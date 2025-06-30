
'use client';

import { FunctionComponent, useEffect, useRef } from 'react';
import { Zap } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';

interface AppHeaderProps {
  onApiSettingsClick?: () => void;
}

const AppHeader: FunctionComponent<AppHeaderProps> = ({ onApiSettingsClick }) => {
  return (
    <header className="py-2 relative">
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
          <div className="ml-2 flex items-center">
            <Zap className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
          </div>
        </div>
        <div className="glowing-logo-border mt-2"></div>
      </div>
      <div className="absolute top-2 right-4 flex items-center gap-2">
        <ThemeToggle />
      </div>
      <style jsx>{`
        .glowing-logo-border {
          height: 2px;
          width: 200px; /* Centered border width */
          background-image: linear-gradient(
            90deg,
            hsl(var(--primary)),
            hsl(var(--accent)),
            hsl(var(--tertiary)),
            hsl(var(--accent)),
            hsl(var(--primary))
          );
          background-size: 300% 100%;
          animation: scroll-glow-animation 4s linear infinite;
          border-radius: 1px; /* Optional: slight rounding */
        }

        @keyframes scroll-glow-animation {
          0% {
            background-position: 150% 0;
          }
          100% {
            background-position: -150% 0;
          }
        }
      `}</style>
    </header>
  );
};

export default AppHeader;
