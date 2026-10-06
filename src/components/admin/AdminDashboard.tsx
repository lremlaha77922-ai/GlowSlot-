import React from 'react';
import { ArrowLeft, ShieldCheck, BarChart2, BellRing, Settings, Users } from 'lucide-react';
import { ReengagementReminderSummary } from './ReengagementReminderSummary';
import { RefundRequestsSummary } from './RefundRequestsSummary';

interface AdminDashboardProps {
  onBack?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-bg text-text pb-20">
      {/* Admin Top Header */}
      <header className="sticky top-0 z-30 bg-surface/95 backdrop-blur-md border-b border-border/80 px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-1.5 -ml-1.5 rounded-full text-text hover:bg-primary-soft transition-colors cursor-pointer"
              aria-label="Back"
            >
              <ArrowLeft size={20} />
            </button>
          )}
          <div className="flex items-center gap-2">
            <ShieldCheck size={20} className="text-primary" />
            <h1 className="text-sm font-bold text-text">Admin Dashboard</h1>
          </div>
        </div>

        <span className="px-2.5 py-1 rounded-chip bg-primary/10 text-primary text-[10px] font-bold border border-primary/20">
          Admin Portal
        </span>
      </header>

      {/* Main Admin Content */}
      <main className="p-4 max-w-2xl mx-auto w-full flex flex-col gap-6">
        {/* Admin Overview Notice */}
        <div className="bg-surface rounded-card border border-border/80 p-4 shadow-level-1 flex items-center justify-between">
          <div>
            <h2 className="text-xs font-bold text-text">GlowSlot System & Automation Control</h2>
            <p className="text-[11px] text-muted mt-0.5">Real-time status of booking re-engagement, retention campaigns, and platform operations.</p>
          </div>
          <BarChart2 size={24} className="text-primary/60 shrink-0 hidden sm:block" />
        </div>

        {/* 30-Day Customer Re-engagement Automation Monitoring Card */}
        <section className="bg-surface rounded-card border border-border shadow-level-1 p-4 sm:p-5">
          <ReengagementReminderSummary />
        </section>

        {/* Refund Management Section */}
        <section className="bg-surface rounded-card border border-border shadow-level-1 p-4 sm:p-5">
          <RefundRequestsSummary />
        </section>
      </main>
    </div>
  );
};
