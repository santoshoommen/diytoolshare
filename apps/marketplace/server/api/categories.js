const { createClient } = require('@sanity/client');

let cached = null;
let cachedAt = 0;
const TTL = 60 * 1000; // 1 minute

function getSanity(perspective = 'published') {
  const projectId = process.env.SANITY_PROJECT_ID;
  const dataset = process.env.SANITY_DATASET;
  const apiVersion = process.env.SANITY_API_VERSION || '2025-01-01';
  const token = process.env.SANITY_READ_TOKEN || undefined;
  if (!projectId || !dataset) return null;
  const useCdn = perspective === 'published';
  return createClient({ projectId, dataset, apiVersion, token, useCdn, perspective });
}

async function fetchCategories({ perspective = 'published' } = {}) {
  const client = getSanity(perspective);
  if (!client) throw new Error('Sanity not configured');
  const query = `*[_type == "category" && (active == true || !defined(active))]{
    _id, value, label, order, active
  } | order(order asc, label asc)`;
  const docs = await client.fetch(query);
  const list = (docs || []).map(d => ({
    id: d._id,
    value: d.value,
    label: d.label,
    order: d.order ?? 0,
    active: d.active !== false,
  }));
  const byValue = {};
  list.forEach(c => { if (c.value) byValue[c.value] = c; });
  return { list, byValue };
}

async function getCached(force, opts) {
  const now = Date.now();
  if (!force && cached && now - cachedAt < TTL) return cached;
  const data = await fetchCategories(opts);
  cached = data;
  cachedAt = now;
  return cached;
}

module.exports = async function categoriesHandler(req, res) {
  try {
    const force = req.query?.refresh === 'true';
    const preview = req.query?.preview === 'true';
    const hasToken = Boolean(process.env.SANITY_READ_TOKEN);
    const perspective = preview && hasToken ? 'drafts' : 'published';
    const data = await getCached(force, { perspective });
    res.status(200).json({ ok: true, data });
  } catch (e) {
    res.status(200).json({ ok: false, error: e.message });
  }
};


