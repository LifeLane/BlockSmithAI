
'use client';

import { useState, useEffect } from 'react';
import AppHeader from '@/components/blocksmith-ai/AppHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Clock, Zap, Users, ShieldCheck, Gift, Award } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useToast } from "@/hooks/use-toast";
import AirdropSignupModal from '@/components/blocksmith-ai/AirdropSignupModal';
import { Badge } from '@/components/ui/badge';

const TwitterIcon = () => (
  <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary">
    <title>X</title>
    <path fill="currentColor" d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 7.184L18.901 1.153zm-1.61 19.99h2.136L4.259 2.145H2.022l15.269 19.001z"/>
  </svg>
);
const TelegramIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-6 w-6 text-primary" fill="currentColor">
        <path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-1.37.2-1.54l15.97-5.85c.73-.27 1.36.17 1.15.94l-3.22 14.22c-.21.93-1.22 1.15-1.8.56l-4.1-3.25-2.02 1.95c-.39.39-1.09.39-1.48 0z" />
    </svg>
);
const YouTubeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-6 w-6 text-primary" fill="currentColor">
        <path d="M21.582 7.696c-.246-1.34-1.28-2.37-2.62-2.616C17.043 4.5 12 4.5 12 4.5s-5.043 0-6.962.58c-1.34.246-2.374 1.276-2.62 2.616C2.5 9.615 2.5 12 2.5 12s0 2.385.418 4.304c.246 1.34 1.28 2.37 2.62 2.616C7.457 19.5 12 19.5 12 19.5s5.043 0 6.962-.58c1.34-.246 2.374-1.276 2.62-2.616C21.5 14.385 21.5 12 21.5 12s0-2.385-.418-4.304zM9.5 15.5V8.5l6 3.5-6 3.5z" />
    </svg>
);

const missions = [
  { id: 5, title: 'Follow on X', description: 'Follow BlockShadow on X to unlock airdrop.', reward: '100 Airdrop Points', icon: <TwitterIcon />, status: 'mandatory' },
  { id: 6, title: 'Join Telegram', description: 'Join the official Telegram community.', reward: '100 Airdrop Points', icon: <TelegramIcon />, status: 'mandatory' },
  { id: 7, title: 'Subscribe on YouTube', description: 'Subscribe to the BlockShadow channel.', reward: '100 Airdrop Points', icon: <YouTubeIcon />, status: 'mandatory' },
  { id: 1, title: 'First Signal', description: 'Generate your first trading signal using the Core Console.', reward: '100 XP & 500 Airdrop Points', icon: <Zap className="h-8 w-8 text-primary"/>, status: 'completed' },
  { id: 2, title: 'The Analyst', description: 'Generate signals for 3 different assets (e.g., BTC, ETH, SOL).', reward: '250 XP & 1000 Airdrop Points', icon: <ShieldCheck className="h-8 w-8 text-tertiary"/>, status: 'available' },
  { id: 4, title: 'Weekly Streak', description: 'Generate at least one signal every day for 7 consecutive days.', reward: '1000 XP & 5000 Airdrop Points', icon: <Gift className="h-8 w-8 text-orange-400"/>, status: 'locked' },
];

export default function MissionsPage() {
    const { toast } = useToast();
    const [showAirdropModal, setShowAirdropModal] = useState(false);
    const [isSignedUp, setIsSignedUp] = useState(false);
    
    useEffect(() => {
        const signedUpStatus = localStorage.getItem('bsaiIsSignedUp') === 'true';
        if (signedUpStatus) {
            setIsSignedUp(true);
        }
    }, []);

    // In a real app, this would come from a user state
    const mandatoryMissionsCompleted = 1;
    const totalMandatoryMissions = 3;
    const progress = (mandatoryMissionsCompleted / totalMandatoryMissions) * 100;


    const handleClaim = (missionTitle: string) => {
        toast({
            title: `Reward Claimed for "${missionTitle}"!`,
            description: "Your XP and Airdrop Points have been added to your profile.",
            variant: "default",
        })
    }

    const handleAirdropSignupSuccess = () => {
        setIsSignedUp(true);
        localStorage.setItem('bsaiIsSignedUp', 'true');
        setShowAirdropModal(false);
        toast({
          title: <span className="text-accent">BlockShadow Airdrop Registration Complete!</span>,
          description: <span className="text-foreground">Your eligibility is confirmed. Welcome to the Initiative.</span>,
        });
    };

  return (
    <>
      <AppHeader />
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-primary mb-2">Missions Terminal</h1>
            <p className="text-muted-foreground">Complete quests to earn XP, airdrop points, and level up your Shadow Core.</p>
        </div>

        <Card className="mb-8 bg-card/80 backdrop-blur-sm border-accent shadow-lg shadow-accent/10">
            <CardHeader>
                <CardTitle className="flex items-center text-xl text-accent">
                    <Award className="mr-3 h-6 w-6"/>
                    Airdrop Initiative Dashboard
                </CardTitle>
                <CardDescription>
                    Complete mandatory missions to secure your <strong className="text-orange-400">$BSAI</strong> allocation.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-foreground">Eligibility Progress</span>
                        <span className="text-sm font-bold text-accent">{mandatoryMissionsCompleted} / {totalMandatoryMissions}</span>
                    </div>
                    <Progress value={progress} className="w-full h-3 bg-background [&>*]:bg-accent" />
                </div>
                 <p className="text-xs text-muted-foreground">
                    You must complete all mandatory missions and submit your details to be eligible for the airdrop.
                </p>
            </CardContent>
            <CardFooter>
                 <Button className="w-full glow-button" onClick={() => setShowAirdropModal(true)}>
                    {isSignedUp ? 'Update Registration' : 'Register for Airdrop'}
                </Button>
            </CardFooter>
        </Card>


        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {missions.map(mission => (
                <Card key={mission.id} className={`bg-card/80 backdrop-blur-sm transition-all duration-300 ${mission.status === 'locked' ? 'opacity-60' : 'hover:border-primary/50'} ${mission.status === 'mandatory' ? 'border-primary' : ''}`}>
                    <CardHeader className="flex flex-row items-start gap-4">
                        <div className={`p-2 bg-background rounded-lg ${mission.status === 'mandatory' ? 'border border-primary/50' : ''}`}>{mission.icon}</div>
                        <div>
                            <CardTitle className="flex items-center">
                                {mission.title} 
                                {mission.status === 'mandatory' && <Badge variant="outline" className="ml-2 border-primary text-primary">Mandatory</Badge>}
                            </CardTitle>
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
                        {mission.status === 'mandatory' && (
                             <Button onClick={() => handleClaim(mission.title)} className="w-full generate-signal-button">
                                Verify & Claim
                            </Button>
                        )}
                    </CardFooter>
                </Card>
            ))}
        </div>
      </div>
      <AirdropSignupModal
        isOpen={showAirdropModal}
        onOpenChange={setShowAirdropModal}
        onSignupSuccess={handleAirdropSignupSuccess}
      />
    </>
  );
}
