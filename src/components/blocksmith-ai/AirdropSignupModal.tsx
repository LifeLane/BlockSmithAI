'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useState, useMemo, useRef, useEffect } from 'react';
import { handleAirdropSignupAction } from '@/app/actions';
import { useCurrentUserState } from '@/components/blocksmith-ai/CurrentUserProvider';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Wallet } from 'lucide-react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

const formSchema = z.object({
  username: z.string().min(3, {
    message: 'Username must be at least 3 characters.',
  }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  phone: z.string().min(10, { message: 'Please enter a valid phone number.' }),
});

type AirdropFormData = z.infer<typeof formSchema>;

interface AirdropSignupModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSignupSuccess: () => void;
  userId: string;
}

export default function AirdropSignupModal({
  isOpen,
  onOpenChange,
  onSignupSuccess,
  userId,
}: AirdropSignupModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, refetchUser } = useCurrentUserState();
  const { toast } = useToast();
  const { connected, publicKey, wallet } = useWallet();
  const walletButtonRef = useRef<HTMLButtonElement>(null);

  const form = useForm<AirdropFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: user?.username?.startsWith('Guest-') ? '' : user?.username || '',
      email: user?.email || '',
      phone: user?.phone || '',
    },
  });

  useEffect(() => {
    if (user && isOpen) {
      form.reset({
        username: user.username?.startsWith('Guest-') ? '' : user.username || '',
        email: user.email || '',
        phone: user.phone || '',
      });
    }
  }, [user, isOpen, form]);

  const handleSubmit = async (data: AirdropFormData) => {
    if (!connected || !publicKey || !wallet?.adapter.name) {
      toast({
        title: 'Wallet Not Connected',
        description: 'Please connect your wallet before submitting.',
        variant: 'destructive',
      });
      walletButtonRef.current?.click();
      return;
    }

    setLoading(true);
    setError(null);

    const result = await handleAirdropSignupAction(
      {
        ...data,
        wallet_address: publicKey.toBase58(),
        wallet_type: wallet.adapter.name,
      },
      userId
    );

    if ('error' in result) {
      setError(result.error);
    } else {
      await refetchUser();
      onSignupSuccess();
    }
    setLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-accent/50">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl text-accent">Join the SHADOW Protocol</DialogTitle>
          <DialogDescription>
            Secure your eligibility for the <strong className="text-orange-400">$SHADOW</strong> airdrop by registering. Your data is your power.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="Shadow_Operator_007" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="operator@blockshadow.ai" type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="+1234567890" type="tel" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {error && <p className="text-sm font-medium text-destructive">{error}</p>}

            <DialogFooter className="flex flex-col-reverse sm:flex-col-reverse sm:space-x-0 gap-2">
                {!connected ? (
                   <div className="w-full">
                       <p className="text-xs text-center text-muted-foreground mb-2">Connect wallet to continue</p>
                        <WalletMultiButton ref={walletButtonRef} className="glow-button w-full" />
                   </div>
                ) : (
                    <Button type="submit" disabled={loading} className="w-full glow-button">
                        {loading ? ( <Loader2 className="mr-2 h-4 w-4 animate-spin" /> ) : ( <Wallet className="mr-2 h-4 w-4" /> )}
                        Join Shadow Protocol
                    </Button>
                )}
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
