
'use client';

import type { FunctionComponent } from 'react';
import { useForm } from 'react-hook-form';
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
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Mail, Send as TelegramIcon, Link as SolanaIcon, Gift, Rocket, Sparkles } from 'lucide-react'; // Using Send for Telegram, Link for Solana

interface AirdropSignupModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSignupSuccess: () => void;
}

const signupSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  telegram: z.string().min(3, { message: "Telegram username must be at least 3 characters." }).regex(/^@?[a-zA-Z0-9_]{3,32}$/, "Invalid Telegram username format."),
  solanaAddress: z.string().min(32, { message: "Solana address seems too short." }).max(44, {message: "Solana address seems too long."}).regex(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/, "Invalid Solana address format."),
});

type SignupFormData = z.infer<typeof signupSchema>;

const AirdropSignupModal: FunctionComponent<AirdropSignupModalProps> = ({ isOpen, onOpenChange, onSignupSuccess }) => {
  const form = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: '',
      telegram: '',
      solanaAddress: '',
    },
  });

  const onSubmit = async (data: SignupFormData) => {
    // In a real app, you'd send this data to your backend.
    // For now, we just simulate success.
    console.log("Airdrop Signup Data:", data);
    onSignupSuccess();
    form.reset(); // Reset form after successful submission
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-card border-primary/50 shadow-xl">
        <DialogHeader className="text-center items-center">
          <Gift className="h-12 w-12 text-accent mb-3" />
          <DialogTitle className="text-2xl font-headline text-primary flex items-center justify-center">
            <Sparkles className="h-6 w-6 mr-2 text-primary" />
            Unlock Your <span className="text-accent mx-1">Full Potential!</span>
          </DialogTitle>
          <DialogDescription className="text-muted-foreground px-2">
            Join the BlockSmithAI revolution! Submit your details for a <strong className="text-foreground">massive 40 Billion $BSAI token airdrop</strong>, exclusive access to our <strong className="text-foreground">1st Public Offering</strong>, and <strong className="text-primary">unlimited AI analyses</strong>.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 px-4 py-2">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center text-muted-foreground">
                    <Mail className="mr-2 h-4 w-4 text-primary" /> Email Address
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="you@example.com" {...field} className="bg-background focus:border-accent"/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="telegram"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center text-muted-foreground">
                    <TelegramIcon className="mr-2 h-4 w-4 text-primary" /> Telegram Username
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="@your_username" {...field} className="bg-background focus:border-accent"/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="solanaAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center text-muted-foreground">
                    <SolanaIcon className="mr-2 h-4 w-4 text-primary" /> Solana Wallet Address
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Your Solana public key" {...field} className="bg-background focus:border-accent"/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="pt-4">
              <Button 
                type="submit" 
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold py-3 text-base"
                disabled={form.formState.isSubmitting}
              >
                <Rocket className="mr-2 h-5 w-5" />
                Secure My Spot & Unlock AI!
              </Button>
            </DialogFooter>
          </form>
        </Form>
        <p className="text-xs text-muted-foreground text-center px-6 pb-4">
            By submitting, you agree to be contacted about the BSAI airdrop and public offering.
            Holding $BSAI tokens grants unlimited analysis access.
        </p>
      </DialogContent>
    </Dialog>
  );
};

export default AirdropSignupModal;
