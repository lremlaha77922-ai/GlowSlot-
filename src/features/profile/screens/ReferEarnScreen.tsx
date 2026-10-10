import React from 'react';
import { ReferralDashboard } from '../components/ReferralDashboard';

interface ReferEarnScreenProps {
  onBack: () => void;
}

export const ReferEarnScreen: React.FC<ReferEarnScreenProps> = ({ onBack }) => {
  return <ReferralDashboard onBack={onBack} />;
};

