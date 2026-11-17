import React, { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useVisualMode } from '../context/VisualModeContext';

export const CinematicPageTransition: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isUltra } = useVisualMode();
  const location = useLocation();
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const prevPathRef = useRef<string>(location.pathname);

  useEffect(() => {
    // Only trigger transition if path actually changed
    if (prevPathRef.current !== location.pathname) {
      prevPathRef.current = location.pathname;

      if (isUltra) {
        // Check for reduced motion
        const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (!prefersReduced) {
          setIsTransitioning(true);
          const timer = setTimeout(() => {
            setIsTransitioning(false);
          }, 320);
          return () => clearTimeout(timer);
        }
      }
    }
  }, [location.pathname, isUltra]);

  return (
    <div className={`page-transition-wrapper ${isUltra ? 'ultra-motion-active' : 'normal-motion-active'}`}>
      {/* Cinematic shutter sweep overlay (Ultra Mode only) */}
      {isUltra && (
        <div
          className={`cinematic-transition-shutter ${isTransitioning ? 'shutter-active' : ''}`}
          aria-hidden="true"
        >
          <div className="shutter-beam" />
          <div className="shutter-scanline" />
        </div>
      )}

      {/* Main page content container with enter animation */}
      <div key={location.pathname} className={isUltra ? 'ultra-page-enter' : 'normal-page-enter'}>
        {children}
      </div>
    </div>
  );
};

export default CinematicPageTransition;

