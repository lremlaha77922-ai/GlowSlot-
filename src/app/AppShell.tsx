import React, { useState, useEffect } from 'react';
import { SplashScreen } from '../features/auth/screens/SplashScreen';
import { OnboardingScreen } from '../features/auth/screens/OnboardingScreen';
import { LoginScreen } from '../features/auth/screens/LoginScreen';
import { OtpVerifyScreen } from '../features/auth/screens/OtpVerifyScreen';
import { ProfileSetupScreen } from '../features/auth/screens/ProfileSetupScreen';
import { HomeScreen } from '../features/home/screens/HomeScreen';
import { SalonListScreen } from '../features/salons/screens/SalonListScreen';
import { SalonDetailScreen } from '../features/salons/screens/SalonDetailScreen';
import { SlotPickerScreen } from '../features/slots/screens/SlotPickerScreen';
import { CartScreen } from '../features/cart/screens/CartScreen';
import { CheckoutScreen } from '../features/cart/screens/CheckoutScreen';
import { BookingSuccessScreen } from '../features/bookings/screens/BookingSuccessScreen';
import { BookingsListScreen } from '../features/bookings/screens/BookingsListScreen';
import { BookingDetailScreen } from '../features/bookings/screens/BookingDetailScreen';
import { AtHomeScreen } from '../features/athome/screens/AtHomeScreen';
import { ShopListScreen } from '../features/shop/screens/ShopListScreen';
import { ProductDetailScreen } from '../features/shop/screens/ProductDetailScreen';
import { WishlistScreen } from '../features/shop/screens/WishlistScreen';
import { BottomTabBar } from '../components/BottomTabBar';
import { LocationSheet } from '../features/home/components/LocationSheet';
import { OfflineBanner } from '../components/OfflineBanner';
import { ToastContainer } from '../components/Toast';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { useUIStore } from '../store/useUIStore';
import { useCartStore } from '../store/useCartStore';
import { useSessionStore } from '../store/useSessionStore';
import { Salon, SlotItem, Booking } from '../types';
import { mockSalons } from '../data/mockData';
import { bookingService } from '../features/bookings/services/bookingService';

type ViewMode =
  | 'splash'
  | 'onboarding'
  | 'login'
  | 'otpVerify'
  | 'profileSetup'
  | 'tabs'
  | 'salonDetail'
  | 'slotPicker'
  | 'cart'
  | 'checkout'
  | 'bookingSuccess'
  | 'bookingDetail'
  | 'productDetail'
  | 'wishlist';

