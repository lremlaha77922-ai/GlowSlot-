import React, { useState, useEffect } from 'react';
import { useSessionStore } from '../../../store/useSessionStore';
import { PointsTransaction } from '../../../types';
import { userService } from '../services/userService';
import { formatMoney } from '../../../utils/money';
import { Button } from '../../../components/Button';
import { useUIStore } from '../../../store/useUIStore';
import {
  ArrowLeft,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Gift,
  ShieldCheck,
  QrCode,
  Copy,
  Check,
  Award,
  Clock,
  CheckCircle2,
  AlertCircle,
  Building2,
  Tag,
  Share2,
  RefreshCw,
} from 'lucide-react';
import { LoyaltyPointsTracker } from '../components/LoyaltyPointsTracker';

interface WalletPointsScreenProps {
  onBack: () => void;
  onReferClick: () => void;
  onRedeemQR?: () => void;
  onPayQR?: () => void;
}

export const WalletPointsScreen: React.FC<WalletPointsScreenProps> = ({
  onBack,
  onReferClick,
  onRedeemQR,
  onPayQR,
}) => {
  const { user } = useSessionStore();
  const { showToast } = useUIStore();
  const [transactions, setTransactions] = useState<PointsTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeFilter, setActiveFilter] = useState<
    'all' | 'qr_payments' | 'bookings' | 'referrals' | 'redeemed' | 'expired' | 'pending'
  >('all');
  const [copiedCode, setCopiedCode] = useState(false);

  const balance = user?.points ?? 0;
  const rupeeValuePaise = balance * 100;
  const referralCode = user?.referralCode || 'GLOWAARAV2026';

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(false);
      try {
        const data = await userService.getWalletTransactions(user?.id);
        setTransactions(data);
      } catch (e) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user?.id]);

  // Calculate Stats using real data
  const lifetimeEarned = transactions
    .filter((t) => t.points > 0)
    .reduce((sum, t) => sum + t.points, 0);
  const lifetimeRedeemed = Math.abs(
    transactions
      .filter((t) => t.points < 0)
      .reduce((sum, t) => sum + t.points, 0)
  );

  const totalQRRewards = transactions
    .filter((t) => t.rewardType === 'qr_payment' && t.status === 'completed')
    .reduce((sum, t) => sum + t.points, 0);

  const referralEarnings = transactions
    .filter((t) => t.rewardType === 'referral')
    .reduce((sum, t) => sum + t.points, 0);

  const handleCopyCode = () => {
    navigator.clipboard?.writeText(referralCode);
    setCopiedCode(true);
    showToast('Referral code copied to clipboard!');
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const filteredTransactions = transactions.filter((t) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'qr_payments') return t.rewardType === 'qr_payment';
    if (activeFilter === 'bookings') return t.rewardType === 'booking';
    if (activeFilter === 'referrals') return t.rewardType === 'referral';
    if (activeFilter === 'redeemed') return t.rewardType === 'redemption';
    if (activeFilter === 'expired') return t.status === 'expired';
    if (activeFilter === 'pending') return t.status === 'pending';
    return true;
  });

  const getStatusBadge = (status: PointsTransaction['status']) => {
    switch (status) {
      case 'completed':
        return (
          <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-chip border border-emerald-200">
            <CheckCircle2 size={10} /> Completed
          </span>
        );
      case 'pending':
        return (
          <span className="flex items-center gap-1 text-[9px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-chip border border-amber-200">
            <Clock size={10} /> Pending
          </span>
        );
      case 'expired':
        return (
          <span className="flex items-center gap-1 text-[9px] font-bold text-stone-600 bg-stone-100 px-2 py-0.5 rounded-chip border border-stone-200">
            <AlertCircle size={10} /> Expired
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-bg text-text pb-28">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-surface/95 backdrop-blur-md border-b border-border/80 px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-1.5 -ml-1.5 rounded-full text-text hover:bg-primary-soft transition-colors cursor-pointer"
            aria-label="Back"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-sm font-bold text-text">Glow Rewards & Wallet</h1>
        </div>
        <button
          onClick={async () => {
            setLoading(true);
            setError(false);
            try {
              const data = await userService.getWalletTransactions(user?.id);
              setTransactions(data);
              showToast('Rewards updated!');
            } catch (e) {
              setError(true);
            } finally {
              setLoading(false);
            }
          }}
          className="p-1.5 rounded-full text-muted hover:text-primary hover:bg-primary-soft transition-colors cursor-pointer"
          aria-label="Refresh"
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
        </button>
      </header>

      <main className="p-4 max-w-lg mx-auto flex flex-col gap-4">
        {/* CURRENT POINTS (AVAILABLE BALANCE) HERO CARD */}
        {loading ? (
          <div className="rounded-card bg-surface p-5 shadow-xs animate-pulse h-32" />
        ) : error ? (
          <div className="rounded-card bg-surface p-5 shadow-xs border border-error/20 text-center">
            <AlertCircle className="mx-auto text-error mb-2" />
            <p className="text-sm font-bold text-text">Unable to load your rewards right now.</p>
          </div>
        ) : (
          <div className="rounded-card bg-gradient-to-br from-primary via-primary to-accent p-5 text-white shadow-level-2 relative overflow-hidden flex flex-col gap-4">
            <div className="relative z-10 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-white/85 uppercase tracking-wider mb-1">
                  <Sparkles size={14} className="text-white" />
                  <span>Available Balance</span>
                </div>
                <div className="flex items-baseline gap-2 my-1">
                  <span className="text-3xl font-extrabold font-mono tracking-tight tabular-nums">
                    {balance}
                  </span>
                  <span className="text-xs text-white/80 font-semibold">Glow Points</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-chip bg-white/20 backdrop-blur-xs text-xs font-medium mt-1">
                  <span>Worth {formatMoney(rupeeValuePaise)} in bill deductions</span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded-chip text-white uppercase tracking-wider">
                  Wallet Active
                </span>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="grid grid-cols-3 gap-2 relative z-10 pt-2 border-t border-white/20">
              <button
                onClick={onRedeemQR}
                className="py-2 px-1 rounded-button bg-white text-primary text-[11px] font-bold hover:bg-white/90 transition-colors cursor-pointer flex flex-col items-center justify-center gap-1 shadow-xs"
              >
                <QrCode size={16} />
                <span className="truncate w-full text-center">Redeem QR</span>
              </button>
              <button
                onClick={onPayQR}
                className="py-2 px-1 rounded-button bg-white/20 text-white text-[11px] font-bold hover:bg-white/30 transition-colors cursor-pointer flex flex-col items-center justify-center gap-1 border border-white/30"
              >
                <TrendingUp size={16} />
                <span className="truncate w-full text-center">Pay & Earn</span>
              </button>
              <button
                onClick={onReferClick}
                className="py-2 px-1 rounded-button bg-white/20 text-white text-[11px] font-bold hover:bg-white/30 transition-colors cursor-pointer flex flex-col items-center justify-center gap-1 border border-white/30"
              >
                <Gift size={16} />
                <span className="truncate w-full text-center">Refer Code</span>
              </button>
            </div>

            <Sparkles
              size={140}
              className="absolute -right-8 -bottom-8 text-white/10 pointer-events-none"
            />
          </div>
        )}

        {/* Loyalty Points Tracker & Progress Bar to Next Discount Tier */}
        <LoyaltyPointsTracker
          customPoints={balance}
          onPayQR={onPayQR}
          onReferClick={onReferClick}
        />

        {/* Stats Section: Lifetime Earned & Redeemed */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-surface rounded-card border border-border p-3.5 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-success/15 text-success flex items-center justify-center shrink-0">
              <TrendingUp size={20} />
            </div>
            <div>
              <span className="text-[10px] text-muted uppercase font-bold">Lifetime Earned</span>
              <span className="text-base font-extrabold font-mono text-text block">
                +{lifetimeEarned} pts
              </span>
            </div>
          </div>

          <div className="bg-surface rounded-card border border-border p-3.5 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-deal/15 text-deal flex items-center justify-center shrink-0">
              <TrendingDown size={20} />
            </div>
            <div>
              <span className="text-[10px] text-muted uppercase font-bold">Lifetime Redeemed</span>
              <span className="text-base font-extrabold font-mono text-text block">
                -{lifetimeRedeemed} pts
              </span>
            </div>
          </div>
        </div>

        {/* QR Payment Rewards Card */}
        <div className="bg-surface rounded-card border border-border p-4 shadow-xs flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-border/60 pb-2">
            <span className="text-xs font-bold text-text uppercase tracking-wider flex items-center gap-1.5">
              <QrCode size={16} className="text-primary" /> QR Payment Rewards
            </span>
            <span className="text-xs font-extrabold text-primary tabular-nums">
              Total Earned: {totalQRRewards} pts
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-bg p-2.5 rounded-button border border-border/60">
              <span className="text-[10px] text-muted block uppercase font-medium">Cashback Rule</span>
              <span className="font-bold text-text mt-0.5 block">10% Instant Points Back</span>
            </div>
            <div className="bg-bg p-2.5 rounded-button border border-border/60">
              <span className="text-[10px] text-muted block uppercase font-medium">Minimum Bill</span>
              <span className="font-bold text-text mt-0.5 block">₹500 min spend</span>
            </div>
          </div>
        </div>

        {/* Referral Rewards Card */}
        <div className="bg-surface rounded-card border border-border p-4 shadow-xs flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-border/60 pb-2">
            <span className="text-xs font-bold text-text uppercase tracking-wider flex items-center gap-1.5">
              <Gift size={16} className="text-teal-600 dark:text-teal-400" /> Referral Rewards
            </span>
            <span className="text-xs font-extrabold text-teal-600 dark:text-teal-400 tabular-nums">
              Earnings: {referralEarnings} pts
            </span>
          </div>

          <div className="flex items-center justify-between bg-bg p-3 rounded-card border border-border">
            <div>
              <span className="text-[10px] text-muted uppercase font-medium block">Your Referral Code</span>
              <span className="text-sm font-mono font-black text-primary tracking-wider">
                {referralCode}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyCode}
                className="text-xs font-bold flex items-center gap-1"
              >
                {copiedCode ? <Check size={14} className="text-success" /> : <Copy size={14} />}
                <span>{copiedCode ? 'Copied' : 'Copy'}</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Earn More Points Section */}
        <div className="bg-surface rounded-card border border-border p-4 shadow-xs flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <h4 className="text-xs font-bold text-text">Earn More Points</h4>
            <p className="text-[11px] text-muted leading-tight">
              Invite friends to GlowSlot and earn referral rewards.
            </p>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={onReferClick}
            className="text-xs font-bold shrink-0"
          >
            Refer & Earn
          </Button>
        </div>

        {/* Reward History Section */}
        <div className="bg-surface rounded-card border border-border shadow-level-1 p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-text uppercase tracking-wider">
              Reward & Points History
            </h3>
            <span className="text-[11px] text-muted font-medium">{filteredTransactions.length} items</span>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {(
              [
                { id: 'all', label: 'All' },
                { id: 'qr_payments', label: 'QR Payments' },
                { id: 'bookings', label: 'Bookings' },
                { id: 'referrals', label: 'Referrals' },
                { id: 'redeemed', label: 'Redeemed' },
                { id: 'expired', label: 'Expired' },
                { id: 'pending', label: 'Pending' },
              ] as const
            ).map((filter) => {
              const isActive = activeFilter === filter.id;
              return (
                <button
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                  className={`px-3 py-1 rounded-chip text-xs font-bold transition-all cursor-pointer shrink-0 border ${
                    isActive
                      ? 'bg-primary text-white border-primary shadow-xs'
                      : 'bg-surface border-border text-muted hover:text-text'
                  }`}
                >
                  {filter.label}
                </button>
              );
            })}
          </div>

          {/* History List */}
          <div className="flex flex-col gap-2.5 divide-y divide-border/60">
            {filteredTransactions.length === 0 ? (
              <div className="py-6 text-center text-xs text-muted">
                No reward transactions found for this filter.
              </div>
            ) : (
              filteredTransactions.map((tx) => {
                const isPositive = tx.points > 0;
                return (
                  <div key={tx.id} className="pt-3 first:pt-0 flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                          isPositive
                            ? 'bg-success/15 text-success'
                            : 'bg-deal/15 text-deal'
                        }`}
                      >
                        {isPositive ? <TrendingUp size={15} /> : <TrendingDown size={15} />}
                      </div>

                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-text">{tx.title}</h4>
                          {getStatusBadge(tx.status)}
                        </div>

                        <p className="text-[11px] text-muted">{tx.description}</p>

                        <div className="flex items-center gap-3 text-[10px] text-muted pt-1">
                          {tx.salonName && (
                            <span className="flex items-center gap-1 font-semibold text-text">
                              <Building2 size={11} className="text-primary" /> {tx.salonName}
                            </span>
                          )}
                          <span>•</span>
                          <span>{tx.date}</span>
                          {tx.qrBillPaise && (
                            <>
                              <span>•</span>
                              <span className="font-mono text-primary font-bold">
                                Bill: {formatMoney(tx.qrBillPaise)}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <span
                      className={`font-mono font-extrabold text-xs tabular-nums shrink-0 mt-1 ${
                        isPositive ? 'text-success' : 'text-error'
                      }`}
                    >
                      {isPositive ? `+${tx.points}` : `${tx.points}`} pts
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
