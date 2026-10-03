-- ====================================================================
-- GlowSlot Secure Rewards & Wallet Transactions SQL Migration
-- ====================================================================

-- 1. Create wallet_transactions table if not exists
CREATE TABLE IF NOT EXISTS public.wallet_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
    referee_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    description TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('booking_reward', 'qr_payment', 'referral', 'redemption', 'signup_bonus')),
    salon_name TEXT NOT NULL DEFAULT 'GlowSlot Platform',
    qr_bill_paise BIGINT,
    points INT NOT NULL, -- Positive for earn, negative for redeem
    status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'pending', 'expired')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Unique constraint to prevent duplicate reward payouts for the same booking
CREATE UNIQUE INDEX IF NOT EXISTS idx_wallet_booking_reward ON public.wallet_transactions(user_id, booking_id) WHERE type = 'booking_reward';
-- Unique constraint to prevent duplicate referral payouts for the same referee
CREATE UNIQUE INDEX IF NOT EXISTS idx_wallet_referral_reward ON public.wallet_transactions(user_id, referee_id) WHERE type = 'referral';

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own transactions" ON public.wallet_transactions;
CREATE POLICY "Users can view own transactions"
    ON public.wallet_transactions
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- 3. Server-side points aggregator RPC
CREATE OR REPLACE FUNCTION public.get_user_points_summary(
    p_user_id UUID
)
RETURNS TABLE (
    current_balance INT,
    lifetime_earned INT,
    lifetime_redeemed INT,
    pending_points INT,
    expired_points INT
) AS $$
DECLARE
    v_balance INT := 0;
    v_earned INT := 0;
    v_redeemed INT := 0;
    v_pending INT := 0;
    v_expired INT := 0;
BEGIN
    -- Current Active Balance
    SELECT COALESCE(SUM(points), 0) INTO v_balance
    FROM public.wallet_transactions
    WHERE user_id = p_user_id AND status = 'completed';

    -- Lifetime Earned Points (positive points with status = completed)
    SELECT COALESCE(SUM(points), 0) INTO v_earned
    FROM public.wallet_transactions
    WHERE user_id = p_user_id AND status = 'completed' AND points > 0;

    -- Lifetime Redeemed Points (negative points with status = completed)
    SELECT ABS(COALESCE(SUM(points), 0)) INTO v_redeemed
    FROM public.wallet_transactions
    WHERE user_id = p_user_id AND status = 'completed' AND points < 0;

    -- Pending Points
    SELECT COALESCE(SUM(points), 0) INTO v_pending
    FROM public.wallet_transactions
    WHERE user_id = p_user_id AND status = 'pending';

    -- Expired Points
    SELECT COALESCE(SUM(points), 0) INTO v_expired
    FROM public.wallet_transactions
    WHERE user_id = p_user_id AND status = 'expired';

    RETURN QUERY SELECT v_balance, v_earned, v_redeemed, v_pending, v_expired;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 4. Safe Earn Booking Reward logic with duplicate check
CREATE OR REPLACE FUNCTION public.earn_booking_reward(
    p_user_id UUID,
    p_booking_id UUID,
    p_points INT,
    p_salon_name TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
    -- Check if reward already exists to prevent duplicate payouts
    IF EXISTS(SELECT 1 FROM public.wallet_transactions WHERE user_id = p_user_id AND booking_id = p_booking_id AND type = 'booking_reward') THEN
        RETURN FALSE;
    END IF;

    INSERT INTO public.wallet_transactions (
        user_id,
        booking_id,
        description,
        type,
        salon_name,
        points,
        status
    ) VALUES (
        p_user_id,
        p_booking_id,
        'App booking reward points earned upon service completion.',
        'booking_reward',
        p_salon_name,
        p_points,
        'completed'
    );

    -- Increment profile points balance concurrently
    UPDATE public.profiles
    SET points = COALESCE(points, 0) + p_points
    WHERE id = p_user_id;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 5. Safe QR payment reward processing
CREATE OR REPLACE FUNCTION public.earn_qr_payment_reward(
    p_user_id UUID,
    p_salon_name TEXT,
    p_qr_bill_paise BIGINT
)
RETURNS TABLE (
    success BOOLEAN,
    points_credited INT
) AS $$
DECLARE
    v_points INT;
BEGIN
    -- Earn 10% cashback points (1 point per ₹10 spent, i.e., bill / 1000)
    v_points := FLOOR(p_qr_bill_paise / 1000.0);

    IF v_points <= 0 THEN
        RETURN QUERY SELECT FALSE, 0;
        RETURN;
    END IF;

    INSERT INTO public.wallet_transactions (
        user_id,
        description,
        type,
        salon_name,
        qr_bill_paise,
        points,
        status
    ) VALUES (
        p_user_id,
        'Earned 10% cashback points on partner salon scan bill.',
        'qr_payment',
        p_salon_name,
        p_qr_bill_paise,
        v_points,
        'completed'
    );

    UPDATE public.profiles
    SET points = COALESCE(points, 0) + v_points
    WHERE id = p_user_id;

    RETURN QUERY SELECT TRUE, v_points;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 6. Safe Referral Reward logic
CREATE OR REPLACE FUNCTION public.earn_referral_reward(
    p_referrer_id UUID,
    p_referee_id UUID,
    p_points INT
)
RETURNS BOOLEAN AS $$
BEGIN
    -- Check if referrer already rewarded for this user signup
    IF EXISTS(SELECT 1 FROM public.wallet_transactions WHERE user_id = p_referrer_id AND referee_id = p_referee_id AND type = 'referral') THEN
        RETURN FALSE;
    END IF;

    -- Reward Referrer
    INSERT INTO public.wallet_transactions (
        user_id,
        referee_id,
        description,
        type,
        salon_name,
        points,
        status
    ) VALUES (
        p_referrer_id,
        p_referee_id,
        'Friend completed their first salon appointment.',
        'referral',
        'GlowSlot Network',
        p_points,
        'completed'
    );

    UPDATE public.profiles
    SET points = COALESCE(points, 0) + p_points
    WHERE id = p_referrer_id;

    -- Reward Referee as well
    INSERT INTO public.wallet_transactions (
        user_id,
        description,
        type,
        salon_name,
        points,
        status
    ) VALUES (
        p_referee_id,
        'Referral signup reward credited.',
        'signup_bonus',
        'GlowSlot Platform',
        p_points,
        'completed'
    );

    UPDATE public.profiles
    SET points = COALESCE(points, 0) + p_points
    WHERE id = p_referee_id;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
