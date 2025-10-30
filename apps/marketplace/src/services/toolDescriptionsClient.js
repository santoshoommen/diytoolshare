let cache = null;
let cacheLoaded = false;
let lastLoadedAt = 0;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

async function fetchFromServer() {
  const base = process.env.NODE_ENV === 'development' ? 'http://localhost:3500' : '';
  const url = `${base}/api/tool-descriptions${process.env.NODE_ENV === 'development' ? '?preview=true' : ''}`;
  const res = await fetch(url, { credentials: 'include' });
  const json = await res.json();
  if (!json.ok) throw new Error(json.error || 'Failed to load tool descriptions');
  return json.data;
}

export async function ensureLoaded(force = false) {
  const isFresh = cacheLoaded && Date.now() - lastLoadedAt < ONE_DAY_MS;
  if (!force && isFresh && cache) return;
  const data = await fetchFromServer();
  cache = data;
  cacheLoaded = true;
  lastLoadedAt = Date.now();
}

export function getToolDescriptionSync(className) {
  if (!cache || !cache.byClass) return null;
  const raw = (className || '').trim();
  const lower = raw.toLowerCase();
  const slug = lower.replace(/\s+/g, '_');
  const match = (
    cache.byClass[raw] ||
    cache.byClass[lower] ||
    cache.byClass[slug] ||
    cache.byClass['other'] ||
    null
  );
  return match;
}

export function getAllSync() {
  return cache;
}

export default {
  ensureLoaded,
  getToolDescriptionSync,
  getAllSync,
};


