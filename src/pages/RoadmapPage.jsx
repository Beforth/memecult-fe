import { useEffect, useState } from 'react';
import { getPublicRoadmap } from '../api/client';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:8000/api';
const API_ORIGIN = API_BASE.replace(/\/api\/?$/, '');

function withApiOrigin(url) {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${API_ORIGIN}${url.startsWith('/') ? '' : '/'}${url}`;
}

export default function RoadmapPage() {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    let live = true;
    getPublicRoadmap()
      .then((data) => {
        if (!live) return;
        setRows(Array.isArray(data) ? data : []);
      })
      .catch((err) => setError(err.message));
    return () => {
      live = false;
    };
  }, []);

  return (
    <section className="roadmap-shell cult-page-shell">
      <header className="roadmap-head cult-page-head">
        <h2>Roadmap</h2>
        <p>Live milestones managed from admin panel.</p>
      </header>

      {error ? <p className="error">{error}</p> : null}

      <div className="roadmap-grid-live">
        {rows.map((item) => (
          <article className="roadmap-card-live" key={item.id}>
            {item.image ? <img src={withApiOrigin(item.image)} alt={item.title} className="roadmap-thumb" /> : null}
            <div className="roadmap-meta">
              <span className={`roadmap-status ${item.status || 'planned'}`}>{item.status || 'planned'}</span>
              <h3>{item.title}</h3>
              <p>{item.description || 'No description yet.'}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
