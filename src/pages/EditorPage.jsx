import { useEffect, useMemo, useRef, useState } from 'react';
import * as fabric from 'fabric';
import { Hand } from 'lucide-react';
import { listAssets, publishMeme } from '../api/client';

function Icon({ name, className = '' }) {
  const common = {
    className: `mc-editor-svg ${className}`.trim(),
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: '2',
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  };

  if (name === 'image') return <svg {...common}><rect x='3' y='3' width='18' height='18' rx='2' /><circle cx='9' cy='9' r='1.8' /><path d='m21 15-5-5L5 21' /></svg>;
  if (name === 'smile') return <svg {...common}><circle cx='12' cy='12' r='10' /><path d='M8 14s1.5 2 4 2 4-2 4-2' /><line x1='9' y1='9' x2='9.01' y2='9' /><line x1='15' y1='9' x2='15.01' y2='9' /></svg>;
  if (name === 'type') return <svg {...common}><path d='M4 7h16' /><path d='M10 7v10' /><path d='M14 7v10' /><path d='M8 17h8' /></svg>;
  if (name === 'plus') return <svg {...common}><path d='M12 5v14M5 12h14' /></svg>;
  if (name === 'copy') return <svg {...common}><rect x='9' y='9' width='10' height='10' rx='2' /><rect x='5' y='5' width='10' height='10' rx='2' /></svg>;
  if (name === 'arrow-up') return <svg {...common}><path d='M12 19V5' /><path d='m6 11 6-6 6 6' /></svg>;
  if (name === 'arrow-down') return <svg {...common}><path d='M12 5v14' /><path d='m18 13-6 6-6-6' /></svg>;
  if (name === 'trash') return <svg {...common}><path d='M3 6h18' /><path d='M8 6V4h8v2' /><path d='M19 6l-1 14H6L5 6' /><path d='M10 11v6M14 11v6' /></svg>;
  if (name === 'target') return <svg {...common}><circle cx='12' cy='12' r='8' /><circle cx='12' cy='12' r='3' /></svg>;
  if (name === 'download') return <svg {...common}><path d='M12 3v12' /><path d='m7 10 5 5 5-5' /><path d='M4 21h16' /></svg>;
  return <svg {...common}><circle cx='12' cy='12' r='10' /></svg>;
}

