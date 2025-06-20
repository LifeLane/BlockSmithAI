
'use client';

// This component is no longer responsible for displaying the main welcome content.
// Its functionality (MarketDataDisplay as welcome) has been moved to page.tsx.
// This file can be deleted or kept empty if other minor welcome elements are added later.

import type { FunctionComponent } from 'react';

interface WelcomeScreenProps {
  onProceed: () => void;
}

const WelcomeScreen: FunctionComponent<WelcomeScreenProps> = ({ onProceed }) => {
  // Content has been moved to page.tsx's conditional rendering for showWelcomeScreen
  return null; 
};

export default WelcomeScreen;
    