import React, { useState } from 'react';
import { HomeHeader } from '../components/HomeHeader';
import { PromoCarousel } from '../components/PromoCarousel';
import { QuickServicesSection } from '../components/QuickServicesSection';
import { LastMinuteDealsSection } from '../components/LastMinuteDealsSection';
import { SalonDiscoverySections } from '../components/SalonDiscoverySections';
import { PromotionalReelsSection } from '../components/PromotionalReelsSection';
import { PopularSalonsSection } from '../components/PopularSalonsSection';
import { ReferralCard } from '../components/ReferralCard';
import { SmartRecommendationsSection } from '../components/SmartRecommendationsSection';
import { PullToRefresh } from '../../../components/PullToRefresh';
import { useUIStore } from '../../../store/useUIStore';
import { festivalBanners, discountBanners, mockQuickServices, mockSalons } from '../../../data/mockData';

interface HomeScreenProps {
  onOpenLocation: () => void;
  onSelectSalon: (salonId: string) => void;
  onBookNowModal?: (salon: any) => void;
  onOpenNotifications?: () => void;
  onOpenProfile?: () => void;
  onOpenPoints?: () => void;
  onOpenRefer?: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onOpenLocation,
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
          onOpenNotifications={onOpenNotifications}
          onOpenProfile={onOpenProfile}
          onOpenPoints={onOpenPoints}
        />

        {/* SECTION 1 — Festival Offers Carousel */}
        <PromoCarousel sectionTitle="Festival Offers" banners={festivalBanners} />

        {/* AI-Powered Smart Recommendations (History & Trending Styles) */}
        <SmartRecommendationsSection
          onSelectSalon={onSelectSalon}
          onBookNow={onBookNowModal}
        />

        {/* Quick Services Section */}
        <QuickServicesSection services={mockQuickServices} onSelectSalon={onSelectSalon} />

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

        {/* Salon Promotional Reels Section */}
        <PromotionalReelsSection onSelectSalon={onSelectSalon} />

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
