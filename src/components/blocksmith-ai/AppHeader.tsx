
import { FunctionComponent, useEffect, useRef } from 'react';
import { Zap } from 'lucide-react';
import { gsap } from 'gsap';

interface AppHeaderProps {}

const AppHeader: FunctionComponent<AppHeaderProps> = () => {
  const logoContainerRef = useRef<HTMLDivElement>(null);
  const zapIconWrapperRef = useRef<HTMLDivElement>(null); // Ref for the Zap icon's wrapper div

  useEffect(() => {
    if (logoContainerRef.current && zapIconWrapperRef.current) {
      const blockLetters = logoContainerRef.current.querySelectorAll('.word-block .letter');
      const smithLetters = logoContainerRef.current.querySelectorAll('.word-smith .letter');
      const aiLetters = logoContainerRef.current.querySelectorAll('.word-ai .letter');
      
      const tl = gsap.timeline();

      // Initial states
      gsap.set([...blockLetters, ...smithLetters, ...aiLetters], { autoAlpha: 0, y: 25, rotationX: -90, transformOrigin: "50% 50% -10px" });
      gsap.set(zapIconWrapperRef.current, { autoAlpha: 0, scale: 0, rotationZ: -180 });

      // Animate "Block"
      tl.to(blockLetters, {
        autoAlpha: 1, y: 0, rotationX: 0,
        duration: 0.4, stagger: 0.05, ease: 'power2.out',
      });
      // Animate "Smith"
      tl.to(smithLetters, {
        autoAlpha: 1, y: 0, rotationX: 0,
        duration: 0.4, stagger: 0.05, ease: 'power2.out',
      }, "-=0.2"); 
      // Animate "AI"
      tl.to(aiLetters, {
        autoAlpha: 1, y: 0, rotationX: 0,
        duration: 0.3, stagger: 0.08, ease: 'back.out(1.7)',
      }, "-=0.1");
      // Animate Zap icon
      tl.to(zapIconWrapperRef.current, {
        autoAlpha: 1, scale: 1, rotationZ: 0,
        duration: 0.6, ease: 'elastic.out(1, 0.6)',
      }, "-=0.3");
    }
  }, []);

  return (
    <header> {/* Removed py-4 */}
      <div className="container mx-auto flex items-center justify-center h-10"> {/* Reduced height */}
        <div className="logo-container flex items-baseline text-3xl sm:text-4xl font-bold font-headline select-none" ref={logoContainerRef}>
          <div className="word-block flex">
            <span className="letter text-primary">B</span>
            <span className="letter text-primary">l</span>
            <span className="letter text-primary">o</span>
            <span className="letter text-primary">c</span>
            <span className="letter text-primary">k</span>
          </div>
          <div className="word-smith flex">
            <span className="letter text-foreground">S</span>
            <span className="letter text-foreground">m</span>
            <span className="letter text-foreground">i</span>
            <span className="letter text-foreground">t</span>
            <span className="letter text-foreground">h</span>
          </div>
          <div className="word-ai ml-1 flex">
            <span className="letter text-accent">A</span>
            <span className="letter text-accent">I</span>
          </div>
        </div>
        <div ref={zapIconWrapperRef} className="ml-2 flex items-center">
          <Zap className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
