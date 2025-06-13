
'use client';

import type { FunctionComponent } from 'react';
import { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { CalendarDays, Lightbulb, BarChartBig, AlertTriangle, Zap, Rocket, Sparkles } from 'lucide-react';
import { gsap } from 'gsap';
import { generateDailyGreetingAction } from '@/app/actions';

interface WelcomeScreenProps {
  onProceed: () => void;
}

const FOMO_HOOKS = [
  "Unlock Your Edge NOW!",
  "Don't Miss Today's Alpha!",
  "The Market Waits For No One...",
  "Reveal BlockSmithAI Secrets!",
  "Is Your Next Big Trade HERE?",
];

const WelcomeScreen: FunctionComponent<WelcomeScreenProps> = ({ onProceed }) => {
  const [dailyGreeting, setDailyGreeting] = useState<string>("");
  const [isLoadingGreeting, setIsLoadingGreeting] = useState<boolean>(true);
  const [currentFomoIndex, setCurrentFomoIndex] = useState<number>(0);
  
  const animationRan = useRef<boolean>(false);

  const welcomeRef = useRef<HTMLDivElement>(null);
  const greetingCardRef = useRef<HTMLDivElement>(null);
  const benefitsCardRef = useRef<HTMLDivElement>(null);
  const storyCardRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const fetchGreeting = async () => {
      setIsLoadingGreeting(true);
      const result = await generateDailyGreetingAction();
      if ('error' in result) {
        setDailyGreeting(result.greeting || "Welcome back, Analyst! Ready to conquer the charts?"); // Fallback
        console.error("Failed to fetch daily greeting:", result.error);
      } else {
        setDailyGreeting(result.greeting);
      }
      setIsLoadingGreeting(false);
    };
    fetchGreeting();
  }, []);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentFomoIndex((prevIndex) => (prevIndex + 1) % FOMO_HOOKS.length);
    }, 1000); // Rotate every 1 second

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (!isLoadingGreeting && welcomeRef.current && !animationRan.current) {
      const elementsToAnimate = [
        greetingCardRef.current,
        benefitsCardRef.current,
        storyCardRef.current,
        buttonRef.current,
      ].filter(Boolean); 

      if (elementsToAnimate.length > 0) {
          gsap.fromTo(elementsToAnimate,
            { autoAlpha: 0, y: 50 }, 
            { 
              autoAlpha: 1,
              y: 0,
              duration: 0.7,
              stagger: 0.2,
              ease: 'power3.out',
              delay: 0.2, 
              onComplete: () => {
                animationRan.current = true;
              }
            }
          );
      }
    }
  }, [isLoadingGreeting]); 

  const handleScroll = useCallback(() => {
    const scrollY = window.scrollY;

    const applyParallax = (ref: React.RefObject<HTMLElement>, speed: number) => {
        if (ref.current) {
            // Apply transform based on scrollY and speed
            const offset = scrollY * speed;
            ref.current.style.transform = `translateY(${offset}px)`;
            // Add a small transition for smoothness (optional, depends on desired effect)
            // ref.current.style.transition = 'transform 0.1s ease-out';
            // Hint to the browser that this element's transform will change
            ref.current.style.willChange = 'transform';
        }
    };

    // Apply different negative speeds for the parallax effect
    // Negative speeds make elements move *up* relative to standard scroll direction
    applyParallax(greetingCardRef as React.RefObject<HTMLElement>, -0.05); // Moves slightly up
    applyParallax(benefitsCardRef as React.RefObject<HTMLElement>, -0.1);
    applyParallax(storyCardRef as React.RefObject<HTMLElement>, -0.15);
    applyParallax(buttonRef as React.RefObject<HTMLElement>, -0.2); // Moves faster up
}, []);

  useEffect(() => {
    // Only add listener if welcome screen is currently shown
    if (welcomeRef.current) {
         window.addEventListener('scroll', handleScroll);
        // Apply initial parallax based on current scroll position on mount
        handleScroll();
    }


    return () => {
         window.removeEventListener('scroll', handleScroll);
    };
}, [handleScroll]); 

  return (
    <div ref={welcomeRef} className="flex flex-col items-center justify-center text-center p-2 md:p-4 max-w-2xl mx-auto space-y-4 md:space-y-6">
      
      {/* Daily Greeting Section */}
      <Card ref={greetingCardRef} className="w-full shadow-xl border-primary/40 bg-card/80 backdrop-blur-sm hover:border-primary transition-all duration-300 ease-in-out hover:shadow-[0_0_20px_3px_hsl(var(--primary)/0.5)]">
        <CardHeader className="items-center pb-3">
          <CalendarDays className="h-10 w-10 text-primary mb-2" />
          <CardTitle className="text-xl md:text-2xl font-bold font-headline text-foreground">
            A Moment with <span className="text-primary">BlockSmithAI</span>:
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm md:text-base text-muted-foreground min-h-[50px]">
          {isLoadingGreeting ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-3/4 mx-auto bg-muted/50" />
              <Skeleton className="h-4 w-1/2 mx-auto bg-muted/50" />
            </div>
          ) : (
            <p className="italic">{dailyGreeting}</p>
          )}
        </CardContent>
      </Card>

      {/* Benefits Section */}
      <Card ref={benefitsCardRef} className="w-full shadow-xl border-accent/40 bg-card/80 backdrop-blur-sm hover:border-accent transition-all duration-300 ease-in-out hover:shadow-[0_0_20px_3px_hsl(var(--accent)/0.5)]">
        <CardHeader className="items-center pb-3">
           <Zap className="h-10 w-10 text-accent mb-2"/>
          <CardTitle className="text-xl md:text-2xl font-bold font-headline text-foreground">
            Your <span className="text-accent">Unfair Advantage</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm md:text-base text-muted-foreground px-4 md:px-6">
          <div className="flex flex-col items-center space-y-1 md:space-y-0 md:flex-row md:items-center md:space-x-3">
            <Lightbulb className="h-5 w-5 text-primary mb-1 md:mb-0 shrink-0" />
            <p><strong className="text-primary">AI-Powered Insights:</strong> Leverage cutting-edge AI to decode market complexities and spot potential opportunities normal squishy humans might miss.</p>
          </div>
          <div className="flex flex-col items-center space-y-1 md:space-y-0 md:flex-row md:items-center md:space-x-3">
            <BarChartBig className="h-5 w-5 text-primary mb-1 md:mb-0 shrink-0" />
            <p><strong className="text-primary">Actionable Strategies:</strong> Get clear, concise trading parameters (entry, TP/SL) so you spend less time guessing, more time executing (hypothetically!).</p>
          </div>
           <div className="flex flex-col items-center space-y-1 md:space-y-0 md:flex-row md:items-center md:space-x-3">
            <Rocket className="h-5 w-5 text-primary mb-1 md:mb-0 shrink-0" />
            <p><strong className="text-primary">Stay Ahead of the Curve:</strong> In the fast-paced crypto world, having an AI co-pilot means you're always equipped with the latest data-driven perspectives.</p>
          </div>
        </CardContent>
      </Card>

      {/* Hook Story Section */}
      <Card ref={storyCardRef} className="w-full shadow-xl border-tertiary/40 bg-card/80 backdrop-blur-sm hover:border-tertiary transition-all duration-300 ease-in-out hover:shadow-[0_0_20px_3px_hsl(var(--tertiary)/0.5)]">
        <CardHeader className="items-center pb-3">
          <AlertTriangle className="h-10 w-10 text-tertiary mb-2" />
          <CardTitle className="text-xl md:text-2xl font-bold font-headline text-foreground">
            The <span className="text-tertiary">Legend</span> of the <span className="text-orange-400">Lost Alpha</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm md:text-base text-muted-foreground">
          <p>
            They say in the digital ether, amidst flickering charts and whispered rumors, lies the <strong className="text-orange-400">Lost Alpha</strong> – opportunities missed by the masses, captured only by those with <strong className="text-primary">vision</strong> and the right <strong className="text-accent">tools</strong>.
            BlockSmithAI was forged in these very data-streams, a beacon for seekers of that elusive edge. Are you just watching, or are you <strong className="text-purple-400">ready to explore?</strong>
          </p>
        </CardContent>
      </Card>
      
      <Button
        ref={buttonRef}
        onClick={onProceed}
        size="lg"
        className="mt-6 bg-accent hover:bg-accent/90 text-accent-foreground font-semibold py-3 px-6 md:px-8 text-base md:text-lg shadow-lg hover:shadow-primary/50 transition-all duration-300 transform hover:scale-105 active:scale-95 w-full max-w-md"
      >
        <Sparkles className="mr-2 h-5 w-5 text-yellow-300" /> 
        <span className="inline-block min-w-[250px] text-center">
          {FOMO_HOOKS[currentFomoIndex]}
        </span>
      </Button>
    </div>
  );
};

export default WelcomeScreen;
