
'use client';

import type { FunctionComponent } from 'react';
import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TestTube2, Sparkles } from 'lucide-react';
import { gsap } from 'gsap';

interface WelcomeScreenProps {
  onProceed: () => void;
}

const WelcomeScreen: FunctionComponent<WelcomeScreenProps> = ({ onProceed }) => {
  const welcomeRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const descriptionContainerRef = useRef<HTMLDivElement>(null); // Renamed for clarity, this is CardContent
  const buttonRef = useRef<HTMLButtonElement>(null);
  const iconRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    // Ensure the main container is made visible by GSAP before children animate
    if (welcomeRef.current) {
      gsap.set(welcomeRef.current, { autoAlpha: 1 });
    }

    // Set initial hidden states for all animatable elements
    if (iconRef.current) gsap.set(iconRef.current, { autoAlpha: 0, scale: 0, rotation: -180 });
    if (titleRef.current) gsap.set(titleRef.current, { autoAlpha: 0, y: 30 });
    if (descriptionContainerRef.current) gsap.set(descriptionContainerRef.current, { autoAlpha: 0, y: 20 });
    if (buttonRef.current) gsap.set(buttonRef.current, { autoAlpha: 0, scale: 0.8 });

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' }});

    // Start animating elements sequentially or with controlled overlaps
    if (iconRef.current) {
      tl.to(iconRef.current, { autoAlpha: 1, scale: 1, rotation: 0, duration: 0.8 }, 0.2); // Start at 0.2s absolute time
    }
    if (titleRef.current) {
      tl.to(titleRef.current, { autoAlpha: 1, y: 0, duration: 0.6 }, ">-0.5"); // Start 0.5s before the end of the icon animation
    }
    if (descriptionContainerRef.current) { // This is CardContent
      tl.to(descriptionContainerRef.current, { autoAlpha: 1, y: 0, duration: 0.6 }, ">-0.4"); // Start 0.4s before the end of the title animation
    }
    if (buttonRef.current) {
      // Start button animation 0.2s after the descriptionContainerRef animation begins
      // tl.recent().startTime() gets the start time of the last added animation (descriptionContainerRef)
      const buttonStartTime = tl.recent().startTime() + 0.2;
      tl.to(buttonRef.current, { autoAlpha: 1, scale: 1, duration: 0.5 }, buttonStartTime);
    }
  }, []);

  return (
    <div ref={welcomeRef} className="flex flex-col items-center justify-center text-center p-4 max-w-xl mx-auto" style={{opacity: 0}}>
      <Card className="w-full shadow-xl border-primary/30 bg-card/80 backdrop-blur-sm">
        <CardHeader className="items-center">
          <TestTube2 ref={iconRef} className="h-16 w-16 text-primary mb-4" />
          <CardTitle ref={titleRef} className="text-3xl font-bold font-headline text-foreground">
            Greetings, Intrepid Analyst!
          </CardTitle>
          <CardDescription className="text-primary font-semibold">
            From the Experimental Labs of BlockSmithAI
          </CardDescription>
        </CardHeader>
        <CardContent ref={descriptionContainerRef} className="space-y-4 text-muted-foreground">
          <p>
            You've stumbled upon the digital forge where algorithms dream of alpha and data streams flow like caffeinated rivers.
            We've been tinkering with the market's quantum fluctuations (or just staring at charts, you know, details).
          </p>
          <p>
            Our AI is primed, protocols are... mostly stable, and the coffee machine is probably working.
            Ready to peer into the crystal ball of code and see what "insights" we've conjured?
          </p>
          <Button
            ref={buttonRef}
            onClick={onProceed}
            size="lg"
            className="mt-6 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 px-8 text-lg shadow-lg hover:shadow-primary/50 transition-all duration-300 transform hover:scale-105"
          >
            <Sparkles className="mr-2 h-5 w-5" />
            Unleash the AI Oracle
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default WelcomeScreen;
