
'use client';

import type { FunctionComponent } from 'react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { CalendarDays, Zap, Rocket } from 'lucide-react';
import { gsap } from 'gsap';
import { generateDailyGreetingAction } from '@/app/actions';

interface WelcomeScreenProps {
  onProceed: () => void;
}

const FOMO_HOOKS = [
  "Launch BlockSmithAI!",
  "Ignite Your AI Edge!",
  "Discover Crypto Alpha!",
  "Start AI Analysis Now!",
  "Unleash Trading Strategies!",
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
        setDailyGreeting(result.greeting || "Welcome back, Analyst! Ready to conquer the charts?"); 
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
    }, 1500); 

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
              stagger: 0.15, 
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


  return (
    <div ref={welcomeRef} className="flex flex-col items-center justify-center text-center p-2 w-full max-w-2xl mx-auto space-y-3 md:space-y-4">
      
      <Card ref={greetingCardRef} className="w-full shadow-xl border-primary/40 bg-card/80 backdrop-blur-sm hover:border-primary transition-all duration-300 ease-in-out hover:shadow-[0_0_20px_3px_hsl(var(--primary)/0.5)]">
        <CardHeader className="items-center pb-1 pt-3"> 
          <CalendarDays className="h-6 w-6 md:h-8 md:w-8 text-primary mb-0.5" /> 
          <CardTitle className="text-md md:text-lg font-bold font-headline text-foreground"> 
            A Moment with <span className="text-primary">BlockSmithAI</span>:
          </CardTitle>
        </CardHeader>
        <CardContent className="text-xs md:text-sm text-muted-foreground min-h-[30px] px-3 pb-3"> 
          {isLoadingGreeting ? (
            <div className="space-y-1">
              <Skeleton className="h-3 w-3/4 mx-auto bg-muted/50" />
              <Skeleton className="h-3 w-1/2 mx-auto bg-muted/50" />
            </div>
          ) : (
            <p className="italic">{dailyGreeting}</p>
          )}
        </CardContent>
      </Card>

      <Card ref={benefitsCardRef} className="w-full shadow-xl border-accent/40 bg-card/80 backdrop-blur-sm hover:border-accent transition-all duration-300 ease-in-out hover:shadow-[0_0_20px_3px_hsl(var(--accent)/0.5)]">
        <CardHeader className="items-center pb-1 pt-3">
           <Zap className="h-6 w-6 md:h-8 md:w-8 text-accent mb-0.5"/>
          <CardTitle className="text-md md:text-lg font-bold font-headline text-foreground">
            Your <span className="text-accent">Unfair Advantage</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1.5 text-xs md:text-sm text-muted-foreground px-3 md:px-4 pb-3"> 
           <p><strong className="text-primary">AI-Powered Insights:</strong> Decode market complexities.</p>
           <p><strong className="text-primary">Actionable Strategies:</strong> Get (hypothetical!) trade parameters.</p>
        </CardContent>
      </Card>

      <Card ref={storyCardRef} className="w-full shadow-xl border-tertiary/40 bg-card/80 backdrop-blur-sm hover:border-tertiary transition-all duration-300 ease-in-out hover:shadow-[0_0_20px_3px_hsl(var(--tertiary)/0.5)]">
        <CardHeader className="items-center pb-1 pt-3">
          <Rocket className="h-6 w-6 md:h-8 md:w-8 text-tertiary mb-0.5" /> 
          <CardTitle className="text-md md:text-lg font-bold font-headline text-foreground">
            Your <span className="text-tertiary">Quest</span> Awaits
          </CardTitle>
        </CardHeader>
        <CardContent className="text-xs md:text-sm text-muted-foreground px-3 pb-3">
          <p>
            BlockSmithAI is your <strong className="text-accent">AI co-pilot</strong>. Ready to <strong className="text-purple-400">explore?</strong>
          </p>
        </CardContent>
      </Card>
      
      <Button
        ref={buttonRef}
        onClick={onProceed}
        size="lg"
        className="mt-3 bg-gradient-to-r from-primary via-accent to-tertiary text-primary-foreground font-semibold py-3 px-6 md:px-8 text-lg md:text-xl shadow-xl border-2 border-transparent hover:border-primary hover:shadow-[0_0_25px_5px_hsl(var(--primary)/0.7)] transition-all duration-300 transform hover:scale-105 active:scale-95 w-full max-w-xs sm:max-w-sm"
      >
        <span className="inline-block min-w-[240px] text-center"> 
          {FOMO_HOOKS[currentFomoIndex]}
        </span>
      </Button>
      <p className="text-xs text-muted-foreground/80 pt-1">Click the button above to begin your AI-driven analysis!</p>
    </div>
  );
};

export default WelcomeScreen;


    