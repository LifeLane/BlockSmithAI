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
        const fetchGreeting = async () => {
            setIsLoading(true);
            try {
                const result = await getDailyGreeting();
                setGreeting(result.greeting);
            } catch (error) {
                console.error("Failed to fetch daily greeting:", error);
                setGreeting("Data stream is temporarily unavailable. Proceed with caution.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchGreeting();

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
