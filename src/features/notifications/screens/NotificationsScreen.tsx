import React, { useState, useEffect } from 'react';
import { NotificationItem } from '../../../types';
import { notificationService } from '../services/notificationService';
import { ArrowLeft, Bell, CheckCheck, Calendar, Sparkles, Tag } from 'lucide-react';
import { EmptyState } from '../../../components/EmptyState';
import { useUIStore } from '../../../store/useUIStore';
import { useSessionStore } from '../../../store/useSessionStore';

interface NotificationsScreenProps {
  onBack: () => void;
}

export const NotificationsScreen: React.FC<NotificationsScreenProps> = ({ onBack }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const { user } = useSessionStore();
  const { showToast } = useUIStore();

  const loadNotifications = async () => {
    const list = await notificationService.getNotifications(user?.id);
    setNotifications(list);
  };

  useEffect(() => {
    loadNotifications();
  }, [user]);

  const handleMarkAsRead = async (id: string) => {
    await notificationService.markAsRead(id, user?.id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: false } : n))
    );
  };

  const handleMarkAllAsRead = async () => {
    await notificationService.markAllAsRead(user?.id);
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
    showToast('All notifications marked as read.');
  };

  const unreadCount = notifications.filter((n) => n.unread).length;
  const groups = ['Today', 'Yesterday', 'Earlier'] as const;

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'booking':
        return <Calendar size={16} className="text-primary" />;
      case 'offer':
        return <Tag size={16} className="text-deal" />;
      case 'points':
        return <Sparkles size={16} className="text-deal" />;
      default:
        return <Bell size={16} className="text-muted" />;
    }
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
          <div>
            <h1 className="text-sm font-bold text-text leading-tight">
              Notifications (S21)
            </h1>
            {unreadCount > 0 && (
              <span className="text-[10px] text-accent font-semibold">
                {unreadCount} unread
              </span>
            )}
          </div>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 cursor-pointer"
          >
            <CheckCheck size={14} />
            <span>Mark all read</span>
          </button>
        )}
      </header>

      {/* Grouped Notifications List */}
      <main className="p-4 max-w-lg mx-auto w-full flex flex-col gap-4">
        {notifications.length === 0 ? (
          <EmptyState
            icon={<Bell size={32} />}
            title="No notifications yet"
            helperText="We will keep you notified about slot confirmations, off-peak deals, and Glow Points."
            actionLabel="Explore Salons"
            onAction={onBack}
          />
        ) : (
          groups.map((group) => {
            const groupNotifs = notifications.filter((n) => n.group === group);
            if (groupNotifs.length === 0) return null;

            return (
              <div key={group} className="flex flex-col gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted px-1">
                  {group}
                </span>

                <div className="flex flex-col gap-2">
                  {groupNotifs.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleMarkAsRead(item.id)}
                      className={`p-3.5 rounded-card border transition-all cursor-pointer flex gap-3 relative ${
                        item.unread
                          ? 'bg-surface border-primary/30 shadow-level-1'
                          : 'bg-surface/60 border-border opacity-85'
                      }`}
                    >
                      {/* Icon container */}
                      <div className="w-9 h-9 rounded-full bg-muted/10 border border-border flex items-center justify-center shrink-0">
                        {getIcon(item.type)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 pr-4">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <h3 className="text-xs font-bold text-text truncate">
                            {item.title}
                          </h3>
                          <span className="text-[10px] text-muted shrink-0">
                            {item.timestamp}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted leading-relaxed line-clamp-2">
                          {item.message}
                        </p>
                      </div>

                      {/* Unread dot indicator */}
                      {item.unread && (
                        <span className="w-2 h-2 rounded-full bg-primary absolute top-4 right-3 shrink-0" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </main>
    </div>
  );
};
