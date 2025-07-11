'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { getDailyGreeting } from '@/app/actions';
import { Bot } from 'lucide-react';
import GlyphScramble from './GlyphScramble';

const DailyGreeting = () => {
    const [greeting, setGreeting] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // This component is now disabled to conserve API quota.
        // A static greeting will be used instead.
        // In a real production app with a paid plan, this could be re-enabled.
        const fetchGreeting = async () => {
            setIsLoading(true);
            try {
                // The AI call is commented out.
                // const result = await getDailyGreeting();
                // setGreeting(result.greeting);
                setGreeting("The data stream is temporarily unavailable. Proceed with caution.");
            } catch (error) {
                console.error("Failed to fetch daily greeting:", error);
                setGreeting("Data stream is temporarily unavailable. Proceed with caution.");
            } finally {
                setIsLoading(false);
            }
        };

        // We are not calling fetchGreeting() to save API calls.
        // If you upgrade your API plan, you can uncomment the line below.
        // fetchGreeting();

        setGreeting("The market breathes in cycles of fear and greed. Observe the patterns, not just the noise.");
        setIsLoading(false);

    }, []);

    return (
        <Card className="mb-4 bg-card/80 backdrop-blur-sm border-primary/20 interactive-card">
            <CardContent className="p-4 flex items-center gap-4">
                <div className="p-2 bg-primary/10 rounded-full">
                    <Bot className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-grow">
                    {isLoading ? (
                        <Skeleton className="h-5 w-3/4 bg-muted/80" />
                    ) : (
                        <p className="text-sm text-muted-foreground italic">
                            "<GlyphScramble text={greeting} />"
                        </p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default DailyGreeting;
