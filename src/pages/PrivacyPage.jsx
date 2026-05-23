import { useEffect, useState } from 'react';
import { getPublicContentPage } from '../api/client';

export default function PrivacyPage() {
  const [title, setTitle] = useState('Privacy');
  const [body, setBody] = useState('');

  useEffect(() => {
    let live = true;
    getPublicContentPage('privacy')
      .then((data) => {
        if (!live) return;
        setTitle(data.title || 'Privacy');
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
        <p>How MemeCult collects and uses data.</p>
      </div>

      <div className="neo-panel">
        {body ? (
          <div className="rich-content" dangerouslySetInnerHTML={{ __html: body }} />
        ) : (
          <p>No privacy policy content yet.</p>
        )}
      </div>
    </section>
  );
}
