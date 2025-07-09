'use client';
import { useState } from 'react';
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
        if (!user || user.status === 'Guest' || !isInitialized) return;

        setIsSyncing(true);
        const result = await syncClientStateAction(user.id, { positions, signals });
        
        if (result.error) {
            toast({ title: "Connection Failed", description: result.error, variant: 'destructive' });
        } else {
            toast({ title: "Connection Successful!", description: "Your progress has been synced to the Mainnet." });
            await refetchUser();
        }
        setIsSyncing(false);
    };
    
    // Don't render anything if we're still loading or if the user is online and registered.
    if (isUserLoading || !isInitialized || (connectionStatus === 'online' && user?.status !== 'Guest')) {
        return null; 
    }
    
    const isGuest = user?.status === 'Guest';

    let icon = <WifiOff className="h-5 w-5 text-destructive animate-pulse" />;
    let text = 'Mainnet Offline';
    let buttonText: React.ReactNode = 'Connect to Mainnet';
    let buttonAction: () => void = handleSync;

    if (isGuest) {
        buttonText = 'Register to Connect';
        buttonAction = () => router.push('/profile');
    }
    
    if (isSyncing && !isGuest) {
        icon = <Loader2 className="h-5 w-5 text-destructive animate-spin" />;
        text = 'Connecting...';
        buttonText = 'Connecting...';
    }

    return (
        <div className={cn(
            "fixed bottom-4 left-1/2 -translate-x-1/2 z-[200] w-full max-w-sm sm:max-w-md",
            "rounded-xl border bg-card/80 p-3 shadow-2xl shadow-black/30 backdrop-blur-xl",
            "flex items-center justify-between gap-4 transition-all",
            "border-destructive/50"
        )}>
            <div className="flex items-center gap-3">
                {icon}
                <span className="text-sm font-semibold text-foreground">{text}</span>
            </div>
            <Button 
                size="sm" 
                className="bg-primary/10 hover:bg-primary/20 shrink-0 border border-primary/20 text-sm font-bold text-primary-foreground"
                onClick={buttonAction}
                disabled={isSyncing}
            >
                {buttonText}
            </Button>
        </div>
    );
};

export default ConnectionStatus;
