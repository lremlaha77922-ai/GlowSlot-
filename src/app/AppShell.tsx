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
import { BookingSuccessScreen } from '../features/bookings/screens/BookingSuccessScreen';
import { BookingsListScreen } from '../features/bookings/screens/BookingsListScreen';
import { BookingDetailScreen } from '../features/bookings/screens/BookingDetailScreen';
import { BookingSummaryScreen } from '../features/bookings/screens/BookingSummaryScreen';
import { AtHomeScreen } from '../features/athome/screens/AtHomeScreen';
import { NotificationsScreen } from '../features/notifications/screens/NotificationsScreen';
import { ProfileMainScreen } from '../features/profile/screens/ProfileMainScreen';
import { EditProfileScreen } from '../features/profile/screens/EditProfileScreen';
import { BookingHistoryScreen } from '../features/profile/screens/BookingHistoryScreen';
import { SavedAddressesScreen } from '../features/profile/screens/SavedAddressesScreen';
import { FavouriteSalonsScreen } from '../features/profile/screens/FavouriteSalonsScreen';
import { WalletPointsScreen } from '../features/profile/screens/WalletPointsScreen';
import { QRPaymentScreen } from '../features/profile/screens/QRPaymentScreen';
import { ReferEarnScreen } from '../features/profile/screens/ReferEarnScreen';
import { SettingsScreen } from '../features/profile/screens/SettingsScreen';
import { InviteLandingScreen } from '../features/auth/screens/InviteLandingScreen';
import { HelpSupportScreen } from '../features/profile/screens/HelpSupportScreen';
import { TermsPrivacyScreen } from '../features/profile/screens/TermsPrivacyScreen';
import { AdminDashboard } from '../components/admin/AdminDashboard';
import { BookServiceModal } from '../features/salons/components/BookServiceModal';
import { BottomTabBar } from '../components/BottomTabBar';
import { LocationSheet } from '../features/home/components/LocationSheet';
import { OfflineBanner } from '../components/OfflineBanner';
import { ToastContainer } from '../components/Toast';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { useUIStore } from '../store/useUIStore';
import { useSessionStore } from '../store/useSessionStore';
import { Salon, SlotItem, Booking } from '../types';
import { mockSalons } from '../data/mockData';
import { bookingService } from '../features/bookings/services/bookingService';
import { authService } from '../features/auth/services/authService';
import { referralService } from '../features/profile/services/referralService';
import { App as CapacitorApp } from '@capacitor/app';

type ViewMode =
  | 'splash'
  | 'onboarding'
  | 'login'
  | 'otpVerify'
  | 'profileSetup'
  | 'tabs'
  | 'salonDetail'
  | 'slotPicker'
  | 'bookingSuccess'
  | 'bookingDetail'
  | 'bookingSummary'
  | 'notifications'
  | 'profile'
  | 'editProfile'
  | 'bookingHistory'
  | 'savedAddresses'
  | 'favouriteSalons'
  | 'walletPoints'
  | 'qrPayment'
  | 'referEarn'
  | 'settings'
  | 'helpSupport'
  | 'termsPrivacy'
  | 'adminDashboard'
  | 'invite';

