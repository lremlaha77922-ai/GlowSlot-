-- ====================================================================
-- GlowSlot Final Booking Cancellation & Refund Rules Migration
-- ====================================================================

-- 1. Ensure cancellation related columns exist on public.bookings
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS cancellation_reason TEXT;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS refund_amount_paise BIGINT DEFAULT 0;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS cancellation_charge_paise BIGINT DEFAULT 0;

-- 2. Robust cancel_booking RPC with Server-Side Refund Calculation
CREATE OR REPLACE FUNCTION public.cancel_booking(
    p_booking_id UUID,
    p_user_id UUID,
    p_reason TEXT
)
RETURNS TABLE (
    success BOOLEAN,
    refund_amount_paise BIGINT,
    refund_percent INT,
    error_message TEXT
) AS $$
DECLARE
    v_booking RECORD;
    v_slot_id UUID;
    v_advance BIGINT;
    v_total BIGINT;
    v_scheduled_at TIMESTAMPTZ;
    v_now TIMESTAMPTZ := NOW();
    v_diff_hours FLOAT;
    v_refund_amount BIGINT := 0;
    v_charge_amount BIGINT := 0;
    v_refund_percent INT := 0;
BEGIN
    -- 1. Fetch and lock the booking record
    SELECT b.*, s.date, s.start_time 
    INTO v_booking
    FROM public.bookings b
    JOIN public.slots s ON b.slot_id = s.id
    WHERE b.id = p_booking_id AND b.user_id = p_user_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN QUERY SELECT FALSE, 0::BIGINT, 0, 'BOOKING_NOT_FOUND'::TEXT;
        RETURN;
    END IF;

    -- 2. Check current status
    IF v_booking.status = 'cancelled' THEN
        RETURN QUERY SELECT FALSE, 0::BIGINT, 0, 'BOOKING_ALREADY_CANCELLED'::TEXT;
        RETURN;
    END IF;

    IF v_booking.status = 'completed' THEN
        RETURN QUERY SELECT FALSE, 0::BIGINT, 0, 'PAST_APPOINTMENT_CANNOT_CANCEL'::TEXT;
        RETURN;
    END IF;

    -- 3. Calculate Scheduled Timestamp
    v_scheduled_at := (v_booking.date::TEXT || ' ' || v_booking.start_time::TEXT)::TIMESTAMPTZ;
    
    -- 4. Safety check: Cannot cancel past appointments
    IF v_now >= v_scheduled_at THEN
        RETURN QUERY SELECT FALSE, 0::BIGINT, 0, 'APPOINTMENT_ALREADY_STARTED'::TEXT;
        RETURN;
    END IF;

    -- 5. Refund Logic Calculation
    v_advance := COALESCE(v_booking.advance_paise, 0);
    v_diff_hours := EXTRACT(EPOCH FROM (v_scheduled_at - v_now)) / 3600;

    -- RULES:
    -- - Same day: 0 refund
    -- - <= 24 hours: 0 refund
    -- - > 24 hours: 80% refund (20% charge)
    
    IF v_scheduled_at::DATE = v_now::DATE THEN
        -- Same calendar day
        v_refund_amount := 0;
        v_charge_amount := v_advance;
        v_refund_percent := 0;
    ELSIF v_diff_hours > 24 THEN
        -- Eligible for refund
        v_charge_amount := ROUND(v_advance * 0.20);
        v_refund_amount := v_advance - v_charge_amount;
        v_refund_percent := 80;
    ELSE
        -- Within 24 hours
        v_refund_amount := 0;
        v_charge_amount := v_advance;
        v_refund_percent := 0;
    END IF;

    -- 6. Execute Cancellation
    UPDATE public.bookings
    SET status = 'cancelled',
        cancellation_reason = p_reason,
        cancelled_at = v_now,
        refund_amount_paise = v_refund_amount,
        cancellation_charge_paise = v_charge_amount,
        payment_status = CASE WHEN v_refund_amount > 0 THEN 'refund_pending' ELSE payment_status END
    WHERE id = p_booking_id;

    -- 7. Release the slot
    UPDATE public.slots
    SET status = 'available',
        held_by_user_id = NULL,
        held_until = NULL
    WHERE id = v_booking.slot_id;

    -- 8. Mark associated payment as refunded if applicable
    UPDATE public.payments
    SET status = CASE WHEN v_refund_amount > 0 THEN 'refunded' ELSE status END,
        updated_at = v_now
    WHERE booking_id = p_booking_id;

    RETURN QUERY SELECT TRUE, v_refund_amount, v_refund_percent, NULL::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
