
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
    Copy, Check, FileText, AreaChart, CircleHelp, Wallet, Bot, BookOpen, LineChart, CandlestickChart, Telescope, Network
} from 'lucide-react';

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
        <Button variant="ghost" size="icon" onClick={handleCopy} className="h-7 w-7">
            {hasCopied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
        </Button>
    );
};


export default function TokenInfo() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="interactive-card border-accent/30">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-accent font-headline"><FileText /> Contract Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Token Name:</span>
                    <span className="font-bold text-foreground">{contractDetails.name}</span>
                </div>
                 <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Decimals:</span>
                    <span className="font-mono text-foreground">{contractDetails.decimals}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Token Address:</span>
                    <div className="flex items-center gap-2">
                        <span className="font-mono text-primary truncate">{contractDetails.address}</span>
                        <CopyButton textToCopy={contractDetails.address} />
                    </div>
                </div>
                 <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Creator Address:</span>
                    <div className="flex items-center gap-2">
                        <span className="font-mono text-primary truncate">{contractDetails.creator}</span>
                        <CopyButton textToCopy={contractDetails.creator} />
                    </div>
                </div>
            </CardContent>
        </Card>

        <Card className="interactive-card border-tertiary/30">
             <CardHeader>
                <CardTitle className="flex items-center gap-2 text-tertiary font-headline"><CandlestickChart /> Trading & Verification</CardTitle>
            </CardHeader>
             <CardContent className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {tradingLinks.map(link => (
                     <Button key={link.name} asChild variant="outline" className="justify-start text-sm">
                        <a href={link.url} target="_blank" rel="noopener noreferrer">
                            <AreaChart className="h-4 w-4 mr-2" /> {link.name}
                        </a>
                    </Button>
                ))}
            </CardContent>
        </Card>

        <Card className="lg:col-span-2 interactive-card border-primary/30">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary font-headline"><Bot /> Explorer & Analytics</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                 {explorerLinks.map(link => (
                    <Button key={link.name} asChild variant="secondary" className="justify-center text-base py-6">
                        <a href={link.url} target="_blank" rel="noopener noreferrer" className="flex flex-col sm:flex-row items-center gap-2">
                           {link.icon} {link.name}
                        </a>
                    </Button>
                ))}
            </CardContent>
        </Card>
    </div>
  );
}
