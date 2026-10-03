import React, { useState } from 'react';
import { useSessionStore } from '../../../store/useSessionStore';
import { useUIStore } from '../../../store/useUIStore';
import { formatMoney } from '../../../utils/money';
import { Button } from '../../../components/Button';
import { mockSalons } from '../../../data/mockData';
import {
  ArrowLeft,
  QrCode,
  ShieldCheck,
  Sparkles,
  Store,
  CheckCircle2,
  AlertCircle,
  Calculator,
} from 'lucide-react';

interface QRPaymentScreenProps {
  onBack: () => void;
  onSuccess: (earnedPoints: number) => void;
}

export const QRPaymentScreen: React.FC<QRPaymentScreenProps> = ({ onBack, onSuccess }) => {
  const { user, updatePoints } = useSessionStore();
  const { showToast } = useUIStore();

  const [selectedSalonId, setSelectedSalonId] = useState(mockSalons[0]?.id || 'sal-1');
  const [billAmountInput, setBillAmountInput] = useState('1200');
  const [qrCodeRef, setQrCodeRef] = useState('GS-QR-994821');
  const [isProcessing, setIsProcessing] = useState(false);
  const [scannedSuccess, setScannedSuccess] = useState(false);

  const billNumeric = Number(billAmountInput) || 0;
  const minEligibleBill = 500;
  const pointsEarned = billNumeric >= minEligibleBill ? Math.floor(billNumeric * 0.10) : 0;

  const handleProcessQRPayment = () => {
    if (billNumeric < minEligibleBill) {
      showToast(`Minimum eligible bill for QR cashback is ${formatMoney(minEligibleBill * 100)}.`);
      return;
    }

    if (!qrCodeRef.trim()) {
      showToast('Please enter or scan a valid Partner Salon QR reference.');
      return;
    }

    setIsProcessing(true);

    setTimeout(() => {
      // 1. Add reward points to user session
      const currentPts = user?.points || 250;
      const updatedPts = currentPts + pointsEarned;
      updatePoints(updatedPts);

      // 2. Success state
      setIsProcessing(false);
      setScannedSuccess(true);
      showToast(`Success! +${pointsEarned} Glow Points added to your wallet.`);

      setTimeout(() => {
        onSuccess(pointsEarned);
      }, 1500);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-bg text-text pb-28">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-surface/95 backdrop-blur-md border-b border-border px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-1.5 -ml-1.5 rounded-full text-text hover:bg-primary-soft transition-colors cursor-pointer"
            aria-label="Back"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xs font-black uppercase tracking-wider text-primary">
              PAY VIA QR & EARN
            </h1>
            <span className="text-[10px] text-muted block">Instant 10% Cashback Rewards</span>
          </div>
        </div>
      </header>

      <main className="p-4 max-w-lg mx-auto flex flex-col gap-4">
        {/* Rules & Requirements Card */}
        <div className="bg-surface rounded-card border border-border p-4 shadow-xs flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-border/60 pb-2">
            <span className="text-xs font-bold text-text uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles size={16} className="text-primary" /> QR Cashback Rules & Info
            </span>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-chip">
              10% Cashback Active
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-bg p-3 rounded-button border border-border/60 flex flex-col gap-1">
              <span className="text-[10px] text-muted uppercase font-medium">Cashback Rate</span>
              <span className="font-black text-primary text-sm">10% Points Back</span>
            </div>
            <div className="bg-bg p-3 rounded-button border border-border/60 flex flex-col gap-1">
              <span className="text-[10px] text-muted uppercase font-medium">Minimum Eligible Bill</span>
              <span className="font-bold text-text text-sm">₹500.00</span>
            </div>
          </div>

          <div className="flex items-start gap-2.5 bg-primary-soft/40 p-3 rounded-card border border-primary/20 text-xs">
            <ShieldCheck size={18} className="text-primary shrink-0 mt-0.5" />
            <div className="text-[11px] text-muted leading-relaxed">
              <strong className="text-text font-bold block mb-0.5">Partner Salon Requirement</strong>
              Valid at all GlowSlot verified physical partner salons. Scan the official salon counter QR code or enter bill reference to claim instant cashback.
            </div>
          </div>
        </div>

        {/* Example UI Indicator */}
        <div className="bg-surface rounded-card border border-border p-3.5 shadow-xs flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Calculator size={16} className="text-primary" />
            <span className="text-muted font-medium">Reward Example:</span>
          </div>
          <span className="font-mono font-bold text-primary bg-primary-soft px-2.5 py-1 rounded-chip">
            ₹1,200 bill → +120 pts
          </span>
        </div>

        {/* QR Payment & Bill Entry Form */}
        <div className="bg-surface rounded-card border border-border p-4 shadow-level-1 flex flex-col gap-4">
          <h3 className="text-xs font-bold text-text uppercase tracking-wider border-b border-border/60 pb-2">
            Scan or Enter Salon Bill Details
          </h3>

          {scannedSuccess ? (
            <div className="py-8 flex flex-col items-center justify-center text-center gap-3">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center animate-bounce">
                <CheckCircle2 size={36} />
              </div>
              <h4 className="text-base font-bold text-text">Payment & Reward Successful!</h4>
              <p className="text-xs text-muted">
                +{pointsEarned} Glow Points have been credited instantly to your wallet.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3.5 text-xs">
              {/* Select Partner Salon */}
              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-text flex items-center gap-1.5">
                  <Store size={14} className="text-primary" /> Partner Salon Location
                </label>
                <select
                  value={selectedSalonId}
                  onChange={(e) => setSelectedSalonId(e.target.value)}
                  className="p-2.5 bg-bg border border-border rounded-input text-text text-xs focus:border-primary focus:outline-none"
                >
                  {mockSalons.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.address.split(',')[0]})
                    </option>
                  ))}
                </select>
              </div>

              {/* QR Reference */}
              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-text flex items-center gap-1.5">
                  <QrCode size={14} className="text-primary" /> Salon Counter QR Reference
                </label>
                <input
                  type="text"
                  value={qrCodeRef}
                  onChange={(e) => setQrCodeRef(e.target.value)}
                  placeholder="e.g. GS-QR-994821"
                  className="p-2.5 bg-bg border border-border rounded-input text-text text-xs font-mono focus:border-primary focus:outline-none"
                />
              </div>

              {/* Bill Amount */}
              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-text flex items-center justify-between">
                  <span>Enter Total Bill Amount (₹)</span>
                  <span className="text-[10px] text-muted">Min ₹500</span>
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 font-bold text-muted">₹</span>
                  <input
                    type="number"
                    value={billAmountInput}
                    onChange={(e) => setBillAmountInput(e.target.value)}
                    placeholder="1200"
                    min="500"
                    className="w-full pl-7 pr-3 py-2.5 bg-bg border border-border rounded-input text-text text-sm font-mono font-bold focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              {/* Live Calculation Preview */}
              <div className="bg-primary-soft/40 p-3 rounded-card border border-primary/20 flex items-center justify-between mt-1">
                <div>
                  <span className="text-[10px] text-muted block uppercase font-semibold">
                    Estimated Points Cashback
                  </span>
                  <span className="text-base font-black text-primary font-mono">
                    +{pointsEarned} Glow Points
                  </span>
                </div>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-chip border border-emerald-200">
                  10% Value Back
                </span>
              </div>

              {billNumeric < minEligibleBill && billNumeric > 0 && (
                <div className="flex items-center gap-1.5 text-error text-[11px]">
                  <AlertCircle size={13} />
                  <span>Bill amount must be at least ₹500 to qualify for QR cashback.</span>
                </div>
              )}

              <Button
                variant="primary"
                size="lg"
                disabled={isProcessing || billNumeric < minEligibleBill}
                onClick={handleProcessQRPayment}
                className="w-full mt-2 font-extrabold shadow-xs"
              >
                {isProcessing ? 'Processing QR Payment...' : `Pay ${formatMoney(billNumeric * 100)} & Earn +${pointsEarned} Pts`}
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
