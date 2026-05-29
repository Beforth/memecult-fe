const API_BASE = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:8000/api';

export const DEFAULT_SITE_LOGO = '/images/memecult-logo.png';
export const DEFAULT_FOOTER_LOGO = '/images/footer-logo.png';

export function getApiOrigin() {
  return API_BASE.replace(/\/api\/?$/, '');
}

export function normalizeMediaUrl(url) {
  if (!url) return '';
  const apiOrigin = getApiOrigin();
  if (/^https?:\/\//i.test(url)) {
    try {
      const parsed = new URL(url);
      const api = new URL(apiOrigin);
      const isLocal = parsed.hostname === '127.0.0.1' || parsed.hostname === 'localhost';
      if (isLocal) {
        return `${api.origin}${parsed.pathname}${parsed.search || ''}`;
      }
      if (window.location.protocol === 'https:' && parsed.protocol === 'http:' && parsed.hostname === api.hostname) {
        parsed.protocol = 'https:';
        return parsed.toString();
      }
      return url;
    } catch {
      return url;
    }
  }
  if (url.startsWith('/images/') || url.startsWith('/assets/')) return url;
  if (url.startsWith('/')) return `${apiOrigin}${url}`;
  return `${apiOrigin}/${url}`;
}

export function resolveSiteLogo(config) {
  return normalizeMediaUrl(config?.site_logo) || DEFAULT_SITE_LOGO;
}

export function resolveFooterLogo(config) {
  return normalizeMediaUrl(config?.footer_logo) || normalizeMediaUrl(config?.site_logo) || DEFAULT_FOOTER_LOGO;
}
