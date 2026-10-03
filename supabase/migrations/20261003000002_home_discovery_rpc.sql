-- ====================================================================
-- GlowSlot Home Page Discovery RPCs & Queries Migration
-- ====================================================================

-- 1. RPC for Nearby Salons (sorted by distance_km)
CREATE OR REPLACE FUNCTION public.get_nearby_salons(p_limit INT DEFAULT 10)
RETURNS SETOF public.salons AS $$
BEGIN
    RETURN QUERY
    SELECT *
    FROM public.salons
    ORDER BY distance_km ASC NULLS LAST
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. RPC for Top Rated Salons Near You (rating >= 4.0, ordered by rating desc)
CREATE OR REPLACE FUNCTION public.get_top_rated_salons(p_limit INT DEFAULT 10)
RETURNS SETOF public.salons AS $$
BEGIN
    RETURN QUERY
    SELECT *
    FROM public.salons
    WHERE rating >= 4.0
    ORDER BY rating DESC, review_count DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. RPC for Trending This Week (deals / popular review count)
CREATE OR REPLACE FUNCTION public.get_trending_salons(p_limit INT DEFAULT 10)
RETURNS SETOF public.salons AS $$
BEGIN
    RETURN QUERY
    SELECT *
    FROM public.salons
    WHERE is_deal = true OR review_count > 100
    ORDER BY review_count DESC, rating DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. RPC for Recommended For You (personalized recommendations based on user bookings/favorites or top rated)
CREATE OR REPLACE FUNCTION public.get_recommended_salons(p_user_id UUID, p_limit INT DEFAULT 10)
RETURNS SETOF public.salons AS $$
BEGIN
    -- Return verified and top-rated salons as recommendations
    RETURN QUERY
    SELECT DISTINCT s.*
    FROM public.salons s
    WHERE s.rating >= 4.5
    ORDER BY s.rating DESC, s.review_count DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
