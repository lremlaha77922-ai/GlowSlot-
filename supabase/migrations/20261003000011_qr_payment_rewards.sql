-- ====================================================================
-- GlowSlot Secure QR Payment Rewards SQL Migration
-- ====================================================================

-- 1. Ensure transaction reference is added or unique on wallet_transactions
ALTER TABLE public.wallet_transactions ADD COLUMN IF NOT EXISTS transaction_reference TEXT UNIQUE;

-- 2. Process secure QR Payment Rewards
CREATE OR REPLACE FUNCTION public.process_secure_qr_payment_rewards(
    p_user_id UUID,
    p_salon_id UUID,
    p_bill_amount_paise BIGINT,
    p_transaction_reference TEXT
)
RETURNS TABLE (
    success BOOLEAN,
    points_earned INT,
    error_message TEXT
) AS $$
DECLARE
    v_salon_name TEXT;
    v_is_open BOOLEAN;
    v_min_eligible_bill BIGINT := 10000; -- Minimum ₹100 eligible bill (10000 paise)
    v_points INT;
BEGIN
    -- A. Validate Partner Salon
    SELECT name, is_open INTO v_salon_name, v_is_open 
    FROM public.salons 
    WHERE id = p_salon_id;

    IF NOT FOUND THEN
        RETURN QUERY SELECT FALSE, 0, 'PARTNER_SALON_NOT_FOUND'::TEXT;
        RETURN;
    END IF;

    IF NOT v_is_open THEN
        RETURN QUERY SELECT FALSE, 0, 'PARTNER_SALON_CLOSED'::TEXT;
        RETURN;
    END IF;

    -- B. Validate Bill Amount and Minimum Eligible Threshold
    IF p_bill_amount_paise <= 0 THEN
        RETURN QUERY SELECT FALSE, 0, 'INVALID_BILL_AMOUNT'::TEXT;
        RETURN;
    END IF;

    IF p_bill_amount_paise < v_min_eligible_bill THEN
        RETURN QUERY SELECT FALSE, 0, 'BILL_BELOW_MIN_ELIGIBLE_THRESHOLD'::TEXT;
        RETURN;
    END IF;

    -- C. Prevent Duplicate QR Reward for the same payment reference
    IF EXISTS (
        SELECT 1 FROM public.wallet_transactions 
        WHERE transaction_reference = p_transaction_reference AND type = 'qr_payment'
    ) THEN
        RETURN QUERY SELECT FALSE, 0, 'DUPLICATE_TRANSACTION_REWARD_ATTEMPT'::TEXT;
        RETURN;
    END IF;

    -- D. Calculate cashback (10% Cashback -> 1 Point per ₹10 spent, which is bill_amount_paise / 1000)
    v_points := FLOOR(p_bill_amount_paise / 1000.0);

    IF v_points <= 0 THEN
        RETURN QUERY SELECT FALSE, 0, 'INSUFFICIENT_BILL_FOR_POINTS'::TEXT;
        RETURN;
    END IF;

    -- E. Create reward transaction in secure history
    INSERT INTO public.wallet_transactions (
        user_id,
        description,
        type,
        salon_name,
        qr_bill_paise,
        points,
        status,
        transaction_reference
    ) VALUES (
        p_user_id,
        'Earned 10% cashback points on partner salon scan bill.',
        'qr_payment',
        v_salon_name,
        p_bill_amount_paise,
        v_points,
        'completed',
        p_transaction_reference
    );

    -- F. Update user points balance in secure profile
    UPDATE public.profiles
    SET points = COALESCE(points, 0) + v_points
    WHERE id = p_user_id;

    RETURN QUERY SELECT TRUE, v_points, NULL::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
