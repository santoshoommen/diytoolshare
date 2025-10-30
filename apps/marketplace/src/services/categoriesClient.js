let cache = null;
let lastLoadedAt = 0;
const TTL = 60 * 1000;

async function fetchFromServer() {
  const base = process.env.NODE_ENV === 'development' ? 'http://localhost:3500' : '';
  const url = `${base}/api/categories${process.env.NODE_ENV === 'development' ? '?preview=true' : ''}`;
  const res = await fetch(url, { credentials: 'include' });
  const json = await res.json();
  if (!json.ok) throw new Error(json.error || 'Failed to load categories');
  return json.data;
}

export async function ensureLoaded(force = false) {
  const fresh = cache && Date.now() - lastLoadedAt < TTL;
  if (!force && fresh) return;
  cache = await fetchFromServer();
  lastLoadedAt = Date.now();
}

export function getAll() {
  return cache?.list || [];
}

export function getLabel(value) {
  return cache?.byValue?.[value]?.label || value || '';
}

export default { ensureLoaded, getAll, getLabel };


