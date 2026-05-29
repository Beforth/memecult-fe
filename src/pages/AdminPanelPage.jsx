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
  adminListSiteConfig,
  adminGetSiteConfig,
  adminCreateSiteConfig,
  adminUpdateSiteConfig,
  adminDeleteSiteConfig,
  adminUpdateSiteConfigNav,
  adminUpdateSiteConfigFooterSections,
  adminUpdateSiteConfigFooterCta,
  adminUpdateSiteConfigLoader,
  adminUpdateSiteConfigBranding,
  adminUpdateSiteConfigHero,
  adminUpdateSiteConfigHomeBar,
  adminUpdateSiteConfigResourcesPage,
  adminUpdateSiteConfigPageBackgrounds,
  adminActivateSiteConfig,
  adminListCustomPages,
  adminCreateCustomPage,
  adminUpdateCustomPage,
  adminDeleteCustomPage,
  getPublicSiteConfig,
} from '../api/client';
import { DEFAULT_HERO_CONTENT } from '../utils/heroContent';
import { cloneHomeBarForEditor, DEFAULT_HOME_BAR } from '../utils/homeBar';
import { cloneNavItemsForEditor, DEFAULT_NAV_ITEMS } from '../utils/navItems';
import { DEFAULT_SITE_LOGO, normalizeMediaUrl, resolveSiteLogo } from '../utils/siteMedia';

const NAV = [
  { id: 'dashboard', label: 'Overview' },
  { id: 'templates', label: 'Templates' },
  { id: 'stickers', label: 'Stickers' },
  { id: 'roadmap', label: 'Roadmap' },
  { id: 'privacy', label: 'Privacy Policy' },
  { id: 'support', label: 'Support' },
  { id: 'site', label: 'Site CMS' },
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

function EditIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6M14 11v6" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m20 6-11 11-5-5" />
    </svg>
  );
}

function ActiveDotIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <circle cx="12" cy="12" r="6" />
    </svg>
  );
}

