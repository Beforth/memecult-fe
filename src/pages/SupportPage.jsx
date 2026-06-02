import { useEffect, useState } from 'react';
import { getPublicContentPage } from '../api/client';

export default function SupportPage() {
  const [title, setTitle] = useState('Support');
  const [subtitle, setSubtitle] = useState('Need help with MemeCult? Reach us through the channels below.');
  const [body, setBody] = useState('');

  useEffect(() => {
    let live = true;
    getPublicContentPage('support')
      .then((data) => {
        if (!live) return;
        setTitle(data.title || 'Support');
        setSubtitle(data.subtitle || 'Need help with MemeCult? Reach us through the channels below.');
        setBody(data.body || '');
      })
      .catch(() => {});
    return () => {
      live = false;
    };
  }, []);

  return (
    <section className="page-shell cult-page-shell">
      <header className="sec-head left cult-page-head">
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </header>

      <div className="neo-panel cult-glass-panel">
        {body ? (
          <div className="rich-content" dangerouslySetInnerHTML={{ __html: body }} />
        ) : (
          <p>No support content yet.</p>
        )}
      </div>
    </section>
  );
}
