
'use client';

import { BrainCircuit, AlertTriangle } from 'lucide-react';
import GlyphScramble from './GlyphScramble';
import { generateSarcasticDisclaimer } from '@/ai/flows/generate-sarcastic-disclaimer';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const DisclaimerFooter = () => {
    const [disclaimer, setDisclaimer] = useState<string | null>(null);

    useEffect(() => {
        generateSarcasticDisclaimer()
            .then(result => setDisclaimer(result.disclaimer))
            .catch(err => {
                console.error("Failed to fetch sarcastic disclaimer:", err);
                setDisclaimer("My analysis is a weapon; how you wield it is your own affair. This is not financial advice.");
            });
    }, []);

    return (
        <footer className="w-full mt-auto pt-12 pb-4 px-4">
            <div className="shadow-edict-container">
                <div className="shadow-edict-title-container">
                    <BrainCircuit className="h-6 w-6" />
                    <h3 className="shadow-edict-title">
                        <GlyphScramble text="SHADOW's Edict" />
                    </h3>
                </div>
                <div className="shadow-edict-body text-center space-y-2">
                   {disclaimer ? (
                        <p className="font-semibold text-foreground italic">"{disclaimer}"</p>
                    ) : (
                        <Skeleton className="h-4 w-10/12 max-w-sm mx-auto bg-muted/50" />
                    )}
                    <p className="flex items-center justify-center gap-2 text-sm font-bold text-destructive">
                        <AlertTriangle className="h-4 w-4" />
                        Always Do Your Own Research (DYOR).
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default DisclaimerFooter;
