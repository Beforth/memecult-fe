import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getPublicRoadmap } from '../api/client';
import { resolveRoadmapPhases } from '../utils/roadmapPhases';
import './RoadmapPage.css';

function PhaseCardBody({ phase, expanded, onToggle }) {
  return (
    <div className={`roadmap-phase-card ${expanded ? 'is-expanded' : ''}`}>
      <div className="roadmap-phase-accent" aria-hidden="true" />
      <div className={`roadmap-phase-body${expanded && phase.image ? ' roadmap-phase-body--split' : ''}`}>
        <div className={`roadmap-phase-content${phase.side === 'right' && expanded && phase.image ? ' roadmap-phase-content--img-left' : ''}`}>
          <div className="roadmap-phase-text">
            <div className="roadmap-phase-top">
              <span className="roadmap-phase-label">{phase.phase}</span>
              <button
                type="button"
                className="roadmap-phase-expand"
                aria-expanded={expanded}
                aria-label={expanded ? 'Collapse details' : 'Expand details'}
                onClick={onToggle}
              >
                {expanded ? '−' : '+'}
              </button>
            </div>
            <h2>{phase.title}</h2>
            {phase.period ? <span className="roadmap-phase-period">{phase.period}</span> : null}
            <p className="roadmap-phase-desc">{phase.description || 'Details coming soon.'}</p>
            <button type="button" className="roadmap-phase-details" onClick={onToggle}>
              <span>{expanded ? 'HIDE DETAILS' : 'VIEW DETAILS'}</span>
              <span className="roadmap-phase-details-arrow" aria-hidden="true">→</span>
            </button>
          </div>
          {expanded && phase.image ? (
            <div className="roadmap-phase-img-wrap">
              <img className="roadmap-phase-img" src={phase.image} alt={phase.title} />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function PhaseCard({ phase }) {
  const [expanded, setExpanded] = useState(false);
  const onToggle = () => setExpanded((v) => !v);
  const isLeft = phase.side === 'left';

  return (
    <article className={`roadmap-phase roadmap-phase--${phase.accent} roadmap-phase--${phase.side}`}>
      <div className="roadmap-phase-row">
        <div className="roadmap-phase-half roadmap-phase-half--start">
          {isLeft ? (
            <>
              <div className="roadmap-phase-card-wrap">
                <PhaseCardBody phase={phase} expanded={expanded} onToggle={onToggle} />
              </div>
              <span className="roadmap-phase-connector" aria-hidden="true" />
            </>
          ) : null}
        </div>

        <div className="roadmap-phase-node" aria-hidden="true" />

        <div className="roadmap-phase-half roadmap-phase-half--end">
          {!isLeft ? (
            <>
              <span className="roadmap-phase-connector" aria-hidden="true" />
              <div className="roadmap-phase-card-wrap">
                <PhaseCardBody phase={phase} expanded={expanded} onToggle={onToggle} />
              </div>
            </>
          ) : null}
        </div>
      </div>
    </article>
  );
}

export default function RoadmapPage() {
  const [phases, setPhases] = useState(() => resolveRoadmapPhases([]));
  const [error, setError] = useState('');

  useEffect(() => {
    let live = true;
    getPublicRoadmap()
      .then((data) => {
        if (!live) return;
        setPhases(resolveRoadmapPhases(data));
      })
      .catch((err) => setError(err.message));
    return () => {
      live = false;
    };
  }, []);

  return (
    <>
      <div className="roadmap-page-bg" aria-hidden="true" />
      <div className="roadmap-page">
        <div className="roadmap-page-inner">
          <header className="roadmap-page-head">
            <span className="roadmap-page-tag">Roadmap</span>
            <h1>
              OUR JOURNEY <span className="roadmap-accent">AHEAD</span>
            </h1>
            <p>
              Building the future of memes, communities, and culture. One phase at a time.
            </p>
          </header>

          {error ? <p className="roadmap-page-error">{error}</p> : null}

          <div className="roadmap-timeline">
            <div className="roadmap-timeline-line" aria-hidden="true" />
            <div className="roadmap-phases">
              {phases.map((phase) => (
                <PhaseCard key={phase.id} phase={phase} />
              ))}
            </div>
          </div>

          <footer className="roadmap-page-cta">
            <div className="roadmap-page-cta-avatar">
              <img src="/images/avatar.png" alt="" />
            </div>
            <div className="roadmap-page-cta-text">
              <h3>
                THE FUTURE IS <span className="roadmap-accent">MEME</span>
              </h3>
              <p>We&apos;re just getting started. Join the cult and be part of history.</p>
            </div>
            <Link to="/login" className="roadmap-page-cta-btn">
              JOIN THE CULT →
            </Link>
          </footer>
        </div>
      </div>
    </>
  );
}
