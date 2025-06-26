
'use client';
import AppHeader from '@/components/blocksmith-ai/AppHeader';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Crown, Shield, Trophy, Settings, BookOpen, GitPullRequestArrow, Database, Rocket, Loader2 } from 'lucide-react';
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";

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

// Function to get the current user ID (replace with actual auth logic)
const getCurrentUserId = (): string | null => {
  // This is a placeholder. In a real app, you would get this from
  // a secure authentication context, cookie, or local storage after login.
  // For now, we'll try to get it from local storage where the airdrop signup might store it.
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

  const loadData = async () => {
      setLoading(true);
      setError(null);
      const userId = getCurrentUserId(); // Get user ID from storage

      if (!userId) {
          setError("User not logged in or ID not found. Please sign up via the Missions tab.");
          setLoading(false);
          return;
      }

      try {
        // Fetch all data in parallel
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
    };

  useEffect(() => {
    loadData();
  }, []);

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

      // Update user settings using JSON action
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
        // Refresh data on the page after population
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


  if (loading && !currentUser) {
    return (
        <>
            <AppHeader />
            <div className="flex justify-center items-center h-[calc(100vh-200px)]">
                <Loader2 className="h-8 w-8 animate-spin text-primary"/>
            </div>
        </>
    );
  }

  if (error) {
      return (
        <>
            <AppHeader />
            <div className="container mx-auto px-4 py-8 text-center">
                 <Card className="max-w-lg mx-auto border-destructive">
                    <CardHeader>
                        <CardTitle className="text-destructive">Profile Error</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>{error}</p>
                    </CardContent>
                </Card>
            </div>
        </>
      );
  }

  if (!currentUser) {
      return (
         <>
            <AppHeader />
             <div className="container mx-auto px-4 py-8 text-center">
                 <Card className="max-w-lg mx-auto border-primary">
                    <CardHeader>
                        <CardTitle className="text-primary">User Not Found</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">Please sign up via the Missions tab to create a profile.</p>
                    </CardContent>
                </Card>
            </div>
        </>
      );
  }


  return (
    <>
      <AppHeader />
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-primary mb-2">Analyst Profile</h1>
            <p className="text-muted-foreground">View your progress and manage your settings, console insights, and signal history.</p>
        </div>

        {/* User Status, ShadowID, and Badges */}
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
                   <p className="text-lg font-semibold text-accent">{currentUser.status}</p>
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

        {/* Leaderboard Display */}
        <Card className="mb-8">
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

         {/* Console Insights */}
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

        {/* Signal History */}
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

        {/* Settings Section */}
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
              {/* Add more settings options here */}
              <Button onClick={handleSaveSettings}>Save Changes</Button>
            </CardContent>
          )}
        </Card>
        
        {/* Database Management Card */}
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

      </div>
    </>
  );
}
