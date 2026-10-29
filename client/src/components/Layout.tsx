import React from 'react';
import { Outlet } from 'react-router-dom';
import NavBar from './NavBar';
import Footer from './Footer';
import WelcomeAuthModal from './WelcomeAuthModal';

const Layout: React.FC = () => {
  return (
    <div className="page-shell">
      <WelcomeAuthModal />
      <NavBar />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
