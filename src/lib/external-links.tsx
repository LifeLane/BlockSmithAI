
import { Telescope, BookOpen, Network, LineChart, CandlestickChart } from 'lucide-react';
import type { TickerItem } from '@/components/blocksmith-ai/LivePriceTicker';

export const explorerLinks: TickerItem[] = [
    { name: 'Token Explorer', url: 'https://solscan.io/token/B6XHf6ouZAy5Enq4kR3Po4CD5axn1EWc7aZKR9gmr2QR', icon: <Telescope className="h-4 w-4" /> },
    { name: 'Transactions', url: 'https://solscan.io/token/B6XHf6ouZAy5Enq4kR3Po4CD5axn1EWc7aZKR9gmr2QR#transactions', icon: <BookOpen className="h-4 w-4" /> },
    { name: 'Holders', url: 'https://solscan.io/token/B6XHf6ouZAy5Enq4kR3Po4CD5axn1EWc7aZKR9gmr2QR#holders', icon: <Network className="h-4 w-4" /> },
    { name: 'Analytics', url: 'https://solscan.io/token/B6XHf6ouZAy5Enq4kR3Po4CD5axn1EWc7aZKR9gmr2QR#analytics', icon: <LineChart className="h-4 w-4" /> },
];

export const tradingLinks: TickerItem[] = [
    { name: 'BirdEye', url: 'https://birdeye.so/token/B6XHf6ouZAy5Enq4kR3Po4CD5axn1EWc7aZKR9gmr2QR?chain=solana', icon: <CandlestickChart className="h-4 w-4"/> },
    { name: 'GeckoTerminal', url: 'https://www.geckoterminal.com/solana/tokens/B6XHf6ouZAy5Enq4kR3Po4CD5axn1EWc7aZKR9gmr2QR', icon: <CandlestickChart className="h-4 w-4"/> },
    { name: 'GMGN', url: 'https://gmgn.ai/sol/token/solscan_B6XHf6ouZAy5Enq4kR3Po4CD5axn1EWc7aZKR9gmr2QR', icon: <CandlestickChart className="h-4 w-4"/> },
    { name: 'DexScreener', url: 'https://dexscreener.com/solana/B6XHf6ouZAy5Enq4kR3Po4CD5axn1EWc7aZKR9gmr2QR', icon: <CandlestickChart className="h-4 w-4"/> },
    { name: 'DexTools', url: 'https://www.dextools.io/app/en/solana/pair-explorer/B6XHf6ouZAy5Enq4kR3Po4CD5axn1EWc7aZKR9gmr2QR', icon: <CandlestickChart className="h-4 w-4"/> },
    { name: 'Photon', url: 'https://photon-sol.tinyastro.io/en/r/solscanofficial/B6XHf6ouZAy5Enq4kR3Po4CD5axn1EWc7aZKR9gmr2QR', icon: <CandlestickChart className="h-4 w-4"/> },
    { name: 'RugCheck', url: 'https://rugcheck.xyz/tokens/B6XHf6ouZAy5Enq4kR3Po4CD5axn1EWc7aZKR9gmr2QR', icon: <CandlestickChart className="h-4 w-4"/> },
];
