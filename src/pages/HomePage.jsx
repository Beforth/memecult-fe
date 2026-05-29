import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getPublicSiteConfig } from '../api/client';
import Footer from '../components/Footer';
import './HomePage.css';

export default function HomePage() {
  const [cfg, setCfg] = useState(null);

  useEffect(() => {
    getPublicSiteConfig()
      .then((data) => {
        setCfg(data);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="canva-home-page">
      <div className="canva-home-content">
        {/* Hero Section */}
        <section className="canva-hero-section">
          {/* Centered large watermark logo behind the text */}
          <div className="canva-hero-watermark-logo" aria-hidden="true">
            <img src="/images/logo.png" alt="" />
          </div>

          <h1 className="canva-main-title">
            The first ever <br />
            <span className="canva-cursive-text">futarchy</span> governed <br />
            meme coin
          </h1>

          <div className="canva-hero-action-box">
            <Link to="/editor" className="canva-enter-btn">
              Enter the cult
            </Link>
          </div>

          <div className="canva-sub-descriptions">
            <p className="sub-desc-1">
              Futardio Cult is a community-driven meme coin, built on futarchy principles.
            </p>
            <p className="sub-desc-2">
              Unruggable by the Holly book of metaDAO.
            </p>
          </div>
        </section>

        {/* 5-Column Home Footer Grid via Reusable Component */}
        <Footer />
      </div>
    </div>
  );
}
