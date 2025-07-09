'use client';
import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

const GLYPHS = '`¡™£¢∞§¶•ªº–≠åß∂ƒ©˙∆˚¬…æ≈ç√∫˜µ≤≥÷/?_>®†¥¨ˆøπ“‘«`¡™£¢∞§¶•ªº–≠åß∂ƒ©˙∆˚¬…æ≈ç√∫˜µ≤≥÷/?_<®†¥¨ˆøπ“‘«1234567890!@#$%^&*()[]{};:\'"|\\,./<>?';
const VALID_CHARS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ012349.,!?\'"()[]{} ';

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
    // Animation props are kept for API compatibility but are currently unused.
    startDelay = 0,
    scrambleDuration = 400,
    revealDelay = 50,
}: GlyphScrambleProps) => {
    // The animation logic has been temporarily disabled to debug a persistent
    // "Maximum update depth exceeded" error. The component now renders text directly.
    return <span className={cn('font-code', className)}>{text}</span>;
};

export default GlyphScramble;
