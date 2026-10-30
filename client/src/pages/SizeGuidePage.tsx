import React, { useState } from 'react';
import { Ruler, Sparkles, Check } from 'lucide-react';

interface MeasurementItem {
  size: string;
  chestIn: number;
  lengthIn: number;
  shoulderIn: number;
  chestCm: number;
  lengthCm: number;
  shoulderCm: number;
  recommended: string;
}

const SizeGuidePage: React.FC = () => {
  const [unit, setUnit] = useState<'inches' | 'cm'>('inches');

  const measurements: MeasurementItem[] = [
    { size: 'S', chestIn: 42, lengthIn: 28, shoulderIn: 20, chestCm: 106, lengthCm: 71, shoulderCm: 51, recommended: '5\'4" - 5\'8" (Under 65kg)' },
    { size: 'M', chestIn: 44, lengthIn: 29, shoulderIn: 21, chestCm: 112, lengthCm: 74, shoulderCm: 53, recommended: '5\'7" - 5\'10" (65 - 75kg)' },
    { size: 'L', chestIn: 46, lengthIn: 30, shoulderIn: 22, chestCm: 117, lengthCm: 76, shoulderCm: 56, recommended: '5\'9" - 6\'1" (75 - 85kg)' },
    { size: 'XL', chestIn: 48, lengthIn: 31, shoulderIn: 23, chestCm: 122, lengthCm: 79, shoulderCm: 58, recommended: '6\'0" - 6\'3" (85 - 95kg)' },
    { size: 'XXL', chestIn: 50, lengthIn: 32, shoulderIn: 24, chestCm: 127, lengthCm: 81, shoulderCm: 61, recommended: '6\'1"+ (95kg+)' },
  ];

  return (
    <main className="page-shell">
      <section className="section">
        <div className="container">
          <div style={{ maxWidth: '680px', marginBottom: '2.5rem' }} className="animate-fade-in-up">
            <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-purple)', fontSize: '0.82rem', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              Precision Sizing
            </div>
            <h1 className="page-heading">OVERSIZED FIT GUIDE</h1>
            <p className="text-muted" style={{ fontSize: '1.05rem', lineHeight: 1.8 }}>
              SheXz tees are custom engineered with an intentional, boxy oversized drape. Use our chart below to pick your ideal street silhouette.
            </p>
          </div>

          {/* Unit Switcher */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <span style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>Unit:</span>
            <div style={{ display: 'inline-flex', background: 'rgba(255,255,255,0.06)', borderRadius: 'var(--radius-full)', padding: '3px' }}>
              <button
                type="button"
                className={`category-tab-btn ${unit === 'inches' ? 'active' : ''}`}
                onClick={() => setUnit('inches')}
                style={{ padding: '0.4rem 1rem', fontSize: '0.82rem' }}
              >
                Inches (in)
              </button>
              <button
                type="button"
                className={`category-tab-btn ${unit === 'cm' ? 'active' : ''}`}
                onClick={() => setUnit('cm')}
                style={{ padding: '0.4rem 1rem', fontSize: '0.82rem' }}
              >
                Centimeters (cm)
              </button>
            </div>
          </div>

          {/* Size Chart Card */}
          <div className="glass-card luxury-border-glow" style={{ padding: '2rem', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '560px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-medium)', color: 'var(--accent-purple)', fontSize: '0.9rem' }}>
                  <th style={{ padding: '1rem 0.75rem' }}>Size</th>
                  <th style={{ padding: '1rem 0.75rem' }}>Chest</th>
                  <th style={{ padding: '1rem 0.75rem' }}>Body Length</th>
                  <th style={{ padding: '1rem 0.75rem' }}>Shoulder Width</th>
                  <th style={{ padding: '1rem 0.75rem' }}>Recommended Build</th>
                </tr>
              </thead>
              <tbody>
                {measurements.map((row) => (
                  <tr key={row.size} style={{ borderBottom: '1px solid var(--border-subtle)', fontSize: '0.92rem' }}>
                    <td style={{ padding: '1rem 0.75rem', fontWeight: 800, color: '#fff', fontSize: '1.05rem', fontFamily: 'var(--font-display)' }}>{row.size}</td>
                    <td style={{ padding: '1rem 0.75rem', color: 'var(--text-secondary)' }}>
                      {unit === 'inches' ? `${row.chestIn}"` : `${row.chestCm} cm`}
                    </td>
                    <td style={{ padding: '1rem 0.75rem', color: 'var(--text-secondary)' }}>
                      {unit === 'inches' ? `${row.lengthIn}"` : `${row.lengthCm} cm`}
                    </td>
                    <td style={{ padding: '1rem 0.75rem', color: 'var(--text-secondary)' }}>
                      {unit === 'inches' ? `${row.shoulderIn}"` : `${row.shoulderCm} cm`}
                    </td>
                    <td style={{ padding: '1rem 0.75rem', color: 'var(--accent-cyan)', fontSize: '0.85rem' }}>
                      {row.recommended}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Fit Tips */}
          <div style={{ marginTop: '2.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            <div className="glass-card luxury-card-interactive">
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={16} color="var(--accent-purple)" /> True Streetwear Look
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.7 }}>
                Take your standard t-shirt size for the intended drop-shoulder, boxy streetwear aesthetic.
              </p>
            </div>
            <div className="glass-card luxury-card-interactive">
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Ruler size={16} color="var(--accent-cyan)" /> Regular / Clean Fit
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.7 }}>
                If you prefer a closer, traditional fit without excess drape, order one size smaller than usual.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default SizeGuidePage;
