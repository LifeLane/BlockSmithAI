
'use client';

import type { FunctionComponent } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link, Zap, Settings, AlertTriangle, ShieldCheck, ShieldAlert, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ExchangeLinkCardProps {
  apiKeysSet: boolean;
  onConfigureKeys: () => void;
  onPlaceTrade: () => void; 
  strategyAvailable: boolean;
}

const ExchangeLinkCard: FunctionComponent<ExchangeLinkCardProps> = ({
  apiKeysSet,
  onConfigureKeys,
  onPlaceTrade,
  strategyAvailable
}) => {
  const { toast } = useToast();

  const handleTradeAttempt = () => {
    if (!strategyAvailable) {
        toast({
            title: "No Strategy Yet",
            description: "Please generate an AI strategy before attempting to place a trade.",
            variant: "default"
        });
        return;
    }
    onPlaceTrade();
  }

  return (
    <Card className="shadow-md transition-all duration-300 ease-in-out hover:border-tertiary hover:shadow-[0_0_15px_3px_hsl(var(--accent)/0.6)]">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center text-lg font-semibold text-foreground">
          <Link className="mr-2 h-5 w-5 text-tertiary" />
          Exchange <span className="text-tertiary ml-1">Link</span>
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground pt-1">
          Connect to Binance for (simulated) trade execution. Keys are stored locally.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-background/30 rounded-md shadow-sm border border-border/50">
          <div className="flex items-center">
            {apiKeysSet ? (
              <ShieldCheck className="h-5 w-5 text-green-400 mr-2 shrink-0" />
            ) : (
              <ShieldAlert className="h-5 w-5 text-orange-400 mr-2 shrink-0" />
            )}
            <span className={`text-sm font-medium ${apiKeysSet ? 'text-green-400' : 'text-orange-400'}`}>
              Binance API: {apiKeysSet ? 'Connected' : 'Not Connected'}
            </span>
          </div>
          <Button variant="outline" size="sm" onClick={onConfigureKeys} className="text-xs whitespace-nowrap">
            <Settings className="mr-1.5 h-3.5 w-3.5" />
            {apiKeysSet ? 'Update Keys' : 'Configure Keys'}
          </Button>
        </div>

        <Button
          onClick={handleTradeAttempt}
          disabled={!apiKeysSet || !strategyAvailable}
          className="w-full bg-tertiary hover:bg-tertiary/90 text-tertiary-foreground font-semibold py-2.5 text-sm shadow-md"
          title={!apiKeysSet ? "Configure API keys to enable simulated trades" : !strategyAvailable ? "Generate a strategy first" : "Simulate trade based on current AI signal"}
        >
          <Zap className="mr-2 h-4.5 w-4.5" />
          Place Simulated Trade
        </Button>
        {(!apiKeysSet || !strategyAvailable) && (
            <p className="text-xs text-center text-muted-foreground">
                {!apiKeysSet ? "API keys required. " : ""}
                {!strategyAvailable ? "Generate a strategy first." : ""}
            </p>
        )}
         <a 
          href="https://www.binance.com/en/my/settings/api-management" 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center w-full text-xs text-muted-foreground hover:text-primary underline mt-1"
        >
          Get Binance API Keys <ExternalLink className="ml-1 h-3 w-3" />
        </a>

        <div className="p-2.5 mt-1 bg-yellow-900/20 border border-yellow-600/40 rounded-md text-xs text-yellow-400">
            <div className="flex items-start">
                <AlertTriangle className="h-3.5 w-3.5 mr-1.5 mt-px text-yellow-500 shrink-0" />
                <span>
                    <strong className="font-semibold">Beta Feature:</strong> Trade execution is currently <strong className="text-yellow-200">simulated</strong>. Always verify actions on the exchange.
                </span>
            </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExchangeLinkCard;