export const AppShell: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    isLocationSheetOpen,
    setIsLocationSheetOpen,
    theme,
    showToast,
  } = useUIStore();

  const { addItemWithSlot, addItem } = useCartStore();
  const { user, returnTarget, setReturnTarget } = useSessionStore();

  // Launch routing starts at splash
  const [currentView, setCurrentView] = useState<ViewMode>('splash');
  const [selectedSalonId, setSelectedSalonId] = useState<string | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [reschedulingBooking, setReschedulingBooking] = useState<Booking | null>(null);

  const [slotPickerContext, setSlotPickerContext] = useState<{
    salon: Salon;
    service: { id: string; name: string; durationMin: number; basePrice: number };
  } | null>(null);

  // Initialize theme class on html element
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }, [theme]);

  // Auth interceptor helper for guest mode
  const requireAuth = (targetView: ViewMode): boolean => {
    if (!user) {
      showToast('Please sign in to proceed with booking.');
      setReturnTarget(targetView);
      setCurrentView('login');
      return false;
    }
    return true;
  };

  const handlePostAuthNavigate = () => {
    if (returnTarget) {
      const target = returnTarget as ViewMode;
      setReturnTarget(null);
      setCurrentView(target);
    } else {
      setCurrentView('tabs');
    }
  };

  const handleOpenSalon = (salonId: string) => {
    setSelectedSalonId(salonId);
    setCurrentView('salonDetail');
  };

  const handleOpenProduct = (productId: string) => {
    setSelectedProductId(productId);
    setCurrentView('productDetail');
  };

  const handleSelectServiceForSlot = (
    salon: Salon,
    service: { id: string; name: string; durationMin: number; basePrice: number }
  ) => {
    setSlotPickerContext({ salon, service });
    setCurrentView('slotPicker');
  };

  const handleAtHomeBooking = (service: {
    id: string;
    name: string;
    durationMin: number;
    basePrice: number;
  }) => {
    const atHomeSalon: Salon = {
      id: 'athome-pro',
      name: 'GlowSlot At-Home Pro',
      area: 'Doorstep Service',
      city: 'Bengaluru',
      address: 'Delivered to your saved address',
      distanceKm: 0,
      rating: 4.9,
      reviewCount: 840,
      startingPrice: service.basePrice,
      isOpen: true,
      openingHours: '08:00 AM - 08:00 PM',
      images: [
        'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
      ],
      gender: 'unisex',
      categories: ['Haircut', 'Shave & Beard', 'Facial', 'Massage'],
    };
    setSlotPickerContext({ salon: atHomeSalon, service });
    setCurrentView('slotPicker');
  };

  const handleSlotContinue = (
    slot: SlotItem,
    salon: Salon,
    service: { id: string; name: string; durationMin: number; basePrice: number }
  ) => {
    if (reschedulingBooking) {
      const updated = bookingService.rescheduleBooking(
        reschedulingBooking.id,
        slot.date,
        slot.time
      );
      if (updated) {
        showToast(`Appointment rescheduled to ${slot.date} at ${slot.time}!`);
        setSelectedBookingId(updated.id);
        setReschedulingBooking(null);
        setCurrentView('bookingDetail');
      }
      return;
    }

    addItemWithSlot(service, {
      slotId: slot.id,
      salonId: salon.id,
      salonName: salon.name,
      serviceName: service.name,
      date: slot.date,
      time: slot.time,
      price: slot.price,
      isFree: slot.isFree,
      isPeak: slot.isPeak,
    });
    setCurrentView('cart');
  };

  const handleProceedToCheckout = () => {
    if (requireAuth('checkout')) {
      setCurrentView('checkout');
    }
  };

  const handleStartReschedule = (booking: Booking) => {
    const salon =
      mockSalons.find((s) => s.name === booking.salonName) || mockSalons[0];
    const srv = booking.services[0] || {
      id: 'srv-resched',
      name: 'Grooming Service',
      durationMin: 30,
      basePrice: booking.subtotalPaise,
    };
    setReschedulingBooking(booking);
    setSlotPickerContext({
      salon,
      service: {
        id: 'srv-1',
        name: srv.name,
        durationMin: srv.durationMin,
        basePrice: srv.price,
      },
    });
    setCurrentView('slotPicker');
  };

  const handleRebook = (booking: Booking) => {
    booking.services.forEach((s) => {
      addItem({
        id: `rebook-${Date.now()}-${s.name}`,
        name: s.name,
        category: 'Grooming',
        durationMin: s.durationMin,
        price: s.price,
      });
    });
    showToast(`Added ${booking.services.length} services to cart.`);
    setCurrentView('cart');
  };

  const handleCheckoutSuccess = (bookingId: string) => {
    setSelectedBookingId(bookingId);
    setCurrentView('bookingSuccess');
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-bg text-text font-sans flex flex-col max-w-lg mx-auto relative shadow-2xl overflow-x-hidden selection:bg-primary-soft selection:text-primary">
        {/* Offline Banner */}
        <OfflineBanner />

        {/* S13 Splash Screen */}
        {currentView === 'splash' && (
          <SplashScreen
            onFinish={(destination) => {
              if (destination === 'main') setCurrentView('tabs');
              else if (destination === 'onboarding') setCurrentView('onboarding');
              else setCurrentView('login');
            }}
          />
        )}

        {/* S14 Onboarding Screen */}
        {currentView === 'onboarding' && (
          <OnboardingScreen onComplete={() => setCurrentView('login')} />
        )}

        {/* S15 Login Screen */}
        {currentView === 'login' && (
          <LoginScreen
            onOtpSent={() => setCurrentView('otpVerify')}
            onContinueAsGuest={() => setCurrentView('tabs')}
          />
        )}

        {/* S16 OTP Verify Screen */}
        {currentView === 'otpVerify' && (
          <OtpVerifyScreen
            onBack={() => setCurrentView('login')}
            onVerified={(isNewUser) => {
              if (isNewUser) {
                setCurrentView('profileSetup');
              } else {
                handlePostAuthNavigate();
              }
            }}
          />
        )}

        {/* S17 Profile Setup Screen */}
        {currentView === 'profileSetup' && (
          <ProfileSetupScreen onComplete={handlePostAuthNavigate} />
        )}

        {/* S02 Cart Screen */}
        {currentView === 'cart' && (
          <CartScreen
            onBack={() => setCurrentView('tabs')}
            onCheckout={handleProceedToCheckout}
          />
        )}

        {/* S08 Checkout Screen */}
        {currentView === 'checkout' && (
          <CheckoutScreen
            onBack={() => setCurrentView('cart')}
            onSuccess={handleCheckoutSuccess}
          />
        )}

        {/* S09 Booking Success Screen */}
        {currentView === 'bookingSuccess' && selectedBookingId && (
          <BookingSuccessScreen
            bookingId={selectedBookingId}
            onViewBooking={(id) => {
              setSelectedBookingId(id);
              setCurrentView('bookingDetail');
            }}
            onGoHome={() => {
              setActiveTab('home');
              setCurrentView('tabs');
            }}
          />
        )}

        {/* S11 Booking Detail Screen */}
        {currentView === 'bookingDetail' && selectedBookingId && (
          <BookingDetailScreen
            bookingId={selectedBookingId}
            onBack={() => setCurrentView('tabs')}
            onReschedule={handleStartReschedule}
            onRebook={handleRebook}
          />
        )}

        {/* S04 Salon Detail Screen */}
        {currentView === 'salonDetail' && selectedSalonId && (
          <SalonDetailScreen
            salonId={selectedSalonId}
            onBack={() => setCurrentView('tabs')}
            onSelectServiceForSlot={handleSelectServiceForSlot}
          />
        )}

        {/* S05 Smart Slot Picker Screen */}
        {currentView === 'slotPicker' && slotPickerContext && (
          <SlotPickerScreen
            salon={slotPickerContext.salon}
            service={slotPickerContext.service}
            onBack={() => {
              if (reschedulingBooking) {
                setReschedulingBooking(null);
                setCurrentView('bookingDetail');
              } else {
                setCurrentView('salonDetail');
              }
            }}
            onContinue={handleSlotContinue}
          />
        )}

        {/* S19 Product Detail Screen */}
        {currentView === 'productDetail' && selectedProductId && (
          <ProductDetailScreen
            productId={selectedProductId}
            onBack={() => setCurrentView('tabs')}
            onOpenCart={() => setCurrentView('cart')}
          />
        )}

        {/* S20 Wishlist Screen */}
        {currentView === 'wishlist' && (
          <WishlistScreen
            onBack={() => setCurrentView('tabs')}
            onSelectProduct={handleOpenProduct}
            onExploreShop={() => {
              setActiveTab('shop');
              setCurrentView('tabs');
            }}
          />
        )}

        {/* Main Tabbed Views */}
        {currentView === 'tabs' && (
          <div className="flex-1 flex flex-col">
            <main className="flex-1">
              {activeTab === 'home' && (
                <HomeScreen
                  onOpenLocation={() => setIsLocationSheetOpen(true)}
                  onOpenCart={() => setCurrentView('cart')}
                  onSelectSalon={handleOpenSalon}
                />
              )}

              {activeTab === 'salons' && (
                <SalonListScreen onSelectSalon={handleOpenSalon} />
              )}

              {activeTab === 'athome' && (
                <AtHomeScreen onBookService={handleAtHomeBooking} />
              )}

              {activeTab === 'bookings' && (
                <BookingsListScreen
                  onSelectBooking={(id) => {
                    setSelectedBookingId(id);
                    setCurrentView('bookingDetail');
                  }}
                  onReschedule={handleStartReschedule}
                  onRebook={handleRebook}
                  onExploreSalons={() => setActiveTab('salons')}
                />
              )}

              {activeTab === 'shop' && (
                <ShopListScreen
                  onSelectProduct={handleOpenProduct}
                  onOpenWishlist={() => setCurrentView('wishlist')}
                />
              )}
            </main>

            {/* Bottom 5-Tab Bar */}
            <BottomTabBar activeTab={activeTab} onTabChange={setActiveTab} />
          </div>
        )}

        {/* O01 Location Selector Sheet */}
        <LocationSheet
          isOpen={isLocationSheetOpen}
          onClose={() => setIsLocationSheetOpen(false)}
        />

        {/* Toast Container */}
        <ToastContainer />
      </div>
    </ErrorBoundary>
  );
};
