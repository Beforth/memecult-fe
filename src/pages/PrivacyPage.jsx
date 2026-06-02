import { useEffect, useState } from 'react';
import { getPublicContentPage } from '../api/client';

export default function PrivacyPage() {
  const [title, setTitle] = useState('Privacy');
  const [subtitle, setSubtitle] = useState('How MemeCult collects and uses data.');
  const [body, setBody] = useState('');

  useEffect(() => {
    let live = true;
    getPublicContentPage('privacy')
      .then((data) => {
        if (!live) return;
        setTitle(data.title || 'Privacy');
        setSubtitle(data.subtitle || 'How MemeCult collects and uses data.');
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
          <p>No privacy policy content yet.</p>
        )}
      </div>
    </section>
  );
}
