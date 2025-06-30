
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Briefcase, Bot, Trophy, Cpu, Terminal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

const navItems = [
  { href: '/pulse', icon: Briefcase, label: 'Portfolio' },
  { href: '/terminal', icon: Terminal, label: 'Terminal' },
  { href: '/core', icon: Bot, label: 'Core' },
  { href: '/agents', icon: Cpu, label: 'Field Ops' },
  { href: '/profile', icon: Trophy, label: 'Profile' },
];

export default function BottomNav() {
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);


  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-card border-t border-border/50 shadow-lg z-50 flex justify-around items-center">
      {navItems.map((item) => {
        const isActive = isMounted && pathname === item.href;
        return (
          <Link href={item.href} key={item.href} className="flex flex-col items-center justify-center w-full h-full text-muted-foreground hover:text-primary transition-colors">
            <item.icon className={cn('h-6 w-6 mb-1 transition-all', isActive ? 'text-primary nav-icon-active-glow' : '')} />
            <span className={cn('text-xs font-medium', isActive ? 'text-primary' : '')}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
