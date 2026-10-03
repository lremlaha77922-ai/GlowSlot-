-- ====================================================================
-- GlowSlot Similar Salons Nearby SQL Migration
-- ====================================================================

-- RPC to find and retrieve similar active salons nearby the target salon
CREATE OR REPLACE FUNCTION public.get_similar_salons_nearby(
    p_salon_id UUID,
    p_limit INT DEFAULT 5
)
RETURNS TABLE (
    id UUID,
    name TEXT,
    address TEXT,
    area TEXT,
    city TEXT,
    rating DECIMAL(3,2),
    review_count INT,
    distance_km DECIMAL(5,2),
    starting_price INT,
    images TEXT[],
    gender TEXT,
    categories TEXT[],
    is_open BOOLEAN,
    operating_hours TEXT,
    is_deal BOOLEAN,
    is_verified BOOLEAN,
    badge_type TEXT,
    amenities TEXT[],
    about_text TEXT
) AS $$
DECLARE
    v_lat DECIMAL(9,6);
    v_lng DECIMAL(9,6);
    v_gender TEXT;
    v_categories TEXT[];
BEGIN
    -- 1. Fetch current salon attributes
    SELECT latitude, longitude, gender, categories
    INTO v_lat, v_lng, v_gender, v_categories
    FROM public.salons
    WHERE salons.id = p_salon_id;

    IF NOT FOUND THEN
        RETURN;
    END IF;

    -- 2. Fetch and return similar active salons sorted by distance & overlap relevance
    RETURN QUERY
    SELECT
        s.id,
        s.name,
        s.address,
        s.area,
        s.city,
        s.rating,
        s.review_count,
        -- Calculate simple coordinate-based distance metric in Km (approx 111km per degree)
        CAST(COALESCE(
            111.0 * SQRT(POWER(COALESCE(s.latitude, 0.0) - COALESCE(v_lat, 0.0), 2) + POWER(COALESCE(s.longitude, 0.0) - COALESCE(v_lng, 0.0), 2)),
            1.5
        ) AS DECIMAL(5,2)) AS distance_km,
        s.starting_price,
        s.images,
        s.gender,
        s.categories,
        s.is_open,
        COALESCE(s.operating_hours, '09:00 AM - 09:00 PM') AS operating_hours,
        s.is_deal,
        s.is_verified,
        s.badge_type,
        s.amenities,
        s.about_text
    FROM public.salons s
    WHERE s.id <> p_salon_id
      AND s.is_open = TRUE
    ORDER BY
        -- Prioritize closer salons first (Euclidean distance)
        (POWER(COALESCE(s.latitude, 0.0) - COALESCE(v_lat, 0.0), 2) + POWER(COALESCE(s.longitude, 0.0) - COALESCE(v_lng, 0.0), 2)) ASC,
        -- Relevance score: match gender alignment
        (CASE WHEN s.gender = v_gender OR s.gender = 'unisex' THEN 0 ELSE 1 END) ASC,
        s.rating DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