export const AppShell: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    isLocationSheetOpen,
    setIsLocationSheetOpen,
    theme,
    showToast,
  } = useUIStore();

  const { user, returnTarget, setReturnTarget, setUser, setReferralCode, getReferralCode } = useSessionStore();

  const [currentView, setCurrentView] = useState<ViewMode>('splash');
  const [selectedSalonId, setSelectedSalonId] = useState<string | null>(null);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [reschedulingBooking, setReschedulingBooking] = useState<Booking | null>(null);
  const [bookingModalSalon, setBookingModalSalon] = useState<Salon | null>(null);
  const [bookingModalInitialServiceIds, setBookingModalInitialServiceIds] = useState<string[] | undefined>(undefined);

  const handleOpenBookModal = (salon: Salon, initialSelectedServiceIds?: string[]) => {
    setBookingModalSalon(salon);
    setBookingModalInitialServiceIds(initialSelectedServiceIds);
  };

  const [bookingSummaryContext, setBookingSummaryContext] = useState<{
    salon: Salon;
    services: any[];
    specialist: any | null;
    slot: SlotItem;
    customerDetails: any;
    pricingSummary: any;
  } | null>(null);

  const handleBookModalContinue = (
    salon: Salon,
    selectedServices: any[],
    selectedSpecialist: any | null,
    selectedSlot: SlotItem,
    pricingSummary: {
      subtotal: number;
      discount: number;
      total: number;
      deposit: number;
      balanceAtSalon: number;
      couponCode?: string;
    },
    customerDetails?: any
  ) => {
    setBookingSummaryContext({
      salon,
      services: selectedServices,
      specialist: selectedSpecialist,
      slot: selectedSlot,
      customerDetails: customerDetails || {
        name: user?.name || 'Aarav Sharma',
        phone: user?.phone || '+91 98765 43210',
        email: user?.email || 'aarav@glowslot.com',
      },
      pricingSummary,
    });
    setCurrentView('bookingSummary');
  };

  const handleConfirmBooking = (
    salon: Salon,
    selectedServices: any[],
    selectedSpecialist: any | null,
    selectedSlot: SlotItem,
    pricingSummary: any,
    customerDetails: any
  ) => {
    handleBookModalContinue(salon, selectedServices, selectedSpecialist, selectedSlot, pricingSummary, customerDetails);
  };

  const handleBookingSummaryConfirmPayment = (summaryData: any) => {
    if (summaryData.bookingId) {
      setSelectedBookingId(summaryData.bookingId);
      setCurrentView('bookingSuccess');
    }
  };

  const [slotPickerContext, setSlotPickerContext] = useState<{
    salon: Salon;
    service: { id: string; name: string; durationMin: number; basePrice: number };
  } | null>(null);

  useEffect(() => {
    // Check initial route
    const path = window.location.pathname;
    const params = new URLSearchParams(window.location.search);
    const refCode = params.get('ref') || params.get('referral');

    if (refCode) {
      setReferralCode(refCode.toUpperCase());
    }

    if (path === '/invite' || path === '/signup') {
      if (user) {
        showToast('You are already signed in.');
        setCurrentView('tabs');
      } else {
        setCurrentView('invite');
      }
    }
  }, [user, setReferralCode]);

  useEffect(() => {
    const applyReferral = async () => {
      const code = getReferralCode();
      if (user && code) {
        console.log('[GlowSlot] Applying referral code:', code);
        await referralService.applyReferral(code);
        setReferralCode(null);
      }
    };
    applyReferral();
  }, [user, getReferralCode, setReferralCode]);

  useEffect(() => {
    const sub = authService.onAuthStateChange((sessionUser) => {
      console.log('[AppShell] Auth listener callback:', sessionUser);
      setUser(sessionUser);
    });

    return () => {
      sub.unsubscribe();
    };
  }, [setUser]);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }, [theme]);

  // Capacitor Hardware Back Button Handler
  useEffect(() => {
    let backListener: any;
    const setupBackListener = async () => {
      try {
        backListener = await CapacitorApp.addListener('backButton', () => {
          if (isLocationSheetOpen) {
            setIsLocationSheetOpen(false);
            return;
          }
          if (currentView !== 'tabs') {
            setCurrentView('tabs');
            return;
          }
          if (activeTab !== 'home') {
            setActiveTab('home');
            return;
          }
          CapacitorApp.minimizeApp();
        });
      } catch {
        // Web browser environment ignore
      }
    };
    setupBackListener();
    return () => {
      if (backListener && typeof backListener.remove === 'function') {
        backListener.remove();
      }
    };
  }, [currentView, activeTab, isLocationSheetOpen]);

  const requireAuth = (targetView: ViewMode): boolean => {
    if (!user) {
      showToast('Please sign in to proceed.');
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

  const handleSlotContinue = async (
    slot: SlotItem,
    salon: Salon,
    service: { id: string; name: string; durationMin: number; basePrice: number }
  ) => {
    if (reschedulingBooking) {
      const res = await bookingService.rescheduleBooking(
        reschedulingBooking.id,
        { id: slot.id, date: slot.date, time: slot.time },
        user?.id
      );
      if (res.success) {
        showToast(`Appointment rescheduled to ${slot.date} at ${slot.time}!`);
        setSelectedBookingId(reschedulingBooking.id);
        setReschedulingBooking(null);
        setCurrentView('bookingDetail');
      } else {
        showToast(res.error || 'Failed to reschedule.');
      }
      return;
    }

    setBookingSummaryContext({
      salon,
      services: [service],
      specialist: null,
      slot,
      customerDetails: {
        name: user?.name || 'Aarav Sharma',
        phone: user?.phone || '+91 98765 43210',
        email: user?.email || 'aarav@glowslot.com',
      },
      pricingSummary: {
        subtotal: service.basePrice,
        discount: 0,
        total: service.basePrice,
        deposit: Math.round(service.basePrice * 0.25),
        balanceAtSalon: service.basePrice - Math.round(service.basePrice * 0.25),
      },
    });
    setCurrentView('bookingSummary');
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
    const salon =
      mockSalons.find((s) => s.name === booking.salonName) || mockSalons[0];
    handleOpenSalon(salon.id);
    showToast(`Welcome back to ${salon.name}! Select services to rebook.`);
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-bg text-text font-sans flex flex-col max-w-lg mx-auto relative shadow-2xl overflow-x-hidden selection:bg-primary-soft selection:text-primary">
        {/* Offline Banner */}
        <OfflineBanner />

        {/* Auth / Onboarding Views */}
        {currentView === 'splash' && (
          <SplashScreen
            onFinish={(destination) => {
              if (destination === 'main') setCurrentView('tabs');
              else if (destination === 'onboarding') setCurrentView('onboarding');
              else setCurrentView('login');
            }}
          />
        )}

        {currentView === 'onboarding' && (
          <OnboardingScreen onComplete={() => setCurrentView('login')} />
        )}

        {currentView === 'login' && (
          <LoginScreen
            onSuccess={() => handlePostAuthNavigate()}
            onContinueAsGuest={() => setCurrentView('tabs')}
          />
        )}

        {currentView === 'invite' && (
          <InviteLandingScreen
            onJoin={(code) => {
              // Navigate to signup with referral
              window.location.href = `/signup?ref=${code}`;
            }}
            onSignIn={() => setCurrentView('login')}
          />
        )}

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

        {currentView === 'profileSetup' && (
          <ProfileSetupScreen onComplete={handlePostAuthNavigate} />
        )}

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
            onViewAppointments={() => {
              setActiveTab('bookings');
              setCurrentView('tabs');
            }}
          />
        )}

        {currentView === 'bookingDetail' && selectedBookingId && (
          <BookingDetailScreen
            bookingId={selectedBookingId}
            onBack={() => setCurrentView('tabs')}
            onReschedule={handleStartReschedule}
            onRebook={handleRebook}
          />
        )}

        {currentView === 'bookingSummary' && bookingSummaryContext && (
          <BookingSummaryScreen
            salon={bookingSummaryContext.salon}
            services={bookingSummaryContext.services}
            specialist={bookingSummaryContext.specialist}
            slot={bookingSummaryContext.slot}
            customerDetails={bookingSummaryContext.customerDetails}
            pricingSummary={bookingSummaryContext.pricingSummary}
            onBack={() => setCurrentView('salonDetail')}
            onChangeSalon={() => setCurrentView('tabs')}
            onChangeServices={() => {
              setBookingModalSalon(bookingSummaryContext.salon);
            }}
            onChangeSpecialist={() => {
              setBookingModalSalon(bookingSummaryContext.salon);
            }}
            onChangeSlot={() => {
              setBookingModalSalon(bookingSummaryContext.salon);
            }}
            onChangeContact={() => {
              setBookingModalSalon(bookingSummaryContext.salon);
            }}
            onAddEditNote={(newNote) => {
              setBookingSummaryContext((prev) =>
                prev
                  ? {
                      ...prev,
                      customerDetails: {
                        ...prev.customerDetails,
                        specialInstructions: newNote,
                      },
                    }
                  : null
              );
            }}
            onConfirmPayment={handleBookingSummaryConfirmPayment}
            onCancelBooking={() => {
              setBookingSummaryContext(null);
              setCurrentView('salonDetail');
              showToast('Booking summary cancelled');
            }}
          />
        )}

        {/* Salon Detail & Slot Picker */}
        {currentView === 'salonDetail' && selectedSalonId && (
          <SalonDetailScreen
            salonId={selectedSalonId}
            onBack={() => setCurrentView('tabs')}
            onSelectServiceForSlot={handleSelectServiceForSlot}
            onSelectSalon={(id) => setSelectedSalonId(id)}
            onBookNowModal={handleOpenBookModal}
          />
        )}

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



        {/* Notifications & Profile Ecosystem (S21 to S30) */}
        {currentView === 'notifications' && (
          <NotificationsScreen onBack={() => setCurrentView('tabs')} />
        )}

        {currentView === 'profile' && (
          <ProfileMainScreen
            onBack={() => setCurrentView('tabs')}
            onEditProfile={() => setCurrentView('editProfile')}
            onBookingHistory={() => setCurrentView('bookingHistory')}
            onSavedAddresses={() => setCurrentView('savedAddresses')}
            onFavouriteSalons={() => setCurrentView('favouriteSalons')}
            onWalletPoints={() => setCurrentView('walletPoints')}
            onReferEarn={() => setCurrentView('referEarn')}
            onSettings={() => setCurrentView('settings')}
            onHelpSupport={() => setCurrentView('helpSupport')}
            onTermsPrivacy={() => setCurrentView('termsPrivacy')}
            onAdminDashboard={() => setCurrentView('adminDashboard')}
            onLoggedOut={() => setCurrentView('login')}
          />
        )}

        {currentView === 'bookingHistory' && (
          <BookingHistoryScreen
            onBack={() => setCurrentView('profile')}
            onSelectBooking={(id) => {
              setSelectedBookingId(id);
              setCurrentView('bookingDetail');
            }}
            onRebook={handleRebook}
          />
        )}

        {currentView === 'adminDashboard' && (
          <AdminDashboard onBack={() => setCurrentView('profile')} />
        )}

        {currentView === 'editProfile' && (
          <EditProfileScreen onBack={() => setCurrentView('profile')} />
        )}

        {currentView === 'savedAddresses' && (
          <SavedAddressesScreen onBack={() => setCurrentView('profile')} />
        )}

        {currentView === 'favouriteSalons' && (
          <FavouriteSalonsScreen
            onBack={() => setCurrentView('profile')}
            onSelectSalon={handleOpenSalon}
            onExploreSalons={() => {
              setActiveTab('salons');
              setCurrentView('tabs');
            }}
          />
        )}

        {currentView === 'walletPoints' && (
          <WalletPointsScreen
            onBack={() => setCurrentView('tabs')}
            onReferClick={() => setCurrentView('referEarn')}
            onPayQR={() => setCurrentView('qrPayment')}
            onRedeemQR={() => setCurrentView('qrPayment')}
          />
        )}

        {currentView === 'qrPayment' && (
          <QRPaymentScreen
            onBack={() => setCurrentView('walletPoints')}
            onSuccess={() => setCurrentView('walletPoints')}
          />
        )}

        {currentView === 'referEarn' && (
          <ReferEarnScreen onBack={() => setCurrentView('tabs')} />
        )}

        {currentView === 'settings' && (
          <SettingsScreen onBack={() => setCurrentView('profile')} />
        )}

        {currentView === 'helpSupport' && (
          <HelpSupportScreen onBack={() => setCurrentView('profile')} />
        )}

        {currentView === 'termsPrivacy' && (
          <TermsPrivacyScreen onBack={() => setCurrentView('profile')} />
        )}

        {/* Main Tabbed Views */}
        {currentView === 'tabs' && (
          <div className="flex-1 flex flex-col">
            <main className="flex-1 pb-20">
              {activeTab === 'home' && (
                <HomeScreen
                  onOpenLocation={() => setIsLocationSheetOpen(true)}
                  onSelectSalon={handleOpenSalon}
                  onBookNowModal={handleOpenBookModal}
                  onOpenNotifications={() => setCurrentView('notifications')}
                  onOpenProfile={() => setActiveTab('profile')}
                  onOpenPoints={() => setActiveTab('rewards')}
                  onOpenRefer={() => setCurrentView('referEarn')}
                />
              )}

              {activeTab === 'favouriteSalons' && (
                <FavouriteSalonsScreen
                  onBack={() => setActiveTab('home')}
                  onSelectSalon={handleOpenSalon}
                  onExploreSalons={() => setActiveTab('home')}
                />
              )}

              {activeTab === 'bookings' && (
                <BookingsListScreen
                  onSelectBooking={(id) => {
                    setSelectedBookingId(id);
                    setCurrentView('bookingDetail');
                  }}
                  onReschedule={handleStartReschedule}
                  onRebook={handleRebook}
                  onExploreSalons={() => setActiveTab('search')}
                />
              )}

              {activeTab === 'rewards' && (
                <WalletPointsScreen
                  onBack={() => setActiveTab('home')}
                  onReferClick={() => setCurrentView('referEarn')}
                  onPayQR={() => setCurrentView('qrPayment')}
                  onRedeemQR={() => setCurrentView('qrPayment')}
                />
              )}

              {activeTab === 'profile' && (
                <ProfileMainScreen
                  onBack={() => setActiveTab('home')}
                  onEditProfile={() => setCurrentView('editProfile')}
                  onBookingHistory={() => setCurrentView('bookingHistory')}
                  onSavedAddresses={() => setCurrentView('savedAddresses')}
                  onFavouriteSalons={() => setCurrentView('favouriteSalons')}
                  onWalletPoints={() => setActiveTab('rewards')}
                  onReferEarn={() => setCurrentView('referEarn')}
                  onSettings={() => setCurrentView('settings')}
                  onHelpSupport={() => setCurrentView('helpSupport')}
                  onTermsPrivacy={() => setCurrentView('termsPrivacy')}
                  onAdminDashboard={() => setCurrentView('adminDashboard')}
                  onLoggedOut={() => setCurrentView('login')}
                />
              )}
            </main>

            {/* Bottom 5-Tab Bar */}
            <BottomTabBar activeTab={activeTab} onTabChange={setActiveTab} bookingBadgeCount={2} />
          </div>
        )}

        {/* O01 Location Selector Sheet */}
        <LocationSheet
          isOpen={isLocationSheetOpen}
          onClose={() => setIsLocationSheetOpen(false)}
        />

        {/* Book Service Selection Modal */}
        {bookingModalSalon && (
          <BookServiceModal
            isOpen={Boolean(bookingModalSalon)}
            onClose={() => {
              setBookingModalSalon(null);
              setBookingModalInitialServiceIds(undefined);
            }}
            salon={bookingModalSalon}
            initialSelectedServiceIds={bookingModalInitialServiceIds}
            onContinue={handleBookModalContinue}
            onConfirmBooking={handleConfirmBooking}
          />
        )}

        {/* Toast Container */}
        <ToastContainer />
      </div>
    </ErrorBoundary>
  );
};
