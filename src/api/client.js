const API_BASE = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:8000/api';

async function parseError(response) {
  const data = await response.json().catch(() => ({}));
  return data.detail || data.error || 'Request failed';
}

export async function api(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, options);
  if (!response.ok) {
    throw new Error(await parseError(response));
  }
  return response.json();
}

async function refreshAdminToken() {
  const refresh = localStorage.getItem('admin_refresh_token');
  if (!refresh) return null;

  const res = await fetch(`${API_BASE}/auth/admin/refresh/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh }),
  });

  if (!res.ok) {
    localStorage.removeItem('admin_auth');
    localStorage.removeItem('admin_access_token');
    localStorage.removeItem('admin_refresh_token');
    return null;
  }

  const data = await res.json();
  if (data.access) {
    localStorage.setItem('admin_access_token', data.access);
    return data.access;
  }
  return null;
}

async function adminApi(path, options = {}, retry = true) {
  const token = localStorage.getItem('admin_access_token');
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${token || ''}`,
    },
  });

  if (response.ok) {
    if (response.status === 204) return {};
    return response.json();
  }

  if (response.status === 401 && retry) {
    const newAccess = await refreshAdminToken();
    if (newAccess) {
      return adminApi(path, options, false);
    }
  }

  throw new Error(await parseError(response));
}

export function googleLogin(idToken) {
  return api('/auth/google/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id_token: idToken }),
  });
}

export function adminLogin(username, password) {
  return api('/auth/admin/login/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
}

export function listAssets(params = '') {
  return api(`/assets/${params}`);
}

export function uploadAsset(formData, token) {
  return api('/assets/', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });
}

export function adminListAssets(query = '') {
  return adminApi(`/admin/assets/${query}`);
}

export function adminListAssetCategories(query = '') {
  return adminApi(`/admin/assets/categories/${query}`);
}

export function adminCreateAsset(formData) {
  return adminApi('/admin/assets/', {
    method: 'POST',
    body: formData,
  });
}

export function adminUpdateAsset(id, formData) {
  return adminApi(`/admin/assets/${id}/`, {
    method: 'PATCH',
    body: formData,
  });
}

export function adminDeleteAsset(id) {
  return adminApi(`/admin/assets/${id}/`, {
    method: 'DELETE',
  });
}

export function adminBulkDeleteAssets(ids) {
  return adminApi('/admin/assets/bulk-delete/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids }),
  });
}

export function adminListRoadmap(query = '') {
  return adminApi(`/admin/roadmap/${query}`);
}

export function adminCreateRoadmap(payload) {
  const isForm = payload instanceof FormData;
  return adminApi('/admin/roadmap/', {
    method: 'POST',
    headers: isForm ? undefined : { 'Content-Type': 'application/json' },
    body: isForm ? payload : JSON.stringify(payload),
  });
}

export function adminUpdateRoadmap(id, payload) {
  const isForm = payload instanceof FormData;
  return adminApi(`/admin/roadmap/${id}/`, {
    method: 'PATCH',
    headers: isForm ? undefined : { 'Content-Type': 'application/json' },
    body: isForm ? payload : JSON.stringify(payload),
  });
}

export function adminDeleteRoadmap(id) {
  return adminApi(`/admin/roadmap/${id}/`, {
    method: 'DELETE',
  });
}

export function adminBulkDeleteRoadmap(ids) {
  return adminApi('/admin/roadmap/bulk-delete/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids }),
  });
}

export function adminListContentPages(query = '') {
  return adminApi(`/admin/content-pages/${query}`);
}

export function adminCreateContentPage(payload) {
  return adminApi('/admin/content-pages/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export function adminUpdateContentPage(id, payload) {
  return adminApi(`/admin/content-pages/${id}/`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export function getPublicContentPage(pageType) {
  return api(`/content/${pageType}/`);
}

export function getPublicRoadmap() {
  return api('/roadmap/');
}

export function listMemes(params = '') {
  return api(`/memes/${params}`);
}

export function publishMeme(formData, token) {
  return api('/memes/', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });
}

export function likeMeme(memeId, token) {
  return api(`/memes/${memeId}/like/`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
