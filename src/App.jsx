import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import NavBar from './components/NavBar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import EditorPage from './pages/EditorPage';
import RoadmapPage from './pages/RoadmapPage';
import MemesPage from './pages/MemesPage';
import LoginPage from './pages/LoginPage';
import SupportPage from './pages/SupportPage';
import PrivacyPage from './pages/PrivacyPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminPanelPage from './pages/AdminPanelPage';
import AdminRoute from './components/AdminRoute';
import './App.css';

export default function App() {
  const location = useLocation();
  const isHome = location.pathname === '/';
  const isAdmin = location.pathname.startsWith('/admin');
  const isEditor = location.pathname === '/editor';
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';
  const hideGlobalChrome = isAdmin || isAuthPage;

  return (
    <div className={`app-shell ${isHome ? 'home-mode' : ''}`}>
      {!isHome ? (
        <div className="global-blobs" aria-hidden="true">
          <span className="gblob gb1" />
          <span className="gblob gb2" />
          <span className="gblob gb3" />
        </div>
      ) : null}

      {!hideGlobalChrome ? <NavBar /> : null}
      <main className={isHome ? 'main-home' : isAdmin ? 'main-admin' : isEditor ? 'main-editor' : 'main-content'}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/editor" element={<EditorPage />} />
          <Route path="/roadmap" element={<RoadmapPage />} />
          <Route path="/memes" element={<MemesPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/support" element={<SupportPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin/panel" element={<AdminRoute><AdminPanelPage /></AdminRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      {!hideGlobalChrome && !isEditor ? <Footer /> : null}
    </div>
  );
}
