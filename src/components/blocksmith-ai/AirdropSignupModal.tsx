
'use client';

import { FunctionComponent, useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Mail, Gift, Rocket, Sparkles, Phone, User, Bot, Loader2 } from 'lucide-react';
import { handleAirdropSignupAction, type AirdropFormData } from '@/app/actions';
import { useCurrentUser } from '@/hooks/useCurrentUser';

const TwitterIcon = () => (
  <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary">
    <title>X</title>
    <path fill="currentColor" d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 7.184L18.901 1.153zm-1.61 19.99h2.136L4.259 2.145H2.022l15.269 19.001z"/>
  </svg>
);
const TelegramIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-4 w-4 text-primary" fill="currentColor">
        <path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-1.37.2-1.54l15.97-5.85c.73-.27 1.36.17 1.15.94l-3.22 14.22c-.21.93-1.22 1.15-1.8.56l-4.1-3.25-2.02 1.95c-.39.39-1.09.39-1.48 0z" />
    </svg>
);
const YouTubeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-4 w-4 text-primary" fill="currentColor">
        <path d="M21.582 7.696c-.246-1.34-1.28-2.37-2.62-2.616C17.043 4.5 12 4.5 12 4.5s-5.043 0-6.962.58c-1.34.246-2.374 1.276-2.62 2.616C2.5 9.615 2.5 12 2.5 12s0 2.385.418 4.304c.246 1.34 1.28 2.37 2.62 2.616C7.457 19.5 12 19.5 12 19.5s5.043 0 6.962-.58c1.34-.246 2.374-1.276-2.62-2.616C21.5 14.385 21.5 12 21.5 12s0-2.385-.418-4.304zM9.5 15.5V8.5l6 3.5-6 3.5z" />
    </svg>
);

interface AirdropSignupModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSignupSuccess: () => Promise<void>;
  userId: string;
}

const signupSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }).optional().or(z.literal('')),
  phone: z.string().optional(),
  x_handle: z.string().min(1, { message: "X (Twitter) handle is required." }).regex(/^@?[a-zA-Z0-9_]{1,15}$/, "Invalid X handle format."),
  telegram_handle: z.string().min(1, { message: "Telegram handle is required." }).regex(/^@?[a-zA-Z0-9_]{5,32}$/, "Invalid Telegram handle format."),
  youtube_handle: z.string().optional(),
  wallet_type: z.enum(['ETH', 'SOL', 'TON'], { required_error: "You must select a wallet type."}),
  wallet_address: z.string().min(20, { message: "Wallet address seems too short." }).max(100, { message: "Wallet address seems too long." }),
}).refine(data => {
    if (data.wallet_type === 'ETH') {
        return /^0x[a-fA-F0-9]{40}$/.test(data.wallet_address);
    }
    if (data.wallet_type === 'SOL') {
        return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(data.wallet_address);
    }
    if (data.wallet_type === 'TON') {
        // Basic TON address check (starts with UQ/EQ, 48 chars long)
        return /^(UQ|EQ)[0-9a-zA-Z\-_]{46}$/.test(data.wallet_address);
    }
    return true; // Pass for other types if any, or if type isn't selected yet.
}, {
    message: "Invalid address format for the selected wallet type.",
    path: ["wallet_address"],
});


type SignupFormData = z.infer<typeof signupSchema>;

