
'use client';

import { AlertTriangle } from 'lucide-react';
import GlyphScramble from './GlyphScramble';

const DisclaimerFooter = () => {
    return (
        <footer className="w-full mt-auto pt-8 pb-4 px-4 text-center">
            <div className="text-sm md:text-base">
                <span className="font-bold text-accent animate-shadow-pulse-accent">
                    <GlyphScramble text="Disclaimer:" />
                </span>
                <span className="ml-2 font-semibold text-destructive inline-flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-1.5" />
                    Do Your Own Research.
                </span>
            </div>
        </footer>
    );
};

export default DisclaimerFooter;
