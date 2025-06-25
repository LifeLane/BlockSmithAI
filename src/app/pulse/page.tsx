'use client';
import AppHeader from '@/components/blocksmith-ai/AppHeader';
import LivePriceTicker from '@/components/blocksmith-ai/LivePriceTicker';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { BarChart, Users, Rss } from 'lucide-react';


export default function PulsePage() {
  return (
    <>
      <AppHeader />
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-primary mb-2 text-center">Live Pulse</h1>
          <p className="text-muted-foreground text-center mb-6">A real-time overview of market activity and community engagement.</p>
          <LivePriceTicker />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover:border-primary/70 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart className="mr-3 h-6 w-6 text-primary" />
                Global Signal Insights
              </CardTitle>
              <CardDescription>Aggregate view of all SHADOW signals.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">This module is under construction.</p>
            </CardContent>
          </Card>
          
          <Card className="hover:border-accent/70 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="mr-3 h-6 w-6 text-accent" />
                Leaderboard Highlights
              </CardTitle>
               <CardDescription>Top performing analysts this week.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">This module is under construction.</p>
            </CardContent>
          </Card>

          <Card className="hover:border-tertiary/70 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Rss className="mr-3 h-6 w-6 text-tertiary" />
                Community Activity Feed
              </CardTitle>
              <CardDescription>Latest missions completed and ranks achieved.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">This module is under construction.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
