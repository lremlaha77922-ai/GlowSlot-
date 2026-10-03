import { useState, useEffect } from 'react';
import { homeService } from '../services/homeService';
import { PromoBanner, QuickService, Salon } from '../../../types';

export const useHomeData = () => {
  const [banners, setBanners] = useState<PromoBanner[]>([]);
  const [quickServices, setQuickServices] = useState<QuickService[]>([]);
  const [deals, setDeals] = useState<Salon[]>([]);
  const [popularSalons, setPopularSalons] = useState<Salon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        setIsLoading(true);
        const [b, qs, d, ps] = await Promise.all([
          homeService.getBanners(),
          homeService.getQuickServices(),
          homeService.getLastMinuteDeals(),
          homeService.getPopularSalons(),
        ]);
        if (isMounted) {
          setBanners(b);
          setQuickServices(qs);
          setDeals(d);
          setPopularSalons(ps);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to load home data');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    load();
    return () => {
      isMounted = false;
    };
  }, []);

  return {
    banners,
    quickServices,
    deals,
    popularSalons,
    isLoading,
    error,
  };
};