function cmsSavePayload({ navItems, footerSections, footerCta, loaderBgType, loaderBgColor, loaderGifFile, loaderBgFile }) {
  const fd = new FormData();
  fd.append('nav_items', JSON.stringify(navItems));
  fd.append('footer_sections', JSON.stringify(footerSections));
  fd.append('footer_cta', JSON.stringify(footerCta));
  fd.append('loader_background_type', loaderBgType);
  fd.append('loader_background_color', loaderBgColor);
  if (loaderGifFile) fd.append('loader_gif', loaderGifFile);
  if (loaderBgFile) fd.append('loader_background_media', loaderBgFile);
  return fd;
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
  const siteConfigIdParam = searchParams.get('siteConfigId');
  const siteSectionParam = searchParams.get('siteSection');
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
  const [roadPhase, setRoadPhase] = useState('');
  const [roadPeriod, setRoadPeriod] = useState('');
  const [roadStatus, setRoadStatus] = useState('planned');
  const [roadImage, setRoadImage] = useState(null);
  const [roadCreateModalOpen, setRoadCreateModalOpen] = useState(false);

  const [contentRows, setContentRows] = useState([]);
  const [contentTitle, setContentTitle] = useState('');
  const [contentBody, setContentBody] = useState('');
  const [siteConfigId, setSiteConfigId] = useState(null);
  const [siteConfigRows, setSiteConfigRows] = useState([]);
  const [selectedSiteConfigs, setSelectedSiteConfigs] = useState([]);
  const [newSiteConfigName, setNewSiteConfigName] = useState('');
  const [siteConfigName, setSiteConfigName] = useState('');
  const [siteNavItems, setSiteNavItems] = useState([]);
  const [siteFooterSections, setSiteFooterSections] = useState([]);
  const [siteFooterCta, setSiteFooterCta] = useState({
    title: '',
    description: '',
    button_text: '',
    button_path: '',
    external: false,
  });
  const [loaderBgType, setLoaderBgType] = useState('color');
  const [loaderBgColor, setLoaderBgColor] = useState('#E3F7FD');
  const [loaderGifFile, setLoaderGifFile] = useState(null);
  const [loaderBgFile, setLoaderBgFile] = useState(null);
  const [loaderGifUrl, setLoaderGifUrl] = useState('');
  const [introVideoFile, setIntroVideoFile] = useState(null);
  const [introVideoUrl, setIntroVideoUrl] = useState('');
  const [clearIntroVideo, setClearIntroVideo] = useState(false);
  const [loaderBgUrl, setLoaderBgUrl] = useState('');
  const [loaderBgHex, setLoaderBgHex] = useState('#E3F7FD');
  const [loaderFrequencyHours, setLoaderFrequencyHours] = useState(24);
  const [siteLogoFile, setSiteLogoFile] = useState(null);
  const [footerLogoFile, setFooterLogoFile] = useState(null);
  const [siteLogoUrl, setSiteLogoUrl] = useState('');
  const [footerLogoUrl, setFooterLogoUrl] = useState('');
  const [adminLogoSrc, setAdminLogoSrc] = useState(DEFAULT_SITE_LOGO);
  const [siteTheme, setSiteTheme] = useState({
    primary: '#202063',
    accent: '#D02D14',
    light_bg: '#E3F7FD',
    black: '#000000',
    warm: '#FFB02F',
  });
  const [siteHeroContent, setSiteHeroContent] = useState(DEFAULT_HERO_CONTENT);
  const [siteHeroCardFiles, setSiteHeroCardFiles] = useState([]);
  const [siteHeroCardClear, setSiteHeroCardClear] = useState([]);
  const [siteHomeBar, setSiteHomeBar] = useState(DEFAULT_HOME_BAR);
  const [siteResourcesPage, setSiteResourcesPage] = useState({
    title: '',
    description: '',
    description2: '',
    dex_label: '',
    left_links: [],
    right_links: [],
  });
  const [sitePageBackgrounds, setSitePageBackgrounds] = useState({});
  const [sitePageBgFiles, setSitePageBgFiles] = useState({});
  const [siteSection, setSiteSection] = useState(siteSectionParam || 'navbar');
  const currentSiteConfigId = Number(siteConfigIdParam || siteConfigId || 0) || null;
  const [customPages, setCustomPages] = useState([]);
  const [customPageModal, setCustomPageModal] = useState(null);
  const [customPageTitle, setCustomPageTitle] = useState('');
  const [customPageSlug, setCustomPageSlug] = useState('');
  const [customPageBody, setCustomPageBody] = useState('');
  const [customPagePublished, setCustomPagePublished] = useState(true);
  const [previewAsset, setPreviewAsset] = useState(null);
  const [assetEditModal, setAssetEditModal] = useState(null);
  const [assetEditTitle, setAssetEditTitle] = useState('');
  const [assetEditCategory, setAssetEditCategory] = useState('');
  const [assetEditFile, setAssetEditFile] = useState(null);
  const [roadEditModal, setRoadEditModal] = useState(null);
  const [roadEditTitle, setRoadEditTitle] = useState('');
  const [roadEditDesc, setRoadEditDesc] = useState('');
  const [roadEditPhase, setRoadEditPhase] = useState('');
  const [roadEditPeriod, setRoadEditPeriod] = useState('');
  const [roadEditImage, setRoadEditImage] = useState(null);
  const [roadEditIsActive, setRoadEditIsActive] = useState(true);
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

  useEffect(() => {
    getPublicSiteConfig()
      .then((cfg) => setAdminLogoSrc(resolveSiteLogo(cfg)))
      .catch(() => {});
  }, []);

  function onTabChange(nextTab) {
    setSearchParams({ tab: nextTab });
  }

  function openSiteConfig(configId, nextSection = 'navbar') {
    setSearchParams({ tab: 'site', siteConfigId: String(configId), siteSection: nextSection });
  }

  useEffect(() => {
    if (tab === 'dashboard') run(() => Promise.all([loadAssets('', 1, '', ''), loadRoadmap(1, ''), loadContentPages()]));
    if (tab === 'templates') run(() => loadAssets('template', assetPage, assetSearch, assetCategoryFilter));
    if (tab === 'stickers') run(() => loadAssets('sticker', assetPage, assetSearch, assetCategoryFilter));
    if (tab === 'roadmap') run(() => loadRoadmap(roadPage, roadSearch));
    if (tab === 'privacy' || tab === 'support') run(async () => { await loadContentPages(); primeContentForm(tab); });
    if (tab === 'site') run(async () => {
      await loadSiteConfigList();
      if (siteConfigIdParam) {
        await loadSiteConfig(Number(siteConfigIdParam));
      }
      await loadCustomPages();
    });
  }, [tab, siteConfigIdParam]);

  useEffect(() => {
    if (siteSectionParam) setSiteSection(siteSectionParam);
  }, [siteSectionParam]);

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
    fd.append('phase', roadPhase);
    fd.append('period', roadPeriod);
    fd.append('status', roadStatus);
    if (roadImage) fd.append('image', roadImage);
    await adminCreateRoadmap(fd);
    setRoadTitle('');
    setRoadDesc('');
    setRoadPhase('');
    setRoadPeriod('');
    setRoadStatus('planned');
    setRoadImage(null);
    await loadRoadmap(roadPage, roadSearch);
  }

  async function editRoadmap(item) {
    if (!roadEditModal) return;
    const fd = new FormData();
    fd.append('title', (roadEditTitle || '').trim() || item.title || '');
    fd.append('description', roadEditDesc);
    fd.append('phase', roadEditPhase);
    fd.append('period', roadEditPeriod);
    fd.append('is_active', roadEditIsActive ? 'true' : 'false');
    if (roadEditImage) fd.append('image', roadEditImage);
    await adminUpdateRoadmap(roadEditModal.id, fd);
    setRoadEditModal(null);
    setRoadEditTitle('');
    setRoadEditDesc('');
    setRoadEditPhase('');
    setRoadEditPeriod('');
    setRoadEditImage(null);
    setRoadEditIsActive(true);
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

  async function loadSiteConfigList() {
    const data = await adminListSiteConfig('?page_size=50');
    if (Array.isArray(data)) {
      setSiteConfigRows(data);
      setSelectedSiteConfigs([]);
      return;
    }
    setSiteConfigRows(data.results || []);
    setSelectedSiteConfigs([]);
  }

  async function loadSiteConfig(id) {
    const row = await adminGetSiteConfig(id);
    if (row) {
      setSiteConfigId(row.id);
      setSiteConfigName(row.name || '');
      setSiteNavItems(cloneNavItemsForEditor(row.nav_items));
      setSiteFooterSections(Array.isArray(row.footer_sections) ? row.footer_sections : []);
      setSiteFooterCta({
        title: row.footer_cta?.title || '',
        description: row.footer_cta?.description || '',
        button_text: row.footer_cta?.button_text || '',
        button_path: row.footer_cta?.button_path || '',
        external: Boolean(row.footer_cta?.external),
      });
      setLoaderBgType(row.loader_background_type || 'color');
      setLoaderBgColor(row.loader_background_color || '#E3F7FD');
      setLoaderBgHex(row.loader_background_color || '#E3F7FD');
      setLoaderGifUrl(normalizeMediaUrl(row.loader_gif) || '');
      setIntroVideoUrl(normalizeMediaUrl(row.intro_video) || '');
      setIntroVideoFile(null);
      setClearIntroVideo(false);
      setLoaderBgUrl(normalizeMediaUrl(row.loader_background_media) || '');
      setSiteLogoUrl(normalizeMediaUrl(row.site_logo) || '');
      setFooterLogoUrl(normalizeMediaUrl(row.footer_logo) || '');
      setLoaderFrequencyHours(Number(row.loader_frequency_hours || 24));
      setSiteTheme({
        primary: row.site_theme?.primary || '#202063',
        accent: row.site_theme?.accent || '#D02D14',
        light_bg: row.site_theme?.light_bg || '#E3F7FD',
        black: row.site_theme?.black || '#000000',
        warm: row.site_theme?.warm || '#FFB02F',
      });
      setSiteLogoFile(null);
      setFooterLogoFile(null);
      setLoaderGifFile(null);
      setLoaderBgFile(null);
      setIntroVideoFile(null);
      setClearIntroVideo(false);
      const hero = row.hero_content || {};
      setSiteHeroContent({
        title_prefix: hero.title_prefix || DEFAULT_HERO_CONTENT.title_prefix,
        title_cursive: hero.title_cursive || DEFAULT_HERO_CONTENT.title_cursive,
        title_suffix: hero.title_suffix || DEFAULT_HERO_CONTENT.title_suffix,
        enter_label: hero.enter_label || DEFAULT_HERO_CONTENT.enter_label,
        enter_path: hero.enter_path || DEFAULT_HERO_CONTENT.enter_path,
        desc_1: hero.desc_1 || DEFAULT_HERO_CONTENT.desc_1,
        desc_2: hero.desc_2 || DEFAULT_HERO_CONTENT.desc_2,

        cards_heading: hero.cards_heading || DEFAULT_HERO_CONTENT.cards_heading,
        cards_subheading: hero.cards_subheading || DEFAULT_HERO_CONTENT.cards_subheading,
        explore_label: hero.explore_label || DEFAULT_HERO_CONTENT.explore_label,
        explore_path: hero.explore_path || DEFAULT_HERO_CONTENT.explore_path,
        headline_prefix: hero.headline_prefix || DEFAULT_HERO_CONTENT.headline_prefix,
        headline_accent: hero.headline_accent || DEFAULT_HERO_CONTENT.headline_accent,
        description: hero.description || DEFAULT_HERO_CONTENT.description,
        cards: Array.isArray(hero.cards) && hero.cards.length
          ? hero.cards.map((card, index) => ({
              title: card?.title || '',
              gradient: card?.gradient || DEFAULT_HERO_CONTENT.cards[index]?.gradient || '',
              image: normalizeMediaUrl(card?.image || ''),
            }))
          : DEFAULT_HERO_CONTENT.cards.map((card) => ({ ...card })),
      });
      setSiteHeroCardFiles([]);
      setSiteHeroCardClear([]);
      setSiteHomeBar(cloneHomeBarForEditor(row.home_bar));
      const rp = row.resources_page || {};
      setSiteResourcesPage({
        title: rp.title || '',
        description: rp.description || '',
        description2: rp.description2 || '',
        dex_label: rp.dex_label || '',
        left_links: Array.isArray(rp.left_links) ? rp.left_links.map(l => ({
          label: l?.label || '',
          path: l?.path || '',
          external: Boolean(l?.external)
        })) : [],
        right_links: Array.isArray(rp.right_links) ? rp.right_links.map(l => ({
          label: l?.label || '',
          path: l?.path || '',
          external: Boolean(l?.external)
        })) : [],
      });
      setSitePageBackgrounds(row.page_backgrounds || {});
      setSitePageBgFiles({});
      return;
    }
    setSiteConfigId(null);
    setSiteConfigName('');
    setSiteNavItems(cloneNavItemsForEditor([]));
    setSiteFooterSections([]);
    setSiteResourcesPage({
      title: '',
      description: '',
      description2: '',
      dex_label: '',
      left_links: [],
      right_links: [],
    });
    setSiteFooterCta({
      title: '',
      description: '',
      button_text: '',
      button_path: '',
      external: false,
    });
    setLoaderBgType('color');
    setLoaderBgColor('#E3F7FD');
    setLoaderBgHex('#E3F7FD');
    setLoaderGifUrl('');
    setLoaderBgUrl('');
    setSiteLogoUrl('');
    setFooterLogoUrl('');
    setLoaderFrequencyHours(24);
    setSiteTheme({
      primary: '#202063',
      accent: '#D02D14',
      light_bg: '#E3F7FD',
      black: '#000000',
      warm: '#FFB02F',
    });
    setSiteLogoFile(null);
    setFooterLogoFile(null);
    setLoaderGifFile(null);
    setLoaderBgFile(null);
    setIntroVideoUrl('');
    setIntroVideoFile(null);
    setClearIntroVideo(false);
    setSiteHeroContent(DEFAULT_HERO_CONTENT);
    setSiteHeroCardFiles([]);
    setSiteHeroCardClear([]);
    setSiteHomeBar(cloneHomeBarForEditor(null));
    setSitePageBackgrounds({});
    setSitePageBgFiles({});
  }

  function updateHeroField(field, value) {
    setSiteHeroContent((prev) => ({ ...prev, [field]: value }));
  }

  function updateHeroCard(index, field, value) {
    setSiteHeroContent((prev) => ({
      ...prev,
      cards: prev.cards.map((card, idx) => (idx === index ? { ...card, [field]: value } : card)),
    }));
  }

  function addHeroCard() {
    setSiteHeroContent((prev) => ({
      ...prev,
      cards: [
        ...prev.cards,
        {
          title: 'New Card',
          gradient: DEFAULT_HERO_CONTENT.cards[0].gradient,
          image: '',
        },
      ],
    }));
  }

  function removeHeroCard(index) {
    setSiteHeroContent((prev) => ({
      ...prev,
      cards: prev.cards.filter((_, idx) => idx !== index),
    }));
    setSiteHeroCardFiles((prev) => prev.filter((_, idx) => idx !== index));
    setSiteHeroCardClear((prev) => prev.filter((idx) => idx !== index).map((idx) => (idx > index ? idx - 1 : idx)));
  }

  function setHeroCardFile(index, file) {
    setSiteHeroCardFiles((prev) => {
      const next = [...prev];
      next[index] = file;
      return next;
    });
    if (file) {
      setSiteHeroCardClear((prev) => prev.filter((idx) => idx !== index));
    }
  }

  function clearHeroCardImage(index) {
    updateHeroCard(index, 'image', '');
    setSiteHeroCardFiles((prev) => {
      const next = [...prev];
      next[index] = null;
      return next;
    });
    setSiteHeroCardClear((prev) => (prev.includes(index) ? prev : [...prev, index]));
  }

  async function saveHeroOnly() {
    if (!currentSiteConfigId) return;
    const fd = new FormData();
    fd.append(
      'hero_content',
      JSON.stringify({
        ...siteHeroContent,
        cards: siteHeroContent.cards.map((card) => ({
          title: card.title || '',
          gradient: card.gradient || '',
          image: card.image || '',
        })),
      }),
    );
    siteHeroCardFiles.forEach((file, index) => {
      if (file) fd.append(`hero_card_${index}_image`, file);
    });
    if (siteHeroCardClear.length) {
      fd.append('clear_card_images', JSON.stringify(siteHeroCardClear));
    }
    await adminUpdateSiteConfigHero(currentSiteConfigId, fd);
    setSiteHeroCardFiles([]);
    setSiteHeroCardClear([]);
    await loadSiteConfig(currentSiteConfigId);
  }

  async function saveHomeBarOnly() {
    if (!currentSiteConfigId) return;
    await adminUpdateSiteConfigHomeBar(currentSiteConfigId, cloneHomeBarForEditor(siteHomeBar));
    await loadSiteConfig(currentSiteConfigId);
  }

  function updateHomeBarTicker(field, value) {
    setSiteHomeBar((prev) => ({
      ...prev,
      ticker: { ...prev.ticker, [field]: value },
    }));
  }

  function updateHomeBarColumn(colIndex, field, value) {
    setSiteHomeBar((prev) => ({
      ...prev,
      columns: prev.columns.map((col, idx) => (idx === colIndex ? { ...col, [field]: value } : col)),
    }));
  }

  function addHomeBarColumn() {
    setSiteHomeBar((prev) => ({
      ...prev,
      columns: [...prev.columns, { title: 'New Column', links: [] }],
    }));
  }

  function removeHomeBarColumn(colIndex) {
    setSiteHomeBar((prev) => ({
      ...prev,
      columns: prev.columns.filter((_, idx) => idx !== colIndex),
    }));
  }

  function addHomeBarLink(colIndex) {
    setSiteHomeBar((prev) => ({
      ...prev,
      columns: prev.columns.map((col, idx) =>
        idx === colIndex
          ? { ...col, links: [...(col.links || []), { label: '', path: '', external: false, highlight: false }] }
          : col,
      ),
    }));
  }

  function updateHomeBarLink(colIndex, linkIndex, field, value) {
    setSiteHomeBar((prev) => ({
      ...prev,
      columns: prev.columns.map((col, cIdx) =>
        cIdx === colIndex
          ? {
              ...col,
              links: (col.links || []).map((link, lIdx) =>
                lIdx === linkIndex ? { ...link, [field]: value } : link,
              ),
            }
          : col,
      ),
    }));
  }

  function removeHomeBarLink(colIndex, linkIndex) {
    setSiteHomeBar((prev) => ({
      ...prev,
      columns: prev.columns.map((col, cIdx) =>
        cIdx === colIndex
          ? { ...col, links: (col.links || []).filter((_, lIdx) => lIdx !== linkIndex) }
          : col,
      ),
    }));
  }

  async function saveLogoOnly() {
    if (!currentSiteConfigId) return;
    const fd = new FormData();
    if (siteLogoFile) fd.append('site_logo', siteLogoFile);
    if (footerLogoFile) fd.append('footer_logo', footerLogoFile);
    if (!siteLogoFile && !footerLogoFile) return;
    await adminUpdateSiteConfigBranding(currentSiteConfigId, fd);
    await loadSiteConfig(currentSiteConfigId);
    const cfg = await getPublicSiteConfig().catch(() => null);
    if (cfg) setAdminLogoSrc(resolveSiteLogo(cfg));
  }

  async function saveSiteConfig() {
    if (!currentSiteConfigId) return;
    const fd = cmsSavePayload({
      navItems: siteNavItems,
      footerSections: siteFooterSections,
      footerCta: siteFooterCta,
      loaderBgType,
      loaderBgColor,
      loaderGifFile,
      loaderBgFile,
    });
    fd.append('loader_frequency_hours', String(Math.max(1, Number(loaderFrequencyHours || 24))));
    await adminUpdateSiteConfig(currentSiteConfigId, fd);
    await loadSiteConfig(currentSiteConfigId);
  }

  async function saveSiteConfigName() {
    if (!currentSiteConfigId) return;
    const name = (siteConfigName || '').trim();
    if (!name) return;
    await adminUpdateSiteConfig(currentSiteConfigId, { name });
    await Promise.all([loadSiteConfig(currentSiteConfigId), loadSiteConfigList()]);
  }

  async function saveNavbarOnly() {
    if (!currentSiteConfigId) return;
    const payload = cloneNavItemsForEditor(siteNavItems);
    await adminUpdateSiteConfigNav(currentSiteConfigId, payload);
    await loadSiteConfig(currentSiteConfigId);
  }

  async function saveFooterOnly() {
    if (!currentSiteConfigId) return;
    await adminUpdateSiteConfigFooterSections(currentSiteConfigId, siteFooterSections);
    await loadSiteConfig(currentSiteConfigId);
  }

  async function saveFooterCtaOnly() {
    if (!currentSiteConfigId) return;
    await adminUpdateSiteConfigFooterCta(currentSiteConfigId, siteFooterCta);
    await loadSiteConfig(currentSiteConfigId);
  }

  async function saveLoaderOnly() {
    if (!currentSiteConfigId) return;
    const fd = new FormData();
    fd.append('loader_background_type', loaderBgType);
    fd.append('loader_background_color', loaderBgColor);
    fd.append('loader_frequency_hours', String(Math.max(1, Number(loaderFrequencyHours || 24))));
    if (loaderGifFile) fd.append('loader_gif', loaderGifFile);
    if (loaderBgFile) fd.append('loader_background_media', loaderBgFile);
    if (introVideoFile) fd.append('intro_video', introVideoFile);
    if (clearIntroVideo) fd.append('clear_intro_video', 'true');
    await adminUpdateSiteConfigLoader(currentSiteConfigId, fd);
    setIntroVideoFile(null);
    setClearIntroVideo(false);
    await loadSiteConfig(currentSiteConfigId);
  }

  async function saveThemeOnly() {
    if (!currentSiteConfigId) return;
    await adminUpdateSiteConfig(currentSiteConfigId, { site_theme: siteTheme });
    await loadSiteConfig(currentSiteConfigId);
  }

  async function saveResourcesPageOnly() {
    if (!currentSiteConfigId) return;
    await adminUpdateSiteConfigResourcesPage(currentSiteConfigId, siteResourcesPage);
    await loadSiteConfig(currentSiteConfigId);
  }

  function updateResourcesField(field, value) {
    setSiteResourcesPage((prev) => ({ ...prev, [field]: value }));
  }

  function addResourcesLink(side) {
    setSiteResourcesPage((prev) => ({
      ...prev,
      [side]: [...(prev[side] || []), { label: '', path: '', external: false }],
    }));
  }

  function updateResourcesLink(side, index, field, value) {
    setSiteResourcesPage((prev) => ({
      ...prev,
      [side]: (prev[side] || []).map((link, idx) =>
        idx === index ? { ...link, [field]: value } : link
      ),
    }));
  }

  function removeResourcesLink(side, index) {
    setSiteResourcesPage((prev) => ({
      ...prev,
      [side]: (prev[side] || []).filter((_, idx) => idx !== index),
    }));
  }

  async function savePageBackgroundsOnly() {
    if (!currentSiteConfigId) return;
    const fd = new FormData();
    fd.append('page_backgrounds', JSON.stringify(sitePageBackgrounds));
    Object.entries(sitePageBgFiles).forEach(([pageKey, file]) => {
      if (file) {
        fd.append(`bg_${pageKey}`, file);
      }
    });
    const clears = [];
    Object.entries(sitePageBackgrounds).forEach(([pageKey, settings]) => {
      if (!settings?.image && !sitePageBgFiles[pageKey]) {
        clears.push(pageKey);
      }
    });
    if (clears.length) {
      fd.append('clear_backgrounds', JSON.stringify(clears));
    }
    await adminUpdateSiteConfigPageBackgrounds(currentSiteConfigId, fd);
    setSitePageBgFiles({});
    await loadSiteConfig(currentSiteConfigId);
  }

  function updatePageBgField(pageKey, field, value) {
    setSitePageBackgrounds((prev) => ({
      ...prev,
      [pageKey]: {
        ...(prev[pageKey] || { image: '', blur: 18, overlay_opacity: 0.92 }),
        [field]: value,
      },
    }));
  }

  function handlePageBgFile(pageKey, file) {
    setSitePageBgFiles((prev) => ({
      ...prev,
      [pageKey]: file,
    }));
  }

  function clearPageBgImage(pageKey) {
    updatePageBgField(pageKey, 'image', '');
    setSitePageBgFiles((prev) => ({
      ...prev,
      [pageKey]: null,
    }));
  }

  async function loadCustomPages() {
    const data = await adminListCustomPages('?page_size=100');
    setCustomPages(data.results || []);
  }

  function openCreateCustomPage() {
    navigate('/admin/page-builder');
  }

  function openEditCustomPage(row) {
    navigate(`/admin/page-builder?id=${row.id}`);
  }

  async function saveCustomPage() {
    const payload = {
      title: customPageTitle,
      slug: customPageSlug,
      body: customPageBody,
      is_published: customPagePublished,
    };
    if (customPageModal?.mode === 'edit' && customPageModal?.id) {
      await adminUpdateCustomPage(customPageModal.id, payload);
    } else {
      await adminCreateCustomPage(payload);
    }
    setCustomPageModal(null);
    await loadCustomPages();
  }

  function updateNavItem(index, key, value) {
    setSiteNavItems((prev) => prev.map((item, i) => (i === index ? { ...item, [key]: value } : item)));
  }

  function addNavItem() {
    setSiteNavItems((prev) => [...prev, { label: '', path: '', external: false, children: [] }]);
  }

  function removeNavItem(index) {
    setSiteNavItems((prev) => prev.filter((_, i) => i !== index));
  }

  function addNavChild(navIndex) {
    setSiteNavItems((prev) => {
      if (navIndex < 0 || navIndex >= prev.length) return prev;
      return prev.map((item, i) => {
        if (i !== navIndex) {
          return {
            ...item,
            children: Array.isArray(item.children) ? [...item.children] : [],
          };
        }
        const children = Array.isArray(item.children) ? [...item.children] : [];
        children.push({ label: '', path: '', external: false });
        return { ...item, children };
      });
    });
  }

  function updateNavChild(navIndex, childIndex, key, value) {
    setSiteNavItems((prev) =>
      prev.map((item, i) =>
        i === navIndex
          ? {
              ...item,
              children: (item.children || []).map((child, ci) =>
                ci === childIndex ? { ...child, [key]: value } : child,
              ),
            }
          : item,
      ),
    );
  }

  function removeNavChild(navIndex, childIndex) {
    setSiteNavItems((prev) =>
      prev.map((item, i) =>
        i === navIndex
          ? { ...item, children: (item.children || []).filter((_, ci) => ci !== childIndex) }
          : item,
      ),
    );
  }

  function addFooterSection() {
    setSiteFooterSections((prev) => [...prev, { title: '', links: [] }]);
  }

  function updateFooterSection(index, key, value) {
    setSiteFooterSections((prev) => prev.map((item, i) => (i === index ? { ...item, [key]: value } : item)));
  }

  function removeFooterSection(index) {
    setSiteFooterSections((prev) => prev.filter((_, i) => i !== index));
  }

  function addFooterLink(sectionIndex) {
    setSiteFooterSections((prev) =>
      prev.map((section, i) =>
        i === sectionIndex
          ? { ...section, links: [...(section.links || []), { label: '', path: '', external: false }] }
          : section,
      ),
    );
  }

  function updateFooterLink(sectionIndex, linkIndex, key, value) {
    setSiteFooterSections((prev) =>
      prev.map((section, i) =>
        i === sectionIndex
          ? {
              ...section,
              links: (section.links || []).map((link, li) => (li === linkIndex ? { ...link, [key]: value } : link)),
            }
          : section,
      ),
    );
  }

  function removeFooterLink(sectionIndex, linkIndex) {
    setSiteFooterSections((prev) =>
      prev.map((section, i) =>
        i === sectionIndex
          ? { ...section, links: (section.links || []).filter((_, li) => li !== linkIndex) }
          : section,
      ),
    );
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
          <img src={adminLogoSrc} alt="MemeCult" />
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
                    <td>
                      <div>{row.title}</div>
                      <small className="admin-muted">{row.phase || '—'}{row.period ? ` · ${row.period}` : ''}</small>
                    </td>
                    <td><span className="badge-chip">{row.status}</span></td>
                    <td>{new Date(row.updated_at).toLocaleDateString()}</td>
                    <td className="mc-actions-cell">
                      <button
                        onClick={() => {
                          setRoadEditModal(row);
                          setRoadEditTitle(row.title || '');
                          setRoadEditDesc(row.description || '');
                          setRoadEditPhase(row.phase || '');
                          setRoadEditPeriod(row.period || '');
                          setRoadEditImage(null);
                          setRoadEditIsActive(row.is_active !== false);
                        }}
                      >
                        Edit
                      </button>
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

        {tab === 'site' ? (
          <>
            {!siteConfigIdParam ? (
              <section className="admin-panel admin-cms-panel">
                <div className="admin-panel-head">
                  <h2>Site Configs</h2>
                  <div className="admin-form-row">
                    <input
                      value={newSiteConfigName}
                      onChange={(e) => setNewSiteConfigName(e.target.value)}
                      placeholder="Config name"
                    />
                    <button
                      className="btn btn-outline"
                      onClick={() => {
                        if (!selectedSiteConfigs.length) return;
                        setConfirmModal({
                          title: 'Delete Selected Site Configs',
                          message: `Delete ${selectedSiteConfigs.length} selected config(s)? This cannot be undone.`,
                          confirmText: 'Delete',
                          onConfirm: async () => {
                            for (const id of selectedSiteConfigs) {
                              await adminDeleteSiteConfig(id);
                            }
                            await loadSiteConfigList();
                          },
                        });
                      }}
                    >
                      Bulk Delete
                    </button>
                    <button className="btn btn-lime" onClick={() => run(async () => {
                      const row = await adminCreateSiteConfig({
                        name: (newSiteConfigName || '').trim() || `Site Config ${new Date().toLocaleString()}`,
                        site_theme: {
                          primary: '#202063',
                          accent: '#D02D14',
                          light_bg: '#E3F7FD',
                          black: '#000000',
                          warm: '#FFB02F',
                        },
                        nav_items: DEFAULT_NAV_ITEMS,
                        footer_sections: [],
                        footer_cta: {},
                        hero_content: DEFAULT_HERO_CONTENT,
                        home_bar: DEFAULT_HOME_BAR,
                        loader_background_type: 'color',
                        loader_background_color: '#E3F7FD',
                        loader_frequency_hours: 24,
                      });
                      setNewSiteConfigName('');
                      await loadSiteConfigList();
                      openSiteConfig(row.id, 'navbar');
                    })}>+ Create Config</button>
                  </div>
                </div>
                <table className="mc-list-table">
                  <thead><tr><th><CustomCheckbox checked={siteConfigRows.length > 0 && selectedSiteConfigs.length === siteConfigRows.length} onChange={(e) => setSelectedSiteConfigs(e.target.checked ? siteConfigRows.map((r) => r.id) : [])} label="Select all site configs" /></th><th>ID</th><th>Name</th><th>Status</th><th>Updated</th><th>Actions</th></tr></thead>
                  <tbody>
                    {siteConfigRows.map((row) => (
                      <tr key={row.id} className={row.is_active ? 'mc-row-active' : ''}>
                        <td><CustomCheckbox checked={selectedSiteConfigs.includes(row.id)} onChange={(e) => setSelectedSiteConfigs((prev) => e.target.checked ? [...prev, row.id] : prev.filter((x) => x !== row.id))} label={`Select config ${row.id}`} /></td>
                        <td>{row.id}</td>
                        <td>{row.name || '-'}</td>
                        <td>
                          {row.is_active ? (
                            <span className="badge-chip badge-chip-active">Active</span>
                          ) : (
                            <span className="badge-chip badge-chip-inactive">Inactive</span>
                          )}
                        </td>
                        <td>{new Date(row.updated_at).toLocaleString()}</td>
                        <td className="mc-actions-cell">
                          <button className="mc-icon-btn" title="Edit" aria-label="Edit" onClick={() => openSiteConfig(row.id, 'navbar')}>
                            <EditIcon />
                          </button>
                          {!row.is_active ? (
                            <button className="mc-icon-btn" title="Set Active" aria-label="Set Active" onClick={() => run(async () => { await adminActivateSiteConfig(row.id); await loadSiteConfigList(); })}>
                              <CheckIcon />
                            </button>
                          ) : (
                            <button className="mc-icon-btn mc-icon-btn-active" title="Already Active" aria-label="Already Active" disabled>
                              <ActiveDotIcon />
                            </button>
                          )}
                          <button
                            className="mc-icon-btn"
                            title="Delete"
                            aria-label="Delete"
                            onClick={() =>
                              setConfirmModal({
                                title: 'Delete Site Config',
                                message: `Delete config #${row.id}? This cannot be undone.`,
                                confirmText: 'Delete',
                                onConfirm: async () => {
                                  await adminDeleteSiteConfig(row.id);
                                  await loadSiteConfigList();
                                },
                              })
                            }
                          >
                            <TrashIcon />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            ) : null}

            {siteConfigIdParam ? (
            <section className="admin-panel admin-cms-panel">
              <div className="admin-cms-layout">
                <aside className="admin-cms-nav">
                  <button className={`admin-cms-nav-item ${siteSection === 'logo' ? 'active' : ''}`} onClick={() => openSiteConfig(siteConfigIdParam, 'logo')}>Logo</button>
                  <button className={`admin-cms-nav-item ${siteSection === 'hero' ? 'active' : ''}`} onClick={() => openSiteConfig(siteConfigIdParam, 'hero')}>Home Hero</button>
                  <button className={`admin-cms-nav-item ${siteSection === 'homebar' ? 'active' : ''}`} onClick={() => openSiteConfig(siteConfigIdParam, 'homebar')}>Home Bar</button>
                  <button className={`admin-cms-nav-item ${siteSection === 'navbar' ? 'active' : ''}`} onClick={() => openSiteConfig(siteConfigIdParam, 'navbar')}>Navbar</button>
                  <button className={`admin-cms-nav-item ${siteSection === 'footer' ? 'active' : ''}`} onClick={() => openSiteConfig(siteConfigIdParam, 'footer')}>Footer Links</button>
                  <button className={`admin-cms-nav-item ${siteSection === 'cta' ? 'active' : ''}`} onClick={() => openSiteConfig(siteConfigIdParam, 'cta')}>Footer CTA</button>
                  <button className={`admin-cms-nav-item ${siteSection === 'resources' ? 'active' : ''}`} onClick={() => openSiteConfig(siteConfigIdParam, 'resources')}>Resources Page</button>
                  <button className={`admin-cms-nav-item ${siteSection === 'loader' ? 'active' : ''}`} onClick={() => openSiteConfig(siteConfigIdParam, 'loader')}>Loader</button>
                  <button className={`admin-cms-nav-item ${siteSection === 'theme' ? 'active' : ''}`} onClick={() => openSiteConfig(siteConfigIdParam, 'theme')}>Theme</button>
                  <button className={`admin-cms-nav-item ${siteSection === 'backgrounds' ? 'active' : ''}`} onClick={() => openSiteConfig(siteConfigIdParam, 'backgrounds')}>Backgrounds & Blur</button>
                  <button className={`admin-cms-nav-item ${siteSection === 'pages' ? 'active' : ''}`} onClick={() => openSiteConfig(siteConfigIdParam, 'pages')}>Custom Pages</button>
                  <button className="admin-cms-nav-item" onClick={() => setSearchParams({ tab: 'site' })}>← Back to Config List</button>
                </aside>
                <div className="admin-cms-content">
                  <div className="admin-site-name-row">
                    <input value={siteConfigName} onChange={(e) => setSiteConfigName(e.target.value)} placeholder="Site config name" />
                    <button className="btn btn-outline" onClick={() => run(saveSiteConfigName)}>Save Name</button>
                  </div>
                  {siteSection === 'logo' ? (
                    <>
                      <div className="admin-panel-head"><h2>Site Logo</h2></div>
                      <p className="admin-muted">Upload logos shown in the navbar, login, hero, and footer.</p>
                      <div className="admin-cms-list">
                        <div>
                          <h3 className="admin-subhead">Main logo</h3>
                          <p className="admin-muted">Used in navbar, login, and hero badge.</p>
                          <label className="admin-file-upload">
                            <input type="file" accept="image/*" onChange={(e) => setSiteLogoFile(e.target.files?.[0] || null)} />
                            <span className="admin-file-upload-trigger"><UploadIcon /><b>{siteLogoFile ? 'Change main logo' : 'Choose main logo'}</b></span>
                            <small>{siteLogoFile ? siteLogoFile.name : 'PNG, JPG, SVG, or WebP'}</small>
                          </label>
                          {(siteLogoFile || siteLogoUrl) ? (
                            <div className="admin-upload-preview admin-logo-preview">
                              <img src={siteLogoFile ? URL.createObjectURL(siteLogoFile) : siteLogoUrl} alt="Main logo preview" />
                            </div>
                          ) : null}
                        </div>
                        <div>
                          <h3 className="admin-subhead">Footer logo</h3>
                          <p className="admin-muted">Optional. Falls back to main logo if empty.</p>
                          <label className="admin-file-upload">
                            <input type="file" accept="image/*" onChange={(e) => setFooterLogoFile(e.target.files?.[0] || null)} />
                            <span className="admin-file-upload-trigger"><UploadIcon /><b>{footerLogoFile ? 'Change footer logo' : 'Choose footer logo'}</b></span>
                            <small>{footerLogoFile ? footerLogoFile.name : 'PNG, JPG, SVG, or WebP'}</small>
                          </label>
                          {(footerLogoFile || footerLogoUrl) ? (
                            <div className="admin-upload-preview admin-logo-preview">
                              <img src={footerLogoFile ? URL.createObjectURL(footerLogoFile) : footerLogoUrl} alt="Footer logo preview" />
                            </div>
                          ) : null}
                        </div>
                      </div>
                      <div className="admin-modal-actions">
                        <button className="btn btn-lime" onClick={() => run(saveLogoOnly)} disabled={!siteLogoFile && !footerLogoFile}>Save Logos</button>
                      </div>
                    </>
                  ) : null}

                  {siteSection === 'hero' ? (
                    <>
                      <div className="admin-panel-head">
                        <h2>Home Hero</h2>
                        <button className="btn btn-outline" onClick={addHeroCard}>+ Add Card</button>
                      </div>
                      <p className="admin-muted">
                        Edit the home page headline (left panel) and generated cards (right panel).
                        Changes apply to the active site config.
                      </p>
                      <div className="admin-cms-list">
                        <div className="admin-cms-section">
                          <h3 className="admin-subhead">Headline (Home / About Page)</h3>
                          <div className="admin-cms-item">
                            <input
                              value={siteHeroContent.title_prefix || ''}
                              onChange={(e) => updateHeroField('title_prefix', e.target.value)}
                              placeholder="Title Prefix (e.g. The first ever)"
                            />
                            <input
                              value={siteHeroContent.title_cursive || ''}
                              onChange={(e) => updateHeroField('title_cursive', e.target.value)}
                              placeholder="Title Cursive (e.g. futarchy)"
                            />
                            <span />
                          </div>
                          <div className="admin-cms-item">
                            <textarea
                              className="admin-textarea"
                              rows={2}
                              value={siteHeroContent.title_suffix || ''}
                              onChange={(e) => updateHeroField('title_suffix', e.target.value)}
                              placeholder="Title Suffix (e.g. governed\nmeme coin)"
                            />
                          </div>
                          <div className="admin-cms-item">
                            <input
                              value={siteHeroContent.enter_label || ''}
                              onChange={(e) => updateHeroField('enter_label', e.target.value)}
                              placeholder="Action Button Label (e.g. Enter the cult)"
                            />
                            <input
                              value={siteHeroContent.enter_path || ''}
                              onChange={(e) => updateHeroField('enter_path', e.target.value)}
                              placeholder="Action Button Path (e.g. /editor)"
                            />
                            <span />
                          </div>
                          <div className="admin-cms-item">
                            <textarea
                              className="admin-textarea"
                              rows={2}
                              value={siteHeroContent.desc_1 || ''}
                              onChange={(e) => updateHeroField('desc_1', e.target.value)}
                              placeholder="Description 1"
                            />
                          </div>
                          <div className="admin-cms-item">
                            <textarea
                              className="admin-textarea"
                              rows={2}
                              value={siteHeroContent.desc_2 || ''}
                              onChange={(e) => updateHeroField('desc_2', e.target.value)}
                              placeholder="Description 2"
                            />
                          </div>
                        </div>
                        <div className="admin-cms-section">
                          <h3 className="admin-subhead">Cards panel (right)</h3>
                          <div className="admin-cms-item">
                            <input
                              value={siteHeroContent.cards_heading || ''}
                              onChange={(e) => updateHeroField('cards_heading', e.target.value)}
                              placeholder="Cards heading"
                            />
                            <input
                              value={siteHeroContent.cards_subheading || ''}
                              onChange={(e) => updateHeroField('cards_subheading', e.target.value)}
                              placeholder="Cards subheading"
                            />
                            <span />
                          </div>
                          <div className="admin-cms-item">
                            <input
                              value={siteHeroContent.explore_label || ''}
                              onChange={(e) => updateHeroField('explore_label', e.target.value)}
                              placeholder="Button label"
                            />
                            <input
                              value={siteHeroContent.explore_path || ''}
                              onChange={(e) => updateHeroField('explore_path', e.target.value)}
                              placeholder="Button path (/editor)"
                            />
                            <span />
                          </div>
                          {siteHeroContent.cards.map((card, idx) => (
                            <div key={`hero-card-${idx}`} className="admin-cms-section">
                              <div className="admin-cms-section-head">
                                <strong>Card {idx + 1}</strong>
                                <button className="btn btn-outline" onClick={() => removeHeroCard(idx)}>Remove</button>
                              </div>
                              <div className="admin-cms-item">
                                <input
                                  value={card.title || ''}
                                  onChange={(e) => updateHeroCard(idx, 'title', e.target.value)}
                                  placeholder="Card title"
                                />
                                <input
                                  value={card.gradient || ''}
                                  onChange={(e) => updateHeroCard(idx, 'gradient', e.target.value)}
                                  placeholder="CSS gradient (if no image)"
                                />
                                <span />
                              </div>
                              <label className="admin-file-upload">
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => setHeroCardFile(idx, e.target.files?.[0] || null)}
                                />
                                <span className="admin-file-upload-trigger">
                                  <UploadIcon />
                                  <b>{siteHeroCardFiles[idx] ? 'Change card image' : 'Choose card image'}</b>
                                </span>
                                <small>Optional — overrides gradient background</small>
                              </label>
                              {(siteHeroCardFiles[idx] || card.image) ? (
                                <div className="admin-upload-preview">
                                  <img
                                    src={
                                      siteHeroCardFiles[idx]
                                        ? URL.createObjectURL(siteHeroCardFiles[idx])
                                        : card.image
                                    }
                                    alt={`Card ${idx + 1} preview`}
                                  />
                                  <button className="btn btn-outline" type="button" onClick={() => clearHeroCardImage(idx)}>
                                    Remove image
                                  </button>
                                </div>
                              ) : null}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="admin-modal-actions">
                        <button className="btn btn-lime" onClick={() => run(saveHeroOnly)}>Save Home Hero</button>
                      </div>
                    </>
                  ) : null}

                  {siteSection === 'homebar' ? (
                    <>
                      <div className="admin-panel-head">
                        <h2>Home Bar</h2>
                        <button type="button" className="btn btn-outline" onClick={addHomeBarColumn}>+ Add Column</button>
                      </div>
                      <p className="admin-muted">
                        Bottom strip on the home page: ticker (token + contract) and link columns (Social, Resources, Contact).
                      </p>
                      <div className="admin-cms-section">
                        <div className="admin-cms-section-head">
                          <strong>Ticker</strong>
                        </div>
                        <div className="admin-cms-item">
                          <input
                            value={siteHomeBar.ticker?.title || ''}
                            onChange={(e) => updateHomeBarTicker('title', e.target.value)}
                            placeholder="Column title (Ticker)"
                          />
                          <input
                            value={siteHomeBar.ticker?.symbol || ''}
                            onChange={(e) => updateHomeBarTicker('symbol', e.target.value)}
                            placeholder="Symbol ($MEMECULT)"
                          />
                          <input
                            value={siteHomeBar.ticker?.contract_address || ''}
                            onChange={(e) => updateHomeBarTicker('contract_address', e.target.value)}
                            placeholder="Contract (0x7a3f...cult)"
                          />
                        </div>
                      </div>
                      <div className="admin-cms-list">
                        {(siteHomeBar.columns || []).map((col, colIdx) => (
                          <div key={`homebar-col-${colIdx}`} className="admin-cms-section">
                            <div className="admin-cms-section-head">
                              <input
                                value={col.title || ''}
                                onChange={(e) => updateHomeBarColumn(colIdx, 'title', e.target.value)}
                                placeholder="Column title"
                              />
                              <button type="button" className="btn btn-outline" onClick={() => removeHomeBarColumn(colIdx)}>
                                Remove Column
                              </button>
                            </div>
                            <div className="admin-cms-list">
                              {(col.links || []).map((link, linkIdx) => (
                                <div key={`homebar-link-${colIdx}-${linkIdx}`} className="admin-cms-item">
                                  <input
                                    value={link.label || ''}
                                    onChange={(e) => updateHomeBarLink(colIdx, linkIdx, 'label', e.target.value)}
                                    placeholder="Link label"
                                  />
                                  <input
                                    value={link.path || ''}
                                    onChange={(e) => updateHomeBarLink(colIdx, linkIdx, 'path', e.target.value)}
                                    placeholder="Path or URL (/login, mailto:…)"
                                  />
                                  <label className="admin-checkline">
                                    <input
                                      type="checkbox"
                                      checked={Boolean(link.external)}
                                      onChange={(e) => updateHomeBarLink(colIdx, linkIdx, 'external', e.target.checked)}
                                    />
                                    <span>External</span>
                                  </label>
                                  <label className="admin-checkline">
                                    <input
                                      type="checkbox"
                                      checked={Boolean(link.highlight)}
                                      onChange={(e) => updateHomeBarLink(colIdx, linkIdx, 'highlight', e.target.checked)}
                                    />
                                    <span>Highlight (Join link style)</span>
                                  </label>
                                  <button type="button" className="btn btn-outline" onClick={() => removeHomeBarLink(colIdx, linkIdx)}>
                                    Remove
                                  </button>
                                </div>
                              ))}
                            </div>
                            <button type="button" className="btn btn-outline admin-cms-add-link" onClick={() => addHomeBarLink(colIdx)}>
                              + Add Link
                            </button>
                          </div>
                        ))}
                      </div>
                      <div className="admin-modal-actions">
                        <button className="btn btn-lime" onClick={() => run(saveHomeBarOnly)}>Save Home Bar</button>
                      </div>
                    </>
                  ) : null}

                  {siteSection === 'navbar' ? (
                    <>
                      <div className="admin-panel-head">
                        <h2>Navbar Builder</h2>
                        <button type="button" className="btn btn-outline" onClick={addNavItem}>+ Add Item</button>
                      </div>
                      <p className="admin-muted">
                        Top links: Home, About, Roadmap. Use dropdown children for Featured (e.g. Meme Lab, Futardio Card).
                      </p>
                      <div className="admin-cms-list">
                        {siteNavItems.map((item, idx) => (
                          <div key={`nav-${idx}`} className="admin-cms-section">
                            <div className="admin-cms-section-head">
                              <strong>Nav item {idx + 1}</strong>
                              <button type="button" className="btn btn-outline" onClick={() => removeNavItem(idx)}>Remove</button>
                            </div>
                            <div className="admin-nav-fields">
                              <label className="admin-field">
                                <span>Label</span>
                                <input value={item.label || ''} onChange={(e) => updateNavItem(idx, 'label', e.target.value)} placeholder="Home" />
                              </label>
                              <label className="admin-field">
                                <span>Path</span>
                                <input
                                  value={item.path || ''}
                                  onChange={(e) => updateNavItem(idx, 'path', e.target.value)}
                                  placeholder={(item.children || []).length ? 'Optional for dropdown parent' : '/about'}
                                />
                              </label>
                              <label className="admin-checkline">
                                <input type="checkbox" checked={Boolean(item.external)} onChange={(e) => updateNavItem(idx, 'external', e.target.checked)} />
                                <span>External link</span>
                              </label>
                            </div>
                            <div className="admin-cms-sublist">
                              <div className="admin-cms-section-head">
                                <span className="admin-muted">
                                  Dropdown links ({(item.children || []).length})
                                </span>
                                <button
                                  type="button"
                                  className="btn btn-outline"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    addNavChild(idx);
                                  }}
                                >
                                  + Add dropdown link
                                </button>
                              </div>
                              {(item.children || []).length === 0 ? (
                                <p className="admin-muted admin-nav-empty-hint">
                                  No dropdown links yet. Click &quot;Add dropdown link&quot; for items like Featured → Meme Lab.
                                </p>
                              ) : null}
                              {(item.children || []).map((child, childIdx) => (
                                <div key={`nav-${idx}-child-${childIdx}`} className="admin-nav-child-card">
                                  <div className="admin-cms-section-head">
                                    <strong>Dropdown {childIdx + 1}</strong>
                                    <button type="button" className="btn btn-outline" onClick={() => removeNavChild(idx, childIdx)}>Remove</button>
                                  </div>
                                  <label className="admin-field">
                                    <span>Label</span>
                                    <input value={child.label || ''} onChange={(e) => updateNavChild(idx, childIdx, 'label', e.target.value)} placeholder="Meme Lab" />
                                  </label>
                                  <label className="admin-field">
                                    <span>Path</span>
                                    <input value={child.path || ''} onChange={(e) => updateNavChild(idx, childIdx, 'path', e.target.value)} placeholder="/editor" />
                                  </label>
                                  <label className="admin-checkline">
                                    <input type="checkbox" checked={Boolean(child.external)} onChange={(e) => updateNavChild(idx, childIdx, 'external', e.target.checked)} />
                                    <span>External link</span>
                                  </label>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="admin-modal-actions"><button className="btn btn-lime" onClick={() => run(saveNavbarOnly)}>Save Navbar</button></div>
                    </>
                  ) : null}

                  {siteSection === 'footer' ? (
                    <>
                      <div className="admin-panel-head">
                        <h2>Footer Builder</h2>
                        <button className="btn btn-outline" onClick={addFooterSection}>+ Add Section</button>
                      </div>
                      <p className="admin-muted">Create footer columns and links visually.</p>
                      <div className="admin-cms-list">
                        {siteFooterSections.map((section, sIdx) => (
                          <div key={`section-${sIdx}`} className="admin-cms-section">
                            <div className="admin-cms-section-head">
                              <input value={section.title || ''} onChange={(e) => updateFooterSection(sIdx, 'title', e.target.value)} placeholder="Section Title" />
                              <button className="btn btn-outline" onClick={() => removeFooterSection(sIdx)}>Remove Section</button>
                            </div>
                            <div className="admin-cms-list">
                              {(section.links || []).map((link, lIdx) => (
                                <div key={`link-${sIdx}-${lIdx}`} className="admin-cms-item">
                                  <input value={link.label || ''} onChange={(e) => updateFooterLink(sIdx, lIdx, 'label', e.target.value)} placeholder="Link Label" />
                                  <input value={link.path || ''} onChange={(e) => updateFooterLink(sIdx, lIdx, 'path', e.target.value)} placeholder="Link Path" />
                                  <label className="admin-checkline">
                                    <input type="checkbox" checked={Boolean(link.external)} onChange={(e) => updateFooterLink(sIdx, lIdx, 'external', e.target.checked)} />
                                    <span>External</span>
                                  </label>
                                  <button className="btn btn-outline" onClick={() => removeFooterLink(sIdx, lIdx)}>Remove</button>
                                </div>
                              ))}
                            </div>
                            <button className="btn btn-outline admin-cms-add-link" onClick={() => addFooterLink(sIdx)}>+ Add Link</button>
                          </div>
                        ))}
                      </div>
                      <div className="admin-modal-actions"><button className="btn btn-lime" onClick={() => run(saveFooterOnly)}>Save Footer Links</button></div>
                    </>
                  ) : null}

                  {siteSection === 'cta' ? (
                    <>
                      <div className="admin-panel-head"><h2>Footer CTA</h2></div>
                      <p className="admin-muted">Edit the highlighted promo card in footer.</p>
                      <div className="admin-cms-item">
                        <input value={siteFooterCta.title || ''} onChange={(e) => setSiteFooterCta((prev) => ({ ...prev, title: e.target.value }))} placeholder="CTA Title" />
                        <input value={siteFooterCta.description || ''} onChange={(e) => setSiteFooterCta((prev) => ({ ...prev, description: e.target.value }))} placeholder="CTA Description" />
                        <input value={siteFooterCta.button_text || ''} onChange={(e) => setSiteFooterCta((prev) => ({ ...prev, button_text: e.target.value }))} placeholder="Button Text" />
                        <input value={siteFooterCta.button_path || ''} onChange={(e) => setSiteFooterCta((prev) => ({ ...prev, button_path: e.target.value }))} placeholder="Button Path" />
                        <label className="admin-checkline">
                          <input type="checkbox" checked={Boolean(siteFooterCta.external)} onChange={(e) => setSiteFooterCta((prev) => ({ ...prev, external: e.target.checked }))} />
                          <span>External Button Link</span>
                        </label>
                      </div>
                      <div className="admin-modal-actions"><button className="btn btn-lime" onClick={() => run(saveFooterCtaOnly)}>Save Footer CTA</button></div>
                    </>
                  ) : null}

                  {siteSection === 'loader' ? (
                    <>
                      <div className="admin-panel-head"><h2>Loader Settings</h2></div>
                      <p className="admin-muted">
                        Loading GIF, intro video (plays after loader with sound), and splash background. Loader + video share the frequency setting below.
                      </p>
                      <div className="admin-cms-list">
                        <label className="admin-file-upload">
                          <input
                            type="file"
                            accept="video/mp4,video/webm,video/quicktime,video/*"
                            onChange={(e) => {
                              setIntroVideoFile(e.target.files?.[0] || null);
                              if (e.target.files?.[0]) setClearIntroVideo(false);
                            }}
                          />
                          <span className="admin-file-upload-trigger">
                            <UploadIcon />
                            <b>{introVideoFile ? 'Change intro video' : 'Choose intro video'}</b>
                          </span>
                          <small>{introVideoFile ? introVideoFile.name : 'MP4, WebM, MOV supported'}</small>
                        </label>
                        {(introVideoFile || (introVideoUrl && !clearIntroVideo)) ? (
                          <div className="admin-upload-preview admin-upload-preview-video">
                            <video
                              src={introVideoFile ? URL.createObjectURL(introVideoFile) : introVideoUrl}
                              controls
                              muted
                              playsInline
                            />
                            <button
                              type="button"
                              className="btn btn-outline admin-video-clear"
                              onClick={() => {
                                setIntroVideoFile(null);
                                setIntroVideoUrl('');
                                setClearIntroVideo(true);
                              }}
                            >
                              Remove intro video
                            </button>
                          </div>
                        ) : (
                          <p className="admin-muted">No intro video uploaded — site uses public/initial video.mp4 as fallback.</p>
                        )}

                        <label className="admin-file-upload">
                          <input type="file" accept="image/gif,image/*" onChange={(e) => setLoaderGifFile(e.target.files?.[0] || null)} />
                          <span className="admin-file-upload-trigger"><UploadIcon /><b>{loaderGifFile ? 'Change loading GIF' : 'Choose loading GIF'}</b></span>
                          <small>{loaderGifFile ? loaderGifFile.name : 'GIF/PNG/JPG supported'}</small>
                        </label>
                        {(loaderGifFile || loaderGifUrl) ? (
                          <div className="admin-upload-preview">
                            <img src={loaderGifFile ? URL.createObjectURL(loaderGifFile) : loaderGifUrl} alt="Loader GIF preview" />
                          </div>
                        ) : null}

                        <div className="admin-cms-item">
                          <label>Background Type</label>
                          <select value={loaderBgType} onChange={(e) => setLoaderBgType(e.target.value)}>
                            <option value="color">Color</option>
                            <option value="image">Image</option>
                            <option value="gif">GIF</option>
                          </select>
                          <span />
                          <span />
                        </div>

                        {loaderBgType === 'color' ? (
                          <div className="admin-cms-item">
                            <label>Background Color</label>
                            <input type="color" value={loaderBgColor} onChange={(e) => { setLoaderBgColor(e.target.value); setLoaderBgHex(e.target.value); }} />
                            <input value={loaderBgHex} onChange={(e) => { setLoaderBgHex(e.target.value); setLoaderBgColor(e.target.value); }} placeholder="#E3F7FD" />
                            <span />
                          </div>
                        ) : (
                          <>
                            <label className="admin-file-upload">
                              <input type="file" accept="image/*" onChange={(e) => setLoaderBgFile(e.target.files?.[0] || null)} />
                              <span className="admin-file-upload-trigger"><UploadIcon /><b>{loaderBgFile ? 'Change background media' : 'Choose background media'}</b></span>
                              <small>{loaderBgFile ? loaderBgFile.name : 'PNG/JPG/GIF supported'}</small>
                            </label>
                            {(loaderBgFile || loaderBgUrl) ? (
                              <div className="admin-upload-preview">
                                <img src={loaderBgFile ? URL.createObjectURL(loaderBgFile) : loaderBgUrl} alt="Loader background preview" />
                              </div>
                            ) : null}
                          </>
                        )}
                        <div className="admin-cms-item">
                          <label>Show loader + intro video every (hours)</label>
                          <input
                            type="number"
                            min="1"
                            value={loaderFrequencyHours}
                            onChange={(e) => setLoaderFrequencyHours(e.target.value)}
                          />
                          <span />
                          <span />
                        </div>
                      </div>
                      <div className="admin-modal-actions"><button className="btn btn-lime" onClick={() => run(saveLoaderOnly)}>Save Loader</button></div>
                    </>
                  ) : null}

                  {siteSection === 'theme' ? (
                    <>
                      <div className="admin-panel-head"><h2>Theme</h2></div>
                      <p className="admin-muted">Set global website colors (dark-first).</p>
                      <div className="admin-cms-list">
                        <div className="admin-cms-item">
                          <label>Primary</label>
                          <input type="color" value={siteTheme.primary} onChange={(e) => setSiteTheme((p) => ({ ...p, primary: e.target.value }))} />
                          <input value={siteTheme.primary} onChange={(e) => setSiteTheme((p) => ({ ...p, primary: e.target.value }))} />
                          <span />
                        </div>
                        <div className="admin-cms-item">
                          <label>Accent</label>
                          <input type="color" value={siteTheme.accent} onChange={(e) => setSiteTheme((p) => ({ ...p, accent: e.target.value }))} />
                          <input value={siteTheme.accent} onChange={(e) => setSiteTheme((p) => ({ ...p, accent: e.target.value }))} />
                          <span />
                        </div>
                        <div className="admin-cms-item">
                          <label>Light Background</label>
                          <input type="color" value={siteTheme.light_bg} onChange={(e) => setSiteTheme((p) => ({ ...p, light_bg: e.target.value }))} />
                          <input value={siteTheme.light_bg} onChange={(e) => setSiteTheme((p) => ({ ...p, light_bg: e.target.value }))} />
                          <span />
                        </div>
                        <div className="admin-cms-item">
                          <label>Black</label>
                          <input type="color" value={siteTheme.black} onChange={(e) => setSiteTheme((p) => ({ ...p, black: e.target.value }))} />
                          <input value={siteTheme.black} onChange={(e) => setSiteTheme((p) => ({ ...p, black: e.target.value }))} />
                          <span />
                        </div>
                        <div className="admin-cms-item">
                          <label>Warm</label>
                          <input type="color" value={siteTheme.warm} onChange={(e) => setSiteTheme((p) => ({ ...p, warm: e.target.value }))} />
                          <input value={siteTheme.warm} onChange={(e) => setSiteTheme((p) => ({ ...p, warm: e.target.value }))} />
                          <span />
                        </div>
                      </div>
                      <div className="admin-modal-actions"><button className="btn btn-lime" onClick={() => run(saveThemeOnly)}>Save Theme</button></div>
                    </>
                  ) : null}

                  {siteSection === 'resources' ? (
                    <>
                      <div className="admin-panel-head">
                        <h2>Resources Page</h2>
                      </div>
                      <p className="admin-muted">
                        Configure the title, description, and link lists shown on the resources/assets page.
                      </p>
                      <div className="admin-cms-list">
                        <div className="admin-cms-section">
                          <h3 className="admin-subhead">Page Info</h3>
                          <div className="admin-cms-item">
                            <input
                              value={siteResourcesPage.title || ''}
                              onChange={(e) => updateResourcesField('title', e.target.value)}
                              placeholder="Page Title (e.g. Assets & Resource)"
                            />
                            <input
                              value={siteResourcesPage.dex_label || ''}
                              onChange={(e) => updateResourcesField('dex_label', e.target.value)}
                              placeholder="DEX Label (e.g. $FUTARDIO\nDEXSCREENER)"
                            />
                            <span />
                          </div>
                          <div className="admin-cms-item">
                            <textarea
                              className="admin-textarea"
                              rows={2}
                              value={siteResourcesPage.description || ''}
                              onChange={(e) => updateResourcesField('description', e.target.value)}
                              placeholder="Description Paragraph 1"
                            />
                          </div>
                          <div className="admin-cms-item">
                            <textarea
                              className="admin-textarea"
                              rows={2}
                              value={siteResourcesPage.description2 || ''}
                              onChange={(e) => updateResourcesField('description2', e.target.value)}
                              placeholder="Description Paragraph 2"
                            />
                          </div>
                        </div>

                        {/* Left Links Builder */}
                        <div className="admin-cms-section">
                          <div className="admin-cms-section-head">
                            <h3>Left Link Column</h3>
                            <button type="button" className="btn btn-outline" onClick={() => addResourcesLink('left_links')}>+ Add Left Link</button>
                          </div>
                          <div className="admin-cms-list">
                            {(siteResourcesPage.left_links || []).map((link, idx) => (
                              <div key={`res-left-link-${idx}`} className="admin-cms-item">
                                <input
                                  value={link.label || ''}
                                  onChange={(e) => updateResourcesLink('left_links', idx, 'label', e.target.value)}
                                  placeholder="Link Label (use --- for spacer)"
                                />
                                <input
                                  value={link.path || ''}
                                  onChange={(e) => updateResourcesLink('left_links', idx, 'path', e.target.value)}
                                  placeholder="Path or URL (e.g. #logo or https://...)"
                                />
                                <label className="admin-checkline">
                                  <input
                                    type="checkbox"
                                    checked={Boolean(link.external)}
                                    onChange={(e) => updateResourcesLink('left_links', idx, 'external', e.target.checked)}
                                  />
                                  <span>External</span>
                                </label>
                                <button type="button" className="btn btn-outline" onClick={() => removeResourcesLink('left_links', idx)}>Remove</button>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Right Links Builder */}
                        <div className="admin-cms-section">
                          <div className="admin-cms-section-head">
                            <h3>Right Link Column</h3>
                            <button type="button" className="btn btn-outline" onClick={() => addResourcesLink('right_links')}>+ Add Right Link</button>
                          </div>
                          <div className="admin-cms-list">
                            {(siteResourcesPage.right_links || []).map((link, idx) => (
                              <div key={`res-right-link-${idx}`} className="admin-cms-item">
                                <input
                                  value={link.label || ''}
                                  onChange={(e) => updateResourcesLink('right_links', idx, 'label', e.target.value)}
                                  placeholder="Link Label (use --- for spacer)"
                                />
                                <input
                                  value={link.path || ''}
                                  onChange={(e) => updateResourcesLink('right_links', idx, 'path', e.target.value)}
                                  placeholder="Path or URL (e.g. https://...)"
                                />
                                <label className="admin-checkline">
                                  <input
                                    type="checkbox"
                                    checked={Boolean(link.external)}
                                    onChange={(e) => updateResourcesLink('right_links', idx, 'external', e.target.checked)}
                                  />
                                  <span>External</span>
                                </label>
                                <button type="button" className="btn btn-outline" onClick={() => removeResourcesLink('right_links', idx)}>Remove</button>
                              </div>
                            ))}
                          </div>
                        </div>

                      </div>
                      <div className="admin-modal-actions">
                        <button className="btn btn-lime" onClick={() => run(saveResourcesPageOnly)}>Save Resources Page</button>
                      </div>
                    </>
                  ) : null}

                  {siteSection === 'backgrounds' ? (
                    <>
                      <div className="admin-panel-head">
                        <h2>Backgrounds & Blur Settings</h2>
                      </div>
                      <p className="admin-muted">
                        Upload custom background images and configure blur amounts and color overlay opacity for each page.
                      </p>
                      <div className="admin-cms-list">
                        {['home', 'about', 'roadmap', 'memes', 'assets', 'editor', 'support', 'privacy', 'custom'].map((pageKey) => {
                          const settings = sitePageBackgrounds[pageKey] || { image: '/images/bg.png', blur: 18, overlay_opacity: 0.92 };
                          const file = sitePageBgFiles[pageKey];
                          const imageSrc = file ? URL.createObjectURL(file) : settings.image;

                          return (
                            <div key={`bg-page-${pageKey}`} className="admin-cms-section">
                              <div className="admin-cms-section-head">
                                <strong style={{ textTransform: 'capitalize' }}>{pageKey} Page</strong>
                              </div>
                              
                              <div className="admin-cms-item">
                                <label className="admin-field">
                                  <span>Blur (px)</span>
                                  <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={settings.blur !== undefined ? settings.blur : 18}
                                    onChange={(e) => updatePageBgField(pageKey, 'blur', Number(e.target.value))}
                                  />
                                </label>
                                <label className="admin-field">
                                  <span>Overlay Opacity (0.00 - 1.00)</span>
                                  <input
                                    type="number"
                                    min="0"
                                    max="1"
                                    step="0.05"
                                    value={settings.overlay_opacity !== undefined ? settings.overlay_opacity : 0.92}
                                    onChange={(e) => updatePageBgField(pageKey, 'overlay_opacity', Number(e.target.value))}
                                  />
                                </label>
                                <span />
                              </div>

                              <label className="admin-file-upload" style={{ marginTop: 8 }}>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => handlePageBgFile(pageKey, e.target.files?.[0] || null)}
                                />
                                <span className="admin-file-upload-trigger">
                                  <UploadIcon />
                                  <b>{file ? 'Change image' : 'Upload custom background'}</b>
                                </span>
                                <small>{file ? file.name : 'PNG, JPG, WEBP supported (leave blank to use fallback)'}</small>
                              </label>

                              {(file || settings.image) ? (
                                <div className="admin-upload-preview" style={{ marginTop: 8 }}>
                                  <img
                                    src={imageSrc || '/images/bg.png'}
                                    alt={`${pageKey} background preview`}
                                    style={{
                                      filter: `blur(${settings.blur}px)`,
                                      transition: 'filter 0.3s ease',
                                      maxHeight: 120,
                                      objectFit: 'cover',
                                      width: '100%',
                                    }}
                                  />
                                  <button
                                    className="btn btn-outline"
                                    type="button"
                                    onClick={() => clearPageBgImage(pageKey)}
                                    style={{ marginTop: 8 }}
                                  >
                                    Use Default / Remove custom background
                                  </button>
                                </div>
                              ) : null}
                            </div>
                          );
                        })}
                      </div>
                      <div className="admin-modal-actions">
                        <button className="btn btn-lime" onClick={() => run(savePageBackgroundsOnly)}>Save Page Backgrounds</button>
                      </div>
                    </>
                  ) : null}
                </div>
              </div>
            </section>
            ) : null}

            {siteSection === 'pages' ? (
              <section className="admin-panel admin-cms-panel" style={{ marginTop: 16 }}>
              <div className="admin-panel-head">
                <h2>Custom Pages</h2>
                <button className="btn btn-lime" onClick={openCreateCustomPage}>+ Add Page</button>
              </div>
              <p className="admin-muted">Create additional pages available on `/page/slug`.</p>
              <table className="mc-list-table">
                <thead><tr><th>Title</th><th>Slug</th><th>Published</th><th>Actions</th></tr></thead>
                <tbody>
                  {customPages.map((row) => (
                    <tr key={row.id}>
                      <td>{row.title}</td>
                      <td>/page/{row.slug}</td>
                      <td>{row.is_published ? 'Yes' : 'No'}</td>
                      <td className="mc-actions-cell">
                        <button onClick={() => openEditCustomPage(row)}>Edit</button>
                        <button
                          onClick={() =>
                            setConfirmModal({
                              title: 'Delete Page',
                              message: `Delete page "${row.title}"? This cannot be undone.`,
                              confirmText: 'Delete',
                              onConfirm: async () => {
                                await adminDeleteCustomPage(row.id);
                                await loadCustomPages();
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
              </section>
            ) : null}
          </>
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
            <p>Update phase card content shown on the public roadmap timeline.</p>
            <input value={roadEditTitle} onChange={(e) => setRoadEditTitle(e.target.value)} placeholder="Title (LAUNCH & FOUNDATION)" />
            <input value={roadEditPhase} onChange={(e) => setRoadEditPhase(e.target.value)} placeholder="Phase label (PHASE 1)" />
            <input value={roadEditPeriod} onChange={(e) => setRoadEditPeriod(e.target.value)} placeholder="Period (Q2 2024)" />
            <textarea value={roadEditDesc} onChange={(e) => setRoadEditDesc(e.target.value)} placeholder="Description" rows={4} />
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
            <label className="admin-checkline">
              <input type="checkbox" checked={roadEditIsActive} onChange={(e) => setRoadEditIsActive(e.target.checked)} />
              <span>Active (visible on public roadmap)</span>
            </label>
            <div className="admin-modal-actions">
              <button className="btn btn-outline" onClick={() => setRoadEditModal(null)}>Cancel</button>
              <button className="btn btn-lime" disabled={busy || !roadEditTitle.trim()} onClick={() => run(() => editRoadmap(roadEditModal))}>Save</button>
            </div>
          </div>
        </div>
      ) : null}

      {roadCreateModalOpen ? (
        <div className="admin-modal-overlay" onClick={() => setRoadCreateModalOpen(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Create Roadmap Item</h3>
            <p>Add a new roadmap milestone.</p>
            <input value={roadTitle} onChange={(e) => setRoadTitle(e.target.value)} placeholder="Title (LAUNCH & FOUNDATION)" />
            <input value={roadPhase} onChange={(e) => setRoadPhase(e.target.value)} placeholder="Phase label (PHASE 1)" />
            <input value={roadPeriod} onChange={(e) => setRoadPeriod(e.target.value)} placeholder="Period (Q2 2024)" />
            <textarea value={roadDesc} onChange={(e) => setRoadDesc(e.target.value)} placeholder="Description" rows={4} />
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

      {customPageModal ? (
        <div className="admin-modal-overlay" onClick={() => setCustomPageModal(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <h3>{customPageModal.mode === 'edit' ? 'Edit Page' : 'Create Page'}</h3>
            <input value={customPageTitle} onChange={(e) => setCustomPageTitle(e.target.value)} placeholder="Title" />
            <input value={customPageSlug} onChange={(e) => setCustomPageSlug(e.target.value)} placeholder="Slug (about-us)" />
            <RichTextEditor value={customPageBody} onChange={setCustomPageBody} />
            <label className="admin-checkline">
              <input type="checkbox" checked={customPagePublished} onChange={(e) => setCustomPagePublished(e.target.checked)} />
              <span>Published</span>
            </label>
            <div className="admin-modal-actions">
              <button className="btn btn-outline" onClick={() => setCustomPageModal(null)}>Cancel</button>
              <button className="btn btn-lime" onClick={() => run(saveCustomPage)} disabled={busy || !customPageTitle.trim() || !customPageSlug.trim()}>Save</button>
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
