import React from 'react';
import { Link } from 'react-router-dom';
import { Layers, Scissors, Sparkles, ArrowRight } from 'lucide-react';

const AboutPage: React.FC = () => {
  return (
    <main className="page-shell">
      {/* Hero */}
      <section className="section">
        <div className="container">
          <div style={{ maxWidth: '780px' }} className="animate-fade-in-up">
            <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-purple)', fontSize: '0.82rem', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '0.6rem' }}>
              The ELIX Atelier
            </div>
            <h1 className="page-heading">
              BORN ON THE ISLAND. <span className="gradient-text luxury-shimmer">ENGINEERED FOR THE WORLD.</span>
            </h1>
            <p className="text-muted" style={{ fontSize: '1.15rem', lineHeight: 1.8 }}>
              ELIX was founded with a singular conviction: streetwear t-shirts should never feel flimsy. We set out to create the island’s most uncompromising oversized garments—combining 220 GSM custom-knit combed cotton with architected boxy silhouettes.
            </p>
          </div>
        </div>
      </section>

      {/* Brand Pillars */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            <div className="glass-card luxury-card-interactive">
              <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: 'rgba(139, 92, 246, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem', border: '1px solid rgba(139, 92, 246, 0.25)' }}>
                <Layers size={28} color="var(--accent-purple)" />
              </div>
              <h3 style={{ fontSize: '1.4rem', marginBottom: '0.6rem' }}>Heavyweight 220 GSM Cotton</h3>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.7 }}>
                We refuse standard lightweight fabric. Our exclusive t-shirts are custom-milled at 220 GSM with 100% combed cotton fibers to maintain structured drape, rich texture, and lasting tactile luxury.
              </p>
            </div>

            <div className="glass-card luxury-card-interactive">
              <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: 'rgba(6, 182, 212, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem', border: '1px solid rgba(6, 182, 212, 0.25)' }}>
                <Scissors size={28} color="var(--accent-cyan)" />
              </div>
              <h3 style={{ fontSize: '1.4rem', marginBottom: '0.6rem' }}>Proportioned Oversized Cuts</h3>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.7 }}>
                An oversized fit isn't just about going two sizes bigger. We recalibrated shoulder drops, neck ribbing density, and torso ratios to flatter all body types with clean drape.
              </p>
            </div>

            <div className="glass-card luxury-card-interactive">
              <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: 'rgba(236, 72, 153, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem', border: '1px solid rgba(236, 72, 153, 0.25)' }}>
                <Sparkles size={28} color="var(--accent-pink)" />
              </div>
              <h3 style={{ fontSize: '1.4rem', marginBottom: '0.6rem' }}>2026-Live Limited Releases</h3>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.7 }}>
                To preserve rarity and ensure zero excess waste, every ELIX release is strictly limited. All 2026-LIVE graphic drops feature flat pricing at LKR 3,000.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to action */}
      <section className="section">
        <div className="container">
          <div className="glass-card glass-card-glow luxury-border-glow" style={{ textAlign: 'center', padding: '3.5rem 2rem' }}>
            <h2 style={{ fontSize: '2.2rem', marginBottom: '1rem' }}>EXPERIENCE THE ATTITUDE</h2>
            <p style={{ color: 'var(--text-muted)', maxWidth: '500px', margin: '0 auto 2rem' }}>
              Explore the 2026-LIVE heavyweight graphic t-shirt drop and feel the 220 GSM difference.
            </p>
            <Link to="/shop" className="btn btn-glow btn-lg luxury-hover">
              Explore Collection <ArrowRight size={18} style={{ marginLeft: '6px', display: 'inline' }} />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
};

export default AboutPage;
