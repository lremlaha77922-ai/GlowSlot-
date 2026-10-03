-- ====================================================================
-- GlowSlot Slots, Holds & Concurrency Booking SQL Migration
-- ====================================================================

-- 1. generate_slots Function to pre-generate or retrieve slots for a salon and date
CREATE OR REPLACE FUNCTION public.generate_slots(
    p_salon_id UUID,
    p_date DATE
)
RETURNS TABLE (
    id UUID,
    salon_id UUID,
    date DATE,
    start_time TIME,
    status TEXT,
    is_free BOOLEAN,
    is_peak BOOLEAN
) AS $$
DECLARE
    v_time TIME;
    v_times TIME[] := ARRAY[
        '09:00:00'::TIME, '09:30:00'::TIME, '10:00:00'::TIME, '10:30:00'::TIME,
        '11:00:00'::TIME, '11:30:00'::TIME, '12:00:00'::TIME, '12:30:00'::TIME,
        '13:00:00'::TIME, '14:00:00'::TIME, '15:00:00'::TIME, '16:00:00'::TIME,
        '17:00:00'::TIME, '17:30:00'::TIME, '18:00:00'::TIME, '18:30:00'::TIME,
        '19:00:00'::TIME, '19:30:00'::TIME, '20:00:00'::TIME
    ];
BEGIN
    -- Ensure slots exist for this date
    FOREACH v_time IN ARRAY v_times LOOP
        INSERT INTO public.slots (salon_id, date, start_time, status, is_free, is_peak)
        VALUES (p_salon_id, p_date, v_time, 'available', false, false)
        ON CONFLICT (salon_id, date, start_time) DO NOTHING;
    END LOOP;

    RETURN QUERY
    SELECT s.id, s.salon_id, s.date, s.start_time, s.status, s.is_free, s.is_peak
    FROM public.slots s
    WHERE s.salon_id = p_salon_id AND s.date = p_date
    ORDER BY s.start_time ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 2. hold_slot Function with concurrency safety and error codes
CREATE OR REPLACE FUNCTION public.hold_slot(
    p_slot_id UUID,
    p_user_id UUID
)
RETURNS TABLE (
    success BOOLEAN,
    held_until TIMESTAMPTZ,
    error_code TEXT
) AS $$
DECLARE
    v_status TEXT;
    v_held_until TIMESTAMPTZ;
    v_held_by UUID;
BEGIN
    -- Select slot with row-level lock
    SELECT status, held_until, held_by_user_id INTO v_status, v_held_until, v_held_by
    FROM public.slots
    WHERE id = p_slot_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN QUERY SELECT FALSE, NULL::TIMESTAMPTZ, 'SLOT_NOT_FOUND';
        RETURN;
    END IF;

    -- If slot is booked
    IF v_status = 'booked' THEN
        RETURN QUERY SELECT FALSE, NULL::TIMESTAMPTZ, 'SLOT_ALREADY_BOOKED';
        RETURN;
    END IF;

    -- If slot is already held by someone else, check if hold expired
    IF v_status = 'held' AND v_held_by <> p_user_id THEN
        IF v_held_until IS NOT NULL AND v_held_until > NOW() THEN
            RETURN QUERY SELECT FALSE, NULL::TIMESTAMPTZ, 'SLOT_ALREADY_HELD';
            RETURN;
        END IF;
    END IF;

    -- Hold slot for 5 minutes
    v_held_until := NOW() + INTERVAL '5 minutes';
    
    UPDATE public.slots
    SET status = 'held',
        held_by_user_id = p_user_id,
        held_until = v_held_until
    WHERE id = p_slot_id;

    RETURN QUERY SELECT TRUE, v_held_until, NULL::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 3. release_slot Function
CREATE OR REPLACE FUNCTION public.release_slot(
    p_slot_id UUID,
    p_user_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
    v_status TEXT;
    v_held_by UUID;
BEGIN
    SELECT status, held_by_user_id INTO v_status, v_held_by
    FROM public.slots
    WHERE id = p_slot_id
    FOR UPDATE;

    IF v_status = 'held' AND v_held_by = p_user_id THEN
        UPDATE public.slots
        SET status = 'available',
            held_by_user_id = NULL,
            held_until = NULL
        WHERE id = p_slot_id;
        RETURN TRUE;
    END IF;

    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 4. create_booking Function with Server-Side Validation, Price/Discount Calculation, and Slot Lock Enforcement
CREATE OR REPLACE FUNCTION public.create_booking(
    p_user_id UUID,
    p_slot_id UUID,
    p_salon_id UUID,
    p_service_names TEXT[],
    p_coupon_discount_paise BIGINT,
    p_points_discount_paise BIGINT,
    p_payment_method TEXT,
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
    v_slot_status TEXT;
    v_held_by UUID;
    v_held_until TIMESTAMPTZ;
    v_booking_id UUID;
    v_booking_number TEXT;
    v_subtotal BIGINT := 0;
    v_platform_fee BIGINT := 1000; -- ₹10 platform fee
    v_tax BIGINT;
    v_total BIGINT;
    v_service RECORD;
BEGIN
    -- 1. Validate slot status
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

    -- If held, must be held by this user or hold must be expired
    IF v_slot_status = 'held' AND v_held_by <> p_user_id THEN
        IF v_held_until IS NOT NULL AND v_held_until > NOW() THEN
            RAISE EXCEPTION 'SLOT_ALREADY_HELD';
        END IF;
    END IF;

    -- 2. Compute trusted prices server-side
    FOR v_service IN
        SELECT base_price
        FROM public.services
        WHERE salon_id = p_salon_id AND name = ANY(p_service_names) AND (is_active = true OR is_active IS NULL)
    LOOP
        v_subtotal := v_subtotal + COALESCE(v_service.base_price, 0);
    END LOOP;

    -- If no services matched
    IF v_subtotal = 0 THEN
        RAISE EXCEPTION 'NO_VALID_SERVICES_FOUND';
    END IF;

    -- 3. Calculate tax (18% GST) and total
    v_tax := ROUND((v_subtotal + v_platform_fee) * 0.18);
    v_total := (v_subtotal + v_platform_fee + v_tax) - p_coupon_discount_paise - p_points_discount_paise;
    IF v_total < 0 THEN
        v_total := 0;
    END IF;

    -- 4. Mark slot as booked
    UPDATE public.slots
    SET status = 'booked',
        held_by_user_id = NULL,
        held_until = NULL
    WHERE id = p_slot_id;

    -- 5. Create the booking record
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
        p_idempotency_key
    )
    ON CONFLICT (idempotency_key) DO UPDATE
    SET id = bookings.id
    RETURNING id, booking_number, bookings.status INTO v_booking_id, v_booking_number, v_slot_status;

    -- 6. Insert booking items
    INSERT INTO public.booking_items (booking_id, service_name, price_paise, qty)
    SELECT v_booking_id, name, base_price, 1
    FROM public.services
    WHERE salon_id = p_salon_id AND name = ANY(p_service_names) AND (is_active = true OR is_active IS NULL);

    RETURN QUERY SELECT v_booking_id, v_booking_number, v_subtotal, v_platform_fee, v_tax, p_coupon_discount_paise, p_points_discount_paise, v_total, v_slot_status;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
