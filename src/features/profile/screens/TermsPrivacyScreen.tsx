import React, { useState } from 'react';
import { ArrowLeft, Shield, FileText } from 'lucide-react';

interface TermsPrivacyScreenProps {
  onBack: () => void;
}

export const TermsPrivacyScreen: React.FC<TermsPrivacyScreenProps> = ({ onBack }) => {
  const [tab, setTab] = useState<'terms' | 'privacy'>('terms');

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
          <h1 className="text-sm font-bold text-text">Legal & Policies (S30)</h1>
        </div>
      </header>

      <main className="p-4 max-w-lg mx-auto w-full flex flex-col gap-4">
        {/* Toggle Segments */}
        <div className="h-9 p-0.5 rounded-button bg-muted/15 border border-border flex items-center">
          <button
            onClick={() => setTab('terms')}
            className={`flex-1 h-full rounded-[10px] text-xs font-semibold transition-all cursor-pointer ${
              tab === 'terms' ? 'bg-surface text-primary shadow-xs' : 'text-muted hover:text-text'
            }`}
          >
            Terms of Service
          </button>
          <button
            onClick={() => setTab('privacy')}
            className={`flex-1 h-full rounded-[10px] text-xs font-semibold transition-all cursor-pointer ${
              tab === 'privacy' ? 'bg-surface text-primary shadow-xs' : 'text-muted hover:text-text'
            }`}
          >
            Privacy Policy
          </button>
        </div>

        <div className="bg-surface rounded-card border border-border shadow-level-1 p-4 flex flex-col gap-3 text-xs leading-relaxed text-muted">
          {tab === 'terms' ? (
            <>
              <h2 className="text-sm font-bold text-text">GlowSlot Terms of Service</h2>
              <p className="text-[11px]">Last updated: October 2026</p>

              <h3 className="font-bold text-text pt-2">1. Smart Slot Reservations</h3>
              <p>
                GlowSlot provides real-time slot scheduling for salons and doorstep grooming. When you hold a slot, a 5-minute reservation timer is granted to complete payment. Unpaid holds expire automatically to ensure fair chair access.
              </p>

              <h3 className="font-bold text-text pt-2">2. Cancellation & Refunds</h3>
              <p>
                Cancellations made more than 4 hours prior to the appointment receive a 100% refund. Cancellations made 1 to 4 hours prior receive a 50% partial refund. Cancellations within 1 hour are non-refundable.
              </p>

              <h3 className="font-bold text-text pt-2">3. Pricing & Taxes</h3>
              <p>
                All prices are displayed in Indian Rupees (INR) and include applicable Goods and Services Tax (GST 18%) plus a flat platform convenience fee of Rs.10.
              </p>
            </>
          ) : (
            <>
              <h2 className="text-sm font-bold text-text">Privacy Policy</h2>
              <p className="text-[11px]">Last updated: October 2026</p>

              <h3 className="font-bold text-text pt-2">1. Information We Collect</h3>
              <p>
                We collect your phone number for OTP authentication, your name for salon personalized appointments, and device location solely to discover nearby salons and compute estimated travel distances.
              </p>

              <h3 className="font-bold text-text pt-2">2. Data Security</h3>
              <p>
                Your personal details, booking records, and saved addresses are strictly encrypted using industry standard protocols. We never sell your personal contact details to third-party advertisers.
              </p>

              <h3 className="font-bold text-text pt-2">3. Account Deletion</h3>
              <p>
                You can permanently delete your account and all associated data at any time from the app settings menu.
              </p>
            </>
          )}
        </div>
      </main>
    </div>
  );
};
