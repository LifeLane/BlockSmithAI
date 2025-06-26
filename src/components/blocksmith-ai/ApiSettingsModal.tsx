
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
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { KeyRound, Settings, Trash2, Save, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useApiKeys } from '@/context/ApiKeyContext';
import { useEffect } from 'react';

const apiSettingsSchema = z.object({
  apiKey: z.string().min(10, { message: "API Key seems too short." }).max(100, { message: "API Key seems too long."}),
  apiSecret: z.string().min(10, { message: "API Secret seems too short." }).max(100, { message: "API Secret seems too long."}),
});

type ApiSettingsFormData = z.infer<typeof apiSettingsSchema>;

const ApiSettingsModal: FunctionComponent = () => {
  const { toast } = useToast();
  const { apiKeys, setApiKey, removeApiKey, isModalOpen, closeModal } = useApiKeys();

  const form = useForm<ApiSettingsFormData>({
    resolver: zodResolver(apiSettingsSchema),
    defaultValues: {
      apiKey: '',
      apiSecret: '',
    },
  });

  useEffect(() => {
    if (isModalOpen) {
      form.reset({
        apiKey: apiKeys.binanceApiKey || '',
        apiSecret: apiKeys.binanceApiSecret || '',
      });
    }
  }, [isModalOpen, apiKeys, form]);

  const onSubmit = (data: ApiSettingsFormData) => {
    setApiKey('binanceApiKey', data.apiKey);
    setApiKey('binanceApiSecret', data.apiSecret);
    toast({
      title: "API Keys Saved",
      description: "Your Binance API keys have been securely stored in your browser.",
    });
    closeModal();
  };

  const handleClearAndClose = () => {
    removeApiKey('binanceApiKey');
    removeApiKey('binanceApiSecret');
    toast({
      title: "API Keys Cleared",
      description: "Your Binance API keys have been removed.",
      variant: "destructive"
    });
    closeModal();
  }

  const apiKeysAreSet = !!apiKeys.binanceApiKey && !!apiKeys.binanceApiSecret;

  return (
    <Dialog open={isModalOpen} onOpenChange={closeModal}>
      <DialogContent className="sm:max-w-md bg-card border-primary/50 shadow-xl">
        <DialogHeader className="text-center items-center">
          <Settings className="h-10 w-10 text-primary mb-2" />
          <DialogTitle className="text-2xl font-headline text-primary">
            Exchange API Settings
          </DialogTitle>
          <DialogDescription className="text-muted-foreground px-2">
            Manage your Binance API keys to enable trade execution features. Keys are stored <strong className="text-accent">locally</strong> in your browser.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 px-4 py-2">
            <FormField
              control={form.control}
              name="apiKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center text-muted-foreground">
                    <KeyRound className="mr-2 h-4 w-4 text-primary" /> API Key
                  </FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Your Binance API Key" {...field} className="bg-background focus:border-accent focus:ring-accent"/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="apiSecret"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center text-muted-foreground">
                    <KeyRound className="mr-2 h-4 w-4 text-primary" /> API Secret
                  </FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Your Binance API Secret" {...field} className="bg-background focus:border-accent focus:ring-accent"/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="p-3 my-2 bg-yellow-900/30 border border-yellow-600/50 rounded-md text-xs text-yellow-300">
                <div className="flex items-start">
                    <AlertTriangle className="h-4 w-4 mr-2 mt-0.5 text-yellow-500 shrink-0" />
                    <div>
                        <strong className="font-semibold">Security Warning:</strong> Never share your API Secret. Ensure these keys have <strong className="text-yellow-200">only trading permissions enabled</strong> and <strong className="text-yellow-200">disable withdrawal permissions</strong>. BlockSmithAI is not responsible for any loss of funds.
                    </div>
                </div>
            </div>

            <DialogFooter className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button 
                type="submit" 
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                disabled={form.formState.isSubmitting}
              >
                <Save className="mr-2 h-5 w-5" />
                Save Keys
              </Button>
              {apiKeysAreSet && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleClearAndClose}
                  className="w-full"
                >
                  <Trash2 className="mr-2 h-5 w-5" />
                  Clear Saved Keys
                </Button>
              )}
            </DialogFooter>
          </form>
        </Form>
         <DialogClose asChild>
            <button className="sr-only">Close</button>
         </DialogClose>
      </DialogContent>
    </Dialog>
  );
};

export default ApiSettingsModal;
