import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { getPublicSiteConfig } from '../api/client';
import { DEFAULT_NAV_ITEMS, normalizeNavItems } from '../utils/navItems';
import { DEFAULT_SITE_LOGO, resolveSiteLogo } from '../utils/siteMedia';

function LogoutIcon() {
  return (
    <svg className="site-logout-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg className="site-nav-chevron" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M2.5 4.5L6 8l3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function NavDropdown({ item, index, openIndex, setOpenIndex }) {
  const location = useLocation();
  const isOpen = openIndex === index;
  const childActive = (item.children || []).some(
    (child) => !child.external && location.pathname === child.path,
  );

  return (
    <div
      className={`site-nav-dropdown ${isOpen ? 'open' : ''} ${childActive ? 'has-active-child' : ''}`}
      onMouseEnter={() => setOpenIndex(index)}
      onMouseLeave={() => setOpenIndex(null)}
    >
      <button
        type="button"
        className={`site-nav-dropdown-trigger ${childActive ? 'active' : ''}`}
        aria-expanded={isOpen}
        aria-haspopup="true"
        onClick={(e) => {
          e.stopPropagation();
          setOpenIndex(isOpen ? null : index);
        }}
      >
        {item.label}
        <ChevronIcon />
      </button>
      <div className="site-nav-dropdown-menu" role="menu">
        {(item.children || []).map((child, childIdx) =>
          child.external ? (
            <a
              key={`${child.label}-${childIdx}`}
              href={child.path}
              target="_blank"
              rel="noreferrer"
              role="menuitem"
            >
              {child.label}
            </a>
          ) : (
            <NavLink
              key={`${child.label}-${childIdx}`}
              to={child.path}
              role="menuitem"
              onClick={() => setOpenIndex(null)}
            >
              {child.label}
            </NavLink>
          ),
        )}
      </div>
    </div>
  );
}

export default function NavBar() {
  const [userName, setUserName] = useState(localStorage.getItem('user_name') || '');
  const [siteLogoSrc, setSiteLogoSrc] = useState(DEFAULT_SITE_LOGO);
  const [navItems, setNavItems] = useState(DEFAULT_NAV_ITEMS);
  const [openDropdown, setOpenDropdown] = useState(null);
  const navRef = useRef(null);

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

  useEffect(() => {
    let live = true;
    getPublicSiteConfig()
      .then((cfg) => {
        if (!live) return;
        setSiteLogoSrc(resolveSiteLogo(cfg));
        const parsed = normalizeNavItems(cfg.nav_items);
        if (parsed.length) {
          setNavItems(parsed);
        }
      })
      .catch(() => {});
    return () => {
      live = false;
    };
  }, []);

  useEffect(() => {
    function onDocClick(e) {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
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
          <img src={siteLogoSrc} alt="MemeCult" className="site-logo" />
        </Link>

        <nav className="site-menu" ref={navRef}>
          {navItems.map((item, idx) =>
            item.children?.length ? (
              <NavDropdown
                key={`${item.label}-${idx}`}
                item={item}
                index={idx}
                openIndex={openDropdown}
                setOpenIndex={setOpenDropdown}
              />
            ) : item.external ? (
              <a key={`${item.label}-${idx}`} href={item.path} target="_blank" rel="noreferrer">
                {item.label}
              </a>
            ) : (
              <NavLink key={`${item.label}-${idx}`} to={item.path} end={item.path === '/'}>
                {item.label}
              </NavLink>
            ),
          )}
        </nav>

        <div className="site-topbar-right">
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
            <Link to="/login" className="site-btn site-btn-lime site-btn-cult">
              Join the Cult
              <img src="/images/avatar.png" alt="" className="site-btn-avatar" />
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
