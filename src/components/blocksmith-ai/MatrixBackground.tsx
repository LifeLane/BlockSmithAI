
'use client';

import type { FunctionComponent} from 'react';
import { useEffect, useRef } from 'react';

const MatrixBackground: FunctionComponent = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameIdRef = useRef<number | null>(null);

  // Colors derived from the new theme
  const matrixColors = [
    'hsl(210 100% 60%)', // New Primary (Electric Blue)
    'hsl(270 100% 65%)', // New Accent (Electric Violet)
    'hsl(35 100% 55%)',  // New Tertiary (Saffron Gold)
    'hsl(120, 100%, 50%)',  // Classic Matrix Green
    'hsl(200, 80%, 60%)',   // Chart-5 (Cyan/Teal)
    'hsl(0, 70%, 55%)',    // Destructive Red
  ];

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
      ctx.fillStyle = 'hsla(220, 20%, 5%, 0.10)'; 
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        // Randomly select a color for each character
        ctx.fillStyle = matrixColors[Math.floor(Math.random() * matrixColors.length)];
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
