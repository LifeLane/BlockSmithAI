
'use client';
import { useState } from 'react';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useClientState } from '@/hooks/use-client-state';
import { syncClientStateAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Wifi, WifiOff, Loader2, UserCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';

const ConnectionStatus = () => {
    const { user, connectionStatus, refetchUser, isLoading: isUserLoading } = useCurrentUser();
    const { positions, signals, isInitialized } = useClientState();
    const [isSyncing, setIsSyncing] = useState(false);
    const { toast } = useToast();
    const router = useRouter();

    const handleSync = async () => {
        if (!user || user.status === 'Guest' || !isInitialized) return;

        setIsSyncing(true);
        toast({ title: "Syncing Progress...", description: "Attempting to sync your local data with the server." });
        
        const result = await syncClientStateAction(user.id, { positions, signals });
        
        if (result.error) {
            toast({ title: "Sync Failed", description: result.error, variant: 'destructive' });
        } else {
            toast({ title: "Sync Successful!", description: "Your progress has been saved online." });
            await refetchUser();
        }
        setIsSyncing(false);
    };
    
    // Hide component if user is loading, or if they are online
    if (isUserLoading || connectionStatus === 'online') {
        return null; 
    }
    
    // Also hide if the client state hasn't been loaded from local storage yet
    if (!isInitialized || !user) {
        return null;
    }

    const isGuest = user.status === 'Guest';
    const message = isGuest ? "You are in Guest Mode. Progress is local." : "You are offline. Progress is not being saved online.";
    const buttonText = isGuest ? "Register to Save" : "Sync Now";

    return (
        <div className="fixed top-0 left-0 right-0 h-12 bg-destructive/90 border-b border-destructive/50 z-[200] flex items-center justify-center px-4 shadow-lg text-destructive-foreground">
            <div className="flex items-center gap-3 text-sm">
                {isSyncing ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                ) : isGuest ? (
                    <UserCheck className="h-5 w-5" />
                ) : (
                    <WifiOff className="h-5 w-5" />
                )}
                <span className="font-semibold">{message}</span>
                <Button 
                    size="sm" 
                    className="bg-background text-foreground hover:bg-background/80"
                    onClick={isGuest ? () => router.push('/profile') : handleSync}
                    disabled={isSyncing}
                >
                    {isSyncing ? 'Syncing...' : buttonText}
                </Button>
            </div>
        </div>
    );
};

export default ConnectionStatus;
