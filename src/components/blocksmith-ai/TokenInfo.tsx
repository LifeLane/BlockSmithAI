'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
    Copy, Check, FileText, AreaChart, CircleHelp, Wallet, Bot, BookOpen, LineChart, CandlestickChart, Telescope, Network
} from 'lucide-react';
import LivePriceTicker from './LivePriceTicker';

const contractDetails = {
    name: 'SHADOW (SHADOW)',
    address: 'B6XHf6ouZAy5Enq4kR3Po4CD5axn1EWc7aZKR9gmr2QR',
    creator: '38XnV4BZownmFeFrykAYhfMJvWxaZ31t4zBa96HqChEe',
    decimals: 6,
    firstMint: 'July 15, 2025 15:12:33 +UTC'
};

const explorerLinks = [
    { name: 'Token Explorer', url: 'https://solscan.io/token/B6XHf6ouZAy5Enq4kR3Po4CD5axn1EWc7aZKR9gmr2QR', icon: <Telescope className="h-4 w-4" /> },
    { name: 'Transactions', url: 'https://solscan.io/token/B6XHf6ouZAy5Enq4kR3Po4CD5axn1EWc7aZKR9gmr2QR#transactions', icon: <BookOpen className="h-4 w-4" /> },
    { name: 'Holders', url: 'https://solscan.io/token/B6XHf6ouZAy5Enq4kR3Po4CD5axn1EWc7aZKR9gmr2QR#holders', icon: <Network className="h-4 w-4" /> },
    { name: 'Analytics', url: 'https://solscan.io/token/B6XHf6ouZAy5Enq4kR3Po4CD5axn1EWc7aZKR9gmr2QR#analytics', icon: <LineChart className="h-4 w-4" /> },
];

const tradingLinks = [
    { name: 'BirdEye', url: 'https://birdeye.so/token/B6XHf6ouZAy5Enq4kR3Po4CD5axn1EWc7aZKR9gmr2QR?chain=solana' },
    { name: 'GeckoTerminal', url: 'https://www.geckoterminal.com/solana/tokens/B6XHf6ouZAy5Enq4kR3Po4CD5axn1EWc7aZKR9gmr2QR' },
    { name: 'GMGN', url: 'https://gmgn.ai/sol/token/solscan_B6XHf6ouZAy5Enq4kR3Po4CD5axn1EWc7aZKR9gmr2QR' },
    { name: 'DexScreener', url: 'https://dexscreener.com/solana/B6XHf6ouZAy5Enq4kR3Po4CD5axn1EWc7aZKR9gmr2QR' },
    { name: 'DexTools', url: 'https://www.dextools.io/app/en/solana/pair-explorer/B6XHf6ouZAy5Enq4kR3Po4CD5axn1EWc7aZKR9gmr2QR' },
    { name: 'Photon', url: 'https://photon-sol.tinyastro.io/en/r/solscanofficial/B6XHf6ouZAy5Enq4kR3Po4CD5axn1EWc7aZKR9gmr2QR' },
    { name: 'RugCheck', url: 'https://rugcheck.xyz/tokens/B6XHf6ouZAy5Enq4kR3Po4CD5axn1EWc7aZKR9gmr2QR' },
];

const CopyButton = ({ textToCopy }: { textToCopy: string }) => {
    const [hasCopied, setHasCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(textToCopy);
        setHasCopied(true);
        setTimeout(() => setHasCopied(false), 2000);
    };

    return (
        <Button variant="ghost" size="icon" onClick={handleCopy} className="h-7 w-7 shrink-0">
            {hasCopied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
        </Button>
    );
};


export default function TokenInfo() {
  return (
    <div className="space-y-4">
        <LivePriceTicker 
            items={explorerLinks} 
            direction="normal"
            title="EXPLORER"
        />
        <LivePriceTicker 
            items={tradingLinks.map(l => ({...l, icon: <CandlestickChart className="h-4 w-4"/>}))} 
            direction="reverse"
            title="TRADING"
        />

        <Card className="interactive-card border-accent/30 bg-card/80 backdrop-blur-sm">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-accent font-headline"><FileText /> Contract Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                    <span className="text-muted-foreground shrink-0 pr-4">Token Name:</span>
                    <span className="font-bold text-foreground text-right">{contractDetails.name}</span>
                </div>
                 <div className="flex justify-between items-center">
                    <span className="text-muted-foreground shrink-0 pr-4">Decimals:</span>
                    <span className="font-mono text-foreground">{contractDetails.decimals}</span>
                </div>
                <div className="flex justify-between items-center gap-2">
                    <span className="text-muted-foreground shrink-0">Token Address:</span>
                    <div className="flex items-center gap-2 min-w-0">
                        <span className="font-mono text-primary truncate">{contractDetails.address}</span>
                        <CopyButton textToCopy={contractDetails.address} />
                    </div>
                </div>
                 <div className="flex justify-between items-center gap-2">
                    <span className="text-muted-foreground shrink-0">Creator Address:</span>
                     <div className="flex items-center gap-2 min-w-0">
                        <span className="font-mono text-primary truncate">{contractDetails.creator}</span>
                        <CopyButton textToCopy={contractDetails.creator} />
                    </div>
                </div>
            </CardContent>
        </Card>
    </div>
  );
}
