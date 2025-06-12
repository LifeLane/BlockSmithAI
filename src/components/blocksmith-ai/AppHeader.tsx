import { FunctionComponent } from 'react';
import { Zap } from 'lucide-react';

interface AppHeaderProps {}

const AppHeader: FunctionComponent<AppHeaderProps> = () => {
  return (
    <header className="py-6">
      <div className="container mx-auto flex items-center space-x-3">
        <Zap className="h-10 w-10 text-primary" />
        <h1 className="text-4xl font-bold font-headline text-primary">
          BlockSmith<span className="text-foreground">AI</span>: <span className="text-foreground">Unlock</span> Your Trading Edge
        </h1>
      </div>
    </header>
  );
};

export default AppHeader;
