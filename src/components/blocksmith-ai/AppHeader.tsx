
'use client';

import { FunctionComponent, useEffect, useRef } from 'react';
import { Zap } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';

interface AppHeaderProps {
  onApiSettingsClick?: () => void;
}

const AppHeader: FunctionComponent<AppHeaderProps> = ({ onApiSettingsClick }) => {
  return (
    <header className="py-4 relative border-b border-border/50">
      <div className="container mx-auto flex flex-col items-center justify-center">
        <div className="flex items-center">
          <div className="logo-container flex items-baseline text-3xl sm:text-4xl font-bold font-headline select-none">
            <div className="word-block flex text-primary">
              Block
            </div>
            <div className="word-shadow flex ml-1 text-accent">
              SHADOW
            </div>
          </div>
        </div>
      </div>
      <div className="absolute top-1/2 -translate-y-1/2 right-4 flex items-center gap-2">
        <ThemeToggle />
      </div>
    </header>
  );
};

export default AppHeader;
