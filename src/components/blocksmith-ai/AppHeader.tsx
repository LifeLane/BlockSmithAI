
'use client';
import { FunctionComponent } from 'react';
import { ThemeToggle } from '@/components/theme-toggle';
import { useCurrentUserState } from '@/components/blocksmith-ai/CurrentUserProvider';
import { Gift, Fingerprint, Wallet } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import GlyphScramble from './GlyphScramble';
import { useWallet } from '@solana/wallet-adapter-react';
import { Button } from '@/components/ui/button';

const AppHeader: FunctionComponent = () => {
  const { user, isLoading } = useCurrentUserState();
  const { select, wallets, publicKey, disconnect } = useWallet();

  const handleWalletConnect = () => {
    if (publicKey) {
      disconnect();
    } else if (wallets.length) {
      // Here you can implement a wallet selection modal
      // For simplicity, we'll just connect to the first available wallet
      select(wallets[0].adapter.name);
    }
  };

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
            <Button onClick={handleWalletConnect} variant="outline" size="sm" className="gap-2">
              <Wallet className="h-4 w-4" />
              {publicKey ? `${publicKey.toBase58().slice(0, 4)}...${publicKey.toBase58().slice(-4)}` : 'Connect Wallet'}
            </Button>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
