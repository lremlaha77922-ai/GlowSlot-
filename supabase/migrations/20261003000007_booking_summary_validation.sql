-- ====================================================================
-- GlowSlot Booking Summary Validation SQL Migration
-- ====================================================================

-- RPC to perform comprehensive server-side pre-booking validation
CREATE OR REPLACE FUNCTION public.validate_booking_summary(
    p_user_id UUID,
    p_salon_id UUID,
    p_service_ids UUID[],
    p_specialist_id UUID,
    p_slot_id UUID,
    p_coupon_code TEXT,
    p_points_to_redeem INT
)
RETURNS TABLE (
    is_valid BOOLEAN,
    subtotal_paise BIGINT,
    platform_fee_paise BIGINT,
    tax_paise BIGINT,
    coupon_discount_paise BIGINT,
    points_discount_paise BIGINT,
    total_amount_paise BIGINT,
    advance_amount_paise BIGINT,
    balance_amount_paise BIGINT,
    total_duration_min INT,
    error_message TEXT
) AS $$
DECLARE
    v_salon_exists BOOLEAN;
    v_specialist_exists BOOLEAN;
    v_slot_status TEXT;
    v_held_by UUID;
    v_held_until TIMESTAMPTZ;
    v_customer_name TEXT;
    v_subtotal BIGINT := 0;
    v_platform_fee BIGINT := 1000; -- ₹10 platform fee
    v_tax BIGINT;
    v_coupon_discount BIGINT := 0;
    v_points_discount BIGINT := 0;
    v_total BIGINT;
    v_advance BIGINT;
    v_balance BIGINT;
    v_duration INT := 0;
    v_service RECORD;
    v_coupon_record RECORD;
BEGIN
    -- 1. Validate Customer
    SELECT full_name INTO v_customer_name FROM public.profiles WHERE id = p_user_id;
    IF v_customer_name IS NULL OR v_customer_name = '' THEN
        RETURN QUERY SELECT FALSE, 0::BIGINT, 0::BIGINT, 0::BIGINT, 0::BIGINT, 0::BIGINT, 0::BIGINT, 0::BIGINT, 0::BIGINT, 0::INT, 'Customer profile is incomplete.'::TEXT;
        RETURN;
    END IF;

    -- 2. Validate Salon
    SELECT EXISTS(SELECT 1 FROM public.salons WHERE id = p_salon_id AND is_open = true) INTO v_salon_exists;
    IF NOT v_salon_exists THEN
        RETURN QUERY SELECT FALSE, 0::BIGINT, 0::BIGINT, 0::BIGINT, 0::BIGINT, 0::BIGINT, 0::BIGINT, 0::BIGINT, 0::BIGINT, 0::INT, 'Salon is currently closed or does not exist.'::TEXT;
        RETURN;
    END IF;

    -- 3. Validate Specialist (if provided)
    IF p_specialist_id IS NOT NULL THEN
        SELECT EXISTS(SELECT 1 FROM public.specialists WHERE id = p_specialist_id AND salon_id = p_salon_id AND is_active = true) INTO v_specialist_exists;
        IF NOT v_specialist_exists THEN
            RETURN QUERY SELECT FALSE, 0::BIGINT, 0::BIGINT, 0::BIGINT, 0::BIGINT, 0::BIGINT, 0::BIGINT, 0::BIGINT, 0::BIGINT, 0::INT, 'Selected specialist is unavailable.'::TEXT;
            RETURN;
        END IF;
    END IF;

    -- 4. Validate Slot
    SELECT status, held_by_user_id, held_until INTO v_slot_status, v_held_by, v_held_until FROM public.slots WHERE id = p_slot_id FOR SHARE;
    IF NOT FOUND THEN
        RETURN QUERY SELECT FALSE, 0::BIGINT, 0::BIGINT, 0::BIGINT, 0::BIGINT, 0::BIGINT, 0::BIGINT, 0::BIGINT, 0::BIGINT, 0::INT, 'Time slot not found.'::TEXT;
        RETURN;
    END IF;

    IF v_slot_status = 'booked' THEN
        RETURN QUERY SELECT FALSE, 0::BIGINT, 0::BIGINT, 0::BIGINT, 0::BIGINT, 0::BIGINT, 0::BIGINT, 0::BIGINT, 0::BIGINT, 0::INT, 'Time slot is already booked.'::TEXT;
        RETURN;
    END IF;

    IF v_slot_status = 'held' AND v_held_by <> p_user_id AND v_held_until > NOW() THEN
        RETURN QUERY SELECT FALSE, 0::BIGINT, 0::BIGINT, 0::BIGINT, 0::BIGINT, 0::BIGINT, 0::BIGINT, 0::BIGINT, 0::BIGINT, 0::INT, 'Time slot is held by another customer.'::TEXT;
        RETURN;
    END IF;

    -- 5. Calculate trusted Subtotal & Duration from Services
    FOR v_service IN
        SELECT base_price, duration_min
        FROM public.services
        WHERE id = ANY(p_service_ids) AND salon_id = p_salon_id AND (is_active = true OR is_active IS NULL)
    LOOP
        v_subtotal := v_subtotal + COALESCE(v_service.base_price, 0);
        v_duration := v_duration + COALESCE(v_service.duration_min, 30);
    END LOOP;

    IF v_subtotal = 0 THEN
        RETURN QUERY SELECT FALSE, 0::BIGINT, 0::BIGINT, 0::BIGINT, 0::BIGINT, 0::BIGINT, 0::BIGINT, 0::BIGINT, 0::BIGINT, 0::INT, 'No active services selected.'::TEXT;
        RETURN;
    END IF;

    -- 6. Validate & Compute Coupon Discount Securely
    IF p_coupon_code IS NOT NULL AND TRIM(p_coupon_code) <> '' THEN
        SELECT * INTO v_coupon_record FROM public.coupons WHERE code = p_coupon_code AND is_expired = false;
        IF FOUND THEN
            IF v_subtotal >= v_coupon_record.min_order_paise THEN
                IF v_coupon_record.discount_type = 'percentage' THEN
                    v_coupon_discount := ROUND((v_subtotal * v_coupon_record.discount_value) / 100.0);
                ELSE
                    v_coupon_discount := v_coupon_record.discount_value;
                END IF;

                -- Cap max discount if applicable
                IF v_coupon_record.max_discount_paise IS NOT NULL AND v_coupon_discount > v_coupon_record.max_discount_paise THEN
                    v_coupon_discount := v_coupon_record.max_discount_paise;
                END IF;
            END IF;
        END IF;
    END IF;

    -- 7. Validate & Compute Glow Points Discount
    IF p_points_to_redeem > 0 THEN
        -- 1 point = ₹1 (100 paise)
        v_points_discount := p_points_to_redeem * 100;
    END IF;

    -- 8. Final calculations
    v_tax := ROUND((v_subtotal + v_platform_fee) * 0.18);
    v_total := (v_subtotal + v_platform_fee + v_tax) - v_coupon_discount - v_points_discount;
    IF v_total < 0 THEN
        v_total := 0;
    END IF;

    -- Advance / deposit is 10% of total (or full if paying online)
    v_advance := ROUND(v_total * 0.10);
    v_balance := v_total - v_advance;

    RETURN QUERY SELECT TRUE, v_subtotal, v_platform_fee, v_tax, v_coupon_discount, v_points_discount, v_total, v_advance, v_balance, v_duration, NULL::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
