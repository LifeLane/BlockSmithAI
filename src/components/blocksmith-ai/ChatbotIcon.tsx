
'use client';

import type { FunctionComponent } from 'react';
import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquareHeart } from 'lucide-react';
import { gsap } from 'gsap';

interface ChatbotIconProps {
  onClick: () => void;
}

const ChatbotIcon: FunctionComponent<ChatbotIconProps> = ({ onClick }) => {
  const iconRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (iconRef.current) {
      gsap.set(iconRef.current, { scale: 1 });
      gsap.to(iconRef.current, {
        scale: 1.1,
        duration: 0.8,
        repeat: -1,
        yoyo: true,
        ease: 'power1.inOut',
      });
    }
  }, []);

  return (
    <Button
      ref={iconRef}
      onClick={onClick}
      variant="outline"
      size="icon"
      className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-card text-accent shadow-xl border-2 border-accent hover:bg-accent/10 hover:border-primary hover:shadow-[0_0_20px_5px_hsl(var(--tertiary)/0.6)] transition-all duration-300 ease-in-out z-50 group"
      aria-label="Open SHADOW Chat Interface"
    >
      <MessageSquareHeart className="h-7 w-7 transition-transform duration-300 group-hover:scale-110 text-accent group-hover:text-primary" />
    </Button>
  );
};

export default ChatbotIcon;
