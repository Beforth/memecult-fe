import { useMemo, useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  adminCreateCustomPage,
  adminGetCustomPage,
  adminUpdateCustomPage,
} from '../api/client';

const MARKER = 'MEMECULT_BUILDER:';

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function defaultBlock(type) {
  if (type === 'hero') return { id: uid(), type, title: 'Big headline', subtitle: 'Add your hero subtitle', bg: '#111111', color: '#ffffff' };
  if (type === 'text') return { id: uid(), type, heading: 'Section heading', body: '<p>Write your content here.</p>' };
  if (type === 'image') return { id: uid(), type, src: '', alt: '', caption: '' };
  if (type === 'two_col') return { id: uid(), type, left: '<h3>Left column</h3><p>Content</p>', right: '<h3>Right column</h3><p>Content</p>' };
  if (type === 'cta') return { id: uid(), type, title: 'Call to action', description: 'Convince users to click.', buttonText: 'Get Started', buttonPath: '/editor' };
  return { id: uid(), type: 'raw', html: '<section><h2>Custom HTML</h2><p>Write anything.</p></section>' };
}

function escapeHtml(v) {
  return String(v || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function blocksToHtml(blocks) {
  return blocks.map((b) => {
    if (b.type === 'hero') {
      return `<section style="padding:64px 24px;border-radius:14px;background:${escapeHtml(b.bg)};color:${escapeHtml(b.color)};margin:0 0 18px;"><h1 style="margin:0 0 10px;font-size:44px;line-height:1.1;">${escapeHtml(b.title)}</h1><p style="margin:0;font-size:18px;opacity:.9;">${escapeHtml(b.subtitle)}</p></section>`;
    }
    if (b.type === 'text') {
      return `<section style="padding:12px 4px 18px;"><h2 style="margin:0 0 12px;font-size:32px;">${escapeHtml(b.heading)}</h2><div>${b.body || ''}</div></section>`;
    }
    if (b.type === 'image') {
      return `<figure style="margin:0 0 18px;"><img src="${escapeHtml(b.src)}" alt="${escapeHtml(b.alt)}" style="display:block;width:100%;height:auto;border-radius:12px;" />${b.caption ? `<figcaption style="margin-top:8px;color:#bcbcbc;">${escapeHtml(b.caption)}</figcaption>` : ''}</figure>`;
    }
    if (b.type === 'two_col') {
      return `<section style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin:0 0 18px;"><div>${b.left || ''}</div><div>${b.right || ''}</div></section>`;
    }
    if (b.type === 'cta') {
      return `<section style="padding:24px;border:1px solid rgba(100,150,255,0.28);border-radius:14px;margin:0 0 18px;background:rgba(8,18,48,0.45);"><h3 style="margin:0 0 8px;font-size:30px;color:#e8eeff;">${escapeHtml(b.title)}</h3><p style="margin:0 0 14px;color:rgba(200,215,255,0.78);">${escapeHtml(b.description)}</p><a href="${escapeHtml(b.buttonPath)}" class="cult-cta-btn">${escapeHtml(b.buttonText)}</a></section>`;
    }
    return `<section style="margin:0 0 18px;">${b.html || ''}</section>`;
  }).join('');
}

function withBuilderMeta(blocks, html) {
  const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(blocks))));
  return `<!-- ${MARKER}${encoded} -->\n${html}`;
}

function parseBuilderMeta(body) {
  const m = String(body || '').match(/<!--\s*MEMECULT_BUILDER:([A-Za-z0-9+/=]+)\s*-->/);
  if (!m) return null;
  try {
    return JSON.parse(decodeURIComponent(escape(atob(m[1]))));
  } catch {
    return null;
  }
}

