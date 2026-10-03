import React, { useState } from 'react';
import { HomeHeader } from '../components/HomeHeader';
import { PromoCarousel } from '../components/PromoCarousel';
import { QuickServicesSection } from '../components/QuickServicesSection';
import { LastMinuteDealsSection } from '../components/LastMinuteDealsSection';
import { SalonDiscoverySections } from '../components/SalonDiscoverySections';
import { PopularSalonsSection } from '../components/PopularSalonsSection';
import { ReferralCard } from '../components/ReferralCard';
import { PullToRefresh } from '../../../components/PullToRefresh';
import { useUIStore } from '../../../store/useUIStore';
import { festivalBanners, discountBanners, mockQuickServices, mockSalons } from '../../../data/mockData';

interface HomeScreenProps {
  onOpenLocation: () => void;
  onOpenCart: () => void;
  onSelectSalon: (salonId: string) => void;
  onBookNowModal?: (salon: Salon) => void;
  onOpenNotifications?: () => void;
  onOpenProfile?: () => void;
  onOpenPoints?: () => void;
  onOpenRefer?: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onOpenLocation,
  onOpenCart,
  onSelectSalon,
  onBookNowModal,
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

        {/* SECTION 1 — Festival Offers Carousel */}
        <PromoCarousel sectionTitle="Festival Offers" banners={festivalBanners} />

        {/* Quick Services Section */}
        <QuickServicesSection services={mockQuickServices} />

        {/* SECTION 2 — Special Discounts Carousel */}
        <PromoCarousel sectionTitle="Special Discounts" banners={discountBanners} />

        {/* Dynamic Deals & Off-Peak Slots Section */}
        <LastMinuteDealsSection
          deals={mockSalons.filter((s) => s.isDeal)}
          onSelectSalon={onSelectSalon}
        />

        {/* 4 Upgraded Salon Discovery Sections */}
        <SalonDiscoverySections
          salons={mockSalons}
          onSelectSalon={onSelectSalon}
          onBookNow={onBookNowModal}
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
