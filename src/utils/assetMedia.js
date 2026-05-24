const API_BASE = (import.meta.env.VITE_API_BASE || 'http://127.0.0.1:8000/api').replace(/\/$/, '');

/** Thumbnail / img src — direct media URL from API */
export function assetPreviewUrl(asset) {
  return asset?.file || '';
}

/**
 * URL for fabric.js canvas (crossOrigin). Uses /api/assets/:id/file/ so CORS headers apply.
 */
export function assetCanvasUrl(asset) {
  if (asset?.id) {
    return `${API_BASE}/assets/${asset.id}/file/`;
  }
  return asset?.file || '';
}
