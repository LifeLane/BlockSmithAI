
'use client';

import type { FunctionComponent} from 'react';
import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Send, Sparkles, MessageSquareQuote } from 'lucide-react';
import { shadowChatAction, type ChatMessage } from '@/app/actions';
import { useToast } from "@/hooks/use-toast";

interface ChatbotPopupProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const getCurrentUserIdClient = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('currentUserId');
  }
  return null;
};

const SHADOW_INITIAL_MESSAGE: ChatMessage = {
  role: 'model',
  parts: [{ text: "I am SHADOW. The market's whispers reach me. What requires my attention?" }],
};

const ChatbotPopup: FunctionComponent<ChatbotPopupProps> = ({ isOpen, onOpenChange }) => {
  const [userInput, setUserInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([SHADOW_INITIAL_MESSAGE]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
    if (isOpen && messages.length <= 1) {
        setMessages([SHADOW_INITIAL_MESSAGE]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!userInput.trim()) return;

    const userId = getCurrentUserIdClient();
    if (!userId) {
        toast({
            title: "User Session Error",
            description: "Cannot communicate with SHADOW without a user session. Please refresh.",
            variant: "destructive"
        });
        return;
    }

    const newUserMessage: ChatMessage = { role: 'user', parts: [{ text: userInput.trim() }] };
    setMessages((prevMessages) => [...prevMessages, newUserMessage]);
    setUserInput('');
    setIsLoading(true);

    const historyForAI = messages.slice(-10);

    try {
      const result = await shadowChatAction({
        userId: userId,
        currentUserInput: newUserMessage.parts[0].text,
        chatHistory: historyForAI,
      });

      if ('error' in result) {
        toast({
            title: <span className="text-orange-400">SHADOW's Transmission Garbled</span>,
            description: <span className="text-foreground">{result.error}</span>,
            variant: "destructive",
        });
        setMessages((prevMessages) => [...prevMessages, {role: 'model', parts: [{text: `My connection to the quantum field is disrupted. Error: ${result.error}`}]}]);
      } else {
        setMessages((prevMessages) => [...prevMessages, { role: 'model', parts: [{ text: result.botResponse }] }]);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "An unexpected error occurred.";
      toast({
        title: <span className="text-red-500">Network Anomaly</span>,
        description: <span className="text-foreground">Cannot reach SHADOW: {errorMsg}</span>,
        variant: "destructive",
      });
      setMessages((prevMessages) => [...prevMessages, {role: 'model', parts: [{text: `The data stream is corrupted. Retry when the ether clears.`}]}]);
    } finally {
      setIsLoading(false);
       setTimeout(() => inputRef.current?.focus(), 0);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px] md:max-w-[650px] lg:max-w-[750px] h-[70vh] flex flex-col bg-card border-primary/50 shadow-xl">
        <DialogHeader className="p-4 border-b border-border">
          <DialogTitle className="flex items-center text-xl text-primary font-headline">
            <Sparkles className="h-6 w-6 mr-2 text-accent" />
            Interface with <span className="text-accent ml-1">SHADOW</span>
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            The <strong className="text-purple-400">core intelligence</strong> of BlockShadow awaits your query.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea ref={scrollAreaRef} className="flex-grow p-4 space-y-4 overflow-y-auto">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex mb-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`p-3 rounded-lg max-w-[75%] text-sm leading-relaxed shadow ${
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground ml-auto'
                    : 'bg-secondary text-secondary-foreground mr-auto'
                }`}
              >
                {msg.role === 'model' && index === 0 && <MessageSquareQuote className="inline h-4 w-4 mr-1 mb-0.5 text-accent"/>}
                {msg.parts[0].text}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="p-3 rounded-lg bg-secondary text-secondary-foreground shadow flex items-center">
                <Loader2 className="h-5 w-5 animate-spin mr-2 text-primary" />
                SHADOW is processing... <span className="text-accent ml-1">stand by.</span>
              </div>
            </div>
          )}
        </ScrollArea>

        <DialogFooter className="p-4 border-t border-border">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex w-full space-x-2"
          >
            <Input
              ref={inputRef}
              type="text"
              placeholder="Transmit your query to SHADOW..."
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              className="flex-grow bg-background focus:ring-accent focus:border-accent"
              disabled={isLoading}
            />
            <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isLoading || !userInput.trim()}>
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
              <span className="sr-only">Send</span>
            </Button>
          </form>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ChatbotPopup;
