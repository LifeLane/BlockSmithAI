
'use client';

import type { FunctionComponent} from 'react';
import { useEffect, useRef, useState } from 'react';
import { useTheme } from 'next-themes';

const MatrixBackground: FunctionComponent = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameIdRef = useRef<number | null>(null);
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Colors derived from the theme
  const matrixColors = [
    'hsl(210 100% 60%)', // Primary (Electric Blue)
    'hsl(270 100% 65%)', // Accent (Electric Violet)
    'hsl(35 100% 55%)',  // Tertiary (Saffron Gold)
    'hsl(120, 100%, 50%)',  // Classic Matrix Green
    'hsl(200, 80%, 60%)',   // Chart-5 (Cyan/Teal)
    'hsl(0, 70%, 55%)',    // Destructive Red
  ];
  
  // When the component mounts, we're on the client
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const isDark = resolvedTheme === 'dark';

    // Don't run animation on server or if not dark
    if (!mounted || !isDark) {
        if (animationFrameIdRef.current) {
            cancelAnimationFrame(animationFrameIdRef.current);
            animationFrameIdRef.current = null;
        }
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx?.clearRect(0, 0, canvas.width, canvas.height);
        }
        return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const katakana = 'アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン';
    const characters = katakana + 'ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
    const fontSize = 16;
    let columns = 0;
    const drops: number[] = [];

    const initializeMatrix = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      columns = Math.floor(canvas.width / fontSize);
      drops.length = 0; 
      for (let x = 0; x < columns; x++) {
        drops[x] = Math.floor(Math.random() * (canvas.height / fontSize));
      }
    };

    const draw = () => {
      if (!ctx) return;

      ctx.fillStyle = 'hsla(220, 20%, 5%, 0.10)'; 
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        ctx.fillStyle = matrixColors[Math.floor(Math.random() * matrixColors.length)];
        const text = characters[Math.floor(Math.random() * characters.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };

    let lastTimestamp = 0;
    const fps = 15;
    const frameInterval = 1000 / fps;

    const animate = (timestamp?: number) => {
      if (timestamp && lastTimestamp) {
        const deltaTime = timestamp - lastTimestamp;
        if (deltaTime < frameInterval) {
          animationFrameIdRef.current = requestAnimationFrame(animate);
          return;
        }
        lastTimestamp = timestamp - (deltaTime % frameInterval);
      } else if (timestamp) {
        lastTimestamp = timestamp;
      } else {
        lastTimestamp = performance.now();
      }
      
      draw();
      animationFrameIdRef.current = requestAnimationFrame(animate);
    };

    initializeMatrix(); 
    
    if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
    }
    animationFrameIdRef.current = requestAnimationFrame(animate);

    const handleResize = () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
      initializeMatrix(); 
      animationFrameIdRef.current = requestAnimationFrame(animate);
    };

    window.addEventListener('resize', handleResize);

    return () => { 
      window.removeEventListener('resize', handleResize);
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [mounted, resolvedTheme]); 

  const isVisible = mounted && resolvedTheme === 'dark';

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0, 
        display: 'block',
        transition: 'opacity 0.5s',
        opacity: isVisible ? 1 : 0,
        pointerEvents: 'none',
      }}
      aria-hidden="true"
    />
  );
};


export default MatrixBackground;
