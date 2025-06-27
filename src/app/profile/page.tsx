
'use client';
import AppHeader from '@/components/blocksmith-ai/AppHeader';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Crown, Shield, Trophy, Settings, Award, AlertTriangle, User, BarChart2, TrendingUp, TrendingDown, Zap, ShieldCheck, Gift, Clock, CheckCircle, Users, Repeat } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect, useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";
import AirdropSignupModal from '@/components/blocksmith-ai/AirdropSignupModal';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { useCurrentUser } from '@/hooks/useCurrentUser';

// Import JSON-based actions and types from app/actions.ts
import { 
  fetchLeaderboardDataJson, 
  updateUserSettingsJson, 
  claimMissionRewardAction,
  type UserProfile, 
  type LeaderboardUser,
} from '../actions';

// ---- Mission and Rank Data ----
const TwitterIcon = () => (
  <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary">
    <title>X</title>
    <path fill="currentColor" d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 7.184L18.901 1.153zm-1.61 19.99h2.136L4.259 2.145H2.022l15.269 19.001z"/>
  </svg>
);
const TelegramIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-8 w-8 text-primary" fill="currentColor">
        <path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-1.37.2-1.54l15.97-5.85c.73-.27 1.36.17 1.15.94l-3.22 14.22c-.21.93-1.22 1.15-1.8.56l-4.1-3.25-2.02 1.95c-.39.39-1.09.39-1.48 0z" />
    </svg>
);
const YouTubeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-8 w-8 text-primary" fill="currentColor">
        <path d="M21.582 7.696c-.246-1.34-1.28-2.37-2.62-2.616C17.043 4.5 12 4.5 12 4.5s-5.043 0-6.962.58c-1.34.246-2.374 1.276-2.62 2.616C2.5 9.615 2.5 12 2.5 12s0 2.385.418 4.304c.246 1.34 1.28 2.37 2.62 2.616C7.457 19.5 12 19.5 12 19.5s5.043 0 6.962-.58c1.34-.246 2.374-1.276 2.62 2.616C21.5 14.385 21.5 12 21.5 12s0-2.385-.418-4.304zM9.5 15.5V8.5l6 3.5-6 3.5z" />
    </svg>
);

const missionsList = [
  { id: 'mission_x', title: 'Follow on X', description: 'Follow BlockShadow on X to unlock airdrop.', reward: '100 Airdrop Points', icon: <TwitterIcon />, type: 'social', url: 'https://x.com/Firebase' },
  { id: 'mission_telegram', title: 'Join Telegram', description: 'Join the official Telegram community.', reward: '100 Airdrop Points', icon: <TelegramIcon />, type: 'social', url: 'https://t.me/firebase' },
  { id: 'mission_youtube', title: 'Subscribe on YouTube', description: 'Subscribe to the BlockShadow channel.', reward: '100 Airdrop Points', icon: <YouTubeIcon />, type: 'social', url: 'https://youtube.com/firebase' },
  { id: 'mission_first_signal', title: 'First Signal', description: 'Generate your first trading signal using the Core Console.', reward: '100 XP & 500 Airdrop Points', icon: <Zap className="h-8 w-8 text-primary"/>, type: 'action' },
  { id: 'mission_analyst', title: 'The Analyst', description: 'Generate signals for 3 different assets (e.g., BTC, ETH, SOL).', reward: '250 XP & 1000 Airdrop Points', icon: <ShieldCheck className="h-8 w-8 text-tertiary"/>, type: 'action' },
  { id: 'mission_prolific_trader', title: 'Prolific Trader', description: 'Execute 10 simulated trades (open or close).', reward: '150 XP & 750 Airdrop Points', icon: <Repeat className="h-8 w-8 text-primary"/>, type: 'action' },
  { id: 'mission_winning_streak', title: 'Winning Streak', description: 'Close 3 profitable trades in a row.', reward: '300 XP & 1500 Airdrop Points', icon: <TrendingUp className="h-8 w-8 text-green-400"/>, type: 'action' },
  { id: 'mission_top_trader', title: 'Top Trader', description: 'Achieve Rank #1 on the weekly XP leaderboard.', reward: '2000 XP & 10000 Airdrop Points', icon: <Crown className="h-8 w-8 text-yellow-400"/>, type: 'locked' },
  { id: 'mission_streak', title: 'Weekly Streak', description: 'Generate at least one signal every day for 7 consecutive days.', reward: '1000 XP & 5000 Airdrop Points', icon: <Gift className="h-8 w-8 text-orange-400"/>, type: 'locked' },
];

