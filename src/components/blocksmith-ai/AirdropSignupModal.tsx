
'use client';

import { FunctionComponent, useEffect } from 'react';
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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Mail, Gift, Rocket, Sparkles, Phone, User, Loader2 } from 'lucide-react';
import { handleAirdropSignupAction, type AirdropFormData, type UserProfile } from '@/app/actions';
import { useCurrentUserState } from '@/components/blocksmith-ai/CurrentUserProvider';
import { useToast } from '@/hooks/use-toast';


interface AirdropSignupModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSignupSuccess: () => Promise<void>;
  userId: string;
}

const signupSchema = z.object({
  username: z.string().min(3, { message: "Username must be at least 3 characters." }).max(20, { message: "Username must be 20 characters or less."}),
  email: z.string().email({ message: "Please enter a valid email address." }).optional().or(z.literal('')),
  phone: z.string().optional(),
});


type SignupFormData = z.infer<typeof signupSchema>;

const AirdropSignupModal: FunctionComponent<AirdropSignupModalProps> = ({ isOpen, onOpenChange, onSignupSuccess, userId }) => {
  const { user, setUser } = useCurrentUserState();
  const { toast } = useToast();

  const form = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      username: '',
      email: '',
      phone: '',
    },
  });

  useEffect(() => {
    if (user && !user.id.startsWith('guest_')) {
        form.reset({
            username: user.username || '',
            email: user.email || '',
            phone: user.phone || '',
        });
    } else {
        form.reset({ username: '', email: '', phone: '' });
    }
  }, [user, form, isOpen]);

  const onSubmit = async (data: SignupFormData) => {
    if (!userId) {
        toast({ title: "Session Error", description: "Could not find user session. Please refresh.", variant: "destructive" });
        return;
    }

    try {
      const result = await handleAirdropSignupAction(data, userId);
      if ('error' in result) {
        toast({ title: "Signup Failed", description: result.error, variant: "destructive" });
      } else {
        const newUser = result as UserProfile;
        setUser(newUser); // Immediately update the user state
        if (userId.startsWith('guest_')) {
            localStorage.setItem('currentUserId', newUser.id); // Persist the new, real ID
        }
        await onSignupSuccess();
        onOpenChange(false);
      }
    } catch (error: any) {
      toast({ title: "An Error Occurred", description: `An unexpected error occurred during signup: ${error.message || "Unknown error"}`, variant: "destructive" });
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
            <FormField control={form.control} name="username" render={({ field }) => ( <FormItem> <FormLabel className="flex items-center text-muted-foreground"><User className="mr-2 h-4 w-4 text-primary" /> Username</FormLabel> <FormControl><Input placeholder="Your unique username" {...field} className="bg-background focus:border-accent focus:ring-accent"/></FormControl> <FormMessage /> </FormItem> )}/>
            <FormField control={form.control} name="email" render={({ field }) => ( <FormItem> <FormLabel className="flex items-center text-muted-foreground"><Mail className="mr-2 h-4 w-4 text-primary" /> Email Address (Optional)</FormLabel> <FormControl><Input placeholder="you@example.com" {...field} className="bg-background focus:border-accent focus:ring-accent"/></FormControl> <FormMessage /> </FormItem> )}/>
            <FormField control={form.control} name="phone" render={({ field }) => ( <FormItem> <FormLabel className="flex items-center text-muted-foreground"><Phone className="mr-2 h-4 w-4 text-primary" /> Phone Number (Optional)</FormLabel> <FormControl><Input placeholder="+1 555 123 4567" {...field} className="bg-background focus:border-accent focus:ring-accent"/></FormControl> <FormMessage /> </FormItem> )}/>
            
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
