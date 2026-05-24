import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getPublicPageBySlug } from '../api/client';

export default function CustomPage() {
  const { slug } = useParams();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let live = true;
    setError('');
    getPublicPageBySlug(slug)
      .then((data) => {
        if (!live) return;
        setTitle(data.title || slug);
        setBody(data.body || '');
      })
      .catch(() => {
        if (!live) return;
        setError('Page not found');
      });
    return () => {
      live = false;
    };
  }, [slug]);

  return (
    <section className="page-shell cult-page-shell">
      <header className="sec-head left cult-page-head">
        <h2>{title || slug}</h2>
      </header>
      <div className="neo-panel cult-glass-panel">
        {error ? <p>{error}</p> : <div className="rich-content" dangerouslySetInnerHTML={{ __html: body }} />}
      </div>
    </section>
  );
}
