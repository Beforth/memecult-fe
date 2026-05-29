import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getPublicSiteConfig } from '../api/client';
import Footer from '../components/Footer';
import './HomePage.css';

const DEFAULTS = {
  title_prefix: 'The first ever',
  title_cursive: 'futarchy',
  title_suffix: 'governed\nmeme coin',
  enter_label: 'Enter the cult',
  enter_path: '/editor',
  desc_1: 'Futardio Cult is a community-driven meme coin, built on futarchy principles.',
  desc_2: 'Unruggable by the Holly book of metaDAO.',
};

export default function HomePage() {
  const [cfg, setCfg] = useState(null);

  useEffect(() => {
    getPublicSiteConfig()
      .then((data) => setCfg(data))
      .catch(() => {});
  }, []);

  const hero = cfg?.hero_content || {};
  const titlePrefix  = hero.title_prefix  || DEFAULTS.title_prefix;
  const titleCursive = hero.title_cursive || DEFAULTS.title_cursive;
  const titleSuffix  = hero.title_suffix  || DEFAULTS.title_suffix;
  const enterLabel   = hero.enter_label   || DEFAULTS.enter_label;
  const enterPath    = hero.enter_path    || DEFAULTS.enter_path;
  const desc1        = hero.desc_1        || DEFAULTS.desc_1;
  const desc2        = hero.desc_2        || DEFAULTS.desc_2;

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
            {titlePrefix} <br />
            <span className="canva-cursive-text">{titleCursive}</span>{' '}
            {titleSuffix.split('\n').map((line, i, arr) => (
              <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
            ))}
          </h1>

          <div className="canva-hero-action-box">
            <Link to={enterPath} className="canva-enter-btn">
              {enterLabel}
            </Link>
          </div>

          <div className="canva-sub-descriptions">
            {desc1 && <p className="sub-desc-1">{desc1}</p>}
            {desc2 && <p className="sub-desc-2">{desc2}</p>}
          </div>
        </section>

        {/* 5-Column Home Footer Grid via Reusable Component */}
        <Footer />
      </div>
    </div>
  );
}
