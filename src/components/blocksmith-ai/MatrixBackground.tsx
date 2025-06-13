
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
      drops.length = 0; // Clear existing drops
      for (let x = 0; x < columns; x++) {
        drops[x] = Math.floor(Math.random() * (canvas.height / fontSize));
      }
    };

    const draw = () => {
      if (!ctx) return;

      // Trail effect: fill canvas with semi-transparent background color
      // --background: 0 0% 13%; /* Dark Gray #222222 */ -> rgba(34, 34, 34, 0.07)
      ctx.fillStyle = 'rgba(34, 34, 34, 0.07)';
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

    const animate = () => {
      draw();
      animationFrameIdRef.current = requestAnimationFrame(animate);
    };

    initializeMatrix(); // Initial setup
    animate(); // Start animation

    const handleResize = () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
      initializeMatrix(); // Re-initialize on resize
      animate(); // Restart animation
    };

    window.addEventListener('resize', handleResize);

    return () => { // Cleanup
      window.removeEventListener('resize', handleResize);
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, []); // Empty dependency array ensures this runs once on mount and cleans up on unmount

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