function HtmlRichEditor({ value, onChange, minHeight = 140 }) {
  const [sourceMode, setSourceMode] = useState(false);

  function exec(command, commandValue = null) {
    document.execCommand(command, false, commandValue);
  }

  return (
    <div className="mc-rte">
      <div className="mc-rte-toolbar">
        <button type="button" onClick={() => exec('bold')}><b>B</b></button>
        <button type="button" onClick={() => exec('italic')}><i>I</i></button>
        <button type="button" onClick={() => exec('underline')}><u>U</u></button>
        <button type="button" onClick={() => exec('insertUnorderedList')}>• List</button>
        <button type="button" onClick={() => exec('insertOrderedList')}>1. List</button>
        <button type="button" onClick={() => exec('formatBlock', 'h2')}>H2</button>
        <button type="button" onClick={() => exec('formatBlock', 'p')}>P</button>
        <button type="button" onClick={() => setSourceMode((v) => !v)}>{sourceMode ? 'Visual' : 'HTML'}</button>
      </div>

      {sourceMode ? (
        <textarea
          className="admin-builder-source"
          style={{ minHeight }}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <div
          className="mc-rte-editor"
          style={{ minHeight }}
          contentEditable
          suppressContentEditableWarning
          onInput={(e) => onChange(e.currentTarget.innerHTML)}
          dangerouslySetInnerHTML={{ __html: value || '' }}
        />
      )}
    </div>
  );
}

