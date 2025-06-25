
'use client';

import type { FunctionComponent } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart2 } from 'lucide-react';

interface TradingViewWidgetProps {
  symbol: string;
}

const TradingViewWidget: FunctionComponent<TradingViewWidgetProps> = ({ symbol }) => {
  return (
    <Card className="shadow-md transition-all duration-300 ease-in-out hover:border-primary">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold flex items-center text-primary">
          <BarChart2 className="mr-2 h-5 w-5" />
          Real-time Chart: {symbol.replace('USDT', '/USDT')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 md:h-96 w-full bg-background/50 flex items-center justify-center rounded-md">
            <p className="text-muted-foreground">TradingView Chart Placeholder</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default TradingViewWidget;
