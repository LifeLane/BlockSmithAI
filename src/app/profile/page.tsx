
'use client';
import AppHeader from '@/components/blocksmith-ai/AppHeader';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Crown, Shield, Trophy, Settings, BookOpen, GitPullRequestArrow, Database, Rocket, Loader2, CheckCircle, Clock, Zap, Users, ShieldCheck, Gift, Award, AlertTriangle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect, useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";
import AirdropSignupModal from '@/components/blocksmith-ai/AirdropSignupModal';

// Import JSON-based actions and types from app/actions.ts
import { 
  fetchCurrentUserJson, 
  fetchLeaderboardDataJson, 
  updateUserSettingsJson, 
  fetchConsoleInsightsJson, 
  fetchSignalHistoryJson,
  populateSampleDataJson, 
  UserProfile, 
  LeaderboardUser,
  ConsoleInsight,
  SignalHistoryItem
} from '../actions';
import Link from 'next/link';

// ---- Start of content copied from missions/page.tsx ----
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
// ---- End of content copied from missions/page.tsx ----

// Helper to get user ID from client-side storage
const getCurrentUserId = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('currentUserId');
  }
  return null;
};

const RankIcon = ({ rank }: { rank: number }) => {
    if (rank === 1) return <Crown className="h-5 w-5 text-yellow-400" />;
    if (rank === 2) return <Trophy className="h-5 w-5 text-gray-400" />;
    if (rank === 3) return <Shield className="h-5 w-5 text-orange-600" />;
    return <span className="font-bold text-muted-foreground">{rank}</span>;
}

