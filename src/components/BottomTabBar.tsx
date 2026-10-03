import React from 'react';
import { Home, Search, Calendar, Gift, User } from 'lucide-react';
import { useUIStore } from '../store/useUIStore';

export interface TabItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  isCurrentPhase: boolean;
}

const TABS: TabItem[] = [
  { id: 'home', label: 'Home', icon: Home, isCurrentPhase: true },
  { id: 'search', label: 'Search', icon: Search, isCurrentPhase: true },
  { id: 'bookings', label: 'Bookings', icon: Calendar, isCurrentPhase: true },
  { id: 'rewards', label: 'Rewards', icon: Gift, isCurrentPhase: true },
  { id: 'profile', label: 'Profile', icon: User, isCurrentPhase: true },
];

interface BottomTabBarProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
  bookingBadgeCount?: number;
}

export const BottomTabBar: React.FC<BottomTabBarProps> = ({
  activeTab,
  onTabChange,
  bookingBadgeCount = 0,
}) => {
  const { showToast } = useUIStore();

  const handleTabClick = (tab: TabItem) => {
    if (tab.isCurrentPhase) {
      onTabChange(tab.id);
    } else {
      showToast(`${tab.label} is coming soon.`);
    }
  };

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-40 bg-surface/95 backdrop-blur-md border-t border-border shadow-level-2 max-w-lg mx-auto"
      role="navigation"
      aria-label="Main Navigation"
    >
      <div className="h-16 flex items-center justify-around px-2 pb-[env(safe-area-inset-bottom)]">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          const showBadge = tab.id === 'bookings' && bookingBadgeCount > 0;

          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab)}
              className={`relative flex-1 flex flex-col items-center justify-center py-1 transition-colors cursor-pointer select-none ${
                isActive ? 'text-primary font-bold' : 'text-muted hover:text-text'
              }`}
              aria-label={tab.label}
              aria-selected={isActive}
            >
              <div className="relative">
                <Icon
                  size={22}
                  className={`transition-transform duration-150 ${
                    isActive ? 'scale-110 stroke-[2.4]' : 'stroke-[1.8]'
                  }`}
                />
                {showBadge && (
                  <span className="absolute -top-1 -right-2 bg-error text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs animate-pulse">
                    {bookingBadgeCount}
                  </span>
                )}
              </div>
              <span className="text-[11px] mt-1 tracking-tight leading-none">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
