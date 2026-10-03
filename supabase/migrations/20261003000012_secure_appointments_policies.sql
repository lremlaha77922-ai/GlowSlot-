-- ====================================================================
-- GlowSlot Secure Appointments RLS Policies SQL Migration
-- ====================================================================

-- 1. Enable Row Level Security (RLS) on bookings and booking_items tables
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_items ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies to prevent conflicts
DROP POLICY IF EXISTS "Users can view own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can insert own bookings" ON public.bookings;
DROP POLICY IF EXISTS "Users can update own bookings" ON public.bookings;

DROP POLICY IF EXISTS "Users can view own booking items" ON public.booking_items;
DROP POLICY IF EXISTS "Users can insert own booking items" ON public.booking_items;

-- 3. Define secure policies for "bookings" table (Strict Ownership check)
CREATE POLICY "Users can view own bookings"
    ON public.bookings
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bookings"
    ON public.bookings
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bookings"
    ON public.bookings
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 4. Define secure policies for "booking_items" table (Cross table security checks)
CREATE POLICY "Users can view own booking items"
    ON public.booking_items
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.bookings
            WHERE bookings.id = booking_items.booking_id
              AND bookings.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own booking items"
    ON public.booking_items
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.bookings
            WHERE bookings.id = booking_items.booking_id
              AND bookings.user_id = auth.uid()
        )
    );
