
'use client';

import { useState, useEffect, useCallback } from 'react';
import AppHeader from '@/components/blocksmith-ai/AppHeader';
import ShadowMindInterface from '@/components/blocksmith-ai/ShadowMindInterface';
import SignalTracker from '@/components/blocksmith-ai/SignalTracker';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Terminal as TerminalIcon, Loader2 } from 'lucide-react';
import type { GenerateTradingStrategyOutput, GenerateShadowChoiceStrategyOutput, LiveMarketData } from '@/app/actions';
import { fetchMarketDataAction } from '@/app/actions';

type AIStrategyOutput = (GenerateTradingStrategyOutput | GenerateShadowChoiceStrategyOutput) & { 
  id?: string;
};


export default function TerminalPage() {
    const [shadowMindData, setShadowMindData] = useState<AIStrategyOutput | null>(null);
    const [liveMarketData, setLiveMarketData] = useState<LiveMarketData | null>(null);
    const [isLoadingData, setIsLoadingData] = useState(true);

    const fetchLiveMarketData = useCallback(async (symbol: string) => {
        const result = await fetchMarketDataAction({ symbol });
        if (!('error' in result)) {
            setLiveMarketData(result);
        } else {
            console.error("Failed to fetch live market data for terminal tracker:", result.error);
            setLiveMarketData(null);
        }
    }, []);

    useEffect(() => {
        const savedData = localStorage.getItem('shadowMindData');
        let dataLoaded = false;
        if (savedData) {
            try {
                const parsedData: AIStrategyOutput = JSON.parse(savedData);
                setShadowMindData(parsedData);
                if (parsedData.symbol) {
                    dataLoaded = true;
                    fetchLiveMarketData(parsedData.symbol);
                    // Optional: Poll for fresh data
                    const intervalId = setInterval(() => fetchLiveMarketData(parsedData.symbol), 30000);
                    return () => clearInterval(intervalId);
                }
            } catch (e) {
                console.error("Failed to parse shadowMindData from localStorage", e);
                localStorage.removeItem('shadowMindData');
            }
        }
        if (!dataLoaded) {
            setIsLoadingData(false);
        }
    }, [fetchLiveMarketData]);

    useEffect(() => {
        // This effect helps in showing the loader until both data are available
        if (shadowMindData && liveMarketData) {
            setIsLoadingData(false);
        }
    }, [shadowMindData, liveMarketData]);


    const renderContent = () => {
        if (isLoadingData && !shadowMindData) {
             return (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-primary"/>
                </div>
            );
        }

        if (shadowMindData) {
            return (
                 <div className="space-y-6">
                    <ShadowMindInterface 
                        shadowScore={shadowMindData.gpt_confidence_score}
                        confidence={shadowMindData.confidence}
                        sentiment={shadowMindData.sentiment}
                        riskRating={shadowMindData.risk_rating}
                        currentThought={shadowMindData.currentThought}
                        prediction={shadowMindData.shortTermPrediction}
                    />
                    {shadowMindData.signal?.toUpperCase() !== 'HOLD' && (
                        <SignalTracker
                            aiStrategy={shadowMindData}
                            liveMarketData={liveMarketData}
                        />
                    )}
                </div>
            )
        }

        return (
            <Card className="mt-8 text-center py-12 px-6 bg-card/80 backdrop-blur-sm">
                <CardHeader>
                    <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit">
                        <TerminalIcon className="h-10 w-10 text-primary" />
                    </div>
                    <CardTitle className="mt-4">SHADOW_MIND Terminal</CardTitle>
                    <CardDescription className="mt-2 text-base">
                        No data in the neural core. Generate a signal from the Core Console to initialize.
                    </CardDescription>
                </CardHeader>
            </Card>
        )
    }

    return (
        <>
            <AppHeader />
            <div className="container mx-auto px-4 py-8">
                {renderContent()}
            </div>
        </>
    );
}
