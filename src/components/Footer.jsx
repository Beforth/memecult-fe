import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getPublicSiteConfig } from '../api/client';
import { DEFAULT_FOOTER_LOGO, resolveFooterLogo } from '../utils/siteMedia';

export default function Footer() {
  const [sections, setSections] = useState([
    { title: 'Product', links: [{ label: 'Memes', path: '/memes', external: false }, { label: 'Editor', path: '/editor', external: false }] },
    { title: 'Resources', links: [{ label: 'Roadmap', path: '/roadmap', external: false }, { label: 'Support', path: '/support', external: false }, { label: 'Privacy', path: '/privacy', external: false }] },
  ]);
  const [footerLogoSrc, setFooterLogoSrc] = useState(DEFAULT_FOOTER_LOGO);
  const [cta, setCta] = useState({
    title: 'READY TO GO VIRAL?',
    description: 'Join creators making the internet funnier every day.',
    button_text: 'Start Creating Now',
    button_path: '/editor',
    external: false,
  });

  useEffect(() => {
    let live = true;
    getPublicSiteConfig()
      .then((cfg) => {
        if (!live) return;
        setFooterLogoSrc(resolveFooterLogo(cfg));
        if (Array.isArray(cfg.footer_sections) && cfg.footer_sections.length) setSections(cfg.footer_sections);
        if (cfg.footer_cta && typeof cfg.footer_cta === 'object') setCta((prev) => ({ ...prev, ...cfg.footer_cta }));
      })
      .catch(() => {});
    return () => {
      live = false;
    };
  }, []);

  return (
    <footer className="site-footer-premium">
      <div className="site-footer-inner">
        <div className="footer-col footer-logo-col">
          <img src={footerLogoSrc} alt="MemeCult" className="footer-logo-mark" />
        </div>

        {sections.map((section, sIdx) => (
          <div className="footer-col" key={`${section.title}-${sIdx}`}>
            <h4>{section.title}</h4>
            {(section.links || []).map((item, idx) => (
              item.external ? (
                <a key={`${item.label}-${idx}`} href={item.path} target="_blank" rel="noreferrer">{item.label}</a>
              ) : (
                <Link key={`${item.label}-${idx}`} to={item.path}>{item.label}</Link>
              )
            ))}
          </div>
        ))}

        <div className="footer-col footer-viral">
          <h4>{cta.title}</h4>
          <p>{cta.description}</p>
          {cta.external ? (
            <a href={cta.button_path} target="_blank" rel="noreferrer" className="site-btn site-btn-lime">{cta.button_text}</a>
          ) : (
            <Link to={cta.button_path} className="site-btn site-btn-lime">{cta.button_text}</Link>
          )}
        </div>
      </div>
    </footer>
  );
}
