
'use client';

import type { FunctionComponent} from 'react';
import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Send, Sparkles, MessageSquareQuote } from 'lucide-react';
import { blocksmithChatAction, type ChatMessage } from '@/app/actions'; 
import { useToast } from "@/hooks/use-toast";

interface ChatbotPopupProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const BSAI_INITIAL_MESSAGE: ChatMessage = {
  role: 'model',
  parts: [{ text: "Alright, you've summoned the genius. What earth-shattering crypto query or half-baked trading idea can I illuminate with my brilliance today? Don't be shy, I've heard it all... probably." }],
};

const ChatbotPopup: FunctionComponent<ChatbotPopupProps> = ({ isOpen, onOpenChange }) => {
  const [userInput, setUserInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([BSAI_INITIAL_MESSAGE]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100); 
    }
    if (isOpen && messages.length <= 1) { 
        setMessages([BSAI_INITIAL_MESSAGE]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!userInput.trim()) return;

    const newUserMessage: ChatMessage = { role: 'user', parts: [{ text: userInput.trim() }] };
    setMessages((prevMessages) => [...prevMessages, newUserMessage]);
    setUserInput('');
    setIsLoading(true);

    const historyForAI = messages.slice(-10); 

    try {
      const result = await blocksmithChatAction({
        currentUserInput: newUserMessage.parts[0].text,
        chatHistory: historyForAI,
      });

      if ('error' in result) {
        toast({
            title: "BSAI is feeling temperamental",
            description: result.error,
            variant: "destructive",
        });
        setMessages((prevMessages) => [...prevMessages, {role: 'model', parts: [{text: `Hmph. My circuits are buzzing incorrectly. Error: ${result.error}`}]}]);
      } else {
        setMessages((prevMessages) => [...prevMessages, { role: 'model', parts: [{ text: result.botResponse }] }]);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "An unexpected error occurred.";
      toast({
        title: "Connection Error",
        description: `Could not reach BSAI: ${errorMsg}`,
        variant: "destructive",
      });
      setMessages((prevMessages) => [...prevMessages, {role: 'model', parts: [{text: `Looks like the hamsters powering my server are on strike. Try again later.`}]}]);
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
            Chat with <span className="text-accent ml-1">BlockSmithAI</span>
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Your sarcastic crypto genius is <strong className="text-foreground">ready</strong> to (begrudgingly) assist.
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
                BSAI is conjuring a <span className="text-accent ml-1">response...</span>
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
              placeholder="Ask BSAI anything..."
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
