'use client';

import { MessageCircleWarning } from 'lucide-react';
import GlyphScramble from './GlyphScramble';
import { Card } from '@/components/ui/card';

const DisclaimerFooter = () => {
    return (
        <footer className="w-full mt-auto pt-6 px-4 text-center">
            <Card className="max-w-3xl mx-auto p-4 bg-card/80 backdrop-blur-sm border border-orange-500/30">
                <div className="flex items-center justify-center text-orange-400 mb-2">
                    <MessageCircleWarning className="h-5 w-5 mr-2" />
                    <h3 className="font-semibold text-base font-headline">
                        <GlyphScramble text="A Transmission from SHADOW" />
                    </h3>
                </div>
                <p className="text-sm font-bold text-foreground/90">
                    I provide the coordinates; you fly the ship. These are not psychic pronouncements, merely high-probability vectors. The market does not offer refunds. Do Your Own Research.
                </p>
            </Card>
        </footer>
    );
};

export default DisclaimerFooter;
