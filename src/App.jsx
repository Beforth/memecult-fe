import { useEffect, useRef, useState } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { getPublicSiteConfig } from './api/client';
import NavBar from './components/NavBar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import EditorPage from './pages/EditorPage';
import RoadmapPage from './pages/RoadmapPage';
import FutardioCardPage from './pages/FutardioCardPage';
import MemesPage from './pages/MemesPage';
import LoginPage from './pages/LoginPage';
import SupportPage from './pages/SupportPage';
import PrivacyPage from './pages/PrivacyPage';
import CustomPage from './pages/CustomPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminPanelPage from './pages/AdminPanelPage';
import AdminPageBuilder from './pages/AdminPageBuilder';
import AdminRoute from './components/AdminRoute';
import './App.css';

const BOOT_LAST_SEEN_KEY = 'memecult_loader_last_seen_at';
const INTRO_VIDEO_FALLBACK = '/initial%20video.mp4';

export default function App() {
  const location = useLocation();
  const introVideoRef = useRef(null);
  /** checking → loader | video | idle */
  const [bootPhase, setBootPhase] = useState('checking');
  const [canEnterSite, setCanEnterSite] = useState(false);
  const [loaderTextIndex, setLoaderTextIndex] = useState(0);
  const [loaderGifSrc, setLoaderGifSrc] = useState('/images/loading-transparent.gif');
  const [loaderBgType, setLoaderBgType] = useState('color');
  const [loaderBgColor, setLoaderBgColor] = useState('#E3F7FD');
  const [loaderBgMedia, setLoaderBgMedia] = useState('');
  const [loaderFrequencyHours, setLoaderFrequencyHours] = useState(24);
  const [introVideoSrc, setIntroVideoSrc] = useState(INTRO_VIDEO_FALLBACK);
  const isHome = location.pathname === '/';
  const isAdmin = location.pathname.startsWith('/admin');
  const isEditor = location.pathname === '/editor';
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';
  const hideGlobalChrome = isAdmin || isAuthPage;
  const isCultThemed = !isAdmin;
  const showSiteChrome = !hideGlobalChrome;

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    if (isCultThemed) {
      root.classList.add('cult-theme');
      body.classList.add('cult-theme');
    } else {
      root.classList.remove('cult-theme');
      body.classList.remove('cult-theme');
    }
    return () => {
      root.classList.remove('cult-theme');
      body.classList.remove('cult-theme');
    };
  }, [isCultThemed]);

  useEffect(() => {
    let mounted = true;
    function markReady() {
      if (!mounted) return;
      window.setTimeout(() => {
        if (!mounted) return;
        setCanEnterSite(true);
      }, 900);
    }
    if (document.readyState === 'complete') {
      markReady();
    } else {
      window.addEventListener('load', markReady, { once: true });
    }
    return () => {
      mounted = false;
      window.removeEventListener('load', markReady);
    };
  }, []);

  useEffect(() => {
    if (isAdmin || isAuthPage) {
      setBootPhase('idle');
      return undefined;
    }

    let mounted = true;
    const apiBase = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:8000/api';
    const apiOrigin = apiBase.replace(/\/api\/?$/, '');
    const normalize = (url) => {
      if (!url) return '';
      if (/^https?:\/\//i.test(url)) {
        try {
          const parsed = new URL(url);
          const api = new URL(apiOrigin);
          const isLocal = parsed.hostname === '127.0.0.1' || parsed.hostname === 'localhost';
          if (isLocal) {
            return `${api.origin}${parsed.pathname}${parsed.search || ''}`;
          }
          if (window.location.protocol === 'https:' && parsed.protocol === 'http:' && parsed.hostname === api.hostname) {
            parsed.protocol = 'https:';
            return parsed.toString();
          }
          return url;
        } catch {
          return url;
        }
      }
      if (url.startsWith('/')) return `${apiOrigin}${url}`;
      return `${apiOrigin}/${url}`;
    };

    getPublicSiteConfig()
      .then((cfg) => {
        if (!mounted) return;
        const theme = cfg?.site_theme || {};
        const root = document.documentElement;
        const primary = theme.primary || '#202063';
        const accent = theme.accent || '#D02D14';
        const lightBg = theme.light_bg || '#E3F7FD';
        const black = theme.black || '#000000';
        const warm = theme.warm || '#FFB02F';
        const darkBlue = `${primary}E6`;
        root.style.setProperty('--brand-primary', primary);
        root.style.setProperty('--brand-accent', accent);
        root.style.setProperty('--brand-light', lightBg);
        root.style.setProperty('--brand-black', black);
        root.style.setProperty('--brand-warm', warm);
        root.style.setProperty('--bg', darkBlue);
        root.style.setProperty('--bg2', '#1a2768');
        root.style.setProperty('--bg3', '#253688');
        root.style.setProperty('--purple', primary);
        root.style.setProperty('--pink', accent);
        root.style.setProperty('--blue', primary);
        root.style.setProperty('--orange', warm);
        root.style.setProperty('--text', lightBg);
        root.style.setProperty('--muted', 'rgba(227,247,253,.72)');
        if (cfg?.loader_gif) setLoaderGifSrc(normalize(cfg.loader_gif));
        if (cfg?.loader_background_type) setLoaderBgType(cfg.loader_background_type);
        if (cfg?.loader_background_color) setLoaderBgColor(cfg.loader_background_color);
        if (cfg?.loader_background_media) setLoaderBgMedia(normalize(cfg.loader_background_media));
        const introUrl = cfg?.intro_video ? normalize(cfg.intro_video) : INTRO_VIDEO_FALLBACK;
        setIntroVideoSrc(introUrl);
        const frequencyHours = Math.max(1, Number(cfg?.loader_frequency_hours || 24));
        setLoaderFrequencyHours(frequencyHours);
        const lastSeen = Number(localStorage.getItem(BOOT_LAST_SEEN_KEY) || 0);
        const now = Date.now();
        const shouldShow = !lastSeen || now - lastSeen >= frequencyHours * 60 * 60 * 1000;
        setBootPhase(shouldShow ? 'loader' : 'idle');
      })
      .catch(() => {
        if (!mounted) return;
        const lastSeen = Number(localStorage.getItem(BOOT_LAST_SEEN_KEY) || 0);
        const now = Date.now();
        const shouldShow = !lastSeen || now - lastSeen >= 24 * 60 * 60 * 1000;
        setBootPhase(shouldShow ? 'loader' : 'idle');
      });

    return () => {
      mounted = false;
    };
  }, [isAdmin, isAuthPage]);

  useEffect(() => {
    if (canEnterSite) return;
    const lines = [
      'Loading...',
      'Getting things ready for you...',
      'Warming up meme engine...',
      'Almost there...',
    ];
    const timer = window.setInterval(() => {
      setLoaderTextIndex((prev) => (prev + 1) % lines.length);
    }, 900);
    return () => window.clearInterval(timer);
  }, [canEnterSite]);

  function finishBootSequence() {
    localStorage.setItem(BOOT_LAST_SEEN_KEY, String(Date.now()));
    setBootPhase('idle');
    const video = introVideoRef.current;
    if (video) {
      video.pause();
      video.currentTime = 0;
    }
  }

  function enterLoader() {
    if (!canEnterSite) return;
    if (introVideoSrc) {
      setBootPhase('video');
      return;
    }
    finishBootSequence();
  }

  useEffect(() => {
    if (bootPhase !== 'video') return undefined;
    const video = introVideoRef.current;
    if (!video) return undefined;
    video.muted = false;
    const playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(() => {});
    }
    return undefined;
  }, [bootPhase]);

  const loaderLines = [
    'Loading...',
    'Getting things ready for you...',
    'Warming up meme engine...',
    'Almost there...',
  ];

  const bootChecking = bootPhase === 'checking';
  const loaderVisible = bootPhase === 'loader';
  const videoVisible = bootPhase === 'video';
  const siteHidden = bootChecking || loaderVisible || videoVisible;

  return (
    <div
      className={`app-shell ${isHome ? 'home-mode' : ''} ${isCultThemed ? 'cult-site-mode' : ''} ${bootChecking ? 'boot-checking' : ''} ${loaderVisible ? 'boot-loading' : ''} ${videoVisible ? 'boot-video' : ''}`}
    >
      {loaderVisible ? (
        <div
          className={`boot-loader-overlay ${canEnterSite ? 'can-enter' : ''}`}
          aria-label="Loading"
          onClick={enterLoader}
          style={
            loaderBgType === 'color'
              ? { background: loaderBgColor || '#E3F7FD' }
              : {
                  backgroundImage: loaderBgMedia ? `url(${loaderBgMedia})` : undefined,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }
          }
        >
          <img src={loaderGifSrc} alt="Loading MemeCult" className="boot-loader-gif" />
          <div className="boot-loader-actions">
            <p className="boot-loader-text">
              {canEnterSite ? 'Touch anywhere to enter' : loaderLines[loaderTextIndex]}
            </p>
          </div>
        </div>
      ) : null}

      {videoVisible ? (
        <div className="intro-video-overlay" aria-label="Intro video">
          <video
            ref={introVideoRef}
            className="intro-video-player"
            src={introVideoSrc}
            key={introVideoSrc}
            playsInline
            preload="auto"
            onEnded={finishBootSequence}
          />
          <div className="intro-video-actions">
            <button type="button" className="intro-video-skip" onClick={finishBootSequence}>
              Skip → Home
            </button>
          </div>
        </div>
      ) : null}

      <div className="app-site-content" aria-hidden={siteHidden}>
        {isCultThemed && !isHome ? (
          <div className="cult-site-bg" aria-hidden="true">
            <div className="cult-stars" />
            <div className="cult-nebula" />
          </div>
        ) : null}

        {showSiteChrome ? <NavBar /> : null}
        <main className={isHome ? 'main-home' : isAdmin ? 'main-admin' : isEditor ? 'main-editor' : 'main-content'}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/editor" element={<EditorPage />} />
            <Route path="/roadmap" element={<RoadmapPage />} />
            <Route path="/futardio-card" element={<FutardioCardPage />} />
            <Route path="/memes" element={<MemesPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/support" element={<SupportPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/page/:slug" element={<CustomPage />} />
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/admin/panel" element={<AdminRoute><AdminPanelPage /></AdminRoute>} />
            <Route path="/admin/page-builder" element={<AdminRoute><AdminPageBuilder /></AdminRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        {showSiteChrome && !isEditor && !isHome ? <Footer /> : null}
      </div>
    </div>
  );
}