export default function EditorPage() {
  const stageRef = useRef(null);
  const canvasRef = useRef(null);
  const fabricRef = useRef(null);
  const panModeRef = useRef(false);
  const panOffsetRef = useRef({ x: 0, y: 0 });
  const [assets, setAssets] = useState([]);
  const [activeTab, setActiveTab] = useState('templates');
  const [zoom, setZoom] = useState(1);
  const [panMode, setPanMode] = useState(false);
  const [history, setHistory] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const [selectedText, setSelectedText] = useState('THAT MOMENT');
  const [fontSize, setFontSize] = useState(72);
  const [fontFamily, setFontFamily] = useState('Impact');
  const [layers, setLayers] = useState([]);
  const [publishTitle, setPublishTitle] = useState('My Meme');
  const [publishMsg, setPublishMsg] = useState('');
  const [templateCategory, setTemplateCategory] = useState('All');
  const [stickerCategory, setStickerCategory] = useState('All');

  useEffect(() => {
    const initialW = stageRef.current?.clientWidth || 1200;
    const initialH = stageRef.current?.clientHeight || 700;
    const c = new fabric.Canvas(canvasRef.current, {
      width: initialW,
      height: initialH,
      backgroundColor: '#111',
      preserveObjectStacking: true,
    });
    fabricRef.current = c;

    const applyCanvasOffset = () => {
      if (!c.wrapperEl) return;
      const { x, y } = panOffsetRef.current;
      c.wrapperEl.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px)`;
      c.wrapperEl.style.position = 'absolute';
      c.wrapperEl.style.left = '50%';
      c.wrapperEl.style.top = '50%';
      c.wrapperEl.style.zIndex = '2';
    };

    fabric.Object.prototype.cornerColor = '#ffffff';
    fabric.Object.prototype.cornerStrokeColor = '#a329ff';
    fabric.Object.prototype.borderColor = '#a329ff';
    fabric.Object.prototype.cornerSize = 12;
    fabric.Object.prototype.transparentCorners = false;

    let layerSeq = 0;

    const ensureLayerId = (obj) => {
      if (!obj) return;
      if (!obj.__layerId) {
        layerSeq += 1;
        obj.__layerId = `layer-${Date.now()}-${layerSeq}`;
      }
    };

    const save = () => {
      setRedoStack([]);
      setHistory((prev) => {
        const next = [...prev, JSON.stringify(c.toJSON())];
        return next.length > 50 ? next.slice(next.length - 50) : next;
      });
    };

    const syncLayers = () => {
      const list = c
        .getObjects()
        .map((obj, idx) => ({
          id: obj.__layerId || `layer-fallback-${idx}`,
          type: obj.type,
          name: obj.type === 'image' ? `Image ${idx + 1}` : (obj.text ? String(obj.text).slice(0, 20) : obj.type),
          preview: obj.type === 'image' ? (obj.getSrc ? obj.getSrc() : obj._element?.src || '') : '',
          ref: obj,
        }))
        .reverse();
      setLayers(list);
    };

    c.on('object:added', save);
    c.on('object:modified', save);
    c.on('object:removed', save);
    c.on('object:added', (e) => ensureLayerId(e.target));
    c.on('object:added', syncLayers);
    c.on('object:modified', syncLayers);
    c.on('object:removed', syncLayers);
    c.on('selection:created', syncPanel);
    c.on('selection:updated', syncPanel);
    c.on('selection:created', syncLayers);
    c.on('selection:updated', syncLayers);

    syncLayers();

    let isPanning = false;
    let lastPosX = 0;
    let lastPosY = 0;

    c.on('mouse:down', (opt) => {
      if (!panModeRef.current) return;
      isPanning = true;
      c.selection = false;
      const evt = opt.e;
      lastPosX = evt.clientX;
      lastPosY = evt.clientY;
    });

    c.on('mouse:move', (opt) => {
      if (!panModeRef.current || !isPanning) return;
      const evt = opt.e;
      panOffsetRef.current = {
        x: panOffsetRef.current.x + (evt.clientX - lastPosX),
        y: panOffsetRef.current.y + (evt.clientY - lastPosY),
      };
      applyCanvasOffset();
      lastPosX = evt.clientX;
      lastPosY = evt.clientY;
    });

    c.on('mouse:up', () => {
      isPanning = false;
      c.selection = !panModeRef.current;
      c.defaultCursor = panModeRef.current ? 'grab' : 'default';
    });

    const ro = new ResizeObserver(() => {
      c.requestRenderAll();
    });
    if (stageRef.current) ro.observe(stageRef.current);

    applyCanvasOffset();

    setHistory([JSON.stringify(c.toJSON())]);

    loadAssets();

    return () => {
      ro.disconnect();
      c.dispose();
    };
  }, []);

  async function loadAssets() {
    const data = await listAssets();
    const rows = data.results || data || [];
    setAssets(rows);
    const first = rows.find((a) => a.asset_type === 'template');
    if (first) setTemplate(first.file);
  }

  function active() {
    return fabricRef.current?.getActiveObject();
  }

  function applyZoomCentered(nextZoom) {
    const c = fabricRef.current;
    if (!c) return;
    const cw = c.getWidth();
    const ch = c.getHeight();
    const tx = (cw - cw * nextZoom) / 2;
    const ty = (ch - ch * nextZoom) / 2;
    c.setViewportTransform([nextZoom, 0, 0, nextZoom, tx, ty]);
    c.requestRenderAll();
  }

  function refreshLayersNow() {
    const c = fabricRef.current;
    if (!c) return;
    const list = c
      .getObjects()
      .map((obj, idx) => ({
        id: obj.__layerId || `layer-fallback-${idx}`,
        type: obj.type,
        name: obj.type === 'image' ? `Image ${idx + 1}` : (obj.text ? String(obj.text).slice(0, 20) : obj.type),
        preview: obj.type === 'image' ? (obj.getSrc ? obj.getSrc() : obj._element?.src || '') : '',
        ref: obj,
      }))
      .reverse();
    setLayers(list);
  }

  function selectLayer(layerObj) {
    const c = fabricRef.current;
    if (!c || !layerObj) return;
    c.setActiveObject(layerObj);
    c.requestRenderAll();
    syncPanel();
  }

  function syncPanel() {
    const obj = active();
    if (!obj) return;
    if (obj.type === 'textbox' || obj.type === 'i-text' || obj.type === 'text') {
      setSelectedText(obj.text || '');
      setFontSize(Number(obj.fontSize || 72));
      setFontFamily(obj.fontFamily || 'Impact');
    }
  }

  async function setTemplate(url) {
    const c = fabricRef.current;
    if (!c) return;
    const img = await fabric.FabricImage.fromURL(url, { crossOrigin: 'anonymous' });
    const cw = img.width;
    const ch = img.height;
    c.setDimensions({ width: cw, height: ch });
    img.set({
      left: cw / 2,
      top: ch / 2,
      originX: 'center',
      originY: 'center',
      selectable: false,
      evented: false,
      scaleX: 1,
      scaleY: 1,
    });
    c.clear();
    c.setViewportTransform([1, 0, 0, 1, 0, 0]);
    panOffsetRef.current = { x: 0, y: 0 };
    if (c.wrapperEl) c.wrapperEl.style.transform = 'translate(-50%, -50%) translate(0px, 0px)';
    const stageW = stageRef.current?.clientWidth || cw;
    const stageH = stageRef.current?.clientHeight || ch;
    const fitZoom = Math.min(stageW / cw, stageH / ch) * 0.92;
    const startZoom = Math.max(0.5, Math.min(1, fitZoom));
    setZoom(startZoom);
    c.add(img);
    if (typeof c.sendObjectToBack === 'function') {
      c.sendObjectToBack(img);
    } else if (typeof c.sendToBack === 'function') {
      c.sendToBack(img);
    }
    addMemeText('THAT MOMENT', cw / 2, 80);
    addMemeText('WHEN IT WORKS!', cw / 2, ch - 90);
    setActiveTab('templates');
    applyZoomCentered(startZoom);
    c.requestRenderAll();
  }

  function addMemeText(text = 'NEW TEXT', left, top) {
    const c = fabricRef.current;
    if (!c) return;
    const x = left ?? c.getWidth() / 2;
    const y = top ?? c.getHeight() / 2;
    const t = new fabric.Textbox(text, {
      left: x,
      top: y,
      width: 620,
      originX: 'center',
      fontFamily: 'Impact',
      fontSize: 72,
      fill: '#fff',
      stroke: '#000',
      strokeWidth: 3,
      textAlign: 'center',
      shadow: '3px 3px 0px #000',
    });
    c.add(t);
    c.setActiveObject(t);
    c.requestRenderAll();
    syncPanel();
  }

  async function addSticker(url) {
    const c = fabricRef.current;
    if (!c) return;
    const img = await fabric.FabricImage.fromURL(url, { crossOrigin: 'anonymous' });
    const side = Math.max(img.width, img.height);
    const scale = 120 / side;
    img.set({ left: c.getWidth() / 2, top: c.getHeight() / 2, originX: 'center', originY: 'center', scaleX: scale, scaleY: scale });
    c.add(img);
    c.setActiveObject(img);
    c.requestRenderAll();
  }

  function updateText(value) {
    setSelectedText(value);
    const obj = active();
    if (!obj) return;
    if (obj.type === 'textbox' || obj.type === 'i-text' || obj.type === 'text') {
      obj.set('text', value);
      fabricRef.current.requestRenderAll();
    }
  }

  function updateFont(value) {
    setFontFamily(value);
    const obj = active();
    if (!obj) return;
    obj.set('fontFamily', value);
    fabricRef.current.requestRenderAll();
  }

  function updateSize(value) {
    const v = Number(value);
    setFontSize(v);
    const obj = active();
    if (!obj) return;
    obj.set('fontSize', v);
    fabricRef.current.requestRenderAll();
  }

  function apply(prop, value) {
    const obj = active();
    if (!obj) return;
    obj.set(prop, value);
    fabricRef.current.requestRenderAll();
  }

  function del() {
    const c = fabricRef.current;
    const obj = active();
    if (c && obj) {
      c.remove(obj);
      refreshLayersNow();
    }
  }

  function duplicate() {
    const c = fabricRef.current;
    const obj = active();
    if (!c || !obj) return;
    Promise.resolve(obj.clone()).then((cloned) => {
      cloned.set({ left: obj.left + 20, top: obj.top + 20 });
      c.add(cloned);
      c.setActiveObject(cloned);
      c.requestRenderAll();
      refreshLayersNow();
    });
  }

  function bringForward() {
    const c = fabricRef.current;
    const obj = active();
    if (!c || !obj) return;
    if (typeof c.bringObjectForward === 'function') c.bringObjectForward(obj);
    else if (typeof c.bringForward === 'function') c.bringForward(obj);
    c.requestRenderAll();
    requestAnimationFrame(refreshLayersNow);
  }

  function sendBack() {
    const c = fabricRef.current;
    const obj = active();
    if (!c || !obj) return;
    if (typeof c.sendObjectBackwards === 'function') c.sendObjectBackwards(obj);
    else if (typeof c.sendBackwards === 'function') c.sendBackwards(obj);
    c.requestRenderAll();
    requestAnimationFrame(refreshLayersNow);
  }

  function undo() {
    const c = fabricRef.current;
    if (!c || history.length < 2) return;
    setRedoStack((prev) => [...prev, history[history.length - 1]]);
    const prevJson = history[history.length - 2];
    setHistory((h) => h.slice(0, -1));
    Promise.resolve(c.loadFromJSON(prevJson)).then(() => c.requestRenderAll());
  }

  function redo() {
    const c = fabricRef.current;
    if (!c || !redoStack.length) return;
    const json = redoStack[redoStack.length - 1];
    setRedoStack((r) => r.slice(0, -1));
    setHistory((h) => [...h, json]);
    Promise.resolve(c.loadFromJSON(json)).then(() => c.requestRenderAll());
  }

  function changeZoom(delta) {
    const c = fabricRef.current;
    if (!c) return;
    const next = Math.max(0.5, Math.min(2, zoom + delta));
    setZoom(next);
    applyZoomCentered(next);
  }

  function togglePanMode() {
    const next = !panMode;
    setPanMode(next);
    panModeRef.current = next;
    const c = fabricRef.current;
    if (!c) return;
    c.discardActiveObject();
    c.selection = !next;
    c.defaultCursor = next ? 'grab' : 'default';
    c.requestRenderAll();
  }

  function resetCanvasPosition() {
    const c = fabricRef.current;
    if (!c) return;
    panOffsetRef.current = { x: 0, y: 0 };
    if (c.wrapperEl) c.wrapperEl.style.transform = 'translate(-50%, -50%) translate(0px, 0px)';
    applyZoomCentered(zoom);
  }

  function exportPng() {
    const c = fabricRef.current;
    if (!c) return;
    const url = c.toDataURL({ format: 'png', multiplier: 2 });
    const a = document.createElement('a');
    a.href = url;
    a.download = 'memecult-meme.png';
    a.click();
  }

  async function publishCurrentMeme() {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setPublishMsg('Login required to publish');
      return;
    }
    const c = fabricRef.current;
    if (!c) return;
    const dataUrl = c.toDataURL({ format: 'png', multiplier: 1 });
    const blob = await (await fetch(dataUrl)).blob();
    const form = new FormData();
    form.append('title', publishTitle || 'Untitled Meme');
    form.append('caption', selectedText || '');
    form.append('tags', activeTab);
    form.append('is_published', 'true');
    form.append('image', blob, `meme-${Date.now()}.png`);

    try {
      await publishMeme(form, token);
      setPublishMsg('Meme published');
    } catch (err) {
      setPublishMsg(err.message);
    }
  }

  const templates = useMemo(() => assets.filter((a) => a.asset_type === 'template'), [assets]);
  const stickers = useMemo(() => assets.filter((a) => a.asset_type === 'sticker'), [assets]);
  const templateCategories = useMemo(() => ['All', ...Array.from(new Set(templates.map((t) => (t.category || '').trim()).filter(Boolean)))], [templates]);
  const stickerCategories = useMemo(() => ['All', ...Array.from(new Set(stickers.map((s) => (s.category || '').trim()).filter(Boolean)))], [stickers]);
  const filteredTemplates = useMemo(
    () => (templateCategory === 'All' ? templates : templates.filter((t) => (t.category || '').trim() === templateCategory)),
    [templates, templateCategory],
  );
  const filteredStickers = useMemo(
    () => (stickerCategory === 'All' ? stickers : stickers.filter((s) => (s.category || '').trim() === stickerCategory)),
    [stickers, stickerCategory],
  );

  return (
    <section className="mc-editor-page">
      <main className="mc-editor-grid">
        <aside className="mc-iconbar">
          <button className={`mc-tool ${activeTab === 'templates' ? 'active' : ''}`} onClick={() => setActiveTab('templates')}><Icon name='image' />Templates</button>
          <button className={`mc-tool ${activeTab === 'stickers' ? 'active' : ''}`} onClick={() => setActiveTab('stickers')}><Icon name='smile' />Stickers</button>
          <button className="mc-tool" onClick={() => addMemeText()}><Icon name='type' />Text</button>
        </aside>

        <aside className="mc-leftpanel">
          <div className="mc-title">{activeTab === 'stickers' ? 'Sticker Packs' : 'Templates'}</div>
          <div className="mc-chip-row">
            {(activeTab === 'templates' ? templateCategories : stickerCategories).map((cat) => (
              <button
                key={cat}
                className={`mc-chip ${(activeTab === 'templates' ? templateCategory : stickerCategory) === cat ? 'active' : ''}`}
                onClick={() => (activeTab === 'templates' ? setTemplateCategory(cat) : setStickerCategory(cat))}
              >
                {cat}
              </button>
            ))}
          </div>
          {activeTab === 'templates' ? (
            <div className="mc-template-grid">
              {filteredTemplates.map((t) => (
                <button key={t.id} className="mc-template" onClick={() => setTemplate(t.file)}>
                  <img src={t.file} alt={t.title} />
                  <span>{t.title}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="mc-sticker-grid">
              {filteredStickers.map((s) => (
                <button key={s.id} className="mc-sticker" onClick={() => addSticker(s.file)}>
                  <img src={s.file} alt={s.title} />
                </button>
              ))}
            </div>
          )}
        </aside>

        <section className="mc-stage" ref={stageRef}>
          <div className="mc-top-tools">
            <button className={panMode ? 'active' : ''} onClick={togglePanMode}><Hand className='mc-tool-btn-icon' /></button>
            <button onClick={resetCanvasPosition}><Icon name='target' className='mc-tool-btn-icon' /></button>
            <button onClick={() => addMemeText()}><Icon name='plus' className='mc-tool-btn-icon' /></button>
            <button onClick={duplicate}><Icon name='copy' className='mc-tool-btn-icon' /></button>
            <button onClick={bringForward}><Icon name='arrow-up' className='mc-tool-btn-icon' /></button>
            <button onClick={sendBack}><Icon name='arrow-down' className='mc-tool-btn-icon' /></button>
            <button onClick={del}><Icon name='trash' className='mc-tool-btn-icon' /></button>
          </div>

          <div className="mc-canvas-wrap">
            <canvas ref={canvasRef} />
          </div>

          <div className="mc-zoom">
            <button onClick={() => changeZoom(-0.1)}>−</button>
            <span>{Math.round(zoom * 100)}%</span>
            <button onClick={() => changeZoom(0.1)}>+</button>
            <button onClick={exportPng}><Icon name='download' className='mc-tool-btn-icon' /></button>
          </div>

        </section>

        <aside className="mc-rightpanel">
          <div className="mc-title">Text</div>
          <input className="mc-field" value={publishTitle} onChange={(e) => setPublishTitle(e.target.value)} placeholder="Meme title" />
          <input className="mc-field" value={selectedText} onChange={(e) => updateText(e.target.value)} />
          <select className="mc-field" value={fontFamily} onChange={(e) => updateFont(e.target.value)}>
            <option>Impact</option>
            <option>Bangers</option>
            <option>Inter</option>
            <option>Arial Black</option>
          </select>
          <div className="mc-row">
            <input className="mc-field" type="number" value={fontSize} onChange={(e) => updateSize(e.target.value)} />
            <button className="mc-square" onClick={() => updateSize(fontSize - 4)}>−</button>
            <button className="mc-square" onClick={() => updateSize(fontSize + 4)}>+</button>
          </div>
          <div className="mc-row">
            <button className="mc-square" onClick={() => apply('fontWeight', active()?.fontWeight === 'bold' ? 'normal' : 'bold')}>B</button>
            <button className="mc-square" onClick={() => apply('fontStyle', active()?.fontStyle === 'italic' ? 'normal' : 'italic')}>I</button>
            <button className="mc-square" onClick={() => apply('underline', !active()?.underline)}>U</button>
          </div>
          <div className="mc-row">
            <button className="mc-effect" onClick={() => apply('shadow', '5px 5px 8px rgba(0,0,0,0.8)')}>Shadow</button>
            <button className="mc-effect" onClick={() => { apply('stroke', '#000'); apply('strokeWidth', 3); }}>Stroke</button>
            <button className="mc-effect" onClick={() => apply('shadow', '0 0 18px #d7ff1f')}>Glow</button>
          </div>
          <input type="range" min="0" max="10" defaultValue="3" onChange={(e) => apply('strokeWidth', Number(e.target.value))} />
          <div className="mc-colors">
            {['#ffffff', '#050505', '#d7ff1f', '#8b20ff', '#f72585', '#ff7300'].map((c) => (
              <button key={c} className="mc-color" style={{ background: c }} onClick={() => apply('fill', c)} />
            ))}
            <input
              type="color"
              className="mc-color-input"
              defaultValue="#ffffff"
              onChange={(e) => apply('fill', e.target.value)}
              title="Pick any color"
              aria-label="Pick any color"
            />
          </div>
          <input type="range" min="0" max="1" step="0.01" defaultValue="1" onChange={(e) => apply('opacity', Number(e.target.value))} />

          <button className="mc-publish-btn" onClick={publishCurrentMeme}>Publish Meme</button>
          {publishMsg ? <p className="mc-publish-msg">{publishMsg}</p> : null}

          <div className="mc-title" style={{ marginTop: 18 }}>Layers</div>
          <div className="mc-layers">
            {layers.map((layer) => (
              <button key={layer.id} className="mc-layer-item" onClick={() => selectLayer(layer.ref)}>
                {layer.type === 'image' && layer.preview ? (
                  <img src={layer.preview} alt={layer.name} className="mc-layer-thumb" />
                ) : (
                  <span className="mc-layer-text">T</span>
                )}
                <span>{layer.name}</span>
              </button>
            ))}
          </div>
        </aside>
      </main>
    </section>
  );
}