const ranks = [
    { level: 1, name: "Analyst", xpThreshold: 0, icon: <User className="h-5 w-5"/> },
    { level: 2, name: "Senior Analyst", xpThreshold: 1000, icon: <BarChart2 className="h-5 w-5"/> },
    { level: 3, name: "Lead Analyst", xpThreshold: 2500, icon: <ShieldCheck className="h-5 w-5"/> },
    { level: 4, name: "Principal Analyst", xpThreshold: 5000, icon: <Trophy className="h-5 w-5"/> },
    { level: 5, name: "Master Analyst", xpThreshold: 10000, icon: <Crown className="h-5 w-5"/> },
];

const getRankDetails = (xp: number) => {
  const currentRank = [...ranks].reverse().find(rank => xp >= rank.xpThreshold) || ranks[0];
  const nextRank = ranks.find(rank => rank.level === currentRank.level + 1);

  const xpForCurrentLevel = currentRank.xpThreshold;
  const xpForNextLevel = nextRank ? nextRank.xpThreshold : currentRank.xpThreshold;
  
  const xpInCurrentLevel = xp - xpForCurrentLevel;
  const xpNeededForNextLevel = xpForNextLevel - xpForCurrentLevel;
  
  const progress = nextRank && xpNeededForNextLevel > 0 ? (xpInCurrentLevel / xpNeededForNextLevel) * 100 : 100;

  return {
    ...currentRank,
    nextRank,
    progress: Math.min(progress, 100),
    xpInCurrentLevel: xpInCurrentLevel.toLocaleString(),
    xpNeededForNextLevel: xpNeededForNextLevel.toLocaleString(),
  };
};

const RankIcon = ({ rank }: { rank: number }) => {
    if (rank === 1) return <Crown className="h-6 w-6 text-yellow-400" />;
    if (rank === 2) return <Trophy className="h-6 w-6 text-gray-400" />;
    if (rank === 3) return <Shield className="h-6 w-6 text-orange-600" />;
    return <span className="font-bold text-lg text-muted-foreground">{rank}</span>;
}

// ---- Helper Components ----
const MissionCard = ({ mission, onClaim, isClaimed, isLocked }: { mission: typeof missionsList[0], onClaim: (id: string) => void, isClaimed: boolean, isLocked: boolean }) => {
    const cardContent = (
        <Card className={`bg-card/80 backdrop-blur-sm transition-all duration-300 flex flex-col h-full ${isLocked ? 'opacity-60' : 'hover:border-primary/50'} ${mission.type === 'social' ? 'border-primary' : ''}`}>
            <CardHeader className="flex flex-row items-start gap-4">
                <div className={`p-2 bg-background rounded-lg ${mission.type === 'social' ? 'border border-primary/50' : ''}`}>{mission.icon}</div>
                <div>
                    <CardTitle className="flex items-center text-base">
                        {mission.title} 
                        {mission.type === 'social' && <Badge variant="outline" className="ml-2 border-primary text-primary text-xs">Mandatory</Badge>}
                    </CardTitle>
                    <CardDescription className="text-sm">{mission.description}</CardDescription>
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-sm font-semibold text-green-400 bg-green-900/30 border border-green-500/30 rounded-md p-2 text-center">
                    Reward: {mission.reward}
                </div>
            </CardContent>
            <CardFooter className="mt-auto">
                {isClaimed ? (
                    <Button disabled className="w-full bg-secondary text-muted-foreground">
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Completed
                    </Button>
                ) : isLocked ? (
                    <Button disabled className="w-full">
                        <Clock className="mr-2 h-4 w-4" />
                        Locked
                    </Button>
                ) : (
                    <Button onClick={() => onClaim(mission.id)} className="w-full glow-button">
                        {mission.type === 'social' ? 'Verify & Claim' : 'Claim Reward'}
                    </Button>
                )}
            </CardFooter>
        </Card>
    );

    if (mission.type === 'social') {
        return (
            <a href={mission.url} target="_blank" rel="noopener noreferrer" className="h-full">
                {cardContent}
            </a>
        );
    }
    return cardContent;
};


