
'use client';

import type { FunctionComponent} from 'react';
import { useEffect, useRef, useState } from 'react';
import { useTheme } from 'next-themes';

const ParticleBackground: FunctionComponent = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameIdRef = useRef<number | null>(null);
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Colors derived from the theme
  const particleColors = [
    'hsla(210, 100%, 60%, 0.7)', // Primary (Electric Blue)
    'hsla(270, 100%, 65%, 0.7)', // Accent (Electric Violet)
    'hsla(35, 100%, 55%, 0.7)',  // Tertiary (Saffron Gold)
  ];
  
  // When the component mounts, we're on the client
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    // Don't run animation on server
    if (!mounted) {
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

    let particles: any[] = [];
    const particleCount = Math.floor((window.innerWidth * window.innerHeight) / 25000); // Adjust density

    const initializeParticles = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        particles = [];
        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 0.3,
                vy: (Math.random() - 0.5) * 0.3,
                radius: Math.random() * 1.5 + 1,
                color: particleColors[Math.floor(Math.random() * particleColors.length)],
            });
        }
    }

    const animate = () => {
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;

            if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
            if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.fill();
        });

        // Draw lines between nearby particles
        for (let i = 0; i < particles.length; i++) {
            for (let j = i; j < particles.length; j++) {
                const dist = Math.hypot(particles[i].x - particles[j].x, particles[i].y - particles[j].y);
                if (dist < 100) { // Connection distance
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `hsla(220, 20%, 50%, ${1 - dist / 100})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }

        animationFrameIdRef.current = requestAnimationFrame(animate);
    }

    initializeParticles();
    
    if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
    }
    animate();

    const handleResize = () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
      initializeParticles(); 
      animate();
    };

    window.addEventListener('resize', handleResize);

    return () => { 
      window.removeEventListener('resize', handleResize);
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [mounted, resolvedTheme]); 

  const isVisible = mounted;
  const canvasOpacity = resolvedTheme === 'dark' ? 0.3 : 0.4;

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
        opacity: isVisible ? canvasOpacity : 0, // Make it subtle and theme-dependent
        pointerEvents: 'none',
      }}
      aria-hidden="true"
    />
  );
};

export default ParticleBackground;
