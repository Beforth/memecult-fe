import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getPublicSiteConfig } from '../api/client';
import { DEFAULT_HOME_BAR, isExternalPath, resolveHomeBar } from '../utils/homeBar';
import { DEFAULT_HERO_CONTENT, cardArtStyle, resolveHeroContent } from '../utils/heroContent';
import { DEFAULT_SITE_LOGO, resolveSiteLogo } from '../utils/siteMedia';
import './HomePage.css';

function HomeBarLink({ link }) {
  const className = link.highlight ? 'cult-join-link' : undefined;
  const label = link.label || link.path;

  if (isExternalPath(link.path)) {
    return (
      <a
        href={link.path}
        target={link.path.startsWith('mailto:') ? undefined : '_blank'}
        rel={link.path.startsWith('mailto:') ? undefined : 'noreferrer'}
        className={className}
      >
        {label}
      </a>
    );
  }

  return (
    <Link to={link.path} className={className}>
      {label}
    </Link>
  );
}

export default function HomePage() {
  const [siteLogoSrc, setSiteLogoSrc] = useState(DEFAULT_SITE_LOGO);
  const [hero, setHero] = useState(DEFAULT_HERO_CONTENT);
  const [homeBar, setHomeBar] = useState(DEFAULT_HOME_BAR);

  useEffect(() => {
    let live = true;
    getPublicSiteConfig()
      .then((cfg) => {
        if (!live) return;
        setSiteLogoSrc(resolveSiteLogo(cfg));
        setHero(resolveHeroContent(cfg));
        setHomeBar(resolveHomeBar(cfg));
      })
      .catch(() => {});
    return () => {
      live = false;
    };
  }, []);

  return (
    <div className="cult-hero-page">
      <div className="cult-hero-bg" aria-hidden="true">
        <div className="cult-stars" />
        <div className="cult-nebula" />
      </div>

      <div className="cult-hero-wrap">
        <section className="cult-hero" aria-label="Hero">
          <div className="cult-portal" aria-hidden="true">
            <div className="cult-portal-ring cult-portal-ring-outer" />
            <div className="cult-portal-ring cult-portal-ring-inner" />
            <div className="cult-portal-logo">
              <img src={siteLogoSrc} alt="" />
            </div>
          </div>

          <aside className="cult-panel cult-panel-left">
            <div className="cult-panel-badge">
              <img src={siteLogoSrc} alt="" className="cult-panel-logo" />
            </div>
            <h1>
              {hero.headline_prefix}{' '}
              <span className="cult-accent">{hero.headline_accent}</span>
            </h1>
            <p>{hero.description}</p>
          </aside>

          <div className="cult-hero-center">
            <img
              src="/images/avatar.png"
              alt="MemeCult guardian"
              className="cult-hero-figure"
            />
            <div className="cult-pedestal" aria-hidden="true">
              <div className="cult-pedestal-glow" />
              <div className="cult-coin">
                <span>MEMECULT</span>
                <small>CULT</small>
              </div>
            </div>
          </div>

          <aside className="cult-panel cult-panel-right">
            <h2>{hero.cards_heading}</h2>
            <p className="cult-panel-sub">{hero.cards_subheading}</p>
            <div className="cult-cards">
              {hero.cards.map((card, index) => (
                <article key={`${card.title}-${index}`} className="cult-card">
                  <div className="cult-card-art" style={cardArtStyle(card)} />
                  <span>{card.title}</span>
                </article>
              ))}
            </div>
            <Link to={hero.explore_path || '/editor'} className="cult-explore-btn">
              {hero.explore_label}
              <span aria-hidden="true">→</span>
            </Link>
          </aside>
        </section>
      </div>

      <footer className="cult-hero-bar">
        <div className="cult-hero-bar-inner">
          <div className="cult-bar-col">
            <h3>{homeBar.ticker.title}</h3>
            <p className="cult-ticker">
              {homeBar.ticker.symbol ? <strong>{homeBar.ticker.symbol}</strong> : null}
              {homeBar.ticker.contract_address ? (
                <span className="cult-ca">CA: {homeBar.ticker.contract_address}</span>
              ) : null}
            </p>
          </div>
          {homeBar.columns.map((col, colIdx) => (
            <div key={`${col.title}-${colIdx}`} className="cult-bar-col">
              <h3>{col.title}</h3>
              {col.links.map((link, linkIdx) => (
                <HomeBarLink key={`${link.label}-${linkIdx}`} link={link} />
              ))}
            </div>
          ))}
        </div>
      </footer>
    </div>
  );
}
