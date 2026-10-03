import React, { useState } from 'react';
import { ArrowLeft, MessageSquare, PhoneCall, Mail, ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import { useUIStore } from '../../../store/useUIStore';

interface HelpSupportScreenProps {
  onBack: () => void;
}

const FAQS = [
  {
    q: 'How does the 5-minute temporary slot hold work?',
    a: 'When you tap "Pick This Slot", that chair is reserved exclusively for you for 5 minutes. No other user can book it while your hold timer is active.',
  },
  {
    q: 'What is the appointment cancellation & refund policy?',
    a: 'Cancelling more than 4 hours in advance gives a 100% full refund. Cancelling between 1 and 4 hours gives a 50% partial refund. No refund is issued if cancelled within 1 hour of the slot.',
  },
  {
    q: 'How do I reschedule my appointment?',
    a: 'You can reschedule once per booking at least 2 hours before the start time directly from the Booking Detail screen.',
  },
  {
    q: 'How do I redeem Glow Points?',
    a: 'At checkout, toggle "Use Glow Points". You can pay up to 20% of your service or product total with your accumulated points (1 point = Rs.1).',
  },
];

export const HelpSupportScreen: React.FC<HelpSupportScreenProps> = ({ onBack }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const { showToast } = useUIStore();

  const handleSupportAction = (channel: string) => {
    showToast(`Connecting to GlowSlot ${channel} support...`);
  };

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
          <h1 className="text-sm font-bold text-text">Help & Support (S29)</h1>
        </div>
      </header>

      <main className="p-4 max-w-lg mx-auto w-full flex flex-col gap-4">
        {/* Contact Support Cards */}
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => handleSupportAction('WhatsApp')}
            className="p-3 rounded-card bg-surface border border-border shadow-xs flex flex-col items-center gap-1.5 hover:border-primary/40 transition-all cursor-pointer"
          >
            <div className="w-9 h-9 rounded-full bg-success/15 text-success flex items-center justify-center">
              <MessageSquare size={18} />
            </div>
            <span className="text-xs font-bold text-text">WhatsApp</span>
            <span className="text-[10px] text-muted">24/7 Chat</span>
          </button>

          <button
            onClick={() => handleSupportAction('Phone')}
            className="p-3 rounded-card bg-surface border border-border shadow-xs flex flex-col items-center gap-1.5 hover:border-primary/40 transition-all cursor-pointer"
          >
            <div className="w-9 h-9 rounded-full bg-primary/15 text-primary flex items-center justify-center">
              <PhoneCall size={18} />
            </div>
            <span className="text-xs font-bold text-text">Call Us</span>
            <span className="text-[10px] text-muted">Toll Free</span>
          </button>

          <button
            onClick={() => handleSupportAction('Email')}
            className="p-3 rounded-card bg-surface border border-border shadow-xs flex flex-col items-center gap-1.5 hover:border-primary/40 transition-all cursor-pointer"
          >
            <div className="w-9 h-9 rounded-full bg-deal/15 text-deal flex items-center justify-center">
              <Mail size={18} />
            </div>
            <span className="text-xs font-bold text-text">Email</span>
            <span className="text-[10px] text-muted">support@glow</span>
          </button>
        </div>

        {/* FAQs */}
        <div className="bg-surface rounded-card border border-border shadow-level-1 p-4 flex flex-col gap-3">
          <h3 className="text-xs font-bold text-text uppercase tracking-wider flex items-center gap-1.5">
            <HelpCircle size={15} className="text-primary" />
            Frequently Asked Questions
          </h3>

          <div className="divide-y divide-border">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx} className="py-3">
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between text-left gap-2 cursor-pointer"
                  >
                    <span className="text-xs font-bold text-text">{faq.q}</span>
                    {isOpen ? (
                      <ChevronUp size={16} className="text-muted shrink-0" />
                    ) : (
                      <ChevronDown size={16} className="text-muted shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <p className="text-xs text-muted leading-relaxed mt-2 pl-0.5">
                      {faq.a}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
};
