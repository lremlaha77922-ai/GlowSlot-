import React, { useEffect } from 'react';
import { Scissors } from 'lucide-react';
import { useSessionStore } from '../../../store/useSessionStore';

interface SplashScreenProps {
  onFinish: (destination: 'onboarding' | 'login' | 'main') => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const { user, isGuest, hasSeenOnboarding } = useSessionStore();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (user || isGuest) {
        onFinish('main');
      } else if (!hasSeenOnboarding) {
        onFinish('onboarding');
      } else {
        onFinish('login');
      }
    }, 1200);

    return () => clearTimeout(timer);
  }, [user, isGuest, hasSeenOnboarding, onFinish]);

  return (
    <div className="min-h-screen bg-primary flex flex-col items-center justify-center p-6 text-white text-center relative overflow-hidden select-none">
      {/* Decorative background glows */}
      <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-white/10 blur-2xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-accent/20 blur-2xl pointer-events-none" />

      {/* Brand Icon */}
      <div className="w-20 h-20 rounded-[24px] bg-white text-primary flex items-center justify-center shadow-2xl mb-4 animate-in zoom-in-75 duration-300">
        <Scissors size={40} className="stroke-[2.2]" />
      </div>

      <h1 className="text-2xl font-bold tracking-tight">GlowSlot</h1>
      <p className="text-xs text-white/80 mt-1 font-medium tracking-wide">
        Smart Slots. Zero Wait.
      </p>

      {/* Subtle loader */}
      <div className="absolute bottom-12 flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-white/80 animate-ping" />
      </div>
    </div>
  );
};
