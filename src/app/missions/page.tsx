'use client';

import AppHeader from '@/components/blocksmith-ai/AppHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Clock, Zap, Users, ShieldCheck, Gift } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

const missions = [
  { id: 1, title: 'First Signal', description: 'Generate your first trading signal using the Core Console.', reward: '100 XP & 500 Airdrop Points', icon: <Zap className="h-8 w-8 text-primary"/>, status: 'completed' },
  { id: 2, title: 'The Analyst', description: 'Generate signals for 3 different assets (e.g., BTC, ETH, SOL).', reward: '250 XP & 1000 Airdrop Points', icon: <ShieldCheck className="h-8 w-8 text-tertiary"/>, status: 'available' },
  { id: 3, title: 'Community Initiate', description: 'Join the BlockShadow Telegram or Discord channel.', reward: '50 XP & 250 Airdrop Points', icon: <Users className="h-8 w-8 text-accent"/>, status: 'available' },
  { id: 4, title: 'Weekly Streak', description: 'Generate at least one signal every day for 7 consecutive days.', reward: '1000 XP & 5000 Airdrop Points', icon: <Gift className="h-8 w-8 text-orange-400"/>, status: 'locked' },
];

export default function MissionsPage() {
    const { toast } = useToast();

    const handleClaim = (missionTitle: string) => {
        toast({
            title: `Reward Claimed for "${missionTitle}"!`,
            description: "Your XP and Airdrop Points have been added to your profile.",
            variant: "default",
        })
    }

  return (
    <>
      <AppHeader />
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-primary mb-2">Missions Terminal</h1>
            <p className="text-muted-foreground">Complete quests to earn XP, airdrop points, and level up your Shadow Core.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {missions.map(mission => (
                <Card key={mission.id} className={`bg-card/80 backdrop-blur-sm transition-all duration-300 ${mission.status === 'locked' ? 'opacity-60' : 'hover:border-primary/50'}`}>
                    <CardHeader className="flex flex-row items-start gap-4">
                        <div className="p-3 bg-background rounded-lg">{mission.icon}</div>
                        <div>
                            <CardTitle>{mission.title}</CardTitle>
                            <CardDescription>{mission.description}</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-sm font-semibold text-green-400 bg-green-900/30 border border-green-500/30 rounded-md p-2 text-center">
                            Reward: {mission.reward}
                        </div>
                    </CardContent>
                    <CardFooter>
                         {mission.status === 'completed' && (
                            <Button disabled className="w-full">
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Completed
                            </Button>
                        )}
                        {mission.status === 'available' && (
                             <Button onClick={() => handleClaim(mission.title)} className="w-full glow-button">
                                Claim Reward
                            </Button>
                        )}
                        {mission.status === 'locked' && (
                            <Button disabled className="w-full">
                                <Clock className="mr-2 h-4 w-4" />
                                Locked
                            </Button>
                        )}
                    </CardFooter>
                </Card>
            ))}
        </div>
      </div>
    </>
  );
}
