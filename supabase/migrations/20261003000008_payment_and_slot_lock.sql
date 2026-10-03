-- ====================================================================
-- GlowSlot Secure Payment and Slot-Lock SQL Migration
-- ====================================================================

-- 1. Create a secure payments table to record and trace transaction status
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    slot_id UUID NOT NULL REFERENCES public.slots(id) ON DELETE CASCADE,
    total_amount_paise BIGINT NOT NULL,
    advance_amount_paise BIGINT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    payment_reference TEXT UNIQUE,
    idempotency_key TEXT UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Initiate Payment and Lock the slot safely (Stage 1 of the secure transaction)
CREATE OR REPLACE FUNCTION public.initiate_secure_booking_payment(
    p_user_id UUID,
    p_slot_id UUID,
    p_salon_id UUID,
    p_service_ids UUID[],
    p_idempotency_key TEXT
)
RETURNS TABLE (
    payment_id UUID,
    total_amount_paise BIGINT,
    advance_amount_paise BIGINT,
    held_until TIMESTAMPTZ,
    error_message TEXT
) AS $$
DECLARE
    v_slot_status TEXT;
    v_held_by UUID;
    v_held_until TIMESTAMPTZ;
    v_subtotal BIGINT := 0;
    v_platform_fee BIGINT := 1000;
    v_tax BIGINT;
    v_total BIGINT;
    v_advance BIGINT;
    v_payment_id UUID;
    v_service RECORD;
BEGIN
    -- A. Validate Slot availability with a SELECT FOR UPDATE to prevent concurrency race conditions
    SELECT status, held_by_user_id, held_until INTO v_slot_status, v_held_by, v_held_until
    FROM public.slots
    WHERE id = p_slot_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN QUERY SELECT NULL::UUID, 0::BIGINT, 0::BIGINT, NULL::TIMESTAMPTZ, 'SLOT_NOT_FOUND'::TEXT;
        RETURN;
    END IF;

    IF v_slot_status = 'booked' THEN
        RETURN QUERY SELECT NULL::UUID, 0::BIGINT, 0::BIGINT, NULL::TIMESTAMPTZ, 'SLOT_ALREADY_BOOKED'::TEXT;
        RETURN;
    END IF;

    IF v_slot_status = 'held' AND v_held_by <> p_user_id THEN
        IF v_held_until IS NOT NULL AND v_held_until > NOW() THEN
            RETURN QUERY SELECT NULL::UUID, 0::BIGINT, 0::BIGINT, NULL::TIMESTAMPTZ, 'SLOT_ALREADY_HELD'::TEXT;
            RETURN;
        END IF;
    END IF;

    -- B. Compute trusted server-side total amount (No trust for frontend-provided amounts)
    FOR v_service IN
        SELECT base_price
        FROM public.services
        WHERE id = ANY(p_service_ids) AND salon_id = p_salon_id AND (is_active = true OR is_active IS NULL)
    LOOP
        v_subtotal := v_subtotal + COALESCE(v_service.base_price, 0);
    END LOOP;

    IF v_subtotal = 0 THEN
        RETURN QUERY SELECT NULL::UUID, 0::BIGINT, 0::BIGINT, NULL::TIMESTAMPTZ, 'NO_VALID_SERVICES_FOUND'::TEXT;
        RETURN;
    END IF;

    v_tax := ROUND((v_subtotal + v_platform_fee) * 0.18);
    v_total := v_subtotal + v_platform_fee + v_tax;

    -- C. Compute required 25% advance amount
    v_advance := ROUND(v_total * 0.25);

    -- D. Temporarily hold the slot for 10 minutes to allow user to complete payment gateway transaction
    v_held_until := NOW() + INTERVAL '10 minutes';
    UPDATE public.slots
    SET status = 'held',
        held_by_user_id = p_user_id,
        held_until = v_held_until
    WHERE id = p_slot_id;

    -- E. Create pending payment order record
    v_payment_id := gen_random_uuid();
    INSERT INTO public.payments (
        id,
        user_id,
        slot_id,
        total_amount_paise,
        advance_amount_paise,
        status,
        idempotency_key
    ) VALUES (
        v_payment_id,
        p_user_id,
        p_slot_id,
        v_total,
        v_advance,
        'pending',
        p_idempotency_key
    )
    ON CONFLICT (idempotency_key) DO UPDATE
    SET id = payments.id
    RETURNING id INTO v_payment_id;

    RETURN QUERY SELECT v_payment_id, v_total, v_advance, v_held_until, NULL::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 3. Confirm payment success and finalize the booking (Stage 2 of the secure transaction)
