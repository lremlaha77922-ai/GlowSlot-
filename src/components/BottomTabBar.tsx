import React from 'react';
import { Home, Scissors, Sparkles, Calendar, ShoppingBag } from 'lucide-react';
import { useUIStore } from '../store/useUIStore';

export interface TabItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  isCurrentPhase: boolean;
}

const TABS: TabItem[] = [
  { id: 'home', label: 'Home', icon: Home, isCurrentPhase: true },
  { id: 'salons', label: 'At Salon', icon: Scissors, isCurrentPhase: true },
  { id: 'athome', label: 'At Home', icon: Sparkles, isCurrentPhase: true },
  { id: 'bookings', label: 'Bookings', icon: Calendar, isCurrentPhase: true },
  { id: 'shop', label: 'Shop', icon: ShoppingBag, isCurrentPhase: true }, // Enabled in Phase 4B
];

interface BottomTabBarProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export const BottomTabBar: React.FC<BottomTabBarProps> = ({
  activeTab,
  onTabChange,
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

          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab)}
              className={`flex-1 flex flex-col items-center justify-center py-1 transition-colors cursor-pointer select-none ${
                isActive ? 'text-primary font-bold' : 'text-muted hover:text-text'
              }`}
              aria-label={tab.label}
              aria-selected={isActive}
            >
              <Icon
                size={22}
                className={`transition-transform duration-150 ${
                  isActive ? 'scale-110 stroke-[2.4]' : 'stroke-[1.8]'
                }`}
              />
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
