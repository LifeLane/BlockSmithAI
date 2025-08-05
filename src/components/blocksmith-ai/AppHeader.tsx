
'use client';
import { FunctionComponent } from 'react';
import { ThemeToggle } from '@/components/theme-toggle';
import { useCurrentUserState } from '@/components/blocksmith-ai/CurrentUserProvider';
import { Gift, Fingerprint } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import GlyphScramble from './GlyphScramble';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

const AppHeader: FunctionComponent = () => {
  const { user, isLoading } = useCurrentUserState();

  return (
    <header className="py-4 relative border-b border-transparent bg-gradient-to-r from-transparent via-primary/20 to-transparent">
      <div className="container mx-auto flex items-center justify-between">
        
        <div className="absolute top-1/2 -translate-y-1/2 left-4 hidden sm:flex items-center gap-4 text-xs">
          {isLoading ? (
            <>
              <Skeleton className="h-5 w-24 bg-muted/50" />
              <Skeleton className="h-5 w-20 bg-muted/50" />
            </>
          ) : user ? (
            <>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Fingerprint className="h-4 w-4 text-primary" />
                <span className="font-mono">{user.shadowId}</span>
              </div>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Gift className="h-4 w-4 text-orange-400" />
                <span className="font-mono font-bold text-orange-400">{user.airdropPoints?.toLocaleString() || 0}</span>
              </div>
            </>
          ) : null}
        </div>

        <div className="flex-1 flex justify-center">
            <div className="logo-container flex items-baseline text-3xl sm:text-4xl font-bold font-headline select-none">
                <div className="word-block flex text-primary animate-shadow-pulse-primary">
                Block
                </div>
                <div className="word-shadow flex ml-1 text-accent">
                  <GlyphScramble text="SHADOW" />
                </div>
            </div>
        </div>

        <div className="absolute top-1/2 -translate-y-1/2 right-4 flex items-center gap-2">
            <ThemeToggle />
            <WalletMultiButton className="!bg-secondary hover:!bg-secondary/80 !text-secondary-foreground !h-9 !rounded-md !px-3" />
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
