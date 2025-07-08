
'use client';
import { useState, useEffect, useCallback } from 'react';
import AppHeader from '@/components/blocksmith-ai/AppHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Loader2, AlertTriangle, Lock, Unlock, Zap, Database, Cpu, Atom, Layers, PlusCircle, ShoppingCart } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import Link from 'next/link';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import GlyphScramble from '@/components/blocksmith-ai/GlyphScramble';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const MINING_RIGS = [
    {
        id: 'rig-01',
        name: 'Tier 1 Miner: ZX-80',
        description: 'A basic mining rig for entry-level SHADOW acquisition.',
        requiredXp: 0,
        hashRate: 0.5, // SHADOW per hour
        icon: <Database className="h-8 w-8 text-primary"/>,
    },
    {
        id: 'rig-02',
        name: 'Tier 2 Miner: Quantum Core',
        description: 'Utilizes quantum superposition to enhance mining efficiency.',
        requiredXp: 1000,
        hashRate: 2.5,
        icon: <Cpu className="h-8 w-8 text-accent"/>,
    },
    {
        id: 'rig-03',
        name: 'Tier 3 Miner: Singularity Engine',
        description: 'Taps into a micro-singularity for unparalleled hash power.',
        requiredXp: 5000,
        hashRate: 10,
        icon: <Atom className="h-8 w-8 text-tertiary"/>,
    }
];

const StakingCard = ({ shadowBalance }: { shadowBalance: number }) => {
    const [stakeAmount, setStakeAmount] = useState('');
    const [stakedBalance, setStakedBalance] = useState(0);
    const { toast } = useToast();

    const handleStake = () => {
        const amount = parseFloat(stakeAmount);
        if (isNaN(amount) || amount <= 0 || amount > shadowBalance) {
            toast({ title: 'Invalid Amount', description: 'Please enter a valid amount to stake.', variant: 'destructive' });
            return;
        }
        setStakedBalance(prev => prev + amount);
        // In a real app, you would call an action here.
        toast({ title: <span className="text-primary">Stake Successful</span>, description: `${amount.toLocaleString()} $BSAI staked.` });
        setStakeAmount('');
    };
    
    const handleUnstake = () => {
         if (stakedBalance <= 0) return;
         setStakedBalance(0);
         toast({ title: <span className="text-primary">Unstaked Successfully</span>, description: `All $BSAI tokens have been returned to your balance.` });
    }

    return (
        <Card className="interactive-card border-primary/50 shadow-lg shadow-primary/10">
            <CardHeader>
                <CardTitle className="flex items-center text-primary"><Layers className="mr-3 h-5 w-5"/> Staking Vault</CardTitle>
                <CardDescription>Stake your <strong className="text-orange-400">$BSAI</strong> to earn rewards. APY is dynamic based on network activity.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="p-3 bg-background/50 rounded-md">
                        <p className="text-sm text-muted-foreground">Staked Balance</p>
                        <p className="text-2xl font-bold font-mono text-primary">{stakedBalance.toLocaleString()}</p>
                    </div>
                     <div className="p-3 bg-background/50 rounded-md">
                        <p className="text-sm text-muted-foreground">Estimated APY</p>
                        <p className="text-2xl font-bold font-mono text-primary">Dynamic</p>
                    </div>
                </div>
                 <div className="flex items-center gap-2">
                    <Input 
                        type="number"
                        placeholder="Amount to stake"
                        value={stakeAmount}
                        onChange={(e) => setStakeAmount(e.target.value)}
                        className="bg-background"
                    />
                    <Button onClick={handleStake} className="glow-button whitespace-nowrap">Stake Tokens</Button>
                </div>
                {stakedBalance > 0 && <Button onClick={handleUnstake} variant="outline" className="w-full">Unstake All</Button>}
            </CardContent>
        </Card>
    );
};

const MiningRigCard = ({ rig, userXp }: { rig: typeof MINING_RIGS[0], userXp: number }) => {
    const isUnlocked = userXp >= rig.requiredXp;
    const { toast } = useToast();
    
    const handleActivate = () => {
        toast({
            title: <span className="text-accent">{rig.name} Activated!</span>,
            description: `Mining initiated. This is a mock action for demonstration.`,
        });
    };

    return (
        <Card className={cn("interactive-card flex flex-col", !isUnlocked && "opacity-60 bg-card/50")}>
            <CardHeader>
                 <div className="flex items-center gap-4">
                    <div className="p-3 bg-background rounded-lg border border-border">
                        {rig.icon}
                    </div>
                    <div>
                        <CardTitle className="text-lg">{rig.name}</CardTitle>
                        <CardDescription>{rig.description}</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
                 <div className="text-xs p-3 bg-background/50 rounded-md">
                     <div className="flex justify-between items-center text-muted-foreground"><span><Zap className="inline h-3 w-3 mr-1"/>Hash Rate</span> <span><Zap className="inline h-3 w-3 mr-1 text-tertiary"/>XP Required</span></div>
                     <div className="flex justify-between items-center font-semibold text-foreground mt-1">
                        <span className="text-primary">{rig.hashRate} $BSAI / hr</span>
                         <span className="text-tertiary">{rig.requiredXp.toLocaleString()} XP</span>
                    </div>
                 </div>
                 {!isUnlocked && (
                     <Progress value={(userXp / rig.requiredXp) * 100} className="h-2 [&>*]:bg-tertiary" />
                 )}
            </CardContent>
            <CardFooter className="mt-auto">
                {isUnlocked ? (
                    <Button className="w-full shadow-choice-button" onClick={handleActivate}>
                        <Zap className="h-4 w-4 mr-2"/> Activate Miner
                    </Button>
                ) : (
                    <Button className="w-full" disabled>
                        <Lock className="h-4 w-4 mr-2"/> Locked
                    </Button>
                )}
            </CardFooter>
        </Card>
    );
};


