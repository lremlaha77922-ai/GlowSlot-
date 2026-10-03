import React, { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { Card } from '../Card';
import { Skeleton } from '../Skeleton';
import { RotateCw, Clock, CheckCircle2, Activity, AlertCircle, Sparkles } from 'lucide-react';

export interface ReminderCounts {
  pending: number;
  sent: number;
  total: number;
  processed: number;
}

export const ReengagementReminderSummary: React.FC = () => {
  const [counts, setCounts] = useState<ReminderCounts>({
    pending: 0,
    sent: 0,
    total: 0,
    processed: 0,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const fetchReminderCounts = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setIsRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      if (!isSupabaseConfigured() || import.meta.env.VITE_USE_MOCK_DATA === 'true') {
        // Fallback for offline mode or unconfigured Supabase
        setCounts({
          pending: 3,
          sent: 12,
          total: 15,
          processed: 12,
        });
        setLoading(false);
        setIsRefreshing(false);
        return;
      }

      // Query database directly from booking_reengagement_reminders
      const { data, error: dbError } = await supabase
        .from('booking_reengagement_reminders')
        .select('status');

      if (dbError) {
        throw new Error(dbError.message || 'Failed to fetch re-engagement reminders from database');
      }

      const pending = (data || []).filter((row: any) => row.status === 'pending').length;
      const sent = (data || []).filter((row: any) => row.status === 'sent').length;

      const total = pending + sent;
      const processed = sent;

      setCounts({
        pending,
        sent,
        total,
        processed,
      });
    } catch (err: any) {
      console.error('[ReengagementReminderSummary Error]', err);
      setError(err?.message || 'Unable to load re-engagement summary');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchReminderCounts();

    // Supabase Realtime Subscription if supported
    if (isSupabaseConfigured() && import.meta.env.VITE_USE_MOCK_DATA !== 'true') {
      const channel = supabase
        .channel('admin-reengagement-changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'booking_reengagement_reminders' },
          () => {
            fetchReminderCounts();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [fetchReminderCounts]);

  const handleRefresh = () => {
    fetchReminderCounts(true);
  };

  // 1. Loading Skeleton State
  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-8 w-20" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Skeleton className="h-28 w-full" radius="card" />
          <Skeleton className="h-28 w-full" radius="card" />
        </div>
        <Skeleton className="h-16 w-full" radius="card" />
      </div>
    );
  }

  // 2. Error State
  if (error) {
    return (
      <Card className="border-red-500/20 bg-red-500/5 p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={20} />
          <div className="flex-1">
            <h4 className="text-xs font-bold text-red-600">Failed to load re-engagement metrics</h4>
            <p className="text-[11px] text-muted mt-0.5">{error}</p>
            <button
              onClick={() => fetchReminderCounts()}
              className="mt-3 px-3 py-1.5 rounded-button bg-red-500/10 text-red-600 hover:bg-red-500/20 text-xs font-bold transition-colors cursor-pointer"
            >
              Retry Loading
            </button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header with Title & Manual Refresh */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles size={18} className="text-primary" />
          <div>
            <h3 className="text-sm font-bold text-text">Re-engagement Automation</h3>
            <p className="text-[11px] text-muted">30-day customer retention & WhatsApp notification monitoring</p>
          </div>
        </div>

        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="p-2 rounded-button bg-surface border border-border hover:bg-primary-soft text-text hover:text-primary transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5 text-xs font-medium"
          aria-label="Refresh reminder counts"
          title="Refresh database counts"
        >
          <RotateCw size={14} className={isRefreshing ? 'animate-spin text-primary' : ''} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* Primary Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Pending Reminders Card */}
        <Card className="flex flex-col justify-between border-amber-500/30 bg-amber-500/5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
              <Clock size={16} />
              <span>Pending Reminders</span>
            </span>
            <span className="px-2 py-0.5 rounded-chip bg-amber-500/10 text-amber-600 text-[10px] font-semibold border border-amber-500/20">
              Queued
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-text tracking-tight">{counts.pending}</span>
            <span className="text-[11px] text-muted">Awaiting delivery</span>
          </div>
        </Card>

        {/* Sent Reminders Card */}
        <Card className="flex flex-col justify-between border-emerald-500/30 bg-emerald-500/5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 size={16} />
              <span>Sent Reminders</span>
            </span>
            <span className="px-2 py-0.5 rounded-chip bg-emerald-500/10 text-emerald-600 text-[10px] font-semibold border border-emerald-500/20">
              Delivered
            </span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-text tracking-tight">{counts.sent}</span>
            <span className="text-[11px] text-muted">Confirmed sent</span>
          </div>
        </Card>
      </div>

      {/* Total / Processed & Automation Health Status */}
      <Card className="flex flex-col gap-2.5 bg-surface/80">
        <div className="flex items-center justify-between border-b border-border/60 pb-2">
          <div className="flex items-center gap-1.5">
            <Activity size={15} className="text-primary" />
            <span className="text-xs font-bold text-text">Automation Health & Statistics</span>
          </div>

          <span
            className={`px-2 py-0.5 rounded-chip text-[10px] font-bold border ${
              counts.sent > 0
                ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                : counts.pending > 0
                ? 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                : 'bg-muted/10 text-muted border-border'
            }`}
          >
            {counts.sent > 0
              ? 'Automation Active (Healthy)'
              : counts.pending > 0
              ? 'Reminders Pending'
              : 'Idle'}
          </span>
        </div>

        {counts.total === 0 ? (
          <div className="py-2 text-center text-xs text-muted">
            No re-engagement reminders yet.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 text-xs pt-0.5">
            <div className="flex flex-col">
              <span className="text-[11px] text-muted">Total Reminders</span>
              <span className="text-sm font-bold text-text">{counts.total}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] text-muted">Processed Reminders</span>
              <span className="text-sm font-bold text-primary">{counts.processed}</span>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
