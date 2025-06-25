
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Zap, AreaChart, Bot, Target, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/pulse', icon: Zap, label: 'Live Pulse' },
  { href: '/monitor', icon: AreaChart, label: 'Monitor' },
  { href: '/core', icon: Bot, label: 'Core' },
  { href: '/missions', icon: Target, label: 'Missions' },
  { href: '/leaderboard', icon: Trophy, label: 'Ranks' },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-card border-t border-border/50 shadow-lg z-50 flex justify-around items-center">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link href={item.href} key={item.href} className="flex flex-col items-center justify-center w-full h-full text-muted-foreground hover:text-primary transition-colors">
            <item.icon className={cn('h-6 w-6 mb-1', isActive ? 'text-primary' : '')} />
            <span className={cn('text-xs font-medium', isActive ? 'text-primary' : '')}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
