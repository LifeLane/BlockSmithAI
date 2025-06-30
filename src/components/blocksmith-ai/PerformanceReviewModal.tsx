
'use client';

import { FunctionComponent } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Loader2, BrainCircuit, Zap, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { type PerformanceReviewOutput } from '@/app/actions';

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
            <div className="space-y-6">
                <div className="p-4 bg-background/50 rounded-lg border border-green-500/50">
                    <h3 className="flex items-center gap-2 font-semibold text-green-400 mb-2">
                        <CheckCircle size={18} /> Strengths
                    </h3>
                    <p className="text-sm text-muted-foreground italic">"{reviewData.strengths}"</p>
                </div>

                <div className="p-4 bg-background/50 rounded-lg border border-red-500/50">
                    <h3 className="flex items-center gap-2 font-semibold text-red-400 mb-2">
                        <XCircle size={18} /> Areas for Improvement
                    </h3>
                    <p className="text-sm text-muted-foreground italic">"{reviewData.weaknesses}"</p>
                </div>
                
                 <div className="p-4 bg-background/50 rounded-lg border border-tertiary/70">
                    <h3 className="flex items-center gap-2 font-semibold text-tertiary mb-2">
                        <Zap size={18} /> Actionable Intelligence
                    </h3>
                    <p className="text-sm text-foreground font-bold">"{reviewData.actionableAdvice}"</p>
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
            SHADOW's Performance Debrief
          </DialogTitle>
          <DialogDescription className="text-muted-foreground px-2">
            A cognitive analysis of your recent trading patterns.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto px-6 pb-6">
            {renderContent()}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PerformanceReviewModal;

    