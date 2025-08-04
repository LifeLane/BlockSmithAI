'use client';
import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader2 } from 'lucide-react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
import { getAssociatedTokenAddress, createTransferInstruction } from '@solana/spl-token';
import { useToast } from "@/hooks/use-toast";
import { confirmShadowSubscriptionAction } from '@/app/actions';
import { useCurrentUserState } from './CurrentUserProvider';

interface SubscriptionCardProps {
    tier: {
        name: string;
        price: number;
        duration: string;
        features: string[];
        icon: React.ReactNode;
        isPopular?: boolean;
    };
    userId: string | undefined;
}

const CREATOR_WALLET_ADDRESS = process.env.NEXT_PUBLIC_CREATOR_WALLET_ADDRESS!;
const SHADOW_TOKEN_MINT = new PublicKey(process.env.NEXT_PUBLIC_SHADOW_TOKEN_MINT!);

export default function SubscriptionCard({ tier, userId }: SubscriptionCardProps) {
    const { toast } = useToast();
    const { connection } = useConnection();
    const { publicKey, sendTransaction, wallet } = useWallet();
    const { refetchUser } = useCurrentUserState();
    const [isProcessing, setIsProcessing] = useState(false);

    const handleSubscription = async () => {
        if (!publicKey || !wallet || !userId) {
            toast({
                title: "Wallet Not Connected",
                description: "Please connect your Solana wallet to subscribe.",
                variant: "destructive"
            });
            return;
        }

        setIsProcessing(true);

        try {
            // Get the sender's token account address
            const fromTokenAccount = await getAssociatedTokenAddress(SHADOW_TOKEN_MINT, publicKey);

            // Get the recipient's token account address
            const toTokenAccount = await getAssociatedTokenAddress(SHADOW_TOKEN_MINT, new PublicKey(CREATOR_WALLET_ADDRESS));

            // Check if the recipient token account exists
            const toTokenAccountInfo = await connection.getAccountInfo(toTokenAccount);
            if (!toTokenAccountInfo) {
                toast({
                    title: 'Recipient Account Error',
                    description: 'The creator\'s SHADOW token account may not be initialized.',
                    variant: 'destructive'
                });
                setIsProcessing(false);
                return;
            }
            
            const {
                context: { slot: minContextSlot },
                value: { blockhash, lastValidBlockHeight }
            } = await connection.getLatestBlockhashAndContext();
            
            const transaction = new Transaction().add(
                createTransferInstruction(
                    fromTokenAccount,
                    toTokenAccount,
                    publicKey,
                    tier.price * (10 ** 9) // Assuming SHADOW has 9 decimals
                )
            );
            
            // Set the fee payer and recent blockhash to ensure the transaction is valid
            transaction.feePayer = publicKey;
            transaction.recentBlockhash = blockhash;

            const signature = await sendTransaction(transaction, connection, { minContextSlot });
            
            toast({
                title: 'Transaction Sent',
                description: 'Waiting for confirmation...',
            });

            await connection.confirmTransaction({ blockhash, lastValidBlockHeight, signature });
            
            toast({
                title: 'Subscription Confirmed!',
                description: 'Your premium access is being activated.',
                variant: 'default',
                className: 'bg-green-500/10 border-green-500/50'
            });

            // Call server action to update user status
            const result = await confirmShadowSubscriptionAction(userId, tier.name, tier.duration as 'Monthly' | 'Yearly' | 'Lifetime', signature);

            if (result.success) {
                await refetchUser();
                toast({
                    title: <span className="text-accent">Premium Activated!</span>,
                    description: `Welcome to the ${tier.name} tier.`
                });
            } else {
                 toast({
                    title: 'Activation Failed',
                    description: result.error,
                    variant: 'destructive'
                });
            }


        } catch (error: any) {
            console.error("Subscription Error:", error);
            toast({
                title: "Transaction Failed",
                description: error.message || "An unknown error occurred during the transaction.",
                variant: "destructive"
            });
        } finally {
            setIsProcessing(false);
        }
    };
    
    return (
        <Card className={`interactive-card flex flex-col ${tier.isPopular ? 'border-primary shadow-lg shadow-primary/20' : ''}`}>
            <CardHeader className="text-center">
                <div className="mx-auto bg-secondary p-3 rounded-full w-fit mb-4">{tier.icon}</div>
                <CardTitle className="text-xl font-headline">{tier.name}</CardTitle>
                <CardDescription className="font-bold text-3xl text-primary font-mono tracking-tight">
                    {tier.price.toLocaleString()} <span className="text-sm text-muted-foreground font-sans tracking-normal">SHADOW</span>
                </CardDescription>
                <CardDescription className="font-semibold">{tier.duration} Membership</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 flex-grow">
                <ul className="space-y-2">
                    {tier.features.map(feature => (
                        <li key={feature} className="flex items-center">
                            <CheckCircle className="h-4 w-4 mr-2 text-green-400"/>
                            <span className="text-sm text-muted-foreground">{feature}</span>
                        </li>
                    ))}
                </ul>
            </CardContent>
            <CardFooter>
                 <Button className="w-full glow-button" onClick={handleSubscription} disabled={isProcessing || !publicKey}>
                    {isProcessing ? <Loader2 className="animate-spin" /> : 'Subscribe Now'}
                </Button>
            </CardFooter>
        </Card>
    );
}
