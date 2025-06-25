'use client';
import AppHeader from '@/components/blocksmith-ai/AppHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, Hourglass, TrendingUp, TrendingDown, Clock } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

const mockSignals = [
  { id: 1, symbol: 'SOL/USDT', signal: 'BUY', entry: '145.20', sl: '142.50', tp: '151.00', status: 'Target Hit', pnl: '+4.00%', timestamp: '2 hours ago' },
  { id: 2, symbol: 'ETH/USDT', signal: 'SELL', entry: '3500.50', sl: '3550.00', tp: '3420.00', status: 'Stopped Out', pnl: '-1.41%', timestamp: '8 hours ago' },
  { id: 3, symbol: 'BTC/USDT', signal: 'BUY', entry: '68100.00', sl: '67500.00', tp: '69500.00', status: 'Monitoring', pnl: '+0.59%', timestamp: '15 minutes ago' },
  { id: 4, symbol: 'DOGE/USDT', signal: 'SELL', entry: '0.1580', sl: '0.1610', tp: '0.1510', status: 'Monitoring', pnl: '-0.63%', timestamp: '45 minutes ago' },
  { id: 5, symbol: 'ADA/USDT', signal: 'BUY', entry: '0.4512', sl: '0.4450', tp: '0.4650', status: 'Target Hit', pnl: '+3.06%', timestamp: '1 day ago' },
  { id: 6, symbol: 'XRP/USDT', signal: 'BUY', entry: '0.5230', sl: '0.5180', tp: '0.5350', status: 'Stopped Out', pnl: '-0.96%', timestamp: '2 days ago' },
];

const StatusIcon = ({ status }: { status: string }) => {
  switch (status) {
    case 'Target Hit': return <CheckCircle2 className="h-5 w-5 text-green-400" />;
    case 'Stopped Out': return <XCircle className="h-5 w-5 text-red-400" />;
    case 'Monitoring': return <Hourglass className="h-5 w-5 text-purple-400 animate-pulse" />;
    default: return null;
  }
};

const PnlIndicator = ({ pnl }: { pnl: string }) => {
    const isPositive = pnl.startsWith('+');
    return (
        <div className={`flex items-center font-semibold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
            {isPositive ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
            {pnl}
        </div>
    );
}

export default function MonitorPage() {
  return (
    <>
      <AppHeader />
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">Signal Monitor</h1>
          <p className="text-muted-foreground">Track your active, pending, and historical signals.</p>
        </div>
        
        <ScrollArea className="h-[calc(100vh-250px)] pr-4">
          <div className="space-y-4">
            {mockSignals.map((signal) => (
              <Card key={signal.id} className="bg-card/80 backdrop-blur-sm hover:border-primary/50 transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div className="flex items-center gap-4">
                    <StatusIcon status={signal.status} />
                    <div>
                      <CardTitle className="text-lg">
                        <span className={`mr-2 font-bold ${signal.signal === 'BUY' ? 'text-green-400' : 'text-red-400'}`}>{signal.signal}</span>
                        <span className="text-foreground">{signal.symbol}</span>
                      </CardTitle>
                      <CardDescription className="flex items-center text-xs">
                          <Clock className="h-3 w-3 mr-1.5"/>{signal.timestamp}
                      </CardDescription>
                    </div>
                  </div>
                   <Badge variant={signal.status === 'Target Hit' ? 'default' : signal.status === 'Stopped Out' ? 'destructive' : 'secondary'} className={signal.status === 'Target Hit' ? 'bg-green-600/80' : ''}>{signal.status}</Badge>
                </CardHeader>
                <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm pt-4">
                  <div className="flex flex-col items-center">
                    <span className="text-muted-foreground text-xs">Entry</span>
                    <span className="font-mono font-semibold text-primary">{signal.entry}</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-muted-foreground text-xs">Stop Loss</span>
                    <span className="font-mono font-semibold text-red-400">{signal.sl}</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-muted-foreground text-xs">Take Profit</span>
                    <span className="font-mono font-semibold text-green-400">{signal.tp}</span>
                  </div>
                  <div className="flex flex-col items-center">
                     <span className="text-muted-foreground text-xs">Est. P/L</span>
                    <PnlIndicator pnl={signal.pnl} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>
    </>
  );
}
