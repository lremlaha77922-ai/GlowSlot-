import React, { useState, useEffect } from 'react';
import { QrCode, AlertCircle, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '../../../components/Button';
import { formatMoney } from '../../../utils/money';

interface NexoraPaymentScreenProps {
  amountPaise: number;
  onConfirm: () => void;
  onCancel: () => void;
  countdownSeconds?: number;
}

export const NexoraPaymentScreen: React.FC<NexoraPaymentScreenProps> = ({ 
  amountPaise, 
  onConfirm, 
  onCancel,
  countdownSeconds = 300 
}) => {
  const [timeLeft, setTimeLeft] = useState(countdownSeconds);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="min-h-screen bg-bg text-text p-4 flex flex-col items-center justify-center max-w-sm mx-auto">
      <div className="w-full bg-surface rounded-card border border-border p-6 shadow-level-2 text-center">
        <h2 className="text-lg font-bold mb-1">Nexora QR Payment</h2>
        <p className="text-xs text-muted mb-6">Scan with your UPI app to pay</p>
        
        <div className="bg-white p-4 rounded-button mb-6 shadow-inner border border-border">
          {/* PLACEHOLDER: Real QR code will be injected here */}
          <div className="w-48 h-48 bg-primary-soft flex items-center justify-center text-primary">
            <QrCode size={96} />
          </div>
        </div>

        <div className="mb-6">
          <span className="text-xs text-muted block mb-1">Amount to pay</span>
          <span className="text-2xl font-black text-primary">{formatMoney(amountPaise)}</span>
        </div>

        <div className="bg-error/10 border border-error/20 rounded-card p-3 mb-6">
          <div className="flex items-center justify-center gap-2 text-xs font-bold text-error mb-2">
            <AlertCircle size={16} />
            <span>Slot reserved for</span>
          </div>
          <div className="text-xl font-mono font-bold text-error tabular-nums">
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </div>
        </div>

        <Button size="lg" fullWidth onClick={onConfirm} className="font-extrabold shadow-level-1">
          I Have Completed Payment
        </Button>
      </div>

      <button onClick={onCancel} className="mt-6 text-xs font-bold text-muted underline cursor-pointer">
        Back to Summary
      </button>
    </div>
  );
};
