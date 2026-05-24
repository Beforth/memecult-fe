import * as fabric from 'fabric';

const API_BASE = (import.meta.env.VITE_API_BASE || 'http://127.0.0.1:8000/api').replace(/\/$/, '');

/** Thumbnail / img src — direct media URL from API */
export function assetPreviewUrl(asset) {
  return asset?.file || '';
}

/**
 * URL for fabric.js canvas. Uses /api/assets/:id/file/ so CORS headers apply.
 */
export function assetCanvasUrl(asset) {
  if (asset?.id) {
    return `${API_BASE}/assets/${asset.id}/file/`;
  }
  return asset?.file || '';
}

/**
 * Load image for Fabric canvas via fetch → blob (avoids crossOrigin / tainted canvas issues).
 */
export async function loadFabricImage(asset) {
  const url = assetCanvasUrl(asset);
  if (!url) {
    throw new Error('Missing image URL');
  }

  const response = await fetch(url, { mode: 'cors', credentials: 'omit' });
  if (!response.ok) {
    throw new Error(`Could not load image (${response.status})`);
  }

  const blob = await response.blob();
  const blobUrl = URL.createObjectURL(blob);
  try {
    return await fabric.FabricImage.fromURL(blobUrl);
  } finally {
    URL.revokeObjectURL(blobUrl);
  }
}
