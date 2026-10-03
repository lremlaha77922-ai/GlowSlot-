import React, { useState } from 'react';
import { Button } from '../../../components/Button';
import { useSessionStore } from '../../../store/useSessionStore';
import { Timer, Scissors, ShieldCheck, ArrowRight } from 'lucide-react';

interface OnboardingScreenProps {
  onComplete: () => void;
}

const SLIDES = [
  {
    icon: Timer,
    title: 'Smart Slots. Dynamic Pricing.',
    description:
      'Book morning and off-peak appointments at up to 40% discount, or grab exclusive free slots every day.',
    tag: 'Dynamic Pricing',
    color: 'text-primary bg-primary-soft',
  },
  {
    icon: Scissors,
    title: 'Zero Wait Times Guaranteed.',
    description:
      'Hold your chair before you step out of home. Walk in straight to an empty chair with your preferred barber.',
    tag: 'Guaranteed Hold',
    color: 'text-accent bg-accent/10',
  },
  {
    icon: ShieldCheck,
    title: 'At-Home Grooming Excellence.',
    description:
      'Prefer staying home? Certified professionals arrive with sealed sanitized single-use kits and clean up after.',
    tag: 'Doorstep Care',
    color: 'text-deal bg-deal/15',
  },
];

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({
  onComplete,
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { markOnboardingSeen } = useSessionStore();

  const handleFinish = () => {
    markOnboardingSeen();
    onComplete();
  };

  const handleNext = () => {
    if (currentSlide < SLIDES.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      handleFinish();
    }
  };

  const slide = SLIDES[currentSlide];
  const Icon = slide.icon;

  return (
    <div className="min-h-screen bg-bg text-text flex flex-col justify-between p-6 max-w-lg mx-auto">
      {/* Top Skip Button per Design.md 8.1 */}
      <div className="flex justify-end pt-2">
        <button
          onClick={handleFinish}
          className="text-xs font-semibold text-muted hover:text-text px-3 py-1.5 rounded-button cursor-pointer"
        >
          Skip
        </button>
      </div>

      {/* Main Slide Content */}
      <div className="flex-1 flex flex-col items-center justify-center text-center px-2">
        {/* Large Illustration / Icon Container */}
        <div
          className={`w-28 h-28 rounded-[28px] ${slide.color} flex items-center justify-center mb-8 shadow-level-1 transition-all duration-300`}
        >
          <Icon size={52} />
        </div>

        <span className="text-[11px] font-bold text-primary uppercase tracking-widest bg-primary-soft px-3 py-1 rounded-chip mb-3">
          {slide.tag}
        </span>

        <h2 className="text-xl sm:text-2xl font-bold text-text leading-tight mb-3 max-w-xs">
          {slide.title}
        </h2>

        <p className="text-xs text-muted leading-relaxed max-w-xs">
          {slide.description}
        </p>
      </div>

      {/* Bottom Controls: Dots & CTA */}
      <div className="flex flex-col gap-6 pb-4">
        {/* Dot Indicators */}
        <div className="flex items-center justify-center gap-2">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`h-1.5 rounded-full transition-all duration-200 cursor-pointer ${
                i === currentSlide ? 'w-6 bg-primary' : 'w-2 bg-border'
              }`}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>

        <Button
          variant="primary"
          size="lg"
          fullWidth
          onClick={handleNext}
          className="flex items-center justify-center gap-2"
        >
          <span>{currentSlide === SLIDES.length - 1 ? 'Get Started' : 'Next'}</span>
          <ArrowRight size={16} />
        </Button>
      </div>
    </div>
  );
};
