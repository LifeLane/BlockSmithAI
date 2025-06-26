
'use client';
import { useState, useEffect, useCallback } from 'react';
import AppHeader from '@/components/blocksmith-ai/AppHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, AlertTriangle, Bot, Binary, Network, Waypoints, Zap, ArrowUp, Clock, Gift, CheckCircle2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import Link from 'next/link';
import {
  fetchAgentDataAction,
  deployAgentAction,
  claimAgentRewardsAction,
  upgradeAgentAction,
  type UserAgentData,
  type AgentLevel
} from '@/app/actions';
import { Progress } from '@/components/ui/progress';

const getCurrentUserId = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('currentUserId');
  }
  return null;
};

const AGENT_ICONS: { [key: string]: React.ElementType } = {
    Binary: Binary,
    Network: Network,
    Waypoints: Waypoints,
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


const AgentCard = ({ agentData, userXp, onAction }: { agentData: UserAgentData, userXp: number, onAction: () => void }) => {
    const { toast } = useToast();
    const [isProcessing, setIsProcessing] = useState(false);
    
    const userId = getCurrentUserId();
    if (!userId) return null;

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
            toast({ title: <span className="text-accent">Rewards Claimed!</span>, description: result.message });
            onAction();
        } else {
            toast({ title: "Claim Failed", description: result.message, variant: "destructive" });
        }
        setIsProcessing(false);
    };

    const handleUpgrade = async () => {
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
    const isComplete = isDeployed && new Date(agentData.userState.deploymentEndTime!) <= new Date();
    const canUpgrade = userXp >= currentLevelData.upgradeCost;

    return (
        <Card className="bg-card/80 backdrop-blur-sm hover:border-primary/50 transition-all duration-300 flex flex-col">
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

                {!isMaxLevel && (
                    <div className="text-xs p-2 bg-background/50 rounded-md">
                        <div className="flex justify-between items-center text-muted-foreground"><span><ArrowUp className="inline h-3 w-3 mr-1"/>Next Level Upgrade</span></div>
                        <div className="flex justify-between items-center font-semibold text-foreground mt-1">
                           <span className="text-tertiary">{currentLevelData.upgradeCost} XP</span>
                           <Button size="sm" variant="outline" className="h-7 text-xs border-tertiary text-tertiary hover:bg-tertiary/20" disabled={isProcessing || isDeployed || !canUpgrade} onClick={handleUpgrade}>
                                {isProcessing ? <Loader2 className="h-4 w-4 animate-spin"/> : <ArrowUp className="h-4 w-4"/>}
                           </Button>
                        </div>
                         {!canUpgrade && <p className="text-red-500/80 text-center mt-1">Insufficient XP</p>}
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
                            <Clock className="h-4 w-4 mr-2 animate-pulse"/> Deployed (<Countdown endTime={agentData.userState!.deploymentEndTime!} />)
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

export default function AgentsPage() {
    const [agentData, setAgentData] = useState<UserAgentData[]>([]);
    const [userXp, setUserXp] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { toast } = useToast();
    const userId = getCurrentUserId();
    
    const fetchAgents = useCallback(async () => {
        if (!userId) {
            setError("User session not found. Please return to the Core Console to initialize.");
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        const result = await fetchAgentDataAction(userId);
        if ('error' in result) {
            setError(result.error);
            toast({ title: "Data Error", description: result.error, variant: "destructive" });
        } else {
            setAgentData(result.agents);
            setUserXp(result.userXp);
        }
        setIsLoading(false);
    }, [userId, toast]);

    useEffect(() => {
        fetchAgents();
    }, [fetchAgents]);

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-primary"/>
                </div>
            );
        }

        if (error) {
            return (
                <Card className="text-center py-12 px-6 bg-card/80 backdrop-blur-sm border-destructive">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {agentData.map(agent => (
                    <AgentCard key={agent.id} agentData={agent} userXp={userXp} onAction={fetchAgents} />
                ))}
            </div>
        );
    }

  return (
    <>
      <AppHeader />
      <div className="container mx-auto px-4 py-8">
        <ScrollArea className="h-[calc(100vh-300px)] pr-4">
            {renderContent()}
        </ScrollArea>
      </div>
    </>
  );
}
