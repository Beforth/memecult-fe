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
    <section className="page-shell">
      <div className="sec-head left">
        <h2>{title}</h2>
        <p>Need help with MemeCult? Reach us through the channels below.</p>
      </div>

      <div className="neo-panel">
        {body ? (
          <div className="rich-content" dangerouslySetInnerHTML={{ __html: body }} />
        ) : (
          <p>No support content yet.</p>
        )}
      </div>
    </section>
  );
}
