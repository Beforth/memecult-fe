import { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';

function LogoutIcon() {
  return (
    <svg className="site-logout-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </svg>
  );
}

export default function NavBar() {
  const [userName, setUserName] = useState(localStorage.getItem('user_name') || '');

  useEffect(() => {
    const onStorage = () => setUserName(localStorage.getItem('user_name') || '');
    const onAuthChanged = () => setUserName(localStorage.getItem('user_name') || '');
    window.addEventListener('storage', onStorage);
    window.addEventListener('auth-changed', onAuthChanged);
    onStorage();
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('auth-changed', onAuthChanged);
    };
  }, []);

  function logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_name');
    localStorage.removeItem('user_email');
    setUserName('');
    window.dispatchEvent(new Event('auth-changed'));
  }

  return (
    <header className="site-topbar">
      <div className="site-topbar-inner">
        <Link to="/" className="site-logo-link">
          <img src="/images/memecult-logo.png" alt="MemeCult" className="site-logo" />
        </Link>

        <nav className="site-menu">
          <NavLink to="/" end>Home</NavLink>
          <NavLink to="/editor">Editor</NavLink>
          <NavLink to="/memes">Memes</NavLink>
          <NavLink to="/roadmap">Roadmap</NavLink>
        </nav>

        <div className="site-topbar-right">
          <input className="site-search" placeholder="Search memes..." />
          {userName ? (
            <>
              <div className="site-user-pill">
                <strong>Logged in</strong>
                <span>{userName}</span>
              </div>
              <button className="site-icon-btn" onClick={logout} title="Logout" aria-label="Logout">
                <LogoutIcon />
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="site-btn site-btn-outline">Log in</Link>
              <Link to="/login" className="site-btn site-btn-lime">Sign up free</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
