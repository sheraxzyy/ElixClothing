import React, { useEffect, useState } from 'react';
import { useVisualMode } from '../context/VisualModeContext';
import { Sparkles, Zap, ShieldCheck } from 'lucide-react';

const TELEMETRY_PHRASES = [
  'BOOTING 220 GSM ATELIER GRAPHICS ENGINE...',
  'CALIBRATING DUAL-UI CINEMATIC SHADOWS...',
  'SYNCHRONIZING STREETWEAR SILHOUETTES...',
  'OPTIMIZING 3D TACTILE BUTTON PHYSICS...',
  'ULTRA GRAPHICS MODE READY // 2026-LIVE',
];

export const CinematicLoader: React.FC = () => {
  const { isLoaderActive, loaderLabel } = useVisualMode();
  const [progress, setProgress] = useState<number>(0);
  const [telemetryIndex, setTelemetryIndex] = useState<number>(0);
  const [exiting, setExiting] = useState<boolean>(false);

  useEffect(() => {
    if (!isLoaderActive) {
      setProgress(0);
      setExiting(false);
      return;
    }

    setProgress(12);
    setTelemetryIndex(0);

    const step1 = setTimeout(() => {
      setProgress(48);
      setTelemetryIndex(1);
    }, 200);

    const step2 = setTimeout(() => {
      setProgress(76);
      setTelemetryIndex(2);
    }, 450);

    const step3 = setTimeout(() => {
      setProgress(100);
      setTelemetryIndex(3);
    }, 700);

    const exitStep = setTimeout(() => {
      setExiting(true);
    }, 850);

    return () => {
      clearTimeout(step1);
      clearTimeout(step2);
      clearTimeout(step3);
      clearTimeout(exitStep);
    };
  }, [isLoaderActive]);

  if (!isLoaderActive) return null;

  return (
    <div
      className={`cinematic-loader-overlay ${exiting ? 'cinematic-loader-exiting' : ''}`}
      role="alert"
      aria-live="assertive"
      aria-label="Loading Ultra Experience"
    >
      {/* Background Cyber Mesh & Dynamic Lighting */}
      <div className="cinematic-loader-bg">
        <div className="cinematic-loader-glow-orb orb-primary" />
        <div className="cinematic-loader-glow-orb orb-secondary" />
        <div className="cinematic-loader-grid-lines" />
        <div className="cinematic-loader-light-beam" />
      </div>

      {/* Main Content Card */}
      <div className="cinematic-loader-content">
        {/* Animated Brand Monogram & Logo */}
        <div className="cinematic-logo-wrapper">
          <div className="cinematic-logo-glow" />
          <div className="cinematic-logo-text">ELIX</div>
          <span className="cinematic-badge">
            <Zap size={11} className="inline-icon" /> ULTRA GRAPHICS
          </span>
        </div>

        {/* Dynamic Title */}
        <h2 className="cinematic-loader-heading">
          {loaderLabel}
        </h2>

        {/* Telemetry subtitle */}
        <p className="cinematic-loader-telemetry">
          {TELEMETRY_PHRASES[telemetryIndex] || TELEMETRY_PHRASES[0]}
        </p>

        {/* Smooth Progress Indicator Bar */}
        <div className="cinematic-progress-container">
          <div className="cinematic-progress-header">
            <span className="cinematic-progress-status">SYSTEM PIPELINE</span>
            <span className="cinematic-progress-val">{progress}%</span>
          </div>
          <div className="cinematic-progress-track">
            <div
              className="cinematic-progress-bar"
              style={{ width: `${progress}%` }}
            />
            <div
              className="cinematic-progress-glow-head"
              style={{ left: `${Math.min(99, progress)}%` }}
            />
          </div>
        </div>

        {/* Footer specs */}
        <div className="cinematic-loader-footer">
          <span><ShieldCheck size={12} className="inline-icon" /> 220 GSM HEAVYWEIGHT</span>
          <span>•</span>
          <span>SRI LANKA STREETWEAR ATELIER</span>
          <span>•</span>
          <span>2026-LIVE EDITION</span>
        </div>
      </div>
    </div>
  );
};

export default CinematicLoader;

