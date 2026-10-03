-- ====================================================================
-- GlowSlot 25% Advance Payment Database Migration
-- ====================================================================

-- 1. Ensure advance_paise and balance_paise exist on public.bookings
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS advance_paise BIGINT DEFAULT 0;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS balance_paise BIGINT DEFAULT 0;

-- 2. Securely rewrite confirm_secure_booking_payment to save advance and balance
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
    v_balance_amount BIGINT;
    v_booking_id UUID;
    v_booking_number TEXT;
    v_salon_id UUID;
BEGIN
    -- Check and lock the payment order record
    SELECT status, slot_id, user_id, total_amount_paise, advance_amount_paise 
    INTO v_status, v_slot_id, v_user_id, v_total_amount, v_advance_amount
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

    -- Calculate balance with precise currency-safe integer math (Total - Advance)
    v_balance_amount := v_total_amount - v_advance_amount;

    -- Retrieve salon_id associated with slot
    SELECT salon_id INTO v_salon_id FROM public.slots WHERE id = v_slot_id;

    -- Mark payment as completed
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

    -- Create secure, permanent booking record with 25% Advance calculations
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
        advance_paise,
        balance_paise,
        payment_method,
        payment_status,
        status
    ) VALUES (
        v_booking_id,
        v_booking_number,
        v_user_id,
        v_salon_id,
        v_slot_id,
        v_total_amount - 1000 - ROUND((v_total_amount - 1000) * 0.18), -- Server-side subtotal back-calculation
        1000,
        ROUND((v_total_amount - 1000) * 0.18),
        0,
        0,
        v_total_amount,
        v_advance_amount,
        v_balance_amount,
        'card',
        'partially_paid', -- Indicates the 25% advance was successfully paid online, 75% due later
        'upcoming'
    );

    -- Associate payment order with the booking
    UPDATE public.payments SET booking_id = v_booking_id WHERE id = p_payment_id;

    RETURN QUERY SELECT TRUE, v_booking_number, NULL::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
