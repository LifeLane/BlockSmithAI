
'use client';
import { useState, useEffect, useCallback } from 'react';
import AppHeader from '@/components/blocksmith-ai/AppHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, AlertTriangle, Bot, Binary, Network, Waypoints, Zap, ArrowUp, Clock, Gift, CheckCircle2, Star, Trophy, Server, TrendingUp } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import Link from 'next/link';
import {
  fetchAgentDataAction,
  deployAgentAction,
  claimAgentRewardsAction,
  upgradeAgentAction,
  fetchSpecialOpsAction,
  claimSpecialOpAction,
  type UserAgentData,
  type SpecialOp,
} from '@/app/actions';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import GlyphScramble from '@/components/blocksmith-ai/GlyphScramble';

const AGENT_ICONS: { [key: string]: React.ElementType } = {
    Binary: Binary,
    Network: Network,
    Waypoints: Waypoints,
    Server: Server,
    Default: Bot,
};

const Countdown = ({ endTime }: { endTime: string }) => {
    const [timeLeft, setTimeLeft] = useState('');

    useEffect(() => {
        const intervalId = setInterval(() => {
            const now = new Date();
            const end = new Date(endTime);
            const distance = end.getTime() - now.getTime();

            if (distance < 0) {
                setTimeLeft('Completed');
                clearInterval(intervalId);
                return;
            }

            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            setTimeLeft(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
        }, 1000);

        return () => clearInterval(intervalId);
    }, [endTime]);

    return <span className="font-mono">{timeLeft}</span>;
};


const AgentCard = ({ agentData, userXp, onAction, userId }: { agentData: UserAgentData, userXp: number, onAction: () => void, userId: string }) => {
    const { toast } = useToast();
    const [isProcessing, setIsProcessing] = useState(false);
    
    const level = agentData.userState?.level || 1;
    const currentLevelData = agentData.levels.find(l => l.level === level);
    const nextLevelData = agentData.levels.find(l => l.level === level + 1);
    const isMaxLevel = !nextLevelData;
    
    if (!currentLevelData) return null; // Should not happen with valid data

    const Icon = AGENT_ICONS[agentData.icon] || AGENT_ICONS.Default;
    
    const handleDeploy = async () => {
        setIsProcessing(true);
        const result = await deployAgentAction(userId, agentData.id);
        if (result.success) {
            toast({ title: <span className="text-primary">{agentData.name} Deployed!</span>, description: "Deployment initiated. Check back after the duration to claim rewards." });
            onAction();
        } else {
            toast({ title: "Deployment Failed", description: result.error, variant: "destructive" });
        }
        setIsProcessing(false);
    };

    const handleClaim = async () => {
        setIsProcessing(true);
        const result = await claimAgentRewardsAction(userId, agentData.id);
         if (result.success) {
            toast({ 
                title: <span className="text-accent">Rewards Claimed!</span>, 
                description: <span className="text-foreground italic">"{result.log}"</span> 
            });
            onAction();
        } else {
            toast({ title: "Claim Failed", description: result.message, variant: "destructive" });
        }
        setIsProcessing(false);
    };

    const handleUpgrade = async () => {
        if (!currentLevelData.upgradeCost || currentLevelData.upgradeCost === 0) {
             toast({ title: "Max Level", description: "This agent is already at its maximum level.", variant: "default" });
             return;
        }

        setIsProcessing(true);
        const result = await upgradeAgentAction(userId, agentData.id);
         if (result.success) {
            toast({ title: <span className="text-tertiary">Upgrade Successful!</span>, description: result.message });
            onAction();
        } else {
            toast({ title: "Upgrade Failed", description: result.message, variant: "destructive" });
        }
        setIsProcessing(false);
    };
    
    const isDeployed = agentData.userState?.status === 'DEPLOYED';
    const isComplete = isDeployed && agentData.userState.deploymentEndTime && new Date(agentData.userState.deploymentEndTime) <= new Date();
    const canUpgrade = !isMaxLevel && userXp >= currentLevelData.upgradeCost;

    return (
        <Card className="bg-card/80 backdrop-blur-sm transition-all duration-300 flex flex-col interactive-card">
            <CardHeader>
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-background rounded-lg border border-border">
                        <Icon className="h-8 w-8 text-primary"/>
                    </div>
                    <div>
                        <CardTitle className="text-lg">{agentData.name}</CardTitle>
                        <CardDescription>Level {level}</CardDescription>
                    </div>
                </div>
                <p className="text-sm text-muted-foreground pt-2">{agentData.description}</p>
            </CardHeader>
            <CardContent className="space-y-3">
                 <div className="text-xs p-2 bg-background/50 rounded-md">
                    <div className="flex justify-between items-center text-muted-foreground"><span><Clock className="inline h-3 w-3 mr-1"/>Duration</span> <span><Gift className="inline h-3 w-3 mr-1"/>Rewards</span></div>
                    <div className="flex justify-between items-center font-semibold text-foreground mt-1">
                        <span>{currentLevelData.deployDuration / 60} min</span>
                        <span className="text-right">
                           <span className="text-orange-400">{currentLevelData.bsaiReward} BSAI</span> + <span className="text-tertiary">{currentLevelData.xpReward} XP</span>
                        </span>
                    </div>
                </div>

                {!isMaxLevel && currentLevelData.upgradeCost > 0 && (
                    <div className="text-xs p-2 bg-background/50 rounded-md">
                        <div className="flex justify-between items-center text-muted-foreground"><span><ArrowUp className="inline h-3 w-3 mr-1"/>Next Level Upgrade</span></div>
                        <div className="flex justify-between items-center font-semibold text-foreground mt-1">
                           <span className="text-tertiary">{currentLevelData.upgradeCost} XP</span>
                           <Button size="sm" variant="outline" className="h-7 text-xs border-tertiary text-tertiary hover:bg-tertiary/20" disabled={isProcessing || isDeployed || !canUpgrade} onClick={handleUpgrade}>
                                {isProcessing ? <Loader2 className="h-4 w-4 animate-spin"/> : <ArrowUp className="h-4 w-4"/>}
                           </Button>
                        </div>
                         {!canUpgrade && <p className="text-red-500/80 text-center mt-1 text-[10px]">Insufficient XP</p>}
                    </div>
                )}
                 {isMaxLevel && (
                    <div className="text-xs p-2 bg-background/50 rounded-md text-center text-tertiary font-semibold">
                       Max Level Reached
                    </div>
                )}
            </CardContent>
            <CardFooter className="mt-auto">
                {isDeployed ? (
                    isComplete ? (
                         <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" onClick={handleClaim} disabled={isProcessing}>
                             {isProcessing ? <Loader2 className="h-4 w-4 animate-spin"/> : <CheckCircle2 className="h-4 w-4 mr-2"/>} Claim Rewards
                         </Button>
                    ) : (
                        <Button className="w-full" disabled>
                            <Clock className="h-4 w-4 mr-2 animate-pulse"/> Deployed ({agentData.userState?.deploymentEndTime && <Countdown endTime={agentData.userState.deploymentEndTime} />})
                        </Button>
                    )
                ) : (
                    <Button className="w-full glow-button" onClick={handleDeploy} disabled={isProcessing}>
                        {isProcessing ? <Loader2 className="h-4 w-4 animate-spin"/> : <Zap className="h-4 w-4 mr-2"/>} Deploy Agent
                    </Button>
                )}
            </CardFooter>
        </Card>
    );
};

const SpecialOpCard = ({ op, agents, onClaim }: { op: SpecialOp, agents: UserAgentData[], onClaim: (opId: string) => void }) => {
    const [isProcessing, setIsProcessing] = useState(false);

    const requiredAgent = agents.find(a => a.id === op.requiredAgentId);
    const userAgentLevel = requiredAgent?.userState?.level || 0;
    const canClaim = userAgentLevel >= op.requiredAgentLevel;

    const handleClaim = async () => {
        setIsProcessing(true);
        await onClaim(op.id);
        setIsProcessing(false);
    };

    const Icon = AGENT_ICONS[requiredAgent?.icon || 'Default'] || AGENT_ICONS.Default;

    return (
        <Card className="bg-gradient-to-br from-tertiary/20 via-card to-accent/20 border-tertiary shadow-lg shadow-tertiary/20 mb-8 interactive-card">
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle className="flex items-center text-tertiary text-xl">
                        <Star className="mr-3 h-6 w-6"/> <GlyphScramble text="Special Operation" />
                    </CardTitle>
                    <Trophy className="h-8 w-8 text-orange-400"/>
                </div>
                <CardDescription className="text-lg font-semibold text-foreground pt-1">{op.title}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{op.description}</p>
                <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex-1 min-w-[150px] p-3 bg-background/70 rounded-md">
                        <div className="font-semibold text-muted-foreground mb-1">Requirement:</div>
                        <div className="flex items-center gap-2">
                             <Icon className="h-5 w-5 text-tertiary"/>
                             <span className="font-bold text-foreground">{requiredAgent?.name || op.requiredAgentId} (Lvl {op.requiredAgentLevel}+)</span>
                        </div>
                        <div className={`text-xs mt-1 ${canClaim ? 'text-green-400' : 'text-red-400'}`}>
                            Your Level: {userAgentLevel}
                        </div>
                    </div>
                     <div className="flex-1 min-w-[150px] p-3 bg-background/70 rounded-md">
                        <div className="font-semibold text-muted-foreground mb-1">Reward:</div>
                        <div className="font-bold text-orange-400">{op.bsaiReward.toLocaleString()} BSAI</div>
                        <div className="font-bold text-tertiary">{op.xpReward.toLocaleString()} XP</div>
                    </div>
                </div>
            </CardContent>
            <CardFooter>
                <Button className="w-full bg-tertiary hover:bg-tertiary/90 text-tertiary-foreground font-bold text-base py-3" onClick={handleClaim} disabled={!canClaim || isProcessing}>
                    {isProcessing ? <Loader2 className="h-5 w-5 animate-spin" /> : <Trophy className="mr-2 h-5 w-5"/>}
                    {canClaim ? "Claim Special Reward" : "Requirement Not Met"}
                </Button>
            </CardFooter>
        </Card>
    );
}

export default function AgentsPage() {
    const [agentData, setAgentData] = useState<UserAgentData[]>([]);
    const [userXp, setUserXp] = useState(0);
    const [specialOps, setSpecialOps] = useState<SpecialOp[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { toast } = useToast();
    const { user: currentUser, isLoading: isUserLoading, error: userError } = useCurrentUser();

    const fetchData = useCallback(async (userId: string) => {
        setIsLoading(true);
        setError(null);
        
        try {
            const [agentResult, opsResult] = await Promise.all([
                fetchAgentDataAction(userId),
                fetchSpecialOpsAction(userId)
            ]);

            if ('error' in agentResult) {
                setError(agentResult.error);
            } else {
                setAgentData(agentResult.agents);
                setUserXp(agentResult.userXp);
            }
            
            setSpecialOps(opsResult); // No error handling for ops, can fail gracefully
        } catch (e: any) {
            setError(e.message || "An unexpected error occurred while fetching agent data.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (userError) {
            setError(userError);
            setIsLoading(false);
        } else if (currentUser) {
            fetchData(currentUser.id);
        }
    }, [currentUser, userError, fetchData]);
    
    const handleClaimSpecialOp = async (opId: string) => {
        if (!currentUser) return;
        const result = await claimSpecialOpAction(currentUser.id, opId);
        if (result.success) {
            toast({ title: "Special Op Reward Claimed!", description: result.message, variant: 'default' });
            fetchData(currentUser.id); // Refresh all data
        } else {
            toast({ title: "Claim Failed", description: result.message, variant: 'destructive' });
        }
    };

    const renderContent = () => {
        if (isLoading || isUserLoading) {
            return (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-primary"/>
                </div>
            );
        }

        if (error) {
            return (
                <Card className="text-center py-12 px-6 bg-card/80 backdrop-blur-sm border-destructive interactive-card">
                    <CardHeader>
                        <div className="mx-auto bg-destructive/10 p-3 rounded-full w-fit">
                            <AlertTriangle className="h-10 w-10 text-destructive" />
                        </div>
                        <CardTitle className="mt-4 text-destructive">Agent Network Error</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-base text-destructive-foreground">{error}</p>
                        <Button asChild className="glow-button mt-4">
                            <Link href="/core">Return to Core</Link>
                        </Button>
                    </CardContent>
                </Card>
            );
        }

        return (
            <>
                <Card className="mb-8 bg-card/80 backdrop-blur-sm border-tertiary/50 shadow-lg shadow-tertiary/10 interactive-card">
                    <CardHeader>
                        <CardTitle className="flex items-center text-lg text-tertiary">
                            <TrendingUp className="mr-3 h-5 w-5"/>
                            <GlyphScramble text="Available Experience Points" />
                        </CardTitle>
                        <CardDescription>
                            Use <strong className="text-tertiary">XP</strong> to upgrade your agents and unlock <strong className="text-accent">higher rewards</strong>.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl sm:text-4xl lg:text-5xl font-bold text-tertiary font-mono tracking-wider">
                            {userXp.toLocaleString()} XP
                        </p>
                    </CardContent>
                </Card>

                {specialOps.map(op => (
                    <SpecialOpCard key={op.id} op={op} agents={agentData} onClaim={handleClaimSpecialOp} />
                ))}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {currentUser && agentData.map(agent => (
                        <AgentCard key={agent.id} agentData={agent} userXp={userXp} onAction={() => fetchData(currentUser.id)} userId={currentUser.id} />
                    ))}
                </div>
            </>
        );
    }

  return (
    <>
      <AppHeader />
      <div className="container mx-auto px-4 py-8">
        <ScrollArea className="h-[calc(100vh-160px)] pr-4">
            {renderContent()}
        </ScrollArea>
      </div>
    </>
  );
}
