import { useEffect, useState } from 'react';
import { getPublicSiteConfig } from '../api/client';
import './HomePage.css';
import './AssetsPage.css';
import Footer from '../components/Footer';

const DEFAULT_LEFT_LINKS = [
  { label: 'Logo', path: '#logo', external: false },
  { label: 'Fonts', path: '#fonts', external: false },
  { label: 'Colors Palette', path: '#colors', external: false },
  { label: '---', path: '', external: false },
  { label: 'Futarchy Papers', path: '#papers', external: false },
];

const DEFAULT_RIGHT_LINKS = [
  { label: 'Twitter', path: 'https://x.com/Futardiocult3', external: true },
  { label: '---', path: '', external: false },
  { label: 'Telegram Community', path: 'https://t.me/FUTARDIOCULT', external: true },
  { label: '---', path: '', external: false },
  { label: 'TG Support', path: 'https://t.me/FUTARDIOCULT', external: true },
  { label: 'Book a call with team', path: 'https://t.me/FUTARDIOCULT', external: true },
];

export default function AssetsPage() {
  const [cfg, setCfg] = useState(null);

  useEffect(() => {
    getPublicSiteConfig()
      .then((data) => setCfg(data))
      .catch(() => {});
  }, []);

  const rp = cfg?.resources_page || {};
  const pageTitle = rp.title || 'Assets & Resource';
  const dexLabel = rp.dex_label || '$FUTARDIO\nDEXSCREENER';
  const description = rp.description || 'Futardio Cult is a community-driven meme coin, built on futarchy principles.';
  const description2 = rp.description2 || 'Unruggable by the Holly book of metaDAO.';
  const leftLinks = (rp.left_links?.length ? rp.left_links : DEFAULT_LEFT_LINKS);
  const rightLinks = (rp.right_links?.length ? rp.right_links : DEFAULT_RIGHT_LINKS);

  function renderLink(link, i) {
    // "---" means a spacer
    if (link.label === '---' || link.path === '') {
      return <div key={i} className="assets-col-spacer" />;
    }
    if (link.external) {
      return (
        <a key={i} href={link.path} target="_blank" rel="noreferrer" className="assets-link">
          {link.label}
        </a>
      );
    }
    return (
      <a key={i} href={link.path} className="assets-link">
        {link.label}
      </a>
    );
  }

  return (
    <div className="assets-canva-page">
      <div className="assets-canva-content">

        {/* Page Title */}
        <h1 className="assets-canva-title">{pageTitle}</h1>

        {/* 3-column body: left links | center logo | right links */}
        <div className="assets-canva-body">

          {/* LEFT LINKS */}
          <div className="assets-col assets-col-left">
            {leftLinks.map(renderLink)}
          </div>

          {/* CENTER LOGO */}
          <div className="assets-col assets-col-center">
            <span className="assets-dex-label">
              {dexLabel.split('\n').map((line, i) => (
                <span key={i}>{line}{i < dexLabel.split('\n').length - 1 && <br />}</span>
              ))}
            </span>
            <div className="assets-logo-circle-wrap">
              <img
                src="/images/logo.png"
                alt="Futardio logo"
                className="assets-center-avatar"
              />
            </div>
          </div>

          {/* RIGHT LINKS */}
          <div className="assets-col assets-col-right">
            {rightLinks.map(renderLink)}
          </div>
        </div>

        {/* Description */}
        <div className="assets-canva-desc">
          {description && <p>{description}</p>}
          {description2 && <p>{description2}</p>}
        </div>

        {/* Footer (includes its own divider line) */}
        <Footer />
      </div>
    </div>
  );
}
