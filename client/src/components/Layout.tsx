import React from 'react';
import { Outlet } from 'react-router-dom';
import NavBar from './NavBar';
import Footer from './Footer';
import WelcomeAuthModal from './WelcomeAuthModal';
import AIAssistant from './AIAssistant';
import useScrollReveal from '../hooks/useScrollReveal';
import CinematicLoader from './CinematicLoader';
import UltraParticles from './UltraParticles';
import UltraSpotlight from './UltraSpotlight';
import CinematicPageTransition from './CinematicPageTransition';
import VisualModeSwitch from './VisualModeSwitch';

const Layout: React.FC = () => {
  useScrollReveal();

  return (
    <div className="page-shell">
      {/* Fullscreen Cinematic Loading Screen */}
      <CinematicLoader />

      {/* Ultra Mode Ambient VFX Layers (0% CPU cost in Normal Mode) */}
      <UltraParticles />
      <UltraSpotlight />

      {/* Modals & Nav */}
      <WelcomeAuthModal />
      <NavBar />

      {/* Main Content with Cinematic Route Transition */}
      <main className="main-content-flow">
        <CinematicPageTransition>
          <Outlet />
        </CinematicPageTransition>
      </main>

      <Footer />
      <AIAssistant />

      {/* Quick Access Visual Experience Switcher Dock */}
      <VisualModeSwitch variant="dock" />
    </div>
  );
};

export default Layout;
