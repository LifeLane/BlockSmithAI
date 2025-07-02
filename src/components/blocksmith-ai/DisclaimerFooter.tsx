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
                setDisclaimer("My pronouncements are data, not destiny. DYOR.");
            });
    }, []);

    return (
        <footer className="w-full mt-auto pt-12 pb-4 px-4">
            <div className="w-full space-y-4 pt-4 border-t border-border/50 text-center">
                <div className="flex flex-col items-center text-primary">
                    <BrainCircuit className="h-6 w-6" />
                    <h3 className="mt-2 text-sm font-semibold font-headline">
                        <GlyphScramble text="SHADOW's Edict" />
                    </h3>
                </div>
                
                <div className="font-code space-y-3">
                   {disclaimer ? (
                        <p className="text-sm font-semibold text-foreground italic">"{disclaimer}"</p>
                    ) : (
                        <div className="flex justify-center">
                            <Skeleton className="h-5 w-10/12 max-w-md mx-auto bg-muted/50" />
                        </div>
                    )}
                </div>
            </div>
        </footer>
    );
};

export default DisclaimerFooter;
