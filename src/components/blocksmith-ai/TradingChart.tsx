
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Area, AreaChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, AlertTriangle } from 'lucide-react';
import { fetchCandlestickData } from '@/services/polygon-service';
import type { Candlestick } from '@/services/polygon-service';
import type { GenerateTradingStrategyOutput } from '@/ai/flows/generate-trading-strategy';
import { format, subDays, subHours } from 'date-fns';

interface TradingChartProps {
  symbol: string;
  tradingMode: string;
  strategy: GenerateTradingStrategyOutput | null;
}

const getChartParams = (tradingMode: string) => {
    const to = new Date();
    switch (tradingMode) {
        case 'Scalper':
            return {
                multiplier: 5,
                timespan: 'minute' as const,
                from: format(subHours(to, 12), 'yyyy-MM-dd'),
                to: format(to, 'yyyy-MM-dd'),
                dateFormat: 'HH:mm'
            };
        case 'Sniper':
            return {
                multiplier: 15,
                timespan: 'minute' as const,
                from: format(subDays(to, 2), 'yyyy-MM-dd'),
                to: format(to, 'yyyy-MM-dd'),
                dateFormat: 'dd HH:mm'
            };
        case 'Intraday':
            return {
                multiplier: 1,
                timespan: 'hour' as const,
                from: format(subDays(to, 7), 'yyyy-MM-dd'),
                to: format(to, 'yyyy-MM-dd'),
                dateFormat: 'MMM dd'
            };
        case 'Swing':
            return {
                multiplier: 4,
                timespan: 'hour' as const,
                from: format(subDays(to, 30), 'yyyy-MM-dd'),
                to: format(to, 'yyyy-MM-dd'),
                dateFormat: 'MMM dd'
            };
        default:
            return {
                multiplier: 1,
                timespan: 'hour' as const,
                from: format(subDays(to, 7), 'yyyy-MM-dd'),
                to: format(to, 'yyyy-MM-dd'),
                dateFormat: 'MMM dd'
            };
    }
}

const TradingChart: React.FC<TradingChartProps> = ({ symbol, tradingMode, strategy }) => {
  const [data, setData] = useState<Candlestick[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const chartParams = getChartParams(tradingMode);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setData([]);
    const result = await fetchCandlestickData({
      symbol,
      multiplier: chartParams.multiplier,
      timespan: chartParams.timespan,
      from: chartParams.from,
      to: chartParams.to,
      limit: 500,
    });
    
    if ('error' in result) {
      setError(result.error);
    } else {
      setData(result);
    }
    setIsLoading(false);
  }, [symbol, chartParams.multiplier, chartParams.timespan, chartParams.from, chartParams.to]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (isLoading) {
    return (
      <Card className="h-[400px] flex items-center justify-center bg-card/80 backdrop-blur-sm">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Loading Chart Data...</p>
      </Card>
    );
  }

  if (error || data.length === 0) {
    return (
      <Card className="h-[400px] flex flex-col items-center justify-center bg-card/80 backdrop-blur-sm border-destructive">
        <AlertTriangle className="h-8 w-8 text-destructive" />
        <CardTitle className="text-destructive mt-2">Chart Error</CardTitle>
        <CardDescription className="text-destructive-foreground px-4 text-center">{error || 'No chart data could be loaded for this asset.'}</CardDescription>
      </Card>
    );
  }

  return (
    <Card className="bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>{symbol} Chart ({tradingMode})</CardTitle>
        <CardDescription>Visual price action with SHADOW's parameters overlaid.</CardDescription>
      </CardHeader>
      <CardContent className="h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border) / 0.5)" />
            <XAxis
              dataKey="t"
              tickFormatter={(unixTime) => format(new Date(unixTime), chartParams.dateFormat)}
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
            />
            <YAxis 
                orientation="right" 
                domain={['auto', 'auto']}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => `$${value.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
            />
            <Tooltip
                contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 'var(--radius)'
                }}
                labelFormatter={(label) => format(new Date(label), 'MMM dd, yyyy HH:mm')}
                formatter={(value: number, name: string) => [`$${value.toFixed(4)}`, 'Price']}
            />
            <Area type="monotone" dataKey="c" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#chartGradient)" name="Close Price" />
            
            {strategy?.entry_zone && !isNaN(parseFloat(strategy.entry_zone)) && (
              <ReferenceLine y={parseFloat(strategy.entry_zone)} label={{ value: "Entry", position: 'insideTopLeft', fill: 'hsl(var(--primary))' }} stroke="hsl(var(--primary))" strokeDasharray="4 4" />
            )}
            {strategy?.take_profit && !isNaN(parseFloat(strategy.take_profit)) && (
              <ReferenceLine y={parseFloat(strategy.take_profit)} label={{ value: "Take Profit", position: 'insideTopLeft', fill: 'hsl(var(--chart-2))' }} stroke="hsl(var(--chart-2))" strokeDasharray="4 4" />
            )}
            {strategy?.stop_loss && !isNaN(parseFloat(strategy.stop_loss)) && (
              <ReferenceLine y={parseFloat(strategy.stop_loss)} label={{ value: "Stop Loss", position: 'insideBottomLeft', fill: 'hsl(var(--destructive))' }} stroke="hsl(var(--destructive))" strokeDasharray="4 4" />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default TradingChart;
