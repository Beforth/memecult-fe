import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getPublicSiteConfig } from '../api/client';
import '../pages/HomePage.css'; // Leverage exact same styling for consistency

export default function Footer() {
  const [cfg, setCfg] = useState(null);
  const [caCopied, setCaCopied] = useState(false);
  const caAddress = 'Cbjr1Nvcay3QWDriyRKtokJ7V4PMnesGxeK8z7Zmeta';

  useEffect(() => {
    getPublicSiteConfig()
      .then((data) => {
        setCfg(data);
      })
      .catch(() => {});
  }, []);

  const getTickerSymbol = () => {
    return cfg?.home_bar?.ticker?.symbol || '$FUTARDIO';
  };

  const getCAAddress = () => {
    return cfg?.home_bar?.ticker?.contract_address || caAddress;
  };

  const handleCopyCA = (e) => {
    e.preventDefault();
    navigator.clipboard.writeText(getCAAddress());
    setCaCopied(true);
    setTimeout(() => setCaCopied(false), 2000);
  };

  // Get social links dynamically from home_bar column if configured
  const getSocialLink = (platform) => {
    if (cfg?.home_bar?.columns) {
      for (const col of cfg.home_bar.columns) {
        if (col.links) {
          for (const link of col.links) {
            if (link.path && link.path.toLowerCase().includes(platform)) {
              return link.path;
            }
          }
        }
      }
    }
    return platform === 'twitter' || platform === 'x.com' 
      ? 'https://x.com/Futardiocult3' 
      : 'https://t.me/FUTARDIOCULT';
  };

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 'auto', zIndex: 1, position: 'relative' }}>
      <div className="canva-divider-line" style={{ width: 'min(840px, 92%)', margin: '30px auto 0' }} />
      <footer 
        className="canva-home-footer-grid" 
        style={{ 
          width: 'min(1120px, 94%)', 
          margin: '0 auto', 
          background: 'transparent', 
          border: 'none', 
          boxShadow: 'none', 
          backdropFilter: 'none', 
          padding: '16px 0 32px'
        }}
      >
        {/* Column 1: Futardio Gallery */}
        <div className="footer-grid-col">
          <h3>
            <Link to="/memes" className="col-title-link">
              Futardio Gallery
            </Link>
          </h3>
          <div className="col-symbol-text">
            {getTickerSymbol()}
          </div>
        </div>

        {/* Column 2: Futardio Cards */}
        <div className="footer-grid-col">
          <h3>
            <Link to="/futardio-card" className="col-title-link">
              Futardio Cards
            </Link>
          </h3>
          <div className="col-ca-container" onClick={handleCopyCA} title="Click to copy contract address">
            <span className="ca-prefix-label">CA:</span>
            <span className="ca-address-value">{getCAAddress()}</span>
            {caCopied && <span className="ca-copied-check">✓</span>}
          </div>
        </div>

        {/* Column 3: Meme Lab */}
        <div className="footer-grid-col">
          <h3>
            <Link to="/editor" className="col-title-link">
              Meme Lab
            </Link>
          </h3>
          <div className="col-empty-spacing" />
        </div>

        {/* Column 4: Resources */}
        <div className="footer-grid-col">
          <h3>
            <Link to="/assets" className="col-title-link">
              Resources
            </Link>
          </h3>
          <div className="footer-social-icons-row">
            <a href={getSocialLink('twitter')} target="_blank" rel="noreferrer" className="social-icon-bubble" title="Twitter/X">
              <svg viewBox="0 0 24 24" className="social-svg-icon" fill="#1a233d" style={{ width: '25px', height: '25px', display: 'block' }}>
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
            <a href={getSocialLink('telegram')} target="_blank" rel="noreferrer" className="social-icon-bubble" title="Telegram">
              <svg viewBox="0 0 24 24" className="social-svg-icon" style={{ width: '28px', height: '28px', display: 'block' }}>
                <path d="M9.78 18.65L10.06 14.75L17.14 8.35C17.45 8.07 17.07 7.91 16.66 8.18L7.91 13.7L4.13 12.52C3.31 12.26 3.29 11.7 4.3 11.31L19.07 5.61C19.75 5.36 20.35 5.77 20.12 6.84L17.61 18.66C17.42 19.55 16.89 19.77 16.14 19.35L12.29 16.51L10.43 18.3C10.22 18.51 10.05 18.69 9.64 18.69L9.78 18.65Z" fill="#00b0f0" />
              </svg>
            </a>
          </div>
        </div>

        {/* Column 5: About us */}
        <div className="footer-grid-col">
          <h3>
            <Link to="/about" className="col-title-link">
              About us
            </Link>
          </h3>
          <a href={getSocialLink('telegram')} target="_blank" rel="noreferrer" className="footer-contact-me-link">
            Contact us
          </a>
        </div>
      </footer>
    </div>
  );
}