export default function ProfilePage() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardUser[]>([]);
  const [consoleInsights, setConsoleInsights] = useState<ConsoleInsight[]>([]);
  const [signalHistory, setSignalHistory] = useState<SignalHistoryItem[]>([]);
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPopulating, setIsPopulating] = useState(false);
  const { toast } = useToast();

  const [showAirdropModal, setShowAirdropModal] = useState(false);
  
  // In a real app, this would come from a user state
  const mandatoryMissionsCompleted = currentUser?.status !== 'Guest' ? 3 : 0;
  const totalMandatoryMissions = 3;
  const progress = (mandatoryMissionsCompleted / totalMandatoryMissions) * 100;

  const handleClaim = (missionTitle: string) => {
      toast({
          title: `Reward Claimed for "${missionTitle}"!`,
          description: "Your XP and Airdrop Points have been added to your profile.",
          variant: "default",
      })
  }

  const loadData = useCallback(async () => {
      setLoading(true);
      setError(null);
      const userId = getCurrentUserId();

      if (!userId) {
          setError("User profile not found. Please visit the Core Console to initialize your session.");
          setLoading(false);
          return;
      }

      try {
        const [user, leaderboard, insights, history] = await Promise.all([
          fetchCurrentUserJson(userId),
          fetchLeaderboardDataJson(),
          fetchConsoleInsightsJson(userId),
          fetchSignalHistoryJson(userId)
        ]);

        if (user) {
            setCurrentUser(user);
            setUsername(user.username);
        } else {
            setError("Could not find user profile. It may have been deleted or the ID is incorrect.");
        }
        
        const rankedData = leaderboard.map((user, index) => ({ ...user, rank: index + 1 }));
        setLeaderboardData(rankedData);
        setConsoleInsights(insights);
        setSignalHistory(history);

      } catch (e: any) {
          console.error("Failed to load profile data:", e);
          setError(`An error occurred while fetching data: ${e.message}`);
      } finally {
          setLoading(false);
      }
    }, []);


  const handleAirdropSignupSuccess = useCallback(() => {
      setShowAirdropModal(false);
      toast({
        title: <span className="text-accent">BlockShadow Registration Complete!</span>,
        description: <span className="text-foreground">Your eligibility is confirmed. Welcome to the Initiative.</span>,
      });
      loadData();
  }, [loadData, toast]);
  

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSaveSettings = async () => {
    if (currentUser && username !== currentUser.username) {
      setLoading(true);
      setError(null);
       const userId = getCurrentUserId();
       if (!userId) {
           setError("User ID not found. Cannot save settings.");
           setLoading(false);
           setSettingsOpen(false);
           return;
       }

      const updatedUser = await updateUserSettingsJson(userId, { username });
      if (updatedUser) {
        setCurrentUser(updatedUser);
        toast({ title: "Success", description: "Username updated successfully."});
      } else {
        setError('Failed to update username.');
         toast({ title: "Error", description: "Failed to update username.", variant: "destructive"});
      }
      setLoading(false);
    }
    setSettingsOpen(false);
  };
  
  const handlePopulateData = async () => {
    setIsPopulating(true);
    toast({
        title: "Database Population Initiated",
        description: "Resetting JSON file with sample data...",
    });
    try {
        await populateSampleDataJson();
        toast({
            title: "Success!",
            description: "Database file reset and sample data populated. Refreshing data now...",
            variant: "default",
        });
        await loadData();
    } catch (error: any) {
        toast({
            title: "Database Error",
            description: `Failed to populate data: ${error.message}`,
            variant: "destructive",
        });
    } finally {
        setIsPopulating(false);
    }
  };


  if (loading) {
    return (
        <>
            <AppHeader />
            <div className="flex justify-center items-center h-[calc(100vh-200px)]">
                <Loader2 className="h-8 w-8 animate-spin text-primary"/>
            </div>
        </>
    );
  }

  if (error || !currentUser) {
      return (
         <>
            <AppHeader />
             <div className="container mx-auto px-4 py-8 text-center">
                 <Card className="max-w-lg mx-auto border-destructive">
                    <CardHeader>
                         <div className="mx-auto bg-destructive/10 p-3 rounded-full w-fit">
                            <AlertTriangle className="h-10 w-10 text-destructive" />
                        </div>
                        <CardTitle className="text-destructive mt-4">{error ? 'Profile Error' : 'User Not Found'}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">{error || "Please visit the Core Console to initialize your session."}</p>
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


  return (
    <>
      <AppHeader />
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-primary mb-2">Analyst HQ</h1>
            <p className="text-muted-foreground">Your central hub for profile, missions, and rankings.</p>
        </div>

        <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="missions">Missions</TabsTrigger>
                <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <Card>
                        <CardHeader>
                        <CardTitle>Analyst Status</CardTitle>
                        <CardDescription>Your current standing and unique identifier.</CardDescription>
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
                        <CardTitle>Earned Badges</CardTitle>
                        <CardDescription>Recognitions for your achievements.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-wrap gap-2">
                        {currentUser.badges && currentUser.badges.length > 0 ? currentUser.badges.map((badge: any, index: number) => (
                            <Badge key={index} variant="secondary" className="font-semibold">
                            {badge.name}
                            </Badge>
                        )) : (
                            <p className="text-sm text-muted-foreground">No badges earned yet.</p>
                        )}
                        </CardContent>
                    </Card>
                </div>
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle className="flex items-center"><BookOpen className="h-5 w-5 mr-2" /> Console Insights</CardTitle>
                        <CardDescription>Recent insights generated by your analysis.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {consoleInsights.length > 0 ? (
                            <ul className="list-disc list-inside space-y-2">
                                {consoleInsights.map((insight) => (
                                    <li key={insight.id} className="text-sm text-muted-foreground">
                                        <span className="font-medium text-foreground">{new Date(insight.timestamp).toLocaleString()}:</span> {insight.content}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-muted-foreground">No console insights available yet.</p>
                        )}
                    </CardContent>
                </Card>

                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle className="flex items-center"><GitPullRequestArrow className="h-5 w-5 mr-2" /> Signal History</CardTitle>
                        <CardDescription>A log of trading signals you have generated or acted upon.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {signalHistory.length > 0 ? (
                            <ul className="list-disc list-inside space-y-2">
                                {signalHistory.map((signal) => (
                                    <li key={signal.id} className="text-sm text-muted-foreground">
                                        <span className="font-medium text-foreground">{new Date(signal.timestamp).toLocaleString()}:</span> {signal.signalType.toUpperCase()} signal for {signal.symbol} at {signal.price}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-muted-foreground">No signal history available yet.</p>
                        )}
                    </CardContent>
                </Card>

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
                
                <Card>
                <CardHeader>
                    <CardTitle className="flex items-center"><Database className="h-5 w-5 mr-2" /> Database Management</CardTitle>
                    <CardDescription>Use these tools for database setup and testing.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between p-4 bg-background/50 rounded-lg border border-border">
                    <p className="text-sm text-muted-foreground max-w-lg">Reset the local JSON database with sample users, badges, and signals. <br/><strong className="text-destructive">Warning: This will overwrite all existing data in the JSON file.</strong></p>
                    <Button onClick={handlePopulateData} disabled={isPopulating}>
                        {isPopulating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Rocket className="mr-2 h-4 w-4" />}
                        Populate Data
                    </Button>
                    </div>
                </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="missions" className="mt-6">
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
                            {currentUser.status !== 'Guest' ? 'Update Registration' : 'Register for Airdrop'}
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
            </TabsContent>
            
            <TabsContent value="leaderboard" className="mt-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Top 10 Analysts</CardTitle>
                        <CardDescription>See the current leaders in the weekly challenge.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                <TableHead className="w-[80px] text-center">Rank</TableHead>
                                <TableHead>Analyst</TableHead>
                                <TableHead className="text-right">Weekly Points</TableHead>
                                <TableHead className="text-right">Airdrop Points</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {leaderboardData.map((user) => (
                                <TableRow key={user.id} className="hover:bg-primary/10">
                                    <TableCell className="text-center">
                                        <div className="flex justify-center items-center">
                                            {user.rank && <RankIcon rank={user.rank}/>}
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-medium text-foreground">{user.username}</TableCell>
                                    <TableCell className="text-right font-mono text-accent">{user.weeklyPoints?.toLocaleString() || 0}</TableCell>
                                    <TableCell className="text-right font-mono text-primary">{user.airdropPoints?.toLocaleString() || 0}</TableCell>
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
