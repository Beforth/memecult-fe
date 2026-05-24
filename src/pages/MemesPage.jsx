import { useEffect, useMemo, useRef, useState } from 'react';
import { likeMeme, listMemes } from '../api/client';

function qs(params) {
  const p = new URLSearchParams(params);
  const s = p.toString();
  return s ? `?${s}` : '';
}

function MemesPage() {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [busy, setBusy] = useState(false);
  const [q, setQ] = useState('');
  const [tag, setTag] = useState('');
  const [error, setError] = useState('');
  const sentinelRef = useRef(null);

  const token = localStorage.getItem('access_token') || '';

  useEffect(() => {
    setItems([]);
    setPage(1);
    setHasMore(true);
  }, [q, tag]);

  useEffect(() => {
    load(page, page === 1);
  }, [page, q, tag]);

  useEffect(() => {
    const obs = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore && !busy) {
        setPage((p) => p + 1);
      }
    }, { rootMargin: '300px' });
    if (sentinelRef.current) obs.observe(sentinelRef.current);
    return () => obs.disconnect();
  }, [hasMore, busy]);

  async function load(nextPage, reset = false) {
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      const data = await listMemes(qs({ page: nextPage, page_size: 18, q, tags: tag }));
      const rows = data.results || [];
      setItems((prev) => reset ? rows : [...prev, ...rows]);
      setHasMore(Boolean(data.next));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function onLike(meme) {
    if (!token) return;
    try {
      const res = await likeMeme(meme.id, token);
      setItems((prev) => prev.map((m) => m.id === meme.id ? {
        ...m,
        is_liked: true,
        likes_count: res.likes_count,
      } : m));
    } catch (err) {
      setError(err.message);
    }
  }

  const tags = useMemo(() => ['funny', 'gaming', 'anime', 'classic', 'reaction', 'dark'], []);

  return (
    <section className="memes-shell cult-page-shell">
      <header className="memes-head cult-page-head">
        <h2>Memes</h2>
        <p>Community feed of published memes.</p>
      </header>

      <div className="memes-controls">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search memes, creators, captions" />
        <select value={tag} onChange={(e) => setTag(e.target.value)}>
          <option value="">All tags</option>
          {tags.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {error ? <p className="error">{error}</p> : null}

      <div className="memes-masonry">
        {items.map((meme) => (
          <article className="meme-pin" key={meme.id}>
            <img src={meme.image} alt={meme.title} loading="lazy" />
            <div className="meme-pin-meta">
              <h3>{meme.title}</h3>
              <p>{meme.owner_name}</p>
              <div className="meme-pin-actions">
                <span>{meme.likes_count || 0} likes</span>
                <button disabled={!token || meme.is_liked} onClick={() => onLike(meme)}>
                  {meme.is_liked ? 'Liked' : 'Like'}
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div ref={sentinelRef} className="memes-sentinel">{busy ? 'Loading...' : hasMore ? '' : 'No more memes'}</div>
    </section>
  );
}

export default MemesPage;
