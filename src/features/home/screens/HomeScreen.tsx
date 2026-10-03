import React, { useState } from 'react';
import { HomeHeader } from '../components/HomeHeader';
import { PromoCarousel } from '../components/PromoCarousel';
import { QuickServicesSection } from '../components/QuickServicesSection';
import { LastMinuteDealsSection } from '../components/LastMinuteDealsSection';
import { PopularSalonsSection } from '../components/PopularSalonsSection';
import { ReferralCard } from '../components/ReferralCard';
import { PullToRefresh } from '../../../components/PullToRefresh';
import { useUIStore } from '../../../store/useUIStore';
import { mockBanners, mockQuickServices, mockSalons } from '../../../data/mockData';

interface HomeScreenProps {
  onOpenLocation: () => void;
  onOpenCart: () => void;
  onSelectSalon: (salonId: string) => void;
  onOpenNotifications?: () => void;
  onOpenProfile?: () => void;
  onOpenPoints?: () => void;
  onOpenRefer?: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onOpenLocation,
  onOpenCart,
  onSelectSalon,
  onOpenNotifications = () => {},
  onOpenProfile = () => {},
  onOpenPoints = () => {},
  onOpenRefer = () => {},
}) => {
  const { showToast } = useUIStore();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 600));
    setIsRefreshing(false);
    showToast('Feed refreshed with latest salon slots.');
  };

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="flex-1 pb-24 bg-bg text-text">
        {/* Top App Bar (Header with points, search, location, profile, bell, cart) */}
        <HomeHeader
          onOpenLocation={onOpenLocation}
          onOpenCart={onOpenCart}
          onOpenNotifications={onOpenNotifications}
          onOpenProfile={onOpenProfile}
          onOpenPoints={onOpenPoints}
        />

        {/* Promotional Banners Carousel */}
        <PromoCarousel banners={mockBanners} />

        {/* Quick Services Section */}
        <QuickServicesSection services={mockQuickServices} />

        {/* Dynamic Deals & Off-Peak Slots Section */}
        <LastMinuteDealsSection
          deals={mockSalons.filter((s) => s.isDeal)}
          onSelectSalon={onSelectSalon}
        />

        {/* Popular Neighborhood Salons List */}
        <PopularSalonsSection
          salons={mockSalons}
          onSelectSalon={onSelectSalon}
        />

        {/* Refer & Earn Banner Card -> S27 */}
        <ReferralCard onReferClick={onOpenRefer} />
      </div>
    </PullToRefresh>
  );
};
