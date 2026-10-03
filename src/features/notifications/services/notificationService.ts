import { supabase, isSupabaseConfigured } from '../../../lib/supabase';
import { NotificationItem } from '../../../types';

export const notificationService = {
  async getNotifications(userId?: string): Promise<NotificationItem[]> {
    if (userId && isSupabaseConfigured() && import.meta.env.VITE_USE_MOCK_DATA !== 'true') {
      try {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          return data.map((n: any) => ({
            id: n.id,
            type: n.type as NotificationItem['type'],
            title: n.title,
            message: n.message,
            timestamp: new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            group: 'Today',
            unread: !n.is_read,
          }));
        }
      } catch {
        // fallback
      }
    }

    return [
      {
        id: 'notif-1',
        type: 'booking',
        title: 'Booking Confirmed! 🎉',
        message: 'Your slot at Scissors Sound Unisex Salon is confirmed for Today at 10:30 AM.',
        timestamp: '10 min ago',
        group: 'Today',
        unread: true,
      },
      {
        id: 'notif-2',
        type: 'offer',
        title: 'Flash Off-Peak Deal ⚡',
        message: 'Save 40% on hair spa and beard trims between 9:00 AM - 12:00 PM today.',
        timestamp: '2 hours ago',
        group: 'Today',
        unread: true,
      },
      {
        id: 'notif-3',
        type: 'points',
        title: 'Points Credited! ✨',
        message: 'You earned 50 Glow Points from your recent visit to Toni & Guy.',
        timestamp: 'Yesterday',
        group: 'Yesterday',
        unread: false,
      },
      {
        id: 'notif-4',
        type: 'system',
        title: 'Welcome to GlowSlot!',
        message: 'Discover nearby verified salons with instant chair booking and zero wait time.',
        timestamp: '3 days ago',
        group: 'Earlier',
        unread: false,
      },
    ];
  },

  async markAsRead(id: string, userId?: string): Promise<void> {
    if (userId && isSupabaseConfigured() && import.meta.env.VITE_USE_MOCK_DATA !== 'true') {
      try {
        await supabase.from('notifications').update({ is_read: true }).eq('id', id).eq('user_id', userId);
      } catch {
        // fallback
      }
    }
  },

  async markAllAsRead(userId?: string): Promise<void> {
    if (userId && isSupabaseConfigured() && import.meta.env.VITE_USE_MOCK_DATA !== 'true') {
      try {
        await supabase.from('notifications').update({ is_read: true }).eq('user_id', userId);
      } catch {
        // fallback
      }
    }
  },
};
