
'use client';

import type { FunctionComponent} from 'react';
import { useEffect, useRef } from 'react';

const MatrixBackground: FunctionComponent = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameIdRef = useRef<number | null>(null);

  useEffect(() => {
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

      // Trail effect: fill canvas with semi-transparent background color
      // --background: 0 0% 13%; /* Dark Gray #222222 */ -> rgba(34, 34, 34, 0.10)
      ctx.fillStyle = 'rgba(34, 34, 34, 0.10)'; // Slightly increased opacity for trail
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Character color: --primary: 181 100% 74%; /* Electric Blue #7DF9FF */
      ctx.fillStyle = '#7DF9FF'; 
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = characters[Math.floor(Math.random() * characters.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0; // Reset drop to the top
        }
        drops[i]++;
      }
    };

    let lastTimestamp = 0;
    const fps = 15; // Target FPS
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
        // Fallback for the very first frame if timestamp is undefined
        lastTimestamp = performance.now();
      }
      
      draw();
      animationFrameIdRef.current = requestAnimationFrame(animate);
    };

    initializeMatrix(); 
    
    // Cancel any existing frame before starting a new one
    if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
    }
    animationFrameIdRef.current = requestAnimationFrame(animate);


    const handleResize = () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
      initializeMatrix(); 
      // Restart animation with new dimensions after a short delay to allow layout to settle
      animationFrameIdRef.current = requestAnimationFrame(animate);
    };

    window.addEventListener('resize', handleResize);

    return () => { 
      window.removeEventListener('resize', handleResize);
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, []); 

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
      }}
      aria-hidden="true"
    />
  );
};

export default MatrixBackground;

    