import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  adminListAssets,
  adminListAssetCategories,
  adminCreateAsset,
  adminUpdateAsset,
  adminDeleteAsset,
  adminBulkDeleteAssets,
  adminListRoadmap,
  adminCreateRoadmap,
  adminUpdateRoadmap,
  adminDeleteRoadmap,
  adminBulkDeleteRoadmap,
  adminListContentPages,
  adminCreateContentPage,
  adminUpdateContentPage,
} from '../api/client';

const NAV = [
  { id: 'dashboard', label: 'Overview' },
  { id: 'templates', label: 'Templates' },
  { id: 'stickers', label: 'Stickers' },
  { id: 'roadmap', label: 'Roadmap' },
  { id: 'privacy', label: 'Privacy Policy' },
  { id: 'support', label: 'Support' },
];

function CustomCheckbox({ checked, onChange, label = 'Select row' }) {
  return (
    <label className="mc-check" aria-label={label}>
      <input type="checkbox" checked={checked} onChange={onChange} />
      <span className="mc-check-box" />
    </label>
  );
}

function UploadIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <path d="M7 10l5-5 5 5" />
      <path d="M12 5v12" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function CustomDropdown({ value, options, onChange }) {
  const [open, setOpen] = useState(false);
  const active = options.find((o) => o.value === value) || options[0];

  return (
    <div className="mc-dropdown">
      <button type="button" className="mc-dropdown-trigger" onClick={() => setOpen((v) => !v)}>
        <span>{active?.label || value}</span>
        <ChevronDownIcon />
      </button>
      {open ? (
        <div className="mc-dropdown-menu">
          {options.map((opt) => (
            <button
              type="button"
              key={opt.value}
              className={`mc-dropdown-item ${value === opt.value ? 'active' : ''}`}
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function CategoryAutocomplete({ value, onChange, suggestions, onQuery, placeholder = 'Category' }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  const filtered = (suggestions || []).filter((s) => s && s.toLowerCase().includes((value || '').toLowerCase())).slice(0, 8);

  useEffect(() => {
    function handleOutside(e) {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  return (
    <div className="mc-autocomplete" ref={wrapRef}>
      <input
        value={value}
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          const v = e.target.value;
          onChange(v);
          onQuery?.(v);
          setOpen(true);
        }}
        placeholder={placeholder}
      />
      {open && filtered.length ? (
        <div className="mc-autocomplete-menu">
          {filtered.map((cat) => (
            <button
              type="button"
              key={cat}
              onClick={() => {
                onChange(cat);
                setOpen(false);
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function RichTextEditor({ value, onChange }) {
  const editorRef = useRef(null);

  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;
    if (el.innerHTML !== (value || '')) {
      el.innerHTML = value || '';
    }
  }, [value]);

  function exec(command, commandValue = null) {
    document.execCommand(command, false, commandValue);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
      editorRef.current.focus();
    }
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
        <button type="button" onClick={() => exec('removeFormat')}>Clear</button>
      </div>
      <div
        ref={editorRef}
        className="mc-rte-editor"
        contentEditable
        suppressContentEditableWarning
        onInput={(e) => onChange(e.currentTarget.innerHTML)}
      />
    </div>
  );
}

function qs(params) {
  const p = new URLSearchParams(params);
  const s = p.toString();
  return s ? `?${s}` : '';
}

export default function AdminPanelPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const urlTab = searchParams.get('tab');
  const tab = NAV.some((n) => n.id === urlTab) ? urlTab : 'dashboard';
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const [assetRows, setAssetRows] = useState([]);
  const [assetCount, setAssetCount] = useState(0);
  const [assetPage, setAssetPage] = useState(1);
  const [assetSearch, setAssetSearch] = useState('');
  const [assetCategoryFilter, setAssetCategoryFilter] = useState('');
  const [assetCategories, setAssetCategories] = useState([]);
  const [templateCategories, setTemplateCategories] = useState([]);
  const [stickerCategories, setStickerCategories] = useState([]);
  const [selectedAssets, setSelectedAssets] = useState([]);
  const [assetTitle, setAssetTitle] = useState('');
  const [assetCategory, setAssetCategory] = useState('');
  const [assetFile, setAssetFile] = useState(null);
  const [assetBulkFiles, setAssetBulkFiles] = useState([]);
  const [assetUploadMode, setAssetUploadMode] = useState('single');
  const [assetDropActive, setAssetDropActive] = useState(false);
  const [assetModalOpen, setAssetModalOpen] = useState(false);

  const [roadRows, setRoadRows] = useState([]);
  const [roadCount, setRoadCount] = useState(0);
  const [roadPage, setRoadPage] = useState(1);
  const [roadSearch, setRoadSearch] = useState('');
  const [selectedRoadmap, setSelectedRoadmap] = useState([]);
  const [roadTitle, setRoadTitle] = useState('');
  const [roadDesc, setRoadDesc] = useState('');
  const [roadStatus, setRoadStatus] = useState('planned');
  const [roadImage, setRoadImage] = useState(null);
  const [roadCreateModalOpen, setRoadCreateModalOpen] = useState(false);

  const [contentRows, setContentRows] = useState([]);
  const [contentTitle, setContentTitle] = useState('');
  const [contentBody, setContentBody] = useState('');
  const [previewAsset, setPreviewAsset] = useState(null);
  const [assetEditModal, setAssetEditModal] = useState(null);
  const [assetEditTitle, setAssetEditTitle] = useState('');
  const [assetEditCategory, setAssetEditCategory] = useState('');
  const [assetEditFile, setAssetEditFile] = useState(null);
  const [roadEditModal, setRoadEditModal] = useState(null);
  const [roadEditTitle, setRoadEditTitle] = useState('');
  const [roadEditImage, setRoadEditImage] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);
  const assetReqRef = useRef(0);
  const roadmapReqRef = useRef(0);

  useEffect(() => {
    if (localStorage.getItem('admin_auth') !== 'true' || !localStorage.getItem('admin_access_token')) {
      navigate('/admin/login');
      return;
    }
    if (!urlTab || !NAV.some((n) => n.id === urlTab)) {
      setSearchParams({ tab: 'dashboard' }, { replace: true });
    }
  }, [navigate, setSearchParams, urlTab]);

  function onTabChange(nextTab) {
    setSearchParams({ tab: nextTab });
  }

  useEffect(() => {
    if (tab === 'dashboard') run(() => Promise.all([loadAssets('', 1, '', ''), loadRoadmap(1, ''), loadContentPages()]));
    if (tab === 'templates') run(() => loadAssets('template', assetPage, assetSearch, assetCategoryFilter));
    if (tab === 'stickers') run(() => loadAssets('sticker', assetPage, assetSearch, assetCategoryFilter));
    if (tab === 'roadmap') run(() => loadRoadmap(roadPage, roadSearch));
    if (tab === 'privacy' || tab === 'support') run(async () => { await loadContentPages(); primeContentForm(tab); });
  }, [tab, assetPage, roadPage, assetCategoryFilter]);

  useEffect(() => {
    if (tab === 'dashboard') run(() => loadAssetCategories(''));
    if (tab === 'templates') run(() => loadAssetCategories('template'));
    if (tab === 'stickers') run(() => loadAssetCategories('sticker'));
  }, [tab]);

  async function run(action) {
    setBusy(true);
    setError('');
    try {
      await action();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function refreshDashboard() {
    await Promise.all([
      loadAssets('', 1, '', ''),
      loadRoadmap(1, ''),
      loadContentPages(),
    ]);
  }

  async function loadAssets(assetType, page = 1, search = '', category = '') {
    const reqId = ++assetReqRef.current;
    const params = { page, search, page_size: 8 };
    if (assetType) params.asset_type = assetType;
    if (category.trim()) params.category = category.trim();
    const data = await adminListAssets(qs(params));
    if (reqId !== assetReqRef.current) return;
    setAssetRows(data.results || []);
    setAssetCount(data.count || 0);
    setSelectedAssets([]);
  }

  async function loadAssetCategories(assetType, q = '') {
    const params = {};
    if (assetType) params.asset_type = assetType;
    if (q.trim()) params.q = q.trim();
    const data = await adminListAssetCategories(qs(params));
    const next = data.results || [];
    setAssetCategories(next);
    if (assetType === 'template') setTemplateCategories(next);
    if (assetType === 'sticker') setStickerCategories(next);
  }

  async function loadRoadmap(page = 1, search = '') {
    const reqId = ++roadmapReqRef.current;
    const data = await adminListRoadmap(qs({ page, search, page_size: 8 }));
    if (reqId !== roadmapReqRef.current) return;
    setRoadRows(data.results || []);
    setRoadCount(data.count || 0);
    setSelectedRoadmap([]);
  }

  async function loadContentPages() {
    const data = await adminListContentPages(qs({ page_size: 20 }));
    setContentRows(data.results || []);
  }

  function primeContentForm(kind) {
    const key = kind === 'privacy' ? 'privacy' : 'support';
    const row = contentRows.find((r) => r.page_type === key);
    setContentTitle(row?.title || '');
    setContentBody(row?.body || '');
  }

  function logout() {
    localStorage.removeItem('admin_auth');
    localStorage.removeItem('admin_access_token');
    localStorage.removeItem('admin_refresh_token');
    navigate('/admin/login');
  }

  async function createAsset(assetType) {
    if (!assetTitle || !assetFile) return;
    const fd = new FormData();
    fd.append('title', assetTitle);
    fd.append('category', assetCategory.trim());
    fd.append('asset_type', assetType);
    fd.append('file', assetFile);
    await adminCreateAsset(fd);
    setAssetTitle('');
    setAssetCategory('');
    setAssetFile(null);
    await loadAssets(assetType, assetPage, assetSearch, assetCategoryFilter);
    await loadAssetCategories(assetType, '');
  }

  function titleFromFileName(name) {
    if (!name) return 'Untitled';
    return name.replace(/\.[^/.]+$/, '').trim() || 'Untitled';
  }

  async function createAssetsBulk(assetType) {
    if (!assetBulkFiles.length) return;
    const category = assetCategory.trim();
    for (const file of assetBulkFiles) {
      const fd = new FormData();
      fd.append('title', titleFromFileName(file.name));
      fd.append('category', category);
      fd.append('asset_type', assetType);
      fd.append('file', file);
      await adminCreateAsset(fd);
    }
    setAssetBulkFiles([]);
    setAssetCategory('');
    await loadAssets(assetType, assetPage, assetSearch, assetCategoryFilter);
    await loadAssetCategories(assetType, '');
  }

  const modalPreviewUrl = assetFile ? URL.createObjectURL(assetFile) : '';

  function handleAssetFiles(fileList) {
    const files = Array.from(fileList || []).filter((f) => f.type?.startsWith('image/'));
    if (!files.length) return;
    if (assetUploadMode === 'bulk') {
      setAssetBulkFiles(files);
      setAssetFile(null);
      return;
    }
    setAssetFile(files[0]);
    setAssetBulkFiles([]);
  }

  async function renameAsset(asset) {
    const title = (assetEditTitle || '').trim();
    const category = (assetEditCategory || '').trim();
    if ((!title && !category && !assetEditFile) || !assetEditModal) return;
    const fd = new FormData();
    if (title) fd.append('title', title);
    fd.append('category', category);
    if (assetEditFile) fd.append('file', assetEditFile);
    await adminUpdateAsset(assetEditModal.id, fd);
    setAssetEditModal(null);
    setAssetEditTitle('');
    setAssetEditCategory('');
    setAssetEditFile(null);
    await loadAssets(tab === 'templates' ? 'template' : 'sticker', assetPage, assetSearch, assetCategoryFilter);
    await loadAssetCategories(tab === 'templates' ? 'template' : 'sticker', '');
  }

  async function createRoadmap() {
    if (!roadTitle) return;
    const fd = new FormData();
    fd.append('title', roadTitle);
    fd.append('description', roadDesc);
    fd.append('status', roadStatus);
    if (roadImage) fd.append('image', roadImage);
    await adminCreateRoadmap(fd);
    setRoadTitle('');
    setRoadDesc('');
    setRoadStatus('planned');
    setRoadImage(null);
    await loadRoadmap(roadPage, roadSearch);
  }

  async function editRoadmap(item) {
    const title = (roadEditTitle || '').trim();
    if ((!title && !roadEditImage) || !roadEditModal) return;
    const fd = new FormData();
    if (title) fd.append('title', title);
    if (roadEditImage) fd.append('image', roadEditImage);
    await adminUpdateRoadmap(roadEditModal.id, fd);
    setRoadEditModal(null);
    setRoadEditTitle('');
    setRoadEditImage(null);
    await loadRoadmap(roadPage, roadSearch);
  }

  async function saveContent(tabKey) {
    const key = tabKey === 'privacy' ? 'privacy' : 'support';
    const row = contentRows.find((r) => r.page_type === key);
    if (row) {
      await adminUpdateContentPage(row.id, { title: contentTitle, body: contentBody, is_published: true });
    } else {
      await adminCreateContentPage({ page_type: key, title: contentTitle, body: contentBody, is_published: true });
    }
    await loadContentPages();
  }

  async function runConfirmedDelete() {
    if (!confirmModal || typeof confirmModal.onConfirm !== 'function') return;
    await confirmModal.onConfirm();
    setConfirmModal(null);
  }

  const activeAssetType = tab === 'templates' ? 'template' : 'sticker';
  const isAssetTab = tab === 'templates' || tab === 'stickers';
  const assetLabel = tab === 'stickers' ? 'Sticker' : 'Template';
  const activeCategorySuggestions = tab === 'stickers' ? stickerCategories : templateCategories;
  const totalAssetPages = Math.max(1, Math.ceil(assetCount / 8));
  const totalRoadPages = Math.max(1, Math.ceil(roadCount / 8));

  const templatesPreview = useMemo(() => assetRows.slice(0, 4), [assetRows]);

  return (
    <section className="admin-shell">
      <aside className="admin-side">
        <div className="admin-side-logo">
          <img src="/images/memecult-logo.png" alt="MemeCult" />
        </div>

        <div className="admin-side-title">Dashboard</div>
        {NAV.map((item) => (
          <button
            key={item.id}
            className={`admin-side-item ${tab === item.id ? 'active' : ''}`}
            onClick={() => onTabChange(item.id)}
          >
            {item.label}
          </button>
        ))}

        <div className="admin-side-title">System</div>
        <button className="admin-side-item" onClick={logout}>Logout</button>
      </aside>

      <main className="admin-main">
        <div className="admin-topbar">
          <div className="admin-title-block">
            <h1>Admin Control Room</h1>
            <p>Manage memes, templates, stickers, roadmap and page content.</p>
          </div>
          <div className="admin-actions">
            <button className="btn btn-outline" onClick={() => run(refreshDashboard)} disabled={busy}>Refresh</button>
            {isAssetTab ? (
              <button className="btn btn-lime" onClick={() => setAssetModalOpen(true)} disabled={busy}>+ Add {assetLabel}</button>
            ) : null}
            {tab === 'roadmap' ? (
              <button className="btn btn-lime" onClick={() => setRoadCreateModalOpen(true)} disabled={busy}>+ Add Roadmap</button>
            ) : null}
          </div>
        </div>

        {error ? <p className="error">{error}</p> : null}

        {tab === 'dashboard' ? (
          <>
            <section className="admin-cards">
              <article className="admin-card"><h3>Total Templates</h3><strong>{assetCount}</strong><small>Live catalog size</small></article>
              <article className="admin-card"><h3>Roadmap Items</h3><strong>{roadCount}</strong><small>Current milestones</small></article>
              <article className="admin-card"><h3>Content Pages</h3><strong>{contentRows.length}</strong><small>Support + privacy</small></article>
              <article className="admin-card"><h3>Status</h3><strong>Healthy</strong><small>Django API connected</small></article>
            </section>

            <section className="admin-grid-2">
              <div className="admin-panel">
                <div className="admin-panel-head">
                  <h2>Recent Assets</h2>
                  <input className="search" placeholder="Search assets..." value={assetSearch} onChange={(e) => setAssetSearch(e.target.value)} />
                </div>
                <table className="table admin-assets-table">
                  <colgroup>
                    <col style={{ width: '90px' }} />
                    <col style={{ width: '28%' }} />
                    <col style={{ width: '16%' }} />
                    <col style={{ width: '12%' }} />
                    <col style={{ width: '26%' }} />
                    <col style={{ width: '18%' }} />
                  </colgroup>
                  <thead><tr><th>Preview</th><th>Title</th><th>Category</th><th>Type</th><th>Owner</th><th>Created</th></tr></thead>
                  <tbody>
                    {assetRows.map((row) => (
                      <tr key={row.id}>
                        <td>
                          <button className="asset-thumb" onClick={() => setPreviewAsset(row)} title="Preview">
                            <img src={row.file} alt={row.title} />
                          </button>
                        </td>
                        <td className="asset-title">{row.title}</td>
                        <td>{row.category || '-'}</td>
                        <td><span className="badge-chip">{row.asset_type}</span></td>
                        <td>{row.owner_email || '-'}</td>
                        <td>{new Date(row.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="admin-panel">
                <div className="admin-panel-head"><h2>Quick Actions</h2></div>
                <div className="admin-quick-list">
                  <button className="admin-quick" onClick={() => onTabChange('templates')}><b>Manage Templates</b><span>→</span></button>
                  <button className="admin-quick" onClick={() => onTabChange('stickers')}><b>Manage Stickers</b><span>→</span></button>
                  <button className="admin-quick" onClick={() => onTabChange('roadmap')}><b>Edit Roadmap</b><span>→</span></button>
                  <button className="admin-quick" onClick={() => onTabChange('privacy')}><b>Update Privacy Policy</b><span>→</span></button>
                </div>
              </div>
            </section>

            <section className="admin-panel" style={{ marginTop: 20 }}>
              <div className="admin-panel-head"><h2>Trending Templates Preview</h2></div>
              <div className="admin-template-grid">
                {templatesPreview.map((item) => (
                  <div key={item.id} className="admin-template">
                    <img src={item.file} alt={item.title} />
                    <b>{item.title}</b>
                  </div>
                ))}
              </div>
            </section>
          </>
        ) : null}

        {isAssetTab ? (
          <section className="admin-panel">
            <div className="admin-panel-head"><h2>{assetLabel}s</h2></div>
            <div className="admin-form-row">
              <input value={assetSearch} onChange={(e) => setAssetSearch(e.target.value)} placeholder="Search" />
              <CategoryAutocomplete
                value={assetCategoryFilter}
                onChange={setAssetCategoryFilter}
                suggestions={activeCategorySuggestions}
                onQuery={(q) => loadAssetCategories(activeAssetType, q)}
                placeholder="Category"
              />
              <button className="btn btn-outline" onClick={() => run(() => loadAssets(activeAssetType, 1, assetSearch, assetCategoryFilter))}>Search</button>
              <button
                className="btn btn-outline"
                onClick={() => {
                  if (!selectedAssets.length) return;
                  setConfirmModal({
                    title: 'Delete Selected Assets',
                    message: `Delete ${selectedAssets.length} selected ${assetLabel.toLowerCase()}(s)? This cannot be undone.`,
                    confirmText: 'Delete',
                    onConfirm: async () => {
                      await adminBulkDeleteAssets(selectedAssets);
                      await loadAssets(activeAssetType, assetPage, assetSearch, assetCategoryFilter);
                    },
                  });
                }}
              >
                Bulk Delete
              </button>
              <button className="btn btn-lime" onClick={() => setAssetModalOpen(true)}>+ Create {assetLabel}</button>
            </div>
            <table className="mc-list-table">
              <thead><tr><th><CustomCheckbox checked={assetRows.length > 0 && selectedAssets.length === assetRows.length} onChange={(e) => setSelectedAssets(e.target.checked ? assetRows.map((r) => r.id) : [])} label="Select all assets" /></th><th>Preview</th><th>Title</th><th>Category</th><th>Owner</th><th>Date</th><th>Actions</th></tr></thead>
              <tbody>
                {assetRows.map((row) => (
                  <tr key={row.id}>
                    <td><CustomCheckbox checked={selectedAssets.includes(row.id)} onChange={(e) => setSelectedAssets((prev) => e.target.checked ? [...prev, row.id] : prev.filter((x) => x !== row.id))} label={`Select ${row.title}`} /></td>
                    <td>
                      <button className="asset-thumb" onClick={() => setPreviewAsset(row)} title="Preview">
                        <img src={row.file} alt={row.title} />
                      </button>
                    </td>
                    <td className="asset-title">{row.title}</td>
                    <td>{row.category || '-'}</td>
                    <td>{row.owner_email || '-'}</td>
                    <td>{new Date(row.created_at).toLocaleDateString()}</td>
                    <td className="mc-actions-cell">
                      <button onClick={() => { setAssetEditModal(row); setAssetEditTitle(row.title || ''); setAssetEditCategory(row.category || ''); setAssetEditFile(null); }}>Edit</button>
                      <button
                        onClick={() =>
                          setConfirmModal({
                            title: 'Delete Asset',
                            message: `Delete "${row.title}"? This cannot be undone.`,
                            confirmText: 'Delete',
                            onConfirm: async () => {
                              await adminDeleteAsset(row.id);
                              await loadAssets(activeAssetType, assetPage, assetSearch, assetCategoryFilter);
                            },
                          })
                        }
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="admin-pager">
              <button disabled={assetPage <= 1} onClick={() => setAssetPage((p) => p - 1)}>Prev</button>
              <span>{assetPage} / {totalAssetPages}</span>
              <button disabled={assetPage >= totalAssetPages} onClick={() => setAssetPage((p) => p + 1)}>Next</button>
            </div>
          </section>
        ) : null}

        {tab === 'roadmap' ? (
          <section className="admin-panel">
            <div className="admin-panel-head"><h2>Roadmap</h2></div>
            <div className="admin-form-row">
              <input value={roadSearch} onChange={(e) => setRoadSearch(e.target.value)} placeholder="Search" />
              <button className="btn btn-outline" onClick={() => run(() => loadRoadmap(1, roadSearch))}>Search</button>
              <button
                className="btn btn-outline"
                onClick={() => {
                  if (!selectedRoadmap.length) return;
                  setConfirmModal({
                    title: 'Delete Selected Roadmap Items',
                    message: `Delete ${selectedRoadmap.length} selected roadmap item(s)? This cannot be undone.`,
                    confirmText: 'Delete',
                    onConfirm: async () => {
                      await adminBulkDeleteRoadmap(selectedRoadmap);
                      await loadRoadmap(roadPage, roadSearch);
                    },
                  });
                }}
              >
                Bulk Delete
              </button>
              <button className="btn btn-lime" onClick={() => setRoadCreateModalOpen(true)}>+ Add Roadmap</button>
            </div>
            <table className="mc-list-table">
              <thead><tr><th><CustomCheckbox checked={roadRows.length > 0 && selectedRoadmap.length === roadRows.length} onChange={(e) => setSelectedRoadmap(e.target.checked ? roadRows.map((r) => r.id) : [])} label="Select all roadmap rows" /></th><th>Preview</th><th>Title</th><th>Status</th><th>Updated</th><th>Actions</th></tr></thead>
              <tbody>
                {roadRows.map((row) => (
                  <tr key={row.id}>
                    <td><CustomCheckbox checked={selectedRoadmap.includes(row.id)} onChange={(e) => setSelectedRoadmap((prev) => e.target.checked ? [...prev, row.id] : prev.filter((x) => x !== row.id))} label={`Select ${row.title}`} /></td>
                    <td>
                      {row.image ? (
                        <button className="asset-thumb" onClick={() => setPreviewAsset({ title: row.title, file: row.image })} title="Preview">
                          <img src={row.image} alt={row.title} />
                        </button>
                      ) : (
                        <span className="badge-chip">No image</span>
                      )}
                    </td>
                    <td>{row.title}</td>
                    <td><span className="badge-chip">{row.status}</span></td>
                    <td>{new Date(row.updated_at).toLocaleDateString()}</td>
                    <td className="mc-actions-cell">
                      <button onClick={() => { setRoadEditModal(row); setRoadEditTitle(row.title || ''); setRoadEditImage(null); }}>Edit</button>
                      <button
                        onClick={() =>
                          setConfirmModal({
                            title: 'Delete Roadmap Item',
                            message: `Delete "${row.title}"? This cannot be undone.`,
                            confirmText: 'Delete',
                            onConfirm: async () => {
                              await adminDeleteRoadmap(row.id);
                              await loadRoadmap(roadPage, roadSearch);
                            },
                          })
                        }
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="admin-pager">
              <button disabled={roadPage <= 1} onClick={() => setRoadPage((p) => p - 1)}>Prev</button>
              <span>{roadPage} / {totalRoadPages}</span>
              <button disabled={roadPage >= totalRoadPages} onClick={() => setRoadPage((p) => p + 1)}>Next</button>
            </div>
          </section>
        ) : null}

        {(tab === 'privacy' || tab === 'support') ? (
          <section className="admin-panel">
            <div className="admin-panel-head"><h2>{tab === 'privacy' ? 'Privacy Policy' : 'Support Page'}</h2></div>
            <div className="admin-content-form">
              <input value={contentTitle} onChange={(e) => setContentTitle(e.target.value)} placeholder="Page title" />
              <RichTextEditor value={contentBody} onChange={setContentBody} />
              <button className="btn btn-lime" onClick={() => run(() => saveContent(tab))}>Save</button>
            </div>
          </section>
        ) : null}
      </main>


      {assetModalOpen ? (
        <div className="admin-modal-overlay" onClick={() => setAssetModalOpen(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Create {assetLabel}</h3>
            <p>Upload image(s) and create new {assetLabel.toLowerCase()} assets.</p>
            <div className="admin-form-row">
              <button className={`btn ${assetUploadMode === 'single' ? 'btn-lime' : 'btn-outline'}`} onClick={() => setAssetUploadMode('single')}>Single</button>
              <button className={`btn ${assetUploadMode === 'bulk' ? 'btn-lime' : 'btn-outline'}`} onClick={() => setAssetUploadMode('bulk')}>Bulk</button>
            </div>
            {assetUploadMode === 'single' ? (
              <input value={assetTitle} onChange={(e) => setAssetTitle(e.target.value)} placeholder="Title" />
            ) : null}
            <CategoryAutocomplete
              value={assetCategory}
              onChange={setAssetCategory}
              suggestions={activeCategorySuggestions}
              onQuery={(q) => loadAssetCategories(activeAssetType, q)}
              placeholder="Category (e.g. Trending, Anime)"
            />
            <label className="admin-file-upload">
              <input
                type="file"
                accept="image/*"
                multiple={assetUploadMode === 'bulk'}
                onChange={(e) => {
                  handleAssetFiles(e.target.files);
                }}
              />
              <span
                className={`admin-file-upload-trigger ${assetDropActive ? 'drag-active' : ''}`}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setAssetDropActive(true);
                }}
                onDragEnter={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setAssetDropActive(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setAssetDropActive(false);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setAssetDropActive(false);
                  handleAssetFiles(e.dataTransfer.files);
                }}
              >
                <UploadIcon />
                <b>
                  {assetUploadMode === 'bulk'
                    ? (assetBulkFiles.length ? `Selected ${assetBulkFiles.length} image(s)` : `Choose ${assetLabel.toLowerCase()} images`)
                    : (assetFile ? 'Change image' : `Choose ${assetLabel.toLowerCase()} image`)}
                </b>
              </span>
              <small>
                {assetUploadMode === 'bulk'
                  ? (assetBulkFiles.length ? `${assetBulkFiles[0].name}${assetBulkFiles.length > 1 ? ` +${assetBulkFiles.length - 1} more` : ''}` : 'PNG, JPG, WEBP supported')
                  : (assetFile ? assetFile.name : 'PNG, JPG, WEBP supported')}
              </small>
            </label>
            {assetUploadMode === 'single' && modalPreviewUrl ? (
              <div className="admin-upload-preview">
                <img src={modalPreviewUrl} alt="Upload preview" />
              </div>
            ) : null}
            {assetUploadMode === 'bulk' && assetBulkFiles.length ? (
              <div className="admin-upload-preview">
                <ul className="admin-bulk-list">
                  {assetBulkFiles.map((f) => (
                    <li key={`${f.name}-${f.size}`}>{titleFromFileName(f.name)}</li>
                  ))}
                </ul>
              </div>
            ) : null}
            <div className="admin-modal-actions">
              <button className="btn btn-outline" onClick={() => setAssetModalOpen(false)}>Cancel</button>
              <button
                className="btn btn-lime"
                disabled={busy || (assetUploadMode === 'single' ? (!assetTitle || !assetFile) : assetBulkFiles.length === 0)}
                onClick={() => run(async () => {
                  if (assetUploadMode === 'bulk') await createAssetsBulk(activeAssetType);
                  else await createAsset(activeAssetType);
                  setAssetModalOpen(false);
                })}
              >
                {assetUploadMode === 'bulk' ? 'Upload All' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      ) : null}



      {previewAsset ? (
        <div className="admin-modal-overlay" onClick={() => setPreviewAsset(null)}>
          <div className="admin-preview-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-preview-head">
              <h3>{previewAsset.title}</h3>
              <button className="btn btn-outline" onClick={() => setPreviewAsset(null)}>Close</button>
            </div>
            <img src={previewAsset.file} alt={previewAsset.title} className="admin-preview-image" />
          </div>
        </div>
      ) : null}

      {assetEditModal ? (
        <div className="admin-modal-overlay" onClick={() => setAssetEditModal(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Edit Asset</h3>
            <p>Update title or replace image for this asset.</p>
            <input value={assetEditTitle} onChange={(e) => setAssetEditTitle(e.target.value)} placeholder="Title" />
            <CategoryAutocomplete
              value={assetEditCategory}
              onChange={setAssetEditCategory}
              suggestions={activeCategorySuggestions}
              onQuery={(q) => loadAssetCategories(activeAssetType, q)}
              placeholder="Category"
            />
            <label className="admin-file-upload">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setAssetEditFile(e.target.files?.[0] || null)}
              />
              <span className="admin-file-upload-trigger">
                <UploadIcon />
                <b>{assetEditFile ? 'Change image' : 'Replace image'}</b>
              </span>
              <small>{assetEditFile ? assetEditFile.name : 'PNG, JPG, WEBP supported'}</small>
            </label>
            <div className="admin-upload-preview">
              <img src={assetEditFile ? URL.createObjectURL(assetEditFile) : assetEditModal.file} alt="Asset preview" />
            </div>
            <div className="admin-modal-actions">
              <button className="btn btn-outline" onClick={() => { setAssetEditModal(null); setAssetEditCategory(''); setAssetEditFile(null); }}>Cancel</button>
              <button className="btn btn-lime" disabled={busy || (!assetEditTitle.trim() && !assetEditCategory.trim() && !assetEditFile)} onClick={() => run(() => renameAsset(assetEditModal))}>Save</button>
            </div>
          </div>
        </div>
      ) : null}

      {roadEditModal ? (
        <div className="admin-modal-overlay" onClick={() => setRoadEditModal(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Edit Roadmap Item</h3>
            <p>Update title for this roadmap item.</p>
            <input value={roadEditTitle} onChange={(e) => setRoadEditTitle(e.target.value)} placeholder="Title" />
            <label className="admin-file-upload">
              <input type="file" accept="image/*" onChange={(e) => setRoadEditImage(e.target.files?.[0] || null)} />
              <span className="admin-file-upload-trigger">
                <UploadIcon />
                <b>{roadEditImage ? 'Change image' : 'Replace image'}</b>
              </span>
              <small>{roadEditImage ? roadEditImage.name : 'PNG, JPG, WEBP supported'}</small>
            </label>
            {(roadEditImage || roadEditModal?.image) ? (
              <div className="admin-upload-preview">
                <img src={roadEditImage ? URL.createObjectURL(roadEditImage) : roadEditModal.image} alt="Roadmap preview" />
              </div>
            ) : null}
            <div className="admin-modal-actions">
              <button className="btn btn-outline" onClick={() => setRoadEditModal(null)}>Cancel</button>
              <button className="btn btn-lime" disabled={busy || (!roadEditTitle.trim() && !roadEditImage)} onClick={() => run(() => editRoadmap(roadEditModal))}>Save</button>
            </div>
          </div>
        </div>
      ) : null}

      {roadCreateModalOpen ? (
        <div className="admin-modal-overlay" onClick={() => setRoadCreateModalOpen(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Create Roadmap Item</h3>
            <p>Add a new roadmap milestone.</p>
            <input value={roadTitle} onChange={(e) => setRoadTitle(e.target.value)} placeholder="Roadmap title" />
            <input value={roadDesc} onChange={(e) => setRoadDesc(e.target.value)} placeholder="Description" />
            <label className="admin-file-upload">
              <input type="file" accept="image/*" onChange={(e) => setRoadImage(e.target.files?.[0] || null)} />
              <span className="admin-file-upload-trigger">
                <UploadIcon />
                <b>{roadImage ? 'Change image' : 'Choose roadmap image'}</b>
              </span>
              <small>{roadImage ? roadImage.name : 'Optional image'}</small>
            </label>
            {roadImage ? (
              <div className="admin-upload-preview">
                <img src={URL.createObjectURL(roadImage)} alt="Roadmap upload preview" />
              </div>
            ) : null}
            <CustomDropdown
              value={roadStatus}
              onChange={setRoadStatus}
              options={[
                { value: 'planned', label: 'Planned' },
                { value: 'active', label: 'Active' },
                { value: 'done', label: 'Done' },
              ]}
            />
            <div className="admin-modal-actions">
              <button className="btn btn-outline" onClick={() => setRoadCreateModalOpen(false)}>Cancel</button>
              <button
                className="btn btn-lime"
                disabled={busy || !roadTitle.trim()}
                onClick={() => run(async () => {
                  await createRoadmap();
                  setRoadCreateModalOpen(false);
                })}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {confirmModal ? (
        <div className="admin-modal-overlay" onClick={() => setConfirmModal(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <h3>{confirmModal.title}</h3>
            <p>{confirmModal.message}</p>
            <div className="admin-modal-actions">
              <button className="btn btn-outline" onClick={() => setConfirmModal(null)}>Cancel</button>
              <button className="btn btn-lime" disabled={busy} onClick={() => run(runConfirmedDelete)}>{confirmModal.confirmText || 'Confirm'}</button>
            </div>
          </div>
        </div>
      ) : null}

    </section>
  );
}
