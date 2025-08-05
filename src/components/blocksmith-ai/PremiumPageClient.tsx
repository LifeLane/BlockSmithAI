
'use client';

import { useMemo, useState, useEffect, lazy, Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Telescope, LineChart } from 'lucide-react';
import { useCurrentUserState } from '@/components/blocksmith-ai/CurrentUserProvider';
import SubscriptionCard from '@/components/blocksmith-ai/SubscriptionCard';
import { Skeleton } from '@/components/ui/skeleton';
import TokenInfo from '@/components/blocksmith-ai/TokenInfo';
import { explorerLinks, tradingLinks } from '@/lib/external-links';
import { useWallet } from '@solana/wallet-adapter-react';

const LivePriceTicker = lazy(() => import('@/components/blocksmith-ai/LivePriceTicker'));


const tiers = [
    {
        name: 'Trial Subscription',
        price: 10000,
        duration: 'Trial',
        features: [
            '3 Days Unlimited Signals',
            'Bonus Airdrop Points',
            'Entry-level SHADOW Back'
        ],
        icon: <Shield className="h-8 w-8 text-green-400" />,
    },
    {
        name: 'Operator Monthly',
        price: 100000,
        duration: 'Monthly',
        features: [
            'Unlimited Signal Generation',
            'Standard Airdrop Points',
            '1.2x SHADOW Back Reward'
        ],
        icon: <Telescope className="h-8 w-8 text-primary" />,
    },
    {
        name: 'Analyst Yearly',
        price: 1000000,
        duration: 'Yearly',
        features: [
            'Everything in Monthly',
            'Priority Access to New Agents',
            '1.5x SHADOW Back Reward',
            'Exclusive Community Access'
        ],
        icon: <LineChart className="h-8 w-8 text-accent" />,
        isPopular: true
    },
    {
        name: 'Architect Lifetime',
        price: 10000000,
        duration: 'Lifetime',
        features: [
            'Everything in Yearly',
            'Permanent Premium Status',
            '2x SHADOW Back Reward',
            'Direct Line to SHADOW Core Devs'
        ],
        icon: <Shield className="h-8 w-8 text-tertiary" />,
    }
];

export default function PremiumPageClient() {
    const { user } = useCurrentUserState();
    const { publicKey } = useWallet();
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const walletAddress = useMemo(() => publicKey?.toBase58(), [publicKey]);
    
    const PriceTickerSkeleton = () => (
        <div className="w-full h-10 bg-card/80 backdrop-blur-sm rounded-lg flex items-center p-2">
            <Skeleton className="h-6 w-full" />
        </div>
    );

    const renderContent = () => {
        if (!isClient) {
            return (
                <div className="space-y-8">
                     <Skeleton className="h-24 w-full" />
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {tiers.map(tier => (
                            <Skeleton key={tier.name} className="h-96 w-full" />
                        ))}
                     </div>
                </div>
            )
        }
        
        return (
            <div className="space-y-8">
                 <Card className="bg-card/80 backdrop-blur-sm border-primary/30">
                    <CardHeader>
                        <CardTitle className="text-xl font-headline text-primary">Your Wallet</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">Connected Address:</p>
                        <p className="text-lg font-mono break-all truncate">{walletAddress || 'Not Connected'}</p>
                    </CardContent>
                </Card>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                   {tiers.map(tier => (
                       <SubscriptionCard key={tier.name} tier={tier} userId={user?.id} />
                   ))}
                </div>
            </div>
        );
    };

    return (
      <div className="container mx-auto px-4 py-8 pb-24">
        <div className="text-center mb-8">
            <h1 className="text-4xl sm:text-5xl font-bold font-headline text-primary animate-shadow-pulse-primary">
                Become a SHADOW Protocol Insider
            </h1>
            <p className="text-lg text-muted-foreground mt-4 max-w-3xl mx-auto">
                Acquire and send SHADOW tokens to the creator address to unlock unlimited signals, airdrop multipliers, and exclusive rewards.
            </p>
        </div>
        
        <div className="space-y-4">
            <div>
                <h3 className="font-bold text-sm tracking-widest text-primary opacity-70 flex items-center gap-2 mb-1"><Telescope size={16}/> EXPLORER</h3>
                 <Suspense fallback={<PriceTickerSkeleton />}>
                    {isClient && <LivePriceTicker items={explorerLinks} direction="normal" />}
                 </Suspense>
            </div>
            <div>
                <h3 className="font-bold text-sm tracking-widest text-accent opacity-70 flex items-center gap-2 mb-1"><LineChart size={16}/> TRADING & VERIFICATION</h3>
                 <Suspense fallback={<PriceTickerSkeleton />}>
                    {isClient && <LivePriceTicker items={tradingLinks} direction="reverse" />}
                 </Suspense>
            </div>
            <TokenInfo />
        </div>


        <div className="mt-12">
            {renderContent()}
        </div>
      </div>
  );
}