export default function VaultPage() {
    const { user: currentUser, isLoading: isUserLoading, error: userError } = useCurrentUser();
    const { toast } = useToast();

    const renderContent = () => {
        if (isUserLoading) {
            return (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-primary"/>
                </div>
            );
        }

        if (userError || !currentUser) {
            return (
                <Card className="text-center py-12 px-6 bg-card/80 backdrop-blur-sm border-destructive interactive-card">
                    <CardHeader>
                        <div className="mx-auto bg-destructive/10 p-3 rounded-full w-fit">
                            <AlertTriangle className="h-10 w-10 text-destructive" />
                        </div>
                        <CardTitle className="mt-4 text-destructive">Vault Access Denied</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-base text-destructive-foreground">{userError || "Please visit the Core Console to initialize a user session."}</p>
                        <Button asChild className="glow-button mt-4">
                            <Link href="/core">Return to Core</Link>
                        </Button>
                    </CardContent>
                </Card>
            );
        }

        return (
             <div className="space-y-8">
                <Card className="bg-card/80 backdrop-blur-sm border-orange-400/50 shadow-lg shadow-orange-400/10 interactive-card">
                    <CardHeader>
                        <CardTitle className="flex items-center text-lg text-orange-400">
                            <Database className="mr-3 h-5 w-5"/>
                            <GlyphScramble text="My SHADOW Balance" />
                        </CardTitle>
                        <CardDescription>
                            Your available <strong className="text-orange-400">$BSAI</strong> balance for staking and other operations.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl sm:text-4xl lg:text-5xl font-bold text-orange-400 font-mono tracking-wider">
                            {(currentUser.airdropPoints || 0).toLocaleString()} <span className="text-2xl">$BSAI</span>
                        </p>
                    </CardContent>
                </Card>

                <StakingCard shadowBalance={currentUser.airdropPoints || 0} />
                
                <div>
                     <Card className="mb-8 bg-card/80 backdrop-blur-sm border-accent/50 shadow-lg shadow-accent/10 interactive-card">
                        <CardHeader>
                            <CardTitle className="flex items-center text-lg text-accent">
                                <Cpu className="mr-3 h-5 w-5"/>
                                <GlyphScramble text="Mining Operations" />
                            </CardTitle>
                            <CardDescription>
                                Activate mining rigs to generate <strong className="text-orange-400">$BSAI</strong> passively. Better rigs unlock with <strong className="text-tertiary">more XP</strong>.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                           <p className="text-3xl sm:text-4xl lg:text-5xl font-bold text-tertiary font-mono tracking-wider">
                                {currentUser.weeklyPoints.toLocaleString()} XP
                            </p>
                        </CardContent>
                    </Card>

                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {MINING_RIGS.map(rig => (
                            <MiningRigCard key={rig.id} rig={rig} userXp={currentUser.weeklyPoints || 0} />
                        ))}
                    </div>
                </div>

                <Card className="interactive-card border-tertiary/50 shadow-lg shadow-tertiary/10">
                    <CardHeader>
                         <CardTitle className="flex items-center text-tertiary"><PlusCircle className="mr-3 h-5 w-5"/> Purchase Power</CardTitle>
                         <CardDescription>Future integration: Directly purchase more hash power or $BSAI tokens.</CardDescription>
                    </CardHeader>
                    <CardFooter className="flex flex-col sm:flex-row gap-4">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="outline" className="w-full" disabled>
                                        <ShoppingCart className="mr-2"/> Buy Hash Power
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent><p>Coming Soon</p></TooltipContent>
                            </Tooltip>
                             <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="outline" className="w-full" disabled>
                                         <ShoppingCart className="mr-2"/> Buy $BSAI
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent><p>Coming Soon</p></TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </CardFooter>
                </Card>

            </div>
        );
    };

    return (
    <>
      <AppHeader />
      <div className="container mx-auto px-4 py-8 pb-24">
        {renderContent()}
      </div>
    </>
  );
}