// ---- Main Page Component ----
export default function ProfilePage() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardUser[]>([]);
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [showAirdropModal, setShowAirdropModal] = useState(false);
  const { user: currentUser, isLoading: isUserLoading, error: userError, refetch: refetchUser } = useCurrentUser();
  
  const loadPageData = useCallback(async () => {
    setLoading(true);
    try {
      const leaderboard = await fetchLeaderboardDataJson();
      const rankedData = leaderboard.map((user, index) => ({ ...user, rank: index + 1 }));
      setLeaderboardData(rankedData);
    } catch (e: any) {
      console.error("Failed to load leaderboard data:", e);
      toast({ title: "Leaderboard Error", description: "Could not fetch leaderboard data.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (currentUser) {
      setUsername(currentUser.username);
      loadPageData();
    }
  }, [currentUser, loadPageData]);

  const handleClaim = async (missionId: string) => {
      if (!currentUser) return;

      const mission = missionsList.find(m => m.id === missionId);
      if (!mission || currentUser.claimedMissions?.includes(missionId)) return;

      const result = await claimMissionRewardAction(currentUser.id, missionId);
      
      if (result.success) {
          toast({
              title: <span className="text-accent">{`Reward Claimed for "${mission.title}"!`}</span>,
              description: <span className="text-foreground">{result.message}</span>,
          });
          refetchUser(); 
      } else {
           toast({
              title: "Claim Failed",
              description: result.message,
              variant: "destructive",
          });
      }
  };

  const handleAirdropSignupSuccess = useCallback(() => {
      setShowAirdropModal(false);
      toast({
        title: <span className="text-accent">BlockShadow Registration Complete!</span>,
        description: <span className="text-foreground">Your eligibility is confirmed. Welcome to the Initiative.</span>,
      });
      refetchUser();
  }, [refetchUser, toast]);


  const handleSaveSettings = async () => {
    if (currentUser && username && username !== currentUser.username) {
      setLoading(true);
      const updatedUser = await updateUserSettingsJson(currentUser.id, { username });
      if (updatedUser) {
        toast({ title: "Success", description: "Username updated successfully."});
        refetchUser();
      } else {
         toast({ title: "Error", description: "Failed to update username.", variant: "destructive"});
      }
      setLoading(false);
    }
    setSettingsOpen(false);
  };
  
  if (isUserLoading || (loading && !currentUser)) {
    return (
        <>
            <AppHeader />
            <div className="flex justify-center items-center h-[calc(100vh-200px)]">
                <Loader2 className="h-8 w-8 animate-spin text-primary"/>
            </div>
        </>
    );
  }

  if (userError || !currentUser) {
      return (
         <>
            <AppHeader />
             <div className="container mx-auto px-4 py-8 text-center">
                 <Card className="max-w-lg mx-auto border-destructive">
                    <CardHeader>
                         <div className="mx-auto bg-destructive/10 p-3 rounded-full w-fit">
                            <AlertTriangle className="h-10 w-10 text-destructive" />
                        </div>
                        <CardTitle className="text-destructive mt-4">{userError ? 'Profile Error' : 'User Not Found'}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">{userError || "Please visit the Core Console to initialize your session."}</p>
                         <Button asChild className="mt-4 glow-button">
                             <Link href="/core">
                                Go to Core Console
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
            <AirdropSignupModal
                isOpen={showAirdropModal}
                onOpenChange={setShowAirdropModal}
                onSignupSuccess={handleAirdropSignupSuccess}
            />
        </>
      );
  }
  
  const rankDetails = getRankDetails(currentUser.weeklyPoints);
  const mandatoryMissionsCompleted = missionsList.filter(m => m.type === 'social' && currentUser.claimedMissions?.includes(m.id)).length;
  const totalMandatoryMissions = missionsList.filter(m => m.type === 'social').length;
  const progress = (mandatoryMissionsCompleted / totalMandatoryMissions) * 100;

  return (
    <>
      <AppHeader />
      <div className="container mx-auto px-4 py-8 pb-24">
        
        <Card className="mb-8 bg-card/80 backdrop-blur-sm border-accent/50 shadow-lg shadow-accent/10">
            <CardHeader>
                <CardTitle className="flex items-center text-lg text-accent">
                    <Gift className="mr-3 h-5 w-5"/>
                    Eligible Airdrop Balance
                </CardTitle>
                <CardDescription>
                    Your accumulated <strong className="text-orange-400">$BSAI</strong> points from all activities.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-4xl lg:text-5xl font-bold text-orange-400 font-mono tracking-wider">
                    {currentUser.airdropPoints?.toLocaleString() || 0}
                </p>
                 <p className="text-xs text-muted-foreground mt-1">
                    Points are updated from portfolio P&L, agent & mission rewards.
                </p>
            </CardContent>
        </Card>

        <Tabs defaultValue="missions" className="w-full">
            <div className="flex justify-center">
                <TabsList className="bg-card/80 grid w-full max-w-md grid-cols-3">
                    <TabsTrigger value="profile">Profile</TabsTrigger>
                    <TabsTrigger value="missions">Missions</TabsTrigger>
                    <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
                </TabsList>
            </div>

            <TabsContent value="profile" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center"><User className="mr-2 h-5 w-5"/>Analyst Status</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Username:</p>
                            <p className="text-lg font-semibold text-foreground">{currentUser.username}</p>
                        </div>
                        {currentUser.status && (
                            <div>
                            <p className="text-sm font-medium text-muted-foreground">Status:</p>
                            <p className={`text-lg font-semibold ${currentUser.status !== 'Guest' ? 'text-accent' : 'text-muted-foreground'}`}>{currentUser.status}</p>
                            </div>
                        )}
                        {currentUser.shadowId && (
                            <div>
                            <p className="text-sm font-medium text-muted-foreground">ShadowID:</p>
                            <p className="text-lg font-semibold text-primary">{currentUser.shadowId}</p>
                            </div>
                        )}

                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center"><BarChart2 className="mr-2 h-5 w-5"/>Points Overview</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                             <div>
                                <p className="text-sm font-medium text-muted-foreground flex items-center"><TrendingUp className="mr-1.5 h-4 w-4"/>Weekly XP (for Agent Upgrades):</p>
                                <p className="text-lg font-semibold text-tertiary">{currentUser.weeklyPoints?.toLocaleString() || 0}</p>
                            </div>
                             <div>
                                <p className="text-sm font-medium text-muted-foreground flex items-center"><TrendingDown className="mr-1.5 h-4 w-4"/>Total Airdrop Points:</p>
                                <p className="text-lg font-semibold text-orange-400">{currentUser.airdropPoints?.toLocaleString() || 0}</p>
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle className="flex items-center text-tertiary">
                                {rankDetails.icon}
                                <span className="ml-2">Analyst Rank: {rankDetails.name}</span>
                            </CardTitle>
                             <CardDescription>
                                Level {rankDetails.level} - Based on your Weekly XP.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Progress value={rankDetails.progress} className="w-full h-3 bg-background [&>*]:bg-tertiary" />
                            <div className="flex justify-between items-center mt-2 text-sm text-muted-foreground">
                            <span>Progress</span>
                            {rankDetails.nextRank ? (
                                <span className="font-mono text-tertiary font-bold">{rankDetails.xpInCurrentLevel} / {rankDetails.xpNeededForNextLevel} XP</span>
                            ) : (
                                <span className="font-mono text-tertiary font-bold">Max Level Reached</span>
                            )}
                            </div>
                            {rankDetails.nextRank && (
                                <p className="text-center text-xs text-muted-foreground mt-3">
                                    You are <strong className="text-tertiary">{(parseInt(rankDetails.xpNeededForNextLevel.replace(/,/g,'')) - parseInt(rankDetails.xpInCurrentLevel.replace(/,/g,''))).toLocaleString()} XP</strong> away from becoming a <strong className="text-tertiary">{rankDetails.nextRank.name}</strong>.
                                </p>
                            )}
                        </CardContent>
                    </Card>


                     <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle className="flex items-center"><Award className="mr-2 h-5 w-5"/>Earned Badges</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-wrap gap-2">
                        {currentUser.badges && currentUser.badges.length > 0 ? currentUser.badges.map((badge: any, index: number) => (
                            <Badge key={index} variant="secondary" className="font-semibold text-base py-1 px-3">
                            {badge.name}
                            </Badge>
                        )) : (
                            <p className="text-sm text-muted-foreground">No badges earned yet. Complete missions to earn them.</p>
                        )}
                        </CardContent>
                    </Card>
                </div>

                <Card className="mb-8">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div className="space-y-1">
                    <CardTitle>Settings</CardTitle>
                    <CardDescription>Manage your profile information.</CardDescription>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setSettingsOpen(!settingsOpen)}>
                    <Settings className="h-4 w-4 mr-2" />
                    {settingsOpen ? 'Close' : 'Open'} Settings
                    </Button>
                </CardHeader>
                {settingsOpen && (
                    <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} />
                    </div>
                    <Button onClick={handleSaveSettings}>Save Changes</Button>
                    </CardContent>
                )}
                </Card>
            </TabsContent>

            <TabsContent value="missions" className="mt-6">
                <Card className="mb-8 bg-card/80 backdrop-blur-sm border-accent/50 shadow-lg shadow-accent/10">
                    <CardHeader>
                        <CardTitle className="flex items-center text-xl text-accent">
                            <Award className="mr-3 h-6 w-6"/>
                            Airdrop Initiative Dashboard
                        </CardTitle>
                        <CardDescription>
                            Complete missions to secure your <strong className="text-orange-400">$BSAI</strong> allocation.
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
                            {currentUser.status !== 'Guest' ? 'Update Registration' : 'Register for Airdrop'}
                        </Button>
                    </CardFooter>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {missionsList.map(mission => (
                        <MissionCard 
                            key={mission.id}
                            mission={mission}
                            onClaim={handleClaim}
                            isClaimed={currentUser.claimedMissions?.includes(mission.id) || false}
                            isLocked={mission.type === 'locked'}
                        />
                    ))}
                </div>
            </TabsContent>
            
            <TabsContent value="leaderboard" className="mt-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center"><Users className="mr-2 h-5 w-5"/>Top 10 Analysts</CardTitle>
                        <CardDescription>Weekly leaders based on XP.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                <TableHead className="w-[80px] text-center">Rank</TableHead>
                                <TableHead>Analyst</TableHead>
                                <TableHead className="text-right">Weekly XP</TableHead>
                                <TableHead className="text-right">Airdrop Points</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {leaderboardData.map((user) => (
                                <TableRow key={user.id} className="hover:bg-primary/10">
                                    <TableCell className="text-center font-bold">
                                        <div className="flex justify-center items-center h-full">
                                            {user.rank && <RankIcon rank={user.rank}/>}
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-medium text-foreground">{user.username}</TableCell>
                                    <TableCell className="text-right font-mono text-tertiary">{user.weeklyPoints?.toLocaleString() || 0}</TableCell>
                                    <TableCell className="text-right font-mono text-orange-400">{user.airdropPoints?.toLocaleString() || 0}</TableCell>
                                </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>

      </div>
       <AirdropSignupModal
        isOpen={showAirdropModal}
        onOpenChange={setShowAirdropModal}
        onSignupSuccess={handleAirdropSignupSuccess}
      />
    </>
  );
}
