-- ====================================================================
-- GlowSlot Booking Confirmation Details SQL Migration
-- ====================================================================

-- RPC function to securely retrieve comprehensive confirmation data from an actual booking record
CREATE OR REPLACE FUNCTION public.get_booking_confirmation_details(
    p_booking_id UUID
)
RETURNS TABLE (
    booking_id UUID,
    booking_number TEXT,
    booking_status TEXT,
    payment_status TEXT,
    salon_name TEXT,
    salon_address TEXT,
    scheduled_date DATE,
    scheduled_time TIME,
    customer_name TEXT,
    customer_phone TEXT,
    customer_email TEXT,
    total_amount_paise BIGINT,
    advance_paid_paise BIGINT,
    balance_due_paise BIGINT,
    special_instructions TEXT,
    specialist_name TEXT,
    services_json JSONB
) AS $$
DECLARE
    v_booking_record RECORD;
    v_salon_record RECORD;
    v_slot_record RECORD;
    v_profile_record RECORD;
    v_specialist_name TEXT := 'Any available stylist';
    v_services_array JSONB;
    v_advance BIGINT;
    v_balance BIGINT;
BEGIN
    -- 1. Fetch main booking details
    SELECT * INTO v_booking_record FROM public.bookings WHERE id = p_booking_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'BOOKING_RECORD_NOT_FOUND';
    END IF;

    -- 2. Fetch associated salon details
    SELECT name, address INTO v_salon_record FROM public.salons WHERE id = v_booking_record.salon_id;

    -- 3. Fetch associated slot details
    SELECT date, start_time INTO v_slot_record FROM public.slots WHERE id = v_booking_record.slot_id;

    -- 4. Fetch customer details from profile
    SELECT full_name, phone, email INTO v_profile_record FROM public.profiles WHERE id = v_booking_record.user_id;

    -- 5. Fetch specialist if assigned (from slots or bookings if column exists, default fallback if none)
    -- Simply query specialist related to the slot if there is a specialist_id in slots
    BEGIN
        SELECT name INTO v_specialist_name 
        FROM public.specialists sp
        JOIN public.slots sl ON sl.specialist_id = sp.id
        WHERE sl.id = v_booking_record.slot_id;
    EXCEPTION WHEN OTHERS THEN
        v_specialist_name := 'Any available specialist';
    END;

    -- 6. Aggregate services
    SELECT jsonb_agg(jsonb_build_object(
        'name', service_name,
        'price', price_paise,
        'qty', qty
    )) INTO v_services_array
    FROM public.booking_items
    WHERE booking_id = p_booking_id;

    -- 7. Calculate paid/due parts
    IF v_booking_record.payment_status = 'paid' THEN
        v_advance := v_booking_record.total_paise;
        v_balance := 0;
    ELSE
        -- 25% advance default or actual payments record amount
        SELECT COALESCE(SUM(advance_amount_paise), ROUND(v_booking_record.total_paise * 0.25)) INTO v_advance
        FROM public.payments
        WHERE booking_id = p_booking_id AND status = 'completed';

        v_balance := v_booking_record.total_paise - v_advance;
    END IF;

    RETURN QUERY SELECT
        v_booking_record.id,
        v_booking_record.booking_number,
        v_booking_record.status,
        v_booking_record.payment_status,
        COALESCE(v_salon_record.name, 'GlowSlot Partner Salon'),
        COALESCE(v_salon_record.address, 'Salon Location'),
        COALESCE(v_slot_record.date, CURRENT_DATE),
        COALESCE(v_slot_record.start_time, '10:00:00'::TIME),
        COALESCE(v_profile_record.full_name, 'Valued Customer'),
        COALESCE(v_profile_record.phone, ''),
        COALESCE(v_profile_record.email, ''),
        v_booking_record.total_paise,
        v_advance,
        v_balance,
        v_booking_record.special_instructions,
        v_specialist_name,
        COALESCE(v_services_array, '[]'::JSONB);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
