import React from 'react';
import { Outlet } from 'react-router-dom';
import NavBar from './NavBar';
import Footer from './Footer';
import WelcomeAuthModal from './WelcomeAuthModal';
import AIAssistant from './AIAssistant';
import useScrollReveal from '../hooks/useScrollReveal';

const Layout: React.FC = () => {
  useScrollReveal();

  return (
    <div className="page-shell">
      <WelcomeAuthModal />
      <NavBar />
      <main>
        <Outlet />
      </main>
      <Footer />
      <AIAssistant />
    </div>
  );
};

export default Layout;