const AirdropSignupModal: FunctionComponent<AirdropSignupModalProps> = ({ isOpen, onOpenChange, onSignupSuccess, userId }) => {
  const { user, setUser } = useCurrentUser();

  const form = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: '',
      phone: '',
      x_handle: '',
      telegram_handle: '',
      youtube_handle: '',
      wallet_address: '',
    },
  });

  useEffect(() => {
    if (user) {
        form.reset({
            email: user.email || '',
            phone: user.phone || '',
            x_handle: user.x_handle || '',
            telegram_handle: user.telegram_handle || '',
            youtube_handle: user.youtube_handle || '',
            wallet_address: user.wallet_address || '',
            wallet_type: user.wallet_type as 'ETH' | 'SOL' | 'TON' | undefined,
        });
    }
  }, [user, form, isOpen]);


  const selectedWalletType = useWatch({
    control: form.control,
    name: 'wallet_type'
  });

  const getWalletPlaceholder = () => {
    switch (selectedWalletType) {
        case 'ETH': return "0x... (ERC-20)";
        case 'SOL': return "Solana address...";
        case 'TON': return "TON address...";
        default: return "Your public wallet address";
    }
  }

  const onSubmit = async (data: AirdropFormData) => {
    if (!userId) {
        alert("Could not find your user session. Please refresh the page and try again.");
        return;
    }

    try {
      const result = await handleAirdropSignupAction(data, userId);
      if ('error' in result) {
        alert(`Signup failed: ${result.error}`);
      } else {
        setUser(result); // Immediately update the user state
        await onSignupSuccess();
        onOpenChange(false);
      }
    } catch (error: any) {
      alert(`An error occurred during signup: ${error.message || "Unknown error"}`);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-card border-primary/50 shadow-xl">
        <DialogHeader className="text-center items-center">
          <Gift className="h-12 w-12 text-accent mb-3" />
          <DialogTitle className="text-2xl font-headline text-primary flex items-center justify-center">
            <Sparkles className="h-6 w-6 mr-2 text-accent" />
            Join the <span className="text-orange-400 mx-1">BlockShadow</span> Initiative!
          </DialogTitle>
          <DialogDescription className="text-muted-foreground px-2">
            Complete your registration to become eligible for the <strong className="text-accent">$BSAI airdrop</strong> and future rewards.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 px-4 py-2 max-h-[60vh] overflow-y-auto no-scrollbar">
            <FormField control={form.control} name="email" render={({ field }) => ( <FormItem> <FormLabel className="flex items-center text-muted-foreground"><Mail className="mr-2 h-4 w-4 text-primary" /> Email Address (Optional)</FormLabel> <FormControl><Input placeholder="you@example.com" {...field} className="bg-background focus:border-accent focus:ring-accent"/></FormControl> <FormMessage /> </FormItem> )}/>
            <FormField control={form.control} name="phone" render={({ field }) => ( <FormItem> <FormLabel className="flex items-center text-muted-foreground"><Phone className="mr-2 h-4 w-4 text-primary" /> Phone Number (Optional)</FormLabel> <FormControl><Input placeholder="+1 555 123 4567" {...field} className="bg-background focus:border-accent focus:ring-accent"/></FormControl> <FormMessage /> </FormItem> )}/>
            
            <p className="text-sm font-medium text-primary pt-2">Social Handles (for verification)</p>
            <FormField control={form.control} name="x_handle" render={({ field }) => ( <FormItem> <FormLabel className="flex items-center text-muted-foreground"><TwitterIcon/> <span className="ml-2">X (Twitter) Handle</span></FormLabel> <FormControl><Input placeholder="@YourHandle" {...field} className="bg-background focus:border-accent focus:ring-accent"/></FormControl> <FormMessage /> </FormItem> )}/>
            <FormField control={form.control} name="telegram_handle" render={({ field }) => ( <FormItem> <FormLabel className="flex items-center text-muted-foreground"><TelegramIcon/> <span className="ml-2">Telegram Handle</span></FormLabel> <FormControl><Input placeholder="@YourHandle" {...field} className="bg-background focus:border-accent focus:ring-accent"/></FormControl> <FormMessage /> </FormItem> )}/>
            <FormField control={form.control} name="youtube_handle" render={({ field }) => ( <FormItem> <FormLabel className="flex items-center text-muted-foreground"><YouTubeIcon/> <span className="ml-2">YouTube Handle (Optional)</span></FormLabel> <FormControl><Input placeholder="Your Channel Name or Handle" {...field} className="bg-background focus:border-accent focus:ring-accent"/></FormControl> <FormMessage /> </FormItem> )}/>

            <FormField
              control={form.control}
              name="wallet_type"
              render={({ field }) => (
                <FormItem className="space-y-3 pt-2">
                  <FormLabel className="text-sm font-medium text-primary">Airdrop Wallet Type</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl><RadioGroupItem value="ETH" /></FormControl>
                        <FormLabel className="font-normal">Ethereum (ETH)</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl><RadioGroupItem value="SOL" /></FormControl>
                        <FormLabel className="font-normal">Solana (SOL)</FormLabel>
                      </FormItem>
                       <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl><RadioGroupItem value="TON" /></FormControl>
                        <FormLabel className="font-normal">TON</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="wallet_address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center text-muted-foreground">Wallet Address</FormLabel>
                  <FormControl>
                    <Input placeholder={getWalletPlaceholder()} {...field} className="bg-background focus:border-accent focus:ring-accent" disabled={!selectedWalletType}/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="pt-4 sticky bottom-0 bg-card pb-2">
              <Button
                type="submit"
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold py-3 text-base"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Rocket className="mr-2 h-5 w-5" />}
                {user?.status === 'Registered' ? 'Update Registration' : 'Confirm Eligibility & Register'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AirdropSignupModal;
