import React, { useEffect, useState } from 'react';
import { useVisualMode } from '../context/VisualModeContext';

export const UltraSpotlight: React.FC = () => {
  const { isUltra } = useVisualMode();
  const [coords, setCoords] = useState<{ x: number; y: number }>({ x: -1000, y: -1000 });

  useEffect(() => {
    if (!isUltra) return;

    // Check if device supports hover / precise pointer (desktop vs mobile)
    const isTouchOnly = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
    if (isTouchOnly) return;

    let ticking = false;

    const handleMouseMove = (e: MouseEvent) => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setCoords({ x: e.clientX, y: e.clientY });
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isUltra]);

  if (!isUltra) return null;

  return (
    <div
      className="ultra-spotlight-layer"
      style={{
        transform: `translate(${coords.x}px, ${coords.y}px)`,
      }}
      aria-hidden="true"
    />
  );
};

export default UltraSpotlight;

