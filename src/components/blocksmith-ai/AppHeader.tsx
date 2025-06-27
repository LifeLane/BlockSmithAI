'use client';

import { FunctionComponent, useEffect, useRef } from 'react';
import { Zap } from 'lucide-react';
import { gsap } from 'gsap';
import { ThemeToggle } from '@/components/theme-toggle';

interface AppHeaderProps {
  onApiSettingsClick?: () => void;
}

const AppHeader: FunctionComponent<AppHeaderProps> = ({ onApiSettingsClick }) => {
  const logoContainerRef = useRef<HTMLDivElement>(null);
  const zapIconWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logoContainerRef.current && zapIconWrapperRef.current) {
      const blockLetters = logoContainerRef.current.querySelectorAll('.word-block .letter');
      const shadowLetters = logoContainerRef.current.querySelectorAll('.word-shadow .letter');

      const tl = gsap.timeline();

      gsap.set([...blockLetters, ...shadowLetters], { autoAlpha: 0, y: 25, rotationX: -90, transformOrigin: "50% 50% -10px" });
      gsap.set(zapIconWrapperRef.current, { autoAlpha: 0, scale: 0, rotationZ: -180 });

      tl.to(blockLetters, {
        autoAlpha: 1, y: 0, rotationX: 0,
        duration: 0.4, stagger: 0.05, ease: 'power2.out',
      });
      tl.to(shadowLetters, {
        autoAlpha: 1, y: 0, rotationX: 0,
        duration: 0.4, stagger: 0.05, ease: 'power2.out',
      }, "-=0.2");
      tl.to(zapIconWrapperRef.current, {
        autoAlpha: 1, scale: 1, rotationZ: 0,
        duration: 0.6, ease: 'elastic.out(1, 0.6)',
      }, "-=0.3");
    }
  }, []);

  return (
    <header className="py-2 relative">
      <div className="container mx-auto flex flex-col items-center justify-center">
        <div className="flex items-center">
          <div className="logo-container flex items-baseline text-3xl sm:text-4xl font-bold font-headline select-none" ref={logoContainerRef}>
            <div className="word-block flex">
              <span className="letter text-primary">B</span>
              <span className="letter text-primary">l</span>
              <span className="letter text-primary">o</span>
              <span className="letter text-primary">c</span>
              <span className="letter text-primary">k</span>
            </div>
            <div className="word-shadow flex ml-1">
              <span className="letter text-accent">S</span>
              <span className="letter text-accent">H</span>
              <span className="letter text-accent">A</span>
              <span className="letter text-accent">D</span>
              <span className="letter text-accent">O</span>
              <span className="letter text-accent">W</span>
            </div>
          </div>
          <div ref={zapIconWrapperRef} className="ml-2 flex items-center">
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
