-- ====================================================================
-- GlowSlot Salon Profile Backend Queries & RPCs Migration
-- ====================================================================

-- 1. Ensure active salons query function (filtering out inactive/closed salons)
CREATE OR REPLACE FUNCTION public.get_active_salon_details(p_salon_id UUID)
RETURNS SETOF public.salons AS $$
BEGIN
    RETURN QUERY
    SELECT *
    FROM public.salons
    WHERE id = p_salon_id AND (is_open = true OR is_open IS NULL);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Ensure active services for a salon
CREATE OR REPLACE FUNCTION public.get_active_salon_services(p_salon_id UUID)
RETURNS SETOF public.services AS $$
BEGIN
    RETURN QUERY
    SELECT *
    FROM public.services
    WHERE salon_id = p_salon_id AND (is_active = true OR is_active IS NULL);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Ensure active packages for a salon
CREATE OR REPLACE FUNCTION public.get_active_salon_packages(p_salon_id UUID)
RETURNS SETOF public.packages AS $$
BEGIN
    RETURN QUERY
    SELECT *
    FROM public.packages
    WHERE salon_id = p_salon_id AND (is_active = true OR is_active IS NULL);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
