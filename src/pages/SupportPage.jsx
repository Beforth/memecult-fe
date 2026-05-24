import { useEffect, useState } from 'react';
import { getPublicContentPage } from '../api/client';

export default function SupportPage() {
  const [title, setTitle] = useState('Support');
  const [body, setBody] = useState('');

  useEffect(() => {
    let live = true;
    getPublicContentPage('support')
      .then((data) => {
        if (!live) return;
        setTitle(data.title || 'Support');
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
        <p>Need help with MemeCult? Reach us through the channels below.</p>
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
