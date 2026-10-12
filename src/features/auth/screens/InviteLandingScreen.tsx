import React from 'react';
import { InviteLandingPage, InviteLandingPageProps } from '../../referral/components/InviteLandingPage';

export interface InviteLandingScreenProps extends InviteLandingPageProps {}

export const InviteLandingScreen: React.FC<InviteLandingScreenProps> = (props) => {
  return <InviteLandingPage {...props} brandName="Nexora" />;
};
