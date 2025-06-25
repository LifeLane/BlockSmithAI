'use client';
import AppHeader from '@/components/blocksmith-ai/AppHeader';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Crown, Shield, Trophy } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const leaderboardData = [
  { rank: 1, user: 'QuantumTrader', weeklyPoints: 15200, airdropPoints: 125500, badge: 'Grandmaster' },
  { rank: 2, user: 'Cipher', weeklyPoints: 14850, airdropPoints: 110200, badge: 'Master' },
  { rank: 3, user: 'SHADOW_Simp_7', weeklyPoints: 13500, airdropPoints: 98700, badge: 'Master' },
  { rank: 4, user: 'User_42', weeklyPoints: 12100, airdropPoints: 85400, badge: 'Expert' },
  { rank: 5, user: 'CryptoWzrd', weeklyPoints: 11500, airdropPoints: 81300, badge: 'Expert' },
  { rank: 6, user: 'BlockchainBelle', weeklyPoints: 10800, airdropPoints: 76900, badge: 'Adept' },
  { rank: 7, user: 'SatoshiJr', weeklyPoints: 9900, airdropPoints: 72100, badge: 'Adept' },
  { rank: 8, user: 'SignalSurfer', weeklyPoints: 9200, airdropPoints: 68500, badge: 'Adept' },
  { rank: 9, user: 'ApeWhisperer', weeklyPoints: 8500, airdropPoints: 61000, badge: 'Initiate' },
  { rank: 10, user: 'NoobMaster69', weeklyPoints: 8100, airdropPoints: 59000, badge: 'Initiate' },
];

const RankIcon = ({ rank }: { rank: number }) => {
    if (rank === 1) return <Crown className="h-5 w-5 text-yellow-400" />;
    if (rank === 2) return <Trophy className="h-5 w-5 text-gray-400" />;
    if (rank === 3) return <Shield className="h-5 w-5 text-orange-600" />;
    return <span className="font-bold text-muted-foreground">{rank}</span>;
}


export default function LeaderboardPage() {
  return (
    <>
      <AppHeader />
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-primary mb-2">Leaderboard</h1>
            <p className="text-muted-foreground">See where you stand in the global ranks and track your airdrop points.</p>
        </div>

        <Card>
            <CardHeader>
                <CardTitle>Top 10 Analysts</CardTitle>
                <CardDescription>Ranks are updated in real-time based on mission completion and signal accuracy.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead className="w-[80px] text-center">Rank</TableHead>
                        <TableHead>Analyst</TableHead>
                        <TableHead className="text-right">Weekly Points</TableHead>
                        <TableHead className="text-right">Airdrop Points</TableHead>
                        <TableHead className="text-center">Badge</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {leaderboardData.map((user) => (
                        <TableRow key={user.rank} className="hover:bg-primary/10">
                            <TableCell className="text-center">
                                <div className="flex justify-center items-center">
                                    <RankIcon rank={user.rank}/>
                                </div>
                            </TableCell>
                            <TableCell className="font-medium text-foreground">{user.user}</TableCell>
                            <TableCell className="text-right font-mono text-accent">{user.weeklyPoints.toLocaleString()}</TableCell>
                            <TableCell className="text-right font-mono text-primary">{user.airdropPoints.toLocaleString()}</TableCell>
                            <TableCell className="text-center">
                                <Badge variant="secondary" className="font-semibold">{user.badge}</Badge>
                            </TableCell>
                        </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
      </div>
    </>
  );
}
