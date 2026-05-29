import { useEffect, useState } from 'react';
import { listMemes } from '../api/client';
import Footer from '../components/Footer';
import './StaticCultPage.css';
import './HomePage.css';

export default function MemesPage() {
  const [items, setItems] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(10);
  const [busy, setBusy] = useState(false);
  const [selectedMeme, setSelectedMeme] = useState(null);

  // Load memes from real backend or fall back to high-density mockup data
  useEffect(() => {
    loadMemes(currentPage);
  }, [currentPage]);

  const loadMemes = async (page) => {
    setBusy(true);
    try {
      const queryParams = new URLSearchParams({
        page: page,
        page_size: 16,
      });
      const data = await listMemes(`?${queryParams.toString()}`);
      
      let loaded = data.results || [];
      if (loaded.length === 0) {
        throw new Error('Empty database');
      }
      
      // Ensure we fill up the 8x2 grid (16 items) by repeating loaded ones if database is sparse
      const repeated = [];
      while (repeated.length < 16) {
        repeated.push(...loaded.map((item, idx) => ({ ...item, id: `${item.id || idx}-${repeated.length}` })));
      }
      setItems(repeated.slice(0, 16));
      setTotalPages(Math.max(10, Math.ceil((data.count || 16) / 16)));
    } catch (err) {
      console.warn('Backend load failed, using high-fidelity 8x2 mockup data:', err.message);
      generateMockupData(16);
    } finally {
      setBusy(false);
    }
  };

  const generateMockupData = (size) => {
    const photoMockups = [
      { id: 1, title: 'Futardio Throne', image: '/images/avatar.png', owner_name: 'Ady', tags: 'photo' },
      { id: 2, title: 'System Activated', image: '/images/card-bg-2.png', owner_name: 'FutardioCult', tags: 'photo' },
      { id: 3, title: 'Meme Catalyst', image: '/images/card-bg-3.png', owner_name: 'MemeLord', tags: 'photo' },
      { id: 4, title: 'Pixel Governance', image: '/images/bg.png', owner_name: 'Decentra', tags: 'photo' },
      { id: 5, title: 'First Ever Governed', image: '/images/logo.png', owner_name: 'Ady', tags: 'photo' },
      { id: 6, title: 'Monday Chaos', image: '/images/1bij.jpg', owner_name: 'MemeLord', tags: 'photo' },
      { id: 7, title: 'Daily Struggle', image: '/images/1ur9b0.jpg', owner_name: 'Ady', tags: 'photo' },
      { id: 8, title: 'Explain This', image: '/images/26am.jpg', owner_name: 'FutardioCult', tags: 'photo' },
      { id: 9, title: 'Next Phase', image: '/images/30b1gx.jpg', owner_name: 'MemeLord', tags: 'photo' },
    ];

    const repeated = [];
    while (repeated.length < size) {
      repeated.push(...photoMockups.map((item, idx) => ({ ...item, id: `${item.id}-${repeated.length}-${idx}` })));
    }
    setItems(repeated.slice(0, size));
    setTotalPages(10);
  };

  const handleDownload = (meme) => {
    const link = document.createElement('a');
    link.href = meme.image;
    link.download = `${meme.title.toLowerCase().replace(/\s+/g, '_')}_futardio.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="canva-home-page">
      <div className="canva-home-content" style={{ gap: '16px', position: 'relative' }}>
        {/* Centered large watermark logo behind the text & grid */}
        <div className="canva-hero-watermark-logo" aria-hidden="true" style={{ position: 'absolute', top: '45%', left: '50%', transform: 'translate(-50%, -50%)', opacity: 0.13, zIndex: 0 }}>
          <img src="/images/logo.png" alt="" />
        </div>

        <header className="gallery-header" style={{ textAlign: 'center', marginTop: '24px', position: 'relative', zIndex: 1 }}>
          <h1 className="canva-main-title" style={{ fontSize: '3.6rem', marginBottom: '8px' }}>
            Futardio Gallery
          </h1>
          <p className="gallery-subtitle-serif" style={{ fontFamily: "'Abhaya Libre', Georgia, serif", fontSize: '1.45rem', fontWeight: 600, color: '#1a233d', fontStyle: 'italic', margin: '0 0 24px' }}>
            Memes and Clips
          </p>
        </header>

        {/* 8-Column Media Grid */}
        {busy ? (
          <div className="gallery-loader" style={{ fontFamily: "'Abhaya Libre', Georgia, serif", fontSize: '1.2rem', color: '#1a233d', textAlign: 'center', padding: '40px 0', position: 'relative', zIndex: 1 }}>
            Scanning Media Feed...
          </div>
        ) : (
          <div className="canva-gallery-8col-grid" style={{ position: 'relative', zIndex: 1 }}>
            {items.map((meme) => (
              <div 
                className="canva-gallery-card" 
                key={meme.id}
                onClick={() => setSelectedMeme(meme)}
              >
                <div className="canva-card-square-box">
                  <img src={meme.image} alt={meme.title} className="canva-card-img" />
                </div>
                <div className="canva-card-meta">
                  <div className="meta-type-row">Type : Image</div>
                  <div className="meta-name-row">Name: {meme.title}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Centered Canva Pagination: Page : 1 / 2 / 3...10 */}
        <div className="canva-gallery-pagination">
          <span className="pagination-label">Page : </span>
          <button 
            type="button" 
            className={`page-num-btn ${currentPage === 1 ? 'active' : ''}`}
            onClick={() => setCurrentPage(1)}
          >
            1
          </button>
          <span className="page-separator">/</span>
          <button 
            type="button" 
            className={`page-num-btn ${currentPage === 2 ? 'active' : ''}`}
            onClick={() => setCurrentPage(2)}
          >
            2
          </button>
          <span className="page-separator">/</span>
          <button 
            type="button" 
            className={`page-num-btn ${currentPage === 3 ? 'active' : ''}`}
            onClick={() => setCurrentPage(3)}
          >
            3
          </button>
          <span className="page-separator">...</span>
          <button 
            type="button" 
            className={`page-num-btn ${currentPage === 10 ? 'active' : ''}`}
            onClick={() => setCurrentPage(10)}
          >
            10
          </button>
        </div>

        {/* Footer landing description text block */}
        <p className="canva-gallery-bottom-desc">
          Futardio Cult is a community driven meme coin , built on futarchy principles. Unruggable by holly book of metaDAO.
        </p>

        {/* Modal popup sub-window for full image + download button */}
        {selectedMeme && (
          <div className="gallery-modal-overlay" onClick={() => setSelectedMeme(null)}>
            <div className="gallery-sub-window" onClick={(e) => e.stopPropagation()}>
              <button 
                type="button" 
                className="sub-window-close-btn"
                onClick={() => setSelectedMeme(null)}
              >
                ✕
              </button>
              
              <div className="sub-window-content">
                <div className="sub-window-media-box">
                  <img src={selectedMeme.image} alt={selectedMeme.title} className="sub-window-image" />
                </div>

                <div className="sub-window-info-box">
                  <h2 style={{ fontFamily: "'Milonga', cursive", color: '#1a233d', fontSize: '1.8rem', margin: '0 0 8px' }}>
                    {selectedMeme.title}
                  </h2>
                  <p style={{ fontFamily: "'Abhaya Libre', serif", color: '#4f5a75', fontSize: '1.1rem', margin: '0 0 24px', fontWeight: 600 }}>
                    Created by: @{selectedMeme.owner_name}
                  </p>
                  
                  <div className="sub-window-actions" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <button 
                      type="button" 
                      className="sub-window-download-btn"
                      onClick={() => handleDownload(selectedMeme)}
                      style={{
                        background: '#a11c0c',
                        color: '#fff',
                        border: 'none',
                        fontFamily: "'Milonga', cursive",
                        fontSize: '1.1rem',
                        fontWeight: 700,
                        padding: '12px 24px',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        boxShadow: '0 4px 15px rgba(161, 28, 12, 0.25)',
                        transition: 'background 0.2s ease',
                      }}
                    >
                      📥 DOWNLOAD MEME
                    </button>
                    <button 
                      type="button" 
                      className="sub-window-cancel-btn"
                      onClick={() => setSelectedMeme(null)}
                      style={{
                        background: 'transparent',
                        color: '#1a233d',
                        border: '1.5px solid #1a233d',
                        fontFamily: "'Milonga', cursive",
                        fontSize: '1.05rem',
                        fontWeight: 700,
                        padding: '10px 24px',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        transition: 'background 0.2s ease',
                      }}
                    >
                      CLOSE WINDOW
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Reusable premium footer */}
        <Footer />
      </div>
    </div>
  );
}
