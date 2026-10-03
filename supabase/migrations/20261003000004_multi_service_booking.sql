-- ====================================================================
-- GlowSlot Multi-Service Booking Validation & Calculation Migration
-- ====================================================================

-- Function to validate multi-service selection, ensure same salon, verify active status,
-- and compute trusted server-side total price and total duration.
CREATE OR REPLACE FUNCTION public.validate_and_calculate_multi_service_booking(
    p_salon_id UUID,
    p_service_ids UUID[]
)
RETURNS TABLE (
    is_valid BOOLEAN,
    total_price_paise BIGINT,
    total_duration_min INT,
    error_message TEXT
) AS $$
DECLARE
    v_count INT;
    v_active_count INT;
    v_salon_match_count INT;
    v_total_price BIGINT := 0;
    v_total_duration INT := 0;
    v_service RECORD;
BEGIN
    -- 1. Check if array is empty
    IF p_service_ids IS NULL OR array_length(p_service_ids, 1) IS NULL THEN
        RETURN QUERY SELECT FALSE, 0::BIGINT, 0::INT, 'No services selected for booking.'::TEXT;
        RETURN;
    end if;

    -- 2. Verify all service IDs exist and belong to the salon and are active
    SELECT COUNT(*) INTO v_count
    FROM public.services
    WHERE id = ANY(p_service_ids);

    IF v_count <> array_length(p_service_ids, 1) THEN
        RETURN QUERY SELECT FALSE, 0::BIGINT, 0::INT, 'One or more selected services do not exist.'::TEXT;
        RETURN;
    END IF;

    -- 3. Verify all services belong to the same salon
    SELECT COUNT(*) INTO v_salon_match_count
    FROM public.services
    WHERE id = ANY(p_service_ids) AND salon_id = p_salon_id;

    IF v_salon_match_count <> array_length(p_service_ids, 1) THEN
        RETURN QUERY SELECT FALSE, 0::BIGINT, 0::INT, 'Selected services must all belong to the same salon.'::TEXT;
        RETURN;
    END IF;

    -- 4. Verify all services are active
    SELECT COUNT(*) INTO v_active_count
    FROM public.services
    WHERE id = ANY(p_service_ids) AND (is_active = true OR is_active IS NULL);

    IF v_active_count <> array_length(p_service_ids, 1) THEN
        RETURN QUERY SELECT FALSE, 0::BIGINT, 0::INT, 'One or more selected services are currently inactive.'::TEXT;
        RETURN;
    END IF;

    -- 5. Calculate server-side trusted price and duration
    FOR v_service IN 
        SELECT base_price, duration_min 
        FROM public.services 
        WHERE id = ANY(p_service_ids)
    LOOP
        v_total_price := v_total_price + COALESCE(v_service.base_price, 0);
        v_total_duration := v_total_duration + COALESCE(v_service.duration_min, 30);
    END LOOP;

    RETURN QUERY SELECT TRUE, v_total_price, v_total_duration, NULL::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
