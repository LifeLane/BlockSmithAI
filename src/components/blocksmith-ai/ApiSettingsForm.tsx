
import { FunctionComponent } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { KeyRound, Save } from 'lucide-react';

interface ApiSettingsFormProps {
  apiKey: string;
  onApiKeyChange: (key: string) => void;
  apiSecret: string;
  onApiSecretChange: (secret: string) => void;
  onSave: () => void;
}

const ApiSettingsForm: FunctionComponent<ApiSettingsFormProps> = ({
  apiKey,
  onApiKeyChange,
  apiSecret,
  onApiSecretChange,
  onSave,
}) => {
  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center text-lg font-semibold">
          <KeyRound className="mr-2 h-5 w-5 text-primary" />
          API Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="apiKey" className="text-sm font-medium">Binance API Key</Label>
          <Input
            id="apiKey"
            type="text"
            placeholder="Enter your API Key"
            value={apiKey}
            onChange={(e) => onApiKeyChange(e.target.value)}
            className="bg-input border-border focus:ring-primary"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="apiSecret" className="text-sm font-medium">Binance Secret Key</Label>
          <Input
            id="apiSecret"
            type="password"
            placeholder="Enter your Secret Key"
            value={apiSecret}
            onChange={(e) => onApiSecretChange(e.target.value)}
            className="bg-input border-border focus:ring-primary"
          />
        </div>
        <Button onClick={onSave} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
          <Save className="mr-2 h-4 w-4" />
          Save API Keys
        </Button>
        <p className="text-xs text-muted-foreground text-center pt-2">
          API keys are stored locally in your browser for this session. For production use, ensure secure server-side storage.
        </p>
      </CardContent>
    </Card>
  );
};

export default ApiSettingsForm;