CREATE OR REPLACE FUNCTION public.confirm_secure_booking_payment(
    p_payment_id UUID,
    p_payment_reference TEXT
)
RETURNS TABLE (
    success BOOLEAN,
    booking_number TEXT,
    error_message TEXT
) AS $$
DECLARE
    v_status TEXT;
    v_slot_id UUID;
    v_user_id UUID;
    v_total_amount BIGINT;
    v_advance_amount BIGINT;
    v_booking_id UUID;
    v_booking_number TEXT;
    v_salon_id UUID;
BEGIN
    -- Check payment order
    SELECT status, slot_id, user_id, total_amount_paise, advance_amount_paise INTO v_status, v_slot_id, v_user_id, v_total_amount, v_advance_amount
    FROM public.payments
    WHERE id = p_payment_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN QUERY SELECT FALSE, NULL::TEXT, 'PAYMENT_RECORD_NOT_FOUND'::TEXT;
        RETURN;
    END IF;

    IF v_status = 'completed' THEN
        RETURN QUERY SELECT FALSE, NULL::TEXT, 'PAYMENT_ALREADY_PROCESSED'::TEXT;
        RETURN;
    END IF;

    -- Get salon_id associated with slot
    SELECT salon_id INTO v_salon_id FROM public.slots WHERE id = v_slot_id;

    -- Mark payment completed
    UPDATE public.payments
    SET status = 'completed',
        payment_reference = p_payment_reference,
        updated_at = NOW()
    WHERE id = p_payment_id;

    -- Lock the slot permanently to 'booked'
    UPDATE public.slots
    SET status = 'booked',
        held_by_user_id = NULL,
        held_until = NULL
    WHERE id = v_slot_id;

    -- Create permanent booking record
    v_booking_id := gen_random_uuid();
    v_booking_number := 'GS-2026-' || (10000 + FLOOR(RANDOM() * 90000))::TEXT;

    INSERT INTO public.bookings (
        id,
        booking_number,
        user_id,
        salon_id,
        slot_id,
        subtotal_paise,
        platform_fee_paise,
        tax_paise,
        coupon_discount_paise,
        points_discount_paise,
        total_paise,
        payment_method,
        payment_status,
        status
    ) VALUES (
        v_booking_id,
        v_booking_number,
        v_user_id,
        v_salon_id,
        v_slot_id,
        v_total_amount - 1000 - ROUND((v_total_amount - 1000) * 0.18), -- subtotal back-calculation
        1000,
        ROUND((v_total_amount - 1000) * 0.18),
        0,
        0,
        v_total_amount,
        'card',
        'paid',
        'upcoming'
    );

    -- Associate payment order with the booking
    UPDATE public.payments SET booking_id = v_booking_id WHERE id = p_payment_id;

    RETURN QUERY SELECT TRUE, v_booking_number, NULL::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 4. Release slot and mark payment failed if payment was cancelled or expired
CREATE OR REPLACE FUNCTION public.release_secure_booking_payment_failure(
    p_payment_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
    v_status TEXT;
    v_slot_id UUID;
BEGIN
    SELECT status, slot_id INTO v_status, v_slot_id FROM public.payments WHERE id = p_payment_id FOR UPDATE;

    IF FOUND AND v_status = 'pending' THEN
        -- Mark payment order as failed
        UPDATE public.payments SET status = 'failed', updated_at = NOW() WHERE id = p_payment_id;

        -- Release slot back to available pool
        UPDATE public.slots
        SET status = 'available',
            held_by_user_id = NULL,
            held_until = NULL
        WHERE id = v_slot_id;

        RETURN TRUE;
    END IF;

    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
