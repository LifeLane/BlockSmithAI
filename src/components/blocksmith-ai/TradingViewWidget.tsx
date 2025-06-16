
'use client';

import { FunctionComponent, useEffect, useRef, memo } from 'react';
import Script from 'next/script';

interface TradingViewWidgetProps {
  symbol: string;
  interval: string;
  selectedIndicators: string[]; // e.g., ["RSI", "EMA"]
}

// Map friendly names to TradingView study IDs
const indicatorMap: { [key: string]: string } = {
  RSI: "RSI@tv-basicstudies",
  EMA: "MAExp@tv-basicstudies", // Exponential Moving Average
  VWAP: "VWAP@tv-basicstudies",
  BOLL: "BB@tv-basicstudies", // Bollinger Bands
  SAR: "PSAR@tv-basicstudies", // Parabolic SAR
  ADX: "ADX@tv-basicstudies", // Average Directional Index
  MACD: "MACD@tv-basicstudies", // Moving Average Convergence Divergence
  STOCH: "Stochastic@tv-basicstudies", // Stochastic Oscillator
  ATR: "ATR@tv-basicstudies", // Average True Range
  OBV: "OBV@tv-basicstudies", // On-Balance Volume
};


const TradingViewWidget: FunctionComponent<TradingViewWidgetProps> = ({ symbol, interval, selectedIndicators }) => {
  const containerId = 'tradingview-chart-container';
  const widgetRef = useRef<any>(null); // To store widget instance for potential cleanup/update
  const scriptLoadedRef = useRef(false);

  const tradingViewSymbol = `BINANCE:${symbol}`;

  const studies = selectedIndicators
    .map(indicatorKey => indicatorMap[indicatorKey])
    .filter(Boolean); // Filter out any undefined mappings


  const createWidget = () => {
    if (document.getElementById(containerId) && typeof TradingView !== 'undefined') {
      if (widgetRef.current) {
        // If a widget instance exists, try to remove it before creating a new one.
        // This is a basic way; TradingView might offer a more robust API for this.
        widgetRef.current.remove();
        widgetRef.current = null;
      }
      
      const newWidget = new TradingView.widget({
        autosize: true,
        symbol: tradingViewSymbol,
        interval: interval,
        timezone: "Etc/UTC",
        theme: "dark",
        style: "1",
        locale: "en",
        toolbar_bg: "#f1f3f6", // This color might be overridden by dark theme
        enable_publishing: false,
        hide_top_toolbar: false,
        hide_side_toolbar: false,
        allow_symbol_change: false, // Controlled by our app's selector
        container_id: containerId,
        studies: studies,
      });
      widgetRef.current = newWidget;
    }
  };

  useEffect(() => {
    if (scriptLoadedRef.current) {
      createWidget();
    }
    // Cleanup function (optional, depending on how TradingView handles widget removal)
    return () => {
      if (widgetRef.current && typeof widgetRef.current.remove === 'function') {
        // widgetRef.current.remove();
      }
    };
  }, [symbol, interval, selectedIndicators, scriptLoadedRef.current]); // Re-run when symbol, interval, or indicators change

  return (
    <>
      <Script
        src="https://s3.tradingview.com/tv.js"
        strategy="lazyOnload" // Load after page content
        onLoad={() => {
          scriptLoadedRef.current = true;
          createWidget(); // Create widget once script is loaded
        }}
      />
      <div id={containerId} className="h-[500px] w-full rounded-lg shadow-md overflow-hidden bg-card" />
    </>
  );
};

// Memoize the component to prevent re-renders if props haven't changed
export default memo(TradingViewWidget);
