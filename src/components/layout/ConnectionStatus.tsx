
'use client';
import { useState, useEffect } from 'react';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useClientState } from '@/hooks/use-client-state';
import { syncClientStateAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { WifiOff, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

const ConnectionStatus = () => {
    const { user, connectionStatus, refetchUser, isLoading: isUserLoading } = useCurrentUser();
    const { positions, signals, isInitialized } = useClientState();
    const [isSyncing, setIsSyncing] = useState(false);
    const { toast } = useToast();
    const router = useRouter();

    const handleSync = async () => {
        if (!user || !isInitialized) return;

        if (user.status === 'Guest') {
            router.push('/profile');
            return;
        }

        setIsSyncing(true);
        const result = await syncClientStateAction(user.id, { positions, signals });
        
        if (result.error) {
            toast({ title: "Connection Failed", description: result.error, variant: 'destructive' });
            setIsSyncing(false);
        } else {
            toast({ title: "Connection Successful!", description: "Your progress has been synced to the Mainnet." });
            await refetchUser();
            setIsSyncing(false);
        }
    };
    
    // Don't render anything if we're still loading, or if the user is online and not a guest.
    if (isUserLoading || !isInitialized || (connectionStatus === 'online' && user?.status !== 'Guest')) {
        return null; 
    }
    
    const isGuest = user?.status === 'Guest';

    let icon = isGuest ? <WifiOff className="h-5 w-5 text-yellow-400" /> : <WifiOff className="h-5 w-5 text-destructive animate-pulse" />;
    let text = isGuest ? 'Guest Session' : 'Mainnet Offline';
    let buttonText: React.ReactNode = 'Connect to Mainnet';

    if (isGuest) {
        buttonText = 'Register to Connect';
    }
    
    if (isSyncing) {
        icon = <Loader2 className="h-5 w-5 text-primary animate-spin" />;
        text = 'Connecting...';
        buttonText = 'Connecting...';
    }

    return (
        <div className={cn(
            "fixed top-4 left-1/2 -translate-x-1/2 z-[200] w-[calc(100%-2rem)] max-w-sm sm:max-w-md",
            "rounded-xl border bg-card/80 p-3 shadow-2xl shadow-black/30 backdrop-blur-xl",
            "flex items-center justify-between gap-4 transition-all",
            isGuest ? "border-yellow-500/50" : "border-destructive/50"
        )}>
            <div className="flex items-center gap-3">
                {icon}
                <span className="text-sm font-semibold text-foreground">{text}</span>
            </div>
            <Button 
                size="sm" 
                className={cn(
                    "shrink-0 border text-sm font-bold",
                    isGuest ? "bg-yellow-400/10 hover:bg-yellow-400/20 border-yellow-400/20 text-yellow-300" 
                            : "bg-primary/10 hover:bg-primary/20 border-primary/20 text-primary"
                )}
                onClick={handleSync}
                disabled={isSyncing}
            >
                {buttonText}
            </Button>
        </div>
    );
};

export default ConnectionStatus;
