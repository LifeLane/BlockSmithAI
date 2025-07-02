'use client';

import { AlertTriangle } from 'lucide-react';
import GlyphScramble from './GlyphScramble';
import { Card } from '@/components/ui/card';

const DisclaimerFooter = () => {
    return (
        <footer className="w-full mt-auto pt-6 px-4 text-center">
            <Card className="max-w-md mx-auto p-4 bg-card/80 backdrop-blur-sm border border-destructive/50 shadow-lg shadow-destructive/20">
                <div className="flex items-center justify-center text-accent mb-2">
                    <AlertTriangle className="h-5 w-5 mr-2" />
                    <h3 className="font-bold text-lg font-headline animate-shadow-pulse-accent">
                        <GlyphScramble text="Disclaimer" />
                    </h3>
                </div>
                <p className="mt-4 text-sm font-bold text-foreground/90">
                    I provide the coordinates; you fly the ship. These are not psychic pronouncements, merely high-probability vectors. The market does not offer refunds.{" "}
                    <strong className="text-destructive inline-flex items-center">
                        <AlertTriangle className="h-4 w-4 mr-1.5" />
                        Do Your Own Research.
                    </strong>
                </p>
            </Card>
        </footer>
    );
};

export default DisclaimerFooter;
