
'use client';
import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

const GLYPHS = '`¡™£¢∞§¶•ªº–≠åß∂ƒ©˙∆˚¬…æ≈ç√∫˜µ≤≥÷/?_>®†¥¨ˆøπ“‘«`¡™£¢∞§¶•ªº–≠åß∂ƒ©˙∆˚¬…æ≈ç√∫˜µ≤≥÷/?_<®†¥¨ˆøπ“‘«1234567890!@#$%^&*()[]{};:\'"|\\,./<>?';
const VALID_CHARS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.,!?\'"()[]{} ';

interface GlyphScrambleProps {
    text: string;
    className?: string;
    startDelay?: number;
    scrambleDuration?: number;
    revealDelay?: number;
}

const GlyphScramble = ({ 
    text, 
    className,
    startDelay = 0,
    scrambleDuration = 400,
    revealDelay = 50,
}: GlyphScrambleProps) => {
    const [displayText, setDisplayText] = useState('');
    const intervalRef = useRef<NodeJS.Timeout>();
    const timeoutRef = useRef<NodeJS.Timeout>();

    useEffect(() => {
        let scrambled = text
            .split('')
            .map(char => (VALID_CHARS.includes(char) ? GLYPHS[Math.floor(Math.random() * GLYPHS.length)] : char))
            .join('');
        setDisplayText(scrambled);

        const startTime = Date.now();
        let revealIndex = 0;

        const animate = () => {
            const elapsedTime = Date.now() - startTime;
            
            // Staggered reveal of characters
            if (elapsedTime > revealIndex * revealDelay) {
                const nextRevealIndex = Math.floor(elapsedTime / revealDelay);
                for (let i = revealIndex; i < nextRevealIndex && i < text.length; i++) {
                    const originalChar = text[i];
                     scrambled = scrambled.substring(0, i) + originalChar + scrambled.substring(i + 1);
                }
                revealIndex = nextRevealIndex;
            }

            // Scramble remaining characters
            let tempScrambled = scrambled.split('');
            for (let i = revealIndex; i < text.length; i++) {
                if (VALID_CHARS.includes(text[i])) {
                    tempScrambled[i] = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
                }
            }
            scrambled = tempScrambled.join('');
            
            setDisplayText(scrambled);
            
            if (revealIndex >= text.length) {
                setDisplayText(text);
                if (intervalRef.current) clearInterval(intervalRef.current);
            }
        };

        timeoutRef.current = setTimeout(() => {
            intervalRef.current = setInterval(animate, 25);
        }, startDelay);


        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [text, startDelay, scrambleDuration, revealDelay]);

    return <span className={cn('font-code', className)}>{displayText}</span>;
};

export default GlyphScramble;
