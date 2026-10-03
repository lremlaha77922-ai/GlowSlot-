import React from 'react';
import { useHomeData } from '../hooks/useHomeData';
import { HomeHeader } from '../components/HomeHeader';
import { PromoCarousel } from '../components/PromoCarousel';
import { QuickServicesSection } from '../components/QuickServicesSection';
import { LastMinuteDealsSection } from '../components/LastMinuteDealsSection';
import { PopularSalonsSection } from '../components/PopularSalonsSection';
import { ReferCard } from '../components/ReferCard';
import { Skeleton } from '../../../components/Skeleton';
import { EmptyState } from '../../../components/EmptyState';
import { AlertCircle } from 'lucide-react';

interface HomeScreenProps {
  onOpenLocation: () => void;
  onOpenCart: () => void;
  onSelectSalon?: (salonId: string) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onOpenLocation,
  onOpenCart,
  onSelectSalon,
}) => {
  const { banners, quickServices, deals, popularSalons, isLoading, error } =
    useHomeData();

  if (error) {
    return (
      <div className="flex-1 pb-20">
        <HomeHeader onOpenLocation={onOpenLocation} onOpenCart={onOpenCart} />
        <EmptyState
          icon={<AlertCircle size={28} className="text-error" />}
          title="Could not load salons"
          helperText={error}
          actionLabel="Try Again"
          onAction={() => window.location.reload()}
        />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex-1 pb-20">
        <HomeHeader onOpenLocation={onOpenLocation} onOpenCart={onOpenCart} />
        <div className="p-4 flex flex-col gap-4">
          <Skeleton className="w-full aspect-[16/7]" radius="card" />
          <div className="flex gap-3 overflow-hidden">
            <Skeleton className="w-[140px] h-40 shrink-0" radius="card" />
            <Skeleton className="w-[140px] h-40 shrink-0" radius="card" />
            <Skeleton className="w-[140px] h-40 shrink-0" radius="card" />
          </div>
          <div className="flex flex-col gap-3">
            <Skeleton className="w-full h-24" radius="card" />
            <Skeleton className="w-full h-24" radius="card" />
            <Skeleton className="w-full h-24" radius="card" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 pb-20">
      {/* 1. Header per Design.md 8.3 */}
      <HomeHeader onOpenLocation={onOpenLocation} onOpenCart={onOpenCart} />

      {/* 2. Promo Carousel (3 banners, 16:7, 5s auto-scroll) */}
      <PromoCarousel banners={banners} />

      {/* 3. Quick Services (30 min, 140px cards, ADD stepper) */}
      <QuickServicesSection services={quickServices} />

      {/* 4. Last-Minute Deals (260px cards, countdown timer, wired to S04) */}
      <LastMinuteDealsSection deals={deals} onSelectSalon={onSelectSalon} />

      {/* 5. Popular Salons (vertical list, wired to S04) */}
      <PopularSalonsSection salons={popularSalons} onSelectSalon={onSelectSalon} />

      {/* 6. Refer and Earn (compact card) */}
      <ReferCard />
    </div>
  );
};
