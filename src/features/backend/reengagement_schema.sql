-- ====================================================================
-- GlowSlot 30-Day Customer Re-Engagement Automation Schema Migration
-- ====================================================================

-- 1. Create booking_reengagement_reminders Table
CREATE TABLE IF NOT EXISTS public.booking_reengagement_reminders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    salon_id UUID NOT NULL REFERENCES public.salons(id) ON DELETE CASCADE,
    phone TEXT,
    reminder_type TEXT NOT NULL DEFAULT '30_day_reengagement',
    scheduled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    sent_at TIMESTAMPTZ,
    status TEXT NOT NULL CHECK (status IN ('pending', 'sent', 'skipped_no_phone', 'no_provider', 'failed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_booking_reengagement UNIQUE (booking_id, reminder_type)
);

-- 2. Create Indexes for Query Performance & Lookups
CREATE INDEX IF NOT EXISTS idx_reengagement_booking ON public.booking_reengagement_reminders(booking_id, reminder_type);
CREATE INDEX IF NOT EXISTS idx_reengagement_user ON public.booking_reengagement_reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_reengagement_status ON public.booking_reengagement_reminders(status);

-- 3. Automated updated_at Trigger
CREATE OR REPLACE FUNCTION public.set_reengagement_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_reengagement_updated_at ON public.booking_reengagement_reminders;

CREATE TRIGGER trg_reengagement_updated_at
BEFORE UPDATE ON public.booking_reengagement_reminders
FOR EACH ROW
EXECUTE FUNCTION public.set_reengagement_updated_at();

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.booking_reengagement_reminders ENABLE ROW LEVEL SECURITY;

-- Drop obsolete policies if re-running
DROP POLICY IF EXISTS "Users can view own re-engagement reminders" ON public.booking_reengagement_reminders;
DROP POLICY IF EXISTS "System or authenticated users can insert re-engagement reminders" ON public.booking_reengagement_reminders;
DROP POLICY IF EXISTS "System or authenticated users can update re-engagement reminders" ON public.booking_reengagement_reminders;

-- 5. Secure Row Level Security (RLS) Policies
-- Authenticated users can ONLY SELECT their own reminder records
CREATE POLICY "Users can view own re-engagement reminders"
    ON public.booking_reengagement_reminders
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Note: INSERT, UPDATE, and DELETE are restricted from client SDKs.
-- All reminder processing and status mutations are executed by the Edge Function / Cron using service_role credentials (which bypasses RLS).
