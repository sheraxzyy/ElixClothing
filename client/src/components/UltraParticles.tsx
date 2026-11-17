import React, { useEffect, useRef } from 'react';
import { useVisualMode } from '../context/VisualModeContext';

interface Particle {
  x: number;
  y: number;
  radius: number;
  color: string;
  vx: number;
  vy: number;
  alpha: number;
  baseAlpha: number;
  pulseSpeed: number;
}

export const UltraParticles: React.FC = () => {
  const { isUltra } = useVisualMode();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!isUltra) return;

    // Respect reduced motion preference
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let isVisible = true;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const handleVisibilityChange = () => {
      isVisible = !document.hidden;
    };

    window.addEventListener('resize', handleResize, { passive: true });
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Color palette matching ELIX aesthetic (Violet, Cyan, Rose)
    const particleColors = [
      'rgba(139, 92, 246, ',  // Purple
      'rgba(6, 182, 212, ',   // Cyan
      'rgba(236, 72, 153, ',  // Pink
      'rgba(255, 255, 255, ', // White spark
    ];

    // Minimal particle count (28) for high performance
    const particleCount = Math.min(32, Math.floor(window.innerWidth / 40));
    const particles: Particle[] = [];

    for (let i = 0; i < particleCount; i++) {
      const baseAlpha = Math.random() * 0.45 + 0.15;
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 2.2 + 0.8,
        color: particleColors[Math.floor(Math.random() * particleColors.length)],
        vx: (Math.random() - 0.5) * 0.4,
        vy: -Math.random() * 0.5 - 0.2, // gentle upward drift
        alpha: baseAlpha,
        baseAlpha,
        pulseSpeed: Math.random() * 0.02 + 0.008,
      });
    }

    let lastTime = performance.now();

    const render = (time: number) => {
      if (!isVisible) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      const delta = time - lastTime;
      // Cap render rate to preserve mobile CPU/GPU
      if (delta > 28) {
        lastTime = time;
        ctx.clearRect(0, 0, width, height);

        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          p.x += p.vx;
          p.y += p.vy;

          // Wrap edges
          if (p.x < 0) p.x = width;
          else if (p.x > width) p.x = 0;
          if (p.y < 0) p.y = height;
          else if (p.y > height) p.y = 0;

          // Subtle breathing opacity
          p.alpha = p.baseAlpha + Math.sin(time * p.pulseSpeed) * 0.15;

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = `${p.color}${Math.max(0, Math.min(1, p.alpha))})`;
          ctx.shadowBlur = p.radius * 3;
          ctx.shadowColor = `${p.color}0.8)`;
          ctx.fill();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isUltra]);

  if (!isUltra) return null;

  return (
    <canvas
      ref={canvasRef}
      className="ultra-particles-canvas"
      aria-hidden="true"
    />
  );
};

export default UltraParticles;

