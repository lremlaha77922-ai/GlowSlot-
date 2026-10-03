-- ====================================================================
-- GlowSlot Secure Reviews & Salon Ratings Aggregation SQL Migration
-- ====================================================================

-- 1. Create the secure reviews table if not exists with a UNIQUE constraint to prevent duplicate reviews on the same booking
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    tags TEXT[],
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_booking_review UNIQUE (booking_id)
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view reviews" ON public.reviews;
CREATE POLICY "Anyone can view reviews"
    ON public.reviews
    FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Users can insert own reviews" ON public.reviews;
CREATE POLICY "Users can insert own reviews"
    ON public.reviews
    FOR INSERT
    TO authenticated
    WITH CHECK (
        auth.uid() = user_id AND
        EXISTS (
            SELECT 1 FROM public.bookings
            WHERE id = booking_id AND user_id = auth.uid() AND status = 'completed'
        )
    );

-- 3. Automatic Trigger to Aggregate Salon Rating and Review Count
CREATE OR REPLACE FUNCTION public.aggregate_salon_reviews_and_rating()
RETURNS TRIGGER AS $$
DECLARE
    v_salon_id UUID;
    v_avg_rating DECIMAL(3,2);
    v_count INT;
BEGIN
    -- Retrieve salon_id associated with the booking of this review
    SELECT salon_id INTO v_salon_id FROM public.bookings WHERE id = NEW.booking_id;

    IF v_salon_id IS NOT NULL THEN
        -- Compute rating metrics across all reviews for this salon
        SELECT COALESCE(AVG(r.rating), 0.0), COUNT(r.id) INTO v_avg_rating, v_count
        FROM public.reviews r
        JOIN public.bookings b ON b.id = r.booking_id
        WHERE b.salon_id = v_salon_id;

        -- Update the salon record securely
        UPDATE public.salons
        SET rating = v_avg_rating,
            review_count = v_count
        WHERE id = v_salon_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_aggregate_salon_reviews ON public.reviews;
CREATE TRIGGER trg_aggregate_salon_reviews
AFTER INSERT OR UPDATE ON public.reviews
FOR EACH ROW
EXECUTE FUNCTION public.aggregate_salon_reviews_and_rating();
