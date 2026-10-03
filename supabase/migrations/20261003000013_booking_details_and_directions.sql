-- ====================================================================
-- GlowSlot Booking Details & Directions SQL Migration
-- ====================================================================

-- 1. Ensure latitude & longitude exist in salons table
ALTER TABLE public.salons ADD COLUMN IF NOT EXISTS latitude DECIMAL(9,6);
ALTER TABLE public.salons ADD COLUMN IF NOT EXISTS longitude DECIMAL(9,6);

-- 2. Create directions helper view or RPC function
CREATE OR REPLACE FUNCTION public.get_salon_directions(
    p_salon_id UUID
)
RETURNS TABLE (
    salon_id UUID,
    name TEXT,
    address TEXT,
    latitude DECIMAL(9,6),
    longitude DECIMAL(9,6),
    google_maps_url TEXT
) AS $$
BEGIN
    RETURN QUERY SELECT
        id,
        salons.name,
        salons.address,
        salons.latitude,
        salons.longitude,
        'https://www.google.com/maps/search/?api=1&query=' || salons.latitude::TEXT || ',' || salons.longitude::TEXT AS google_maps_url
    FROM public.salons
    WHERE id = p_salon_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
