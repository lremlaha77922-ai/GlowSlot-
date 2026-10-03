-- ====================================================================
-- GlowSlot Booking Customer Details & Special Instructions SQL Migration
-- ====================================================================

-- 1. Add special_instructions column to bookings table if not exists
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS special_instructions TEXT;

-- 2. Update/create a robust booking registration with customer details validation
CREATE OR REPLACE FUNCTION public.create_booking_v2(
    p_user_id UUID,
    p_slot_id UUID,
    p_salon_id UUID,
    p_service_names TEXT[],
    p_coupon_discount_paise BIGINT,
    p_points_discount_paise BIGINT,
    p_payment_method TEXT,
    p_special_instructions TEXT,
    p_idempotency_key TEXT
)
RETURNS TABLE (
    booking_id UUID,
    booking_number TEXT,
    subtotal_paise BIGINT,
    platform_fee_paise BIGINT,
    tax_paise BIGINT,
    coupon_discount_paise BIGINT,
    points_discount_paise BIGINT,
    total_paise BIGINT,
    status TEXT
) AS $$
DECLARE
    v_profile_name TEXT;
    v_profile_phone TEXT;
    v_profile_email TEXT;
    v_slot_status TEXT;
    v_held_by UUID;
    v_held_until TIMESTAMPTZ;
    v_booking_id UUID;
    v_booking_number TEXT;
    v_subtotal BIGINT := 0;
    v_platform_fee BIGINT := 1000;
    v_tax BIGINT;
    v_total BIGINT;
    v_service RECORD;
BEGIN
    -- A. Validate Profile & Customer Information Server-Side from profiles table
    SELECT full_name, phone, email INTO v_profile_name, v_profile_phone, v_profile_email
    FROM public.profiles
    WHERE id = p_user_id;

    IF v_profile_name IS NULL OR TRIM(v_profile_name) = '' THEN
        RAISE EXCEPTION 'PROFILE_NAME_REQUIRED';
    END IF;

    IF v_profile_phone IS NULL OR TRIM(v_profile_phone) = '' THEN
        RAISE EXCEPTION 'PROFILE_PHONE_REQUIRED';
    END IF;

    -- B. Validate slot status
    SELECT status, held_by_user_id, held_until INTO v_slot_status, v_held_by, v_held_until
    FROM public.slots
    WHERE id = p_slot_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'SLOT_NOT_FOUND';
    END IF;

    IF v_slot_status = 'booked' THEN
        RAISE EXCEPTION 'SLOT_ALREADY_BOOKED';
    END IF;

    IF v_slot_status = 'held' AND v_held_by <> p_user_id THEN
        IF v_held_until IS NOT NULL AND v_held_until > NOW() THEN
            RAISE EXCEPTION 'SLOT_ALREADY_HELD';
        END IF;
    END IF;

    -- C. Compute prices
    FOR v_service IN
        SELECT base_price
        FROM public.services
        WHERE salon_id = p_salon_id AND name = ANY(p_service_names) AND (is_active = true OR is_active IS NULL)
    LOOP
        v_subtotal := v_subtotal + COALESCE(v_service.base_price, 0);
    END LOOP;

    IF v_subtotal = 0 THEN
        RAISE EXCEPTION 'NO_VALID_SERVICES_FOUND';
    END IF;

    v_tax := ROUND((v_subtotal + v_platform_fee) * 0.18);
    v_total := (v_subtotal + v_platform_fee + v_tax) - p_coupon_discount_paise - p_points_discount_paise;
    IF v_total < 0 THEN
        v_total := 0;
    END IF;

    -- D. Mark slot as booked
    UPDATE public.slots
    SET status = 'booked',
        held_by_user_id = NULL,
        held_until = NULL
    WHERE id = p_slot_id;

    -- E. Insert booking with special instructions
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
        status,
        special_instructions,
        idempotency_key
    ) VALUES (
        v_booking_id,
        v_booking_number,
        p_user_id,
        p_salon_id,
        p_slot_id,
        v_subtotal,
        v_platform_fee,
        v_tax,
        p_coupon_discount_paise,
        p_points_discount_paise,
        v_total,
        p_payment_method,
        CASE WHEN p_payment_method = 'pay_at_salon' THEN 'pay_later' ELSE 'paid' END,
        'upcoming',
        p_special_instructions,
        p_idempotency_key
    )
    ON CONFLICT (idempotency_key) DO UPDATE
    SET id = bookings.id
    RETURNING id, booking_number, bookings.status INTO v_booking_id, v_booking_number, v_slot_status;

    -- F. Insert booking items
    INSERT INTO public.booking_items (booking_id, service_name, price_paise, qty)
    SELECT v_booking_id, name, base_price, 1
    FROM public.services
    WHERE salon_id = p_salon_id AND name = ANY(p_service_names) AND (is_active = true OR is_active IS NULL);

    RETURN QUERY SELECT v_booking_id, v_booking_number, v_subtotal, v_platform_fee, v_tax, p_coupon_discount_paise, p_points_discount_paise, v_total, v_slot_status;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
