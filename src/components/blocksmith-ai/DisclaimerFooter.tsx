
'use client';

import { AlertTriangle } from 'lucide-react';
import GlyphScramble from './GlyphScramble';

const DisclaimerFooter = () => {
    return (
        <footer className="w-full mt-auto pt-8 pb-4 px-4 text-center">
             <div className="inline-flex items-center justify-center p-3 rounded-lg bg-card/80 backdrop-blur-sm border border-destructive/50">
                 <strong className="text-red-500 inline-flex items-center text-base sm:text-lg font-bold whitespace-nowrap">
                    <AlertTriangle className="h-5 w-5 mr-2" />
                    <GlyphScramble text="Do Your Own Research." />
                </strong>
             </div>
        </footer>
    );
};

export default DisclaimerFooter;
