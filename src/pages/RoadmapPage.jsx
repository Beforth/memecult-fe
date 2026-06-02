import { useEffect, useState } from 'react';
import { getPublicSiteConfig, getPublicRoadmap } from '../api/client';
import { DEFAULT_SITE_LOGO, resolveSiteLogo } from '../utils/siteMedia';
import './HomePage.css';
import './RoadmapPage.css';

export default function RoadmapPage() {
  const [siteLogoSrc, setSiteLogoSrc] = useState(DEFAULT_SITE_LOGO);
  const [milestones, setMilestones] = useState([]);
  const [roadmapTitle, setRoadmapTitle] = useState('Futardio');
  const [roadmapCursive, setRoadmapCursive] = useState('roadmap');
  const [statusTitle, setStatusTitle] = useState('COMING SOON');
  const [statusSubtext, setStatusSubtext] = useState('PROPULSION STAGE ACTIVE');
  const [description, setDescription] = useState(
    'We are designing an artistic, organic "Tree of Life" roadmap system with branching milestones.'
  );
  const [description2, setDescription2] = useState(
    'Once launched, each branch will grow dynamically as community-driven goals are achieved.'
  );

  useEffect(() => {
    getPublicSiteConfig()
      .then((cfg) => {
        setSiteLogoSrc(resolveSiteLogo(cfg));
        if (cfg.roadmap_settings) {
          setRoadmapTitle(cfg.roadmap_settings.title || 'Futardio');
          setRoadmapCursive(cfg.roadmap_settings.cursive_subtitle || 'roadmap');
          setStatusTitle(cfg.roadmap_settings.status_title || 'COMING SOON');
          setStatusSubtext(cfg.roadmap_settings.status_subtext || 'PROPULSION STAGE ACTIVE');
          setDescription(
            cfg.roadmap_settings.description ||
              'We are designing an artistic, organic "Tree of Life" roadmap system with branching milestones.'
          );
          setDescription2(
            cfg.roadmap_settings.description2 ||
              'Once launched, each branch will grow dynamically as community-driven goals are achieved.'
          );
        }
      })
      .catch(() => {});

    getPublicRoadmap()
      .then((data) => setMilestones(data || []))
      .catch(() => {});
  }, []);

  return (
    <div className="canva-home-page">
      <div className="canva-home-content" style={{ position: 'relative' }}>
        {/* Centered large watermark logo behind the text */}
        <div className="canva-hero-watermark-logo" aria-hidden="true">
          <img src={siteLogoSrc} alt="" />
        </div>

        {/* Hero Section */}
        <section className="canva-hero-section" style={{ position: 'relative', zIndex: 1 }}>
          <h1 className="canva-main-title">
            {roadmapTitle} <br />
            <span className="canva-cursive-text">{roadmapCursive}</span>
          </h1>

          <div className="canva-hero-action-box">
            <span className="canva-enter-btn" style={{ cursor: 'default' }}>
              {statusTitle}
            </span>
          </div>

          <div className="canva-sub-descriptions" style={{ marginBottom: '32px' }}>
            <p className="sub-desc-1">
              {description}
            </p>
            <p className="sub-desc-2" style={{ marginTop: '8px' }}>
              {description2}
            </p>
          </div>

          {/* Interactive hints or milestones card styled premium */}
          <div className="roadmap-details-card">
            <div className="roadmap-future-hints">
              {milestones.length > 0 ? (
                milestones.map((item) => (
                  <div className="roadmap-hint-item" key={item.id}>
                    {item.image ? (
                      <img src={item.image} alt={item.title} className="roadmap-item-img" style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
                    ) : (
                      <span className="hint-icon">🌱</span>
                    )}
                    <div>
                      <h4>{item.title}</h4>
                      <p>{item.description}</p>
                      {item.phase && <span className="roadmap-phase-tag" style={{ display: 'inline-block', marginTop: '4px', fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--brand-accent)', textTransform: 'uppercase' }}>{item.phase}</span>}
                    </div>
                  </div>
                ))
              ) : (
                <>
                  <div className="roadmap-hint-item">
                    <span className="hint-icon">🌱</span>
                    <div>
                      <h4>Branching Phases</h4>
                      <p>Click on custom branches to view growing developmental paths.</p>
                    </div>
                  </div>
                  <div className="roadmap-hint-item">
                    <span className="hint-icon">⚡</span>
                    <div>
                      <h4>Dynamic Milestone Growth</h4>
                      <p>Watch branches grow, bloom, and expand as the Futardio Cult reaches new heights.</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
