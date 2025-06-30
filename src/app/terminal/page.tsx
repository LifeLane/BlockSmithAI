
'use client';

import { useState, useEffect } from 'react';
import AppHeader from '@/components/blocksmith-ai/AppHeader';
import ShadowMindInterface from '@/components/blocksmith-ai/ShadowMindInterface';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Terminal as TerminalIcon } from 'lucide-react';
import type { GenerateTradingStrategyOutput, GenerateShadowChoiceStrategyOutput } from '@/app/actions';

type AIStrategyOutput = (GenerateTradingStrategyOutput | GenerateShadowChoiceStrategyOutput) & { 
  id?: string;
};


export default function TerminalPage() {
    const [shadowMindData, setShadowMindData] = useState<AIStrategyOutput | null>(null);

    useEffect(() => {
        const savedData = localStorage.getItem('shadowMindData');
        if (savedData) {
            try {
                setShadowMindData(JSON.parse(savedData));
            } catch (e) {
                console.error("Failed to parse shadowMindData from localStorage", e);
                localStorage.removeItem('shadowMindData');
            }
        }
    }, []);

    return (
        <>
            <AppHeader />
            <div className="container mx-auto px-4 py-8">
                {shadowMindData ? (
                    <ShadowMindInterface 
                        shadowScore={shadowMindData.gpt_confidence_score}
                        confidence={shadowMindData.confidence}
                        sentiment={shadowMindData.sentiment}
                        riskRating={shadowMindData.risk_rating}
                        currentThought={shadowMindData.currentThought}
                        prediction={shadowMindData.shortTermPrediction}
                    />
                ) : (
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
                )}
            </div>
        </>
    );
}
