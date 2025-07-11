'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';

const GLYPHS = '`¡™£¢∞§¶•ªº–≠åß∂ƒ©˙∆˚¬…æ≈ç√∫˜µ≤≥÷/?_>®†¥¨ˆøπ“‘«`¡™£¢∞§¶•ªº–≠åß∂ƒ©˙∆˚¬…æ≈ç√∫˜µ≤≥÷/?_<®†¥¨ˆøπ“‘«1234567890!@#$%^&*()[]{};:\'"|\\,./<>?';

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
    const [currentText, setCurrentText] = useState(text);
    const timeoutRef = useRef<NodeJS.Timeout>();
    const frameRequestRef = useRef<number>();
    const isMountedRef = useRef(true);

    const animate = useCallback(() => {
        if (!isMountedRef.current) return;
        
        let frame = 0;
        const totalFrames = Math.round(scrambleDuration / 16.67); // 60fps
        const endTimes = Array.from({ length: text.length }, (_, i) => Math.random() * totalFrames);
        const startValues = Array.from({ length: text.length }, () => Math.random());

        const updateFrame = () => {
            if (!isMountedRef.current) return;
            setCurrentText(prev => {
                return prev.split('').map((char, i) => {
                    if (frame >= endTimes[i]) return text[i];
                    const randomGlyphIndex = Math.floor(startValues[i] * GLYPHS.length + frame) % GLYPHS.length;
                    return GLYPHS[randomGlyphIndex];
                }).join('');
            });

            if (frame < totalFrames) {
                frame++;
                frameRequestRef.current = requestAnimationFrame(updateFrame);
            } else {
                 if (isMountedRef.current) setCurrentText(text);
            }
        };
        
        frameRequestRef.current = requestAnimationFrame(updateFrame);
    }, [text, scrambleDuration]);

    useEffect(() => {
        isMountedRef.current = true;
        setCurrentText(text); // Initialize text
        
        const startAnimation = () => {
            if (isMountedRef.current) {
                timeoutRef.current = setTimeout(animate, startDelay);
            }
        };

        startAnimation();

        return () => {
            isMountedRef.current = false;
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            if (frameRequestRef.current) cancelAnimationFrame(frameRequestRef.current);
        };
    }, [text, startDelay, animate]);


    return <span className={cn('font-code', className)}>{currentText}</span>;
};

export default GlyphScramble;
