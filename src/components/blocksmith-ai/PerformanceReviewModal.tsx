
'use client';

import { FunctionComponent } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Loader2, BrainCircuit, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { type PerformanceReviewOutput } from '@/app/actions';
import ReactMarkdown from 'react-markdown';
import { ScrollArea } from '../ui/scroll-area';

interface PerformanceReviewModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  reviewData: PerformanceReviewOutput | null;
  isLoading: boolean;
  error: string | null;
}

const PerformanceReviewModal: FunctionComponent<PerformanceReviewModalProps> = ({
  isOpen,
  onOpenChange,
  reviewData,
  isLoading,
  error,
}) => {
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center gap-4 py-12">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-lg font-semibold text-muted-foreground">SHADOW is analyzing your performance...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
            <div className="bg-destructive/10 p-3 rounded-full">
                <AlertTriangle className="h-12 w-12 text-destructive" />
            </div>
            <p className="text-lg font-semibold text-destructive">Analysis Failed</p>
            <p className="text-sm text-muted-foreground px-4">{error}</p>
        </div>
      );
    }
    
    if (reviewData) {
        return (
            <div className="space-y-4">
                <div className="p-4 bg-background/50 rounded-lg border border-border">
                    <h3 className="font-semibold text-primary mb-2">
                        Summary
                    </h3>
                    <p className="text-sm text-muted-foreground italic">"{reviewData.summary}"</p>
                </div>
                
                <div className="prose prose-sm prose-invert max-w-none text-foreground prose-headings:text-accent prose-strong:text-primary">
                  <ReactMarkdown>{reviewData.analysis}</ReactMarkdown>
                </div>
            </div>
        );
    }
    
    return null;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl bg-card border-primary/50 shadow-xl">
        <DialogHeader className="text-center items-center pb-4">
          <BrainCircuit className="h-12 w-12 text-primary mb-3" />
          <DialogTitle className="text-2xl font-headline text-primary">
            {reviewData?.title || "Performance Debrief"}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground px-2">
            A cognitive analysis of your recent <strong className="text-tertiary">trading patterns</strong>.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] px-6 pb-6 no-scrollbar">
            {renderContent()}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default PerformanceReviewModal;
