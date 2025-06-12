
'use client';

import type { FunctionComponent} from 'react';
import { useEffect, useRef } from 'react';

const MatrixBackground: FunctionComponent = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const setup = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      const katakana = 'アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン';
      const characters = katakana + 'ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
      const fontSize = 16;
      const columns = Math.floor(canvas.width / fontSize);
      const drops: number[] = [];

      for (let x = 0; x < columns; x++) {
        drops[x] = Math.floor(Math.random() * (canvas.height / fontSize));
      }

      const draw = () => {
        // Use a color derived from the theme's background for trails
        // --background: 0 0% 13%; /* Dark Gray #222222 */
        // So, rgba(34, 34, 34, 0.07)
        ctx.fillStyle = 'rgba(34, 34, 34, 0.07)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // --primary: 181 100% 74%; /* Electric Blue #7DF9FF */
        ctx.fillStyle = '#7DF9FF'; 
        ctx.font = fontSize + 'px monospace';

        for (let i = 0; i < drops.length; i++) {
          const text = characters[Math.floor(Math.random() * characters.length)];
          ctx.fillText(text, i * fontSize, drops[i] * fontSize);

          if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
            drops[i] = 0;
          }
          drops[i]++;
        }
      };

      const animate = () => {
        draw();
        animationFrameId = requestAnimationFrame(animate);
      };
      animate();
    };

    setup(); 

    const handleResize = () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      setup(); 
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
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
        zIndex: -10, // Ensure it's well behind other content
        display: 'block', 
      }}
      aria-hidden="true"
    />
  );
};

export default MatrixBackground;
