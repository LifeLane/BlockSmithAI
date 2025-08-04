'use client';

import type { FunctionComponent} from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CandlestickChart } from 'lucide-react';

interface TickerItem {
  name: string;
  url: string;
  icon: React.ReactNode;
}

interface LivePriceTickerProps {
    items: TickerItem[];
    direction: 'normal' | 'reverse';
    title: string;
}

const LivePriceTicker: FunctionComponent<LivePriceTickerProps> = ({ items, direction, title }) => {
  const animationClass = direction === 'reverse' ? 'animate-marquee-reverse' : 'animate-marquee';
  
  // Duplicate items for a seamless continuous scroll effect
  const displayItems = [...items, ...items, ...items];

  return (
    <div className="relative bg-card/50 border-y border-border/80 shadow-sm h-12 overflow-hidden flex items-center group">
        <div className="absolute left-0 top-0 bottom-0 z-10 w-24 bg-gradient-to-r from-background to-transparent"/>
        <div className="absolute right-0 top-0 bottom-0 z-10 w-24 bg-gradient-to-l from-background to-transparent"/>
        <div className="absolute left-4 top-1/2 -translate-y-1/2 z-20">
            <span className="font-bold text-sm tracking-widest text-primary opacity-70">{title}</span>
        </div>
      <div className={cn("whitespace-nowrap flex items-center h-full group-hover:[animation-play-state:paused]", animationClass)}>
        {displayItems.map((item, index) => (
           <Button key={index} asChild variant="ghost" className="justify-start text-sm mx-2">
                <a href={item.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                    {item.icon} {item.name}
                </a>
            </Button>
        ))}
      </div>
    </div>
  );
};

export default LivePriceTicker;
