'use client';
import AppHeader from '@/components/blocksmith-ai/AppHeader';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Crown, Shield, Trophy, Settings, BookOpen, GitPullRequestArrow } from 'lucide-react';
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from 'react';
// Import Neon-based actions and types from app/actions.ts
import { 
  fetchCurrentUserNeon, 
  fetchLeaderboardDataNeon, 
  updateUserSettingsNeon, 
  fetchConsoleInsightsNeon, 
  fetchSignalHistoryNeon, 
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
  return localStorage.getItem('currentUserId');
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

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      const userId = getCurrentUserId(); // Get user ID from storage

      if (!userId) {
          setError("User not logged in or ID not found.");
          setLoading(false);
          return;
      }

      // Fetch current user data using Neon action
      const user = await fetchCurrentUserNeon(userId);
      setCurrentUser(user);
      if (user) {
        setUsername(user.username);
      }

      // Fetch leaderboard data using Neon action
      const leaderboard = await fetchLeaderboardDataNeon();
      const rankedData = leaderboard.map((user, index) => ({ ...user, rank: index + 1 }));
      setLeaderboardData(rankedData);

      // Fetch console insights
      const insights = await fetchConsoleInsightsNeon(userId);
      setConsoleInsights(insights);

      // Fetch signal history
      const history = await fetchSignalHistoryNeon(userId);
      setSignalHistory(history);

      setLoading(false);
    };

    loadData();
  }, []); // Empty dependency array means this effect runs once on mount

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

      // Update user settings using Neon action
      const updatedUser = await updateUserSettingsNeon(userId, { username });
      if (updatedUser) {
        setCurrentUser(updatedUser);
        console.log('Username updated successfully!', updatedUser);
      } else {
        console.error('Failed to update username.');
        setError('Failed to update username.');
      }
      setLoading(false);
    }
    setSettingsOpen(false);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading profile...</div>; // Loading state
  }

  if (error) {
      return <div className="flex justify-center items-center h-screen text-red-500">Error: {error}</div>; // Error state
  }

  if (!currentUser) {
      return <div className="flex justify-center items-center h-screen text-yellow-500">User not found. Please sign up or log in.</div>; // User not found state
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
              {/* Assuming a 'badges' relation on user model, and each badge has a 'name' field */}
              {currentUser.badges && currentUser.badges.map((badge: any, index: number) => (
                <Badge key={index} variant="secondary" className="font-semibold">
                  {badge.name}
                </Badge>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Leaderboard Display */}
        <Card className="mb-8">
            <CardHeader>
                <CardTitle>Top Analysts Leaderboard</CardTitle>
                <CardDescription>See where you stand in the global ranks.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead className="w-[80px] text-center">Rank</TableHead>
                        <TableHead>Analyst</TableHead>
                         {/* Assuming 'weeklyPoints' and 'airdropPoints' fields exist on your user model for leaderboard */}
                        <TableHead className="text-right">Weekly Points</TableHead>
                        <TableHead className="text-right">Airdrop Points</TableHead>
                        <TableHead className="text-center">Badge</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {leaderboardData.map((user) => (
                        <TableRow key={user.id} className="hover:bg-primary/10">
                            <TableCell className="text-center">
                                <div className="flex justify-center items-center">
                                    <RankIcon rank={user.rank}/>
                                </div>
                            </TableCell>
                            <TableCell className="font-medium text-foreground">{user.username}</TableCell>
                            <TableCell className="text-right font-mono text-accent">{user.weeklyPoints?.toLocaleString() || 0}</TableCell>
                            <TableCell className="text-right font-mono text-primary">{user.airdropPoints?.toLocaleString() || 0}</TableCell>
                            <TableCell className="text-center">
                               {/* Assuming badges relation and badge name field, or a simple badge string if not fetching relations */}
                                {user.badge ? (
                                  <Badge variant="secondary" className="font-semibold">
                                    {user.badge} {/* Displaying a single badge string */}
                                  </Badge>
                                ) : user.badges && user.badges.length > 0 ? (
                                   <Badge variant="secondary" className="font-semibold">
                                    {user.badges[0].name} {/* Displaying the first badge from relation as an example */}
                                  </Badge>
                                ) : (
                                  <span className="text-muted-foreground">No Badge</span>
                                )}
                            </TableCell>
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
        <Card>
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

      </div>
    </>
  );
}
