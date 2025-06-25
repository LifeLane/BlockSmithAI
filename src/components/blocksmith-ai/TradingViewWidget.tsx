
'use client';

import React, { useEffect, useRef, memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart2 } from 'lucide-react';

interface TradingViewWidgetProps {
  symbol: string;
  interval: string; // "1m", "15m", "1h", "4h"
}

// Separate component for the actual widget logic to allow memoization
const TVWidgetCore: React.FC<TradingViewWidgetProps> = ({ symbol, interval }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const mapInterval = (appInterval: string): string => {
    // TradingView widget expects minutes as a string number, e.g., '1', '15', '60'
    switch (appInterval) {
      case '1m': return '1';
      case '15m': return '15';
      case '1h': return '60';
      case '4h': return '240';
      default: return '15'; // A safe default
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Give a unique ID to the container for the widget to mount
    const widgetContainerId = `tradingview_widget_${Math.random().toString(36).substr(2, 9)}`;
    container.id = widgetContainerId;
    
    // Clear any previous widget before creating a new one
    container.innerHTML = '';

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;
    script.onload = () => {
      if (typeof (window as any).TradingView === 'undefined') return;
      
      new (window as any).TradingView.widget({
        autosize: true,
        symbol: `BINANCE:${symbol}`,
        interval: mapInterval(interval),
        timezone: "Etc/UTC",
        theme: "dark",
        style: "1",
        locale: "en",
        enable_publishing: false,
        allow_symbol_change: true,
        container_id: widgetContainerId,
        hide_side_toolbar: false,
        details: true,
        hotlist: true,
        calendar: true,
        // Override default dark theme colors to match our app
        overrides: {
            "paneProperties.background": "#0c0c0c",
            "paneProperties.vertGridProperties.color": "hsla(var(--border))",
            "paneProperties.horzGridProperties.color": "hsla(var(--border))",
            "symbolWatermarkProperties.transparency": 90,
            "scalesProperties.textColor" : "hsl(var(--muted-foreground))",
            "mainSeriesProperties.candleStyle.wickUpColor": 'hsl(var(--primary))',
            "mainSeriesProperties.candleStyle.wickDownColor": 'hsl(var(--accent))',
        },
      });
    };

    document.head.appendChild(script);

    return () => {
      // Cleanup script on component unmount
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, [symbol, interval]);

  return <div ref={containerRef} className="h-full w-full" />;
};

const MemoizedTVWidget = memo(TVWidgetCore);

const TradingViewWidget: React.FC<TradingViewWidgetProps> = ({ symbol, interval }) => {
  return (
    <Card className="shadow-md transition-all duration-300 ease-in-out hover:border-primary">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold flex items-center text-primary">
          <BarChart2 className="mr-2 h-5 w-5" />
          Real-time Chart: {symbol.replace('USDT', '/USDT')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 md:h-96 w-full bg-background/50 rounded-md">
            <MemoizedTVWidget symbol={symbol} interval={interval} />
        </div>
      </CardContent>
    </Card>
  );
};

export default TradingViewWidget;
