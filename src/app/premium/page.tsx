
'use client';

import { useMemo, useState, useEffect } from 'react';
import AppHeader from '@/components/blocksmith-ai/AppHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Zap, Star, Rocket, Wallet, Shield } from 'lucide-react';
import { useCurrentUserState } from '@/components/blocksmith-ai/CurrentUserProvider';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import SubscriptionCard from '@/components/blocksmith-ai/SubscriptionCard';
import { Skeleton } from '@/components/ui/skeleton';
import TokenInfo from '@/components/blocksmith-ai/TokenInfo';

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
        icon: <Zap className="h-8 w-8 text-primary" />,
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
        icon: <Star className="h-8 w-8 text-accent" />,
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
        icon: <Rocket className="h-8 w-8 text-tertiary" />,
    }
]

export default function PremiumPage() {
    const { user } = useCurrentUserState();
    const { connected, publicKey } = useWallet();
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const walletAddress = useMemo(() => publicKey?.toBase58(), [publicKey]);

    const renderContent = () => {
        if (!isClient) {
            return (
                 <Card className="text-center py-12 px-6 bg-card/80 backdrop-blur-sm interactive-card">
                    <CardHeader>
                        <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4"><Wallet className="h-10 w-10 text-primary"/></div>
                        <CardTitle className="font-headline text-2xl">Connect Your Wallet</CardTitle>
                        <CardDescription className="text-base">
                            Connect your Solana wallet to manage your SHADOW subscription and unlock premium features.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-12 w-48 mx-auto" />
                    </CardContent>
                </Card>
            )
        }
        
        if (!connected || !walletAddress) {
            return (
                <Card className="text-center py-12 px-6 bg-card/80 backdrop-blur-sm interactive-card">
                    <CardHeader>
                        <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4"><Wallet className="h-10 w-10 text-primary"/></div>
                        <CardTitle className="font-headline text-2xl">Connect Your Wallet</CardTitle>
                        <CardDescription className="text-base">
                            Connect your Solana wallet to manage your SHADOW subscription and unlock premium features.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <WalletMultiButton className="glow-button" />
                    </CardContent>
                </Card>
            );
        }

        return (
            <div className="space-y-8">
                 <Card className="bg-card/80 backdrop-blur-sm border-primary/30">
                    <CardHeader>
                        <CardTitle className="text-xl font-headline text-primary">Your Wallet</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">Connected Address:</p>
                        <p className="text-lg font-mono break-all">{walletAddress}</p>
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
    <>
      <AppHeader />
      <div className="container mx-auto px-4 py-8 pb-24">
        <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold font-headline text-primary animate-shadow-pulse-primary">
                Become a SHADOW Protocol Insider
            </h1>
            <p className="text-lg text-muted-foreground mt-4 max-w-3xl mx-auto">
                Acquire and send SHADOW tokens to the creator address to unlock unlimited signals, airdrop multipliers, and exclusive rewards.
            </p>
        </div>
        
        <TokenInfo />

        <div className="mt-12">
            {renderContent()}
        </div>
      </div>
    </>
  );
}
