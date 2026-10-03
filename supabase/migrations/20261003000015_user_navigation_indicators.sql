-- ====================================================================
-- GlowSlot Secure User Navigation Indicators SQL Migration
-- ====================================================================

-- RPC to securely calculate and return current points, unread notifications count, and unread/pending booking indicators
CREATE OR REPLACE FUNCTION public.get_user_navigation_indicators(
    p_user_id UUID
)
RETURNS TABLE (
    current_points INT,
    unread_notifications_count INT,
    pending_bookings_count INT,
    upcoming_bookings_count INT
) AS $$
DECLARE
    v_points INT := 0;
    v_notifs_count INT := 0;
    v_bookings_pending_count INT := 0;
    v_bookings_upcoming_count INT := 0;
BEGIN
    -- 1. Query points balance from profile
    SELECT COALESCE(points, 0) INTO v_points FROM public.profiles WHERE id = p_user_id;

    -- 2. Query unread notifications count from notifications table if it exists
    BEGIN
        SELECT COUNT(id) INTO v_notifs_count 
        FROM public.notifications 
        WHERE user_id = p_user_id AND is_read = FALSE;
    EXCEPTION WHEN OTHERS THEN
        v_notifs_count := 0;
    END;

    -- 3. Query pending bookings count (e.g. status is pending or holds)
    SELECT COUNT(id) INTO v_bookings_pending_count 
    FROM public.bookings 
    WHERE user_id = p_user_id AND status = 'pending';

    -- 4. Query upcoming bookings count
    SELECT COUNT(id) INTO v_bookings_upcoming_count 
    FROM public.bookings 
    WHERE user_id = p_user_id AND status = 'upcoming';

    RETURN QUERY SELECT v_points, v_notifs_count, v_bookings_pending_count, v_bookings_upcoming_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
