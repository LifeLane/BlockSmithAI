
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Briefcase, AreaChart, Bot, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

const navItems = [
  { href: '/pulse', icon: Briefcase, label: 'Portfolio' },
  { href: '/monitor', icon: AreaChart, label: 'Monitor' },
  { href: '/core', icon: Bot, label: 'Core' },
  { href: '/profile', icon: Trophy, label: 'Profile' },
];

export default function BottomNav() {
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // During server render or until mounted on client, render a non-interactive skeleton
  // that is structurally identical to the client-rendered version to prevent hydration mismatch.
  if (!isMounted) {
    return (
        <nav className="fixed bottom-0 left-0 right-0 h-16 bg-card border-t border-border/50 shadow-lg z-50 flex justify-around items-center">
        {navItems.map((item) => (
            // Use an `a` tag to match the <Link> component's output.
            // Add all non-dynamic classes that the final component will have.
            <a key={item.href} href={item.href} className="flex flex-col items-center justify-center w-full h-full text-muted-foreground hover:text-primary transition-colors">
                <item.icon className="h-6 w-6 mb-1" />
                <span className="text-xs font-medium">
                    {item.label}
                </span>
            </a>
        ))}
        </nav>
    );
  }

  // After mounting on client, render the real links with active state
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
