import { Outlet } from 'react-router-dom';
import NavBar from './NavBar';
import Footer from './Footer';
import WelcomeAuthModal from './WelcomeAuthModal';

function Layout() {
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
}

export default Layout;
