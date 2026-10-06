-- ====================================================================
-- GlowSlot Refund Request & Admin Approval Migration
-- ====================================================================

-- 1. Add refund related columns to public.bookings
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS refund_status TEXT CHECK (refund_status IN ('none', 'pending_approval', 'approved', 'processing', 'refunded', 'failed', 'rejected')) DEFAULT 'none';
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS refund_upi_id TEXT;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS refund_request_at TIMESTAMPTZ;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS refund_approved_at TIMESTAMPTZ;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS refund_tx_reference TEXT;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS refund_error_reason TEXT;

-- 2. Update cancel_booking to set refund_status if eligible
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
        v_refund_amount := 0;
        v_charge_amount := v_advance;
        v_refund_percent := 0;
    ELSIF v_diff_hours > 24 THEN
        v_charge_amount := ROUND(v_advance * 0.20);
        v_refund_amount := v_advance - v_charge_amount;
        v_refund_percent := 80;
    ELSE
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
        payment_status = CASE WHEN v_refund_amount > 0 THEN 'refund_pending' ELSE payment_status END,
        refund_status = CASE WHEN v_refund_amount > 0 THEN 'pending_approval' ELSE 'none' END
    WHERE id = p_booking_id;

    -- 7. Release the slot
    UPDATE public.slots
    SET status = 'available',
        held_by_user_id = NULL,
        held_until = NULL
    WHERE id = v_booking.slot_id;

    -- 8. Mark associated payment as refunded if applicable (status logic moved to admin approval)
    -- We don't mark as 'refunded' here yet.

    RETURN QUERY SELECT TRUE, v_refund_amount, v_refund_percent, NULL::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Function to submit refund request with UPI ID
CREATE OR REPLACE FUNCTION public.submit_refund_request(
    p_booking_id UUID,
    p_user_id UUID,
    p_upi_id TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE public.bookings
    SET refund_upi_id = p_upi_id,
        refund_status = 'pending_approval',
        refund_request_at = NOW()
    WHERE id = p_booking_id AND user_id = p_user_id AND status = 'cancelled' AND refund_amount_paise > 0;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Admin function to approve refund (Secured by RLS or role check)
-- For this exercise, we assume the caller is authenticated as an admin.
CREATE OR REPLACE FUNCTION public.admin_approve_refund(
    p_booking_id UUID,
    p_admin_id UUID
)
RETURNS TABLE (
    success BOOLEAN,
    message TEXT
) AS $$
DECLARE
    v_refund_amount BIGINT;
    v_upi_id TEXT;
    v_refund_status TEXT;
BEGIN
    SELECT refund_amount_paise, refund_upi_id, refund_status 
    INTO v_refund_amount, v_upi_id, v_refund_status
    FROM public.bookings
    WHERE id = p_booking_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN QUERY SELECT FALSE, 'BOOKING_NOT_FOUND'::TEXT;
        RETURN;
    END IF;

    IF v_refund_status <> 'pending_approval' THEN
        RETURN QUERY SELECT FALSE, 'INVALID_REFUND_STATUS'::TEXT;
        RETURN;
    END IF;

    -- Transition to Processing
    UPDATE public.bookings
    SET refund_status = 'processing',
        refund_approved_at = NOW()
    WHERE id = p_booking_id;

    -- PLACEHOLDER: In a real system, this would trigger an Edge Function or background worker 
    -- to call Razorpay API. For this mock implementation, we'll simulate success.
    
    -- Simulate Razorpay Payout Success
    UPDATE public.bookings
    SET refund_status = 'refunded',
        refund_tx_reference = 'RZP-' || floor(random() * 1000000)::TEXT,
        payment_status = 'refunded'
    WHERE id = p_booking_id;

    RETURN QUERY SELECT TRUE, 'REFUND_PROCESSED'::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Admin function to reject refund
CREATE OR REPLACE FUNCTION public.admin_reject_refund(
    p_booking_id UUID,
    p_reason TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE public.bookings
    SET refund_status = 'rejected',
        refund_error_reason = p_reason
    WHERE id = p_booking_id AND refund_status = 'pending_approval';
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