export default function AdminPageBuilder() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const id = Number(params.get('id') || 0) || null;
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [published, setPublished] = useState(true);
  const [blocks, setBlocks] = useState([defaultBlock('hero'), defaultBlock('text')]);

  useEffect(() => {
    if (!id) return;
    let live = true;
    setBusy(true);
    adminGetCustomPage(id)
      .then((row) => {
        if (!live) return;
        setTitle(row.title || '');
        setSlug(row.slug || '');
        setPublished(Boolean(row.is_published));
        const metaBlocks = parseBuilderMeta(row.body || '');
        if (Array.isArray(metaBlocks) && metaBlocks.length) {
          setBlocks(metaBlocks.map((b) => ({ ...b, id: b.id || uid() })));
        } else if (row.body) {
          setBlocks([{ id: uid(), type: 'raw', html: row.body }]);
        }
      })
      .catch((e) => setError(e.message || 'Failed to load page'))
      .finally(() => setBusy(false));
    return () => {
      live = false;
    };
  }, [id]);

  const previewHtml = useMemo(() => blocksToHtml(blocks), [blocks]);

  function addBlock(type) {
    setBlocks((prev) => [...prev, defaultBlock(type)]);
  }

  function patchBlock(blockId, patch) {
    setBlocks((prev) => prev.map((b) => (b.id === blockId ? { ...b, ...patch } : b)));
  }

  function moveBlock(blockId, dir) {
    setBlocks((prev) => {
      const i = prev.findIndex((b) => b.id === blockId);
      if (i < 0) return prev;
      const j = i + dir;
      if (j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  }

  function removeBlock(blockId) {
    setBlocks((prev) => prev.filter((b) => b.id !== blockId));
  }

  function uploadImageForBlock(blockId, file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = typeof reader.result === 'string' ? reader.result : '';
      if (!dataUrl) return;
      patchBlock(blockId, { src: dataUrl });
    };
    reader.readAsDataURL(file);
  }

  async function savePage() {
    if (!title.trim() || !slug.trim()) return;
    setBusy(true);
    setError('');
    try {
      const html = blocksToHtml(blocks);
      const body = withBuilderMeta(blocks, html);
      const payload = { title: title.trim(), slug: slug.trim(), body, is_published: published };
      if (id) {
        await adminUpdateCustomPage(id, payload);
      } else {
        await adminCreateCustomPage(payload);
      }
      navigate('/admin/panel?tab=site&siteSection=pages');
    } catch (e) {
      setError(e.message || 'Failed to save');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="admin-builder-shell">
      <div className="admin-builder-top">
        <h1>Custom Page Builder</h1>
        <div className="admin-builder-actions">
          <Link to="/admin/panel?tab=site&siteSection=pages" className="btn btn-outline">Back</Link>
          <button className="btn btn-lime" onClick={savePage} disabled={busy || !title.trim() || !slug.trim()}>
            {busy ? 'Saving...' : 'Save Page'}
          </button>
        </div>
      </div>

      {error ? <p className="error">{error}</p> : null}

      <div className="admin-builder-grid">
        <aside className="admin-builder-sidebar">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Page title" />
          <input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="Slug (about-us)" />
          <label className="admin-checkline">
            <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} />
            <span>Published</span>
          </label>
          <h3>Add Components</h3>
          <div className="admin-builder-buttons">
            <button onClick={() => addBlock('hero')}>Hero</button>
            <button onClick={() => addBlock('text')}>Text</button>
            <button onClick={() => addBlock('image')}>Image</button>
            <button onClick={() => addBlock('two_col')}>Two Columns</button>
            <button onClick={() => addBlock('cta')}>CTA</button>
            <button onClick={() => addBlock('raw')}>Raw HTML</button>
          </div>
        </aside>

        <section className="admin-builder-editor">
          {blocks.map((b, idx) => (
            <article key={b.id} className="admin-builder-block">
              <div className="admin-builder-block-head">
                <strong>{b.type.replace('_', ' ').toUpperCase()}</strong>
                <div>
                  <button onClick={() => moveBlock(b.id, -1)} disabled={idx === 0}>↑</button>
                  <button onClick={() => moveBlock(b.id, 1)} disabled={idx === blocks.length - 1}>↓</button>
                  <button onClick={() => removeBlock(b.id)}>Delete</button>
                </div>
              </div>

              {b.type === 'hero' ? (
                <div className="admin-builder-fields">
                  <input value={b.title || ''} onChange={(e) => patchBlock(b.id, { title: e.target.value })} placeholder="Hero title" />
                  <input value={b.subtitle || ''} onChange={(e) => patchBlock(b.id, { subtitle: e.target.value })} placeholder="Hero subtitle" />
                  <input value={b.bg || ''} onChange={(e) => patchBlock(b.id, { bg: e.target.value })} placeholder="Background color (#111111)" />
                  <input value={b.color || ''} onChange={(e) => patchBlock(b.id, { color: e.target.value })} placeholder="Text color (#ffffff)" />
                </div>
              ) : null}

              {b.type === 'text' ? (
                <div className="admin-builder-fields">
                  <input value={b.heading || ''} onChange={(e) => patchBlock(b.id, { heading: e.target.value })} placeholder="Heading" />
                  <HtmlRichEditor value={b.body || ''} onChange={(next) => patchBlock(b.id, { body: next })} minHeight={160} />
                </div>
              ) : null}

              {b.type === 'image' ? (
                <div className="admin-builder-fields">
                  <input value={b.src || ''} onChange={(e) => patchBlock(b.id, { src: e.target.value })} placeholder="Image URL" />
                  <label className="admin-file-upload">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => uploadImageForBlock(b.id, e.target.files?.[0])}
                    />
                    <span className="admin-file-upload-trigger">
                      <b>Upload Image</b>
                    </span>
                  </label>
                  <input value={b.alt || ''} onChange={(e) => patchBlock(b.id, { alt: e.target.value })} placeholder="Alt text" />
                  <input value={b.caption || ''} onChange={(e) => patchBlock(b.id, { caption: e.target.value })} placeholder="Caption" />
                </div>
              ) : null}

              {b.type === 'two_col' ? (
                <div className="admin-builder-fields">
                  <HtmlRichEditor value={b.left || ''} onChange={(next) => patchBlock(b.id, { left: next })} minHeight={130} />
                  <HtmlRichEditor value={b.right || ''} onChange={(next) => patchBlock(b.id, { right: next })} minHeight={130} />
                </div>
              ) : null}

              {b.type === 'cta' ? (
                <div className="admin-builder-fields">
                  <input value={b.title || ''} onChange={(e) => patchBlock(b.id, { title: e.target.value })} placeholder="CTA title" />
                  <input value={b.description || ''} onChange={(e) => patchBlock(b.id, { description: e.target.value })} placeholder="CTA description" />
                  <input value={b.buttonText || ''} onChange={(e) => patchBlock(b.id, { buttonText: e.target.value })} placeholder="Button text" />
                  <input value={b.buttonPath || ''} onChange={(e) => patchBlock(b.id, { buttonPath: e.target.value })} placeholder="Button path" />
                </div>
              ) : null}

              {b.type === 'raw' ? (
                <div className="admin-builder-fields">
                  <HtmlRichEditor value={b.html || ''} onChange={(next) => patchBlock(b.id, { html: next })} minHeight={180} />
                </div>
              ) : null}
            </article>
          ))}
        </section>

        <section className="admin-builder-preview">
          <h3>Preview (between navbar/footer)</h3>
          <div className="admin-builder-preview-frame">
            <div className="rich-content" dangerouslySetInnerHTML={{ __html: previewHtml }} />
          </div>
        </section>
      </div>
    </section>
  );
}
