import React, { useState, useEffect } from 'react';
import { useSessionStore } from '../../../store/useSessionStore';
import { PointsTransaction } from '../../../types';
import { userService } from '../services/userService';
import { formatMoney } from '../../../utils/money';
import { ArrowLeft, Sparkles, TrendingUp, TrendingDown, Gift, ShieldCheck } from 'lucide-react';

interface WalletPointsScreenProps {
  onBack: () => void;
  onReferClick: () => void;
}

export const WalletPointsScreen: React.FC<WalletPointsScreenProps> = ({
  onBack,
  onReferClick,
}) => {
  const { user } = useSessionStore();
  const [transactions, setTransactions] = useState<PointsTransaction[]>([]);
  const balance = user?.points ?? 120;
  const rupeeValuePaise = balance * 100;

  useEffect(() => {
    const load = async () => {
      const data = await userService.getWalletTransactions(user?.id);
      setTransactions(data);
    };
    load();
  }, [user]);

  return (
    <div className="min-h-screen bg-bg text-text pb-20">
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
          <h1 className="text-sm font-bold text-text">Glow Wallet & Points (S26)</h1>
        </div>
      </header>

      <main className="p-4 max-w-lg mx-auto flex flex-col gap-4">
        {/* Balance Hero Card */}
        <div className="rounded-card bg-gradient-to-br from-primary via-primary to-accent p-5 text-white shadow-level-2 relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-white/85 uppercase tracking-wider mb-1">
              <Sparkles size={14} className="text-white" />
              <span>Available Glow Points</span>
            </div>

            <div className="flex items-baseline gap-2 my-2">
              <span className="text-3xl font-bold font-mono tracking-tight tabular-nums">
                {balance}
              </span>
              <span className="text-xs text-white/80 font-semibold">Points</span>
            </div>

            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-chip bg-white/20 backdrop-blur-xs text-xs font-medium">
              <span>Worth {formatMoney(rupeeValuePaise)} in bill deductions</span>
            </div>
          </div>

          <Sparkles
            size={120}
            className="absolute -right-6 -bottom-6 text-white/10 pointer-events-none"
          />
        </div>

        {/* Refer Friend CTA Card */}
        <div
          onClick={onReferClick}
          className="bg-surface rounded-card border border-border/80 p-4 shadow-level-1 flex items-center justify-between gap-3 cursor-pointer hover:border-primary/40 hover:shadow-level-2 transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-deal/15 text-deal flex items-center justify-center shrink-0">
              <Gift size={20} />
            </div>
            <div>
              <h3 className="text-xs font-bold text-text">Earn 100 Points Per Friend</h3>
              <p className="text-[11px] text-muted mt-0.5">
                Invite friends with your referral link and earn when they book.
              </p>
            </div>
          </div>
        </div>

        {/* Perks Notice */}
        <div className="bg-surface rounded-card border border-border p-3.5 shadow-xs flex items-start gap-3">
          <ShieldCheck size={18} className="text-success shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-bold text-text block">Automatic Checkout Discount</span>
            <p className="text-[11px] text-muted mt-0.5 leading-relaxed">
              Toggle "Use Glow Points" at checkout to instantly deduct up to 20% off your total bill amount.
            </p>
          </div>
        </div>

        {/* Transaction History Ledger */}
        <div className="bg-surface rounded-card border border-border shadow-level-1 p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-text uppercase tracking-wider">
              Points History
            </h3>
            <span className="text-[11px] text-muted font-medium">All Activity</span>
          </div>

          <div className="divide-y divide-border">
            {transactions.map((tx) => {
              const isPositive = tx.points > 0;
              return (
                <div key={tx.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                        isPositive
                          ? 'bg-success/15 text-success'
                          : 'bg-deal/15 text-deal'
                      }`}
                    >
                      {isPositive ? <TrendingUp size={15} /> : <TrendingDown size={15} />}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-text leading-tight">{tx.title}</h4>
                      <span className="text-[10px] text-muted">{tx.date}</span>
                    </div>
                  </div>

                  <span
                    className={`font-mono font-bold text-xs tabular-nums shrink-0 ${
                      isPositive ? 'text-success' : 'text-error'
                    }`}
                  >
                    {isPositive ? `+${tx.points}` : `${tx.points}`} pts
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
};
