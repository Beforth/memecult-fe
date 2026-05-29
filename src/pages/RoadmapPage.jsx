import './RoadmapPage.css';

export default function RoadmapPage() {
  return (
    <div className="cult-vortex-page">
      <div className="cult-vortex-container">
        <header className="vortex-page-header">
          <span className="vortex-page-tag">ROADMAP</span>
          <h1>ROADMAP</h1>
        </header>

        {/* Custom Premium Spiral Vortex Coming Soon Graphic */}
        <div className="vortex-graphic-wrapper">
          <div className="vortex-screen">
            {/* Swirling space/whirlpool background layers */}
            <div className="vortex-layer layer-1" />
            <div className="vortex-layer layer-2" />
            <div className="vortex-layer layer-3" />

            {/* Glowing helmet core in the absolute center */}
            <div className="vortex-center-core">
              <div className="vortex-core-ring" />
              <img src="/images/logo.png" alt="Futardio Core" className="vortex-core-logo" />
            </div>

            {/* COMING SOON text */}
            <div className="vortex-status-text">
              <h2>COMING SOON</h2>
              <p>PROPULSION STAGE ACTIVE</p>
            </div>
          </div>
        </div>

        <div className="vortex-description-card">
          <p className="vortex-primary-desc">
            We are designing an artistic, organic &quot;Tree of Life&quot; roadmap system with branching milestones. 
            Once launched, each branch will grow dynamically as community-driven goals are achieved.
          </p>
          <div className="roadmap-future-hints">
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
          </div>
        </div>
      </div>
    </div>
  );
}
