const { createClient } = require('@sanity/client');

// In-memory cache
let cachedData = null;
let cachedAt = 0;
// Use short TTL in development; adjust later for production
const CACHE_TTL_MS = 60 * 1000; // 1 minute

function getSanityClient(perspective = 'published') {
  const projectId = process.env.SANITY_PROJECT_ID;
  const dataset = process.env.SANITY_DATASET;
  const apiVersion = process.env.SANITY_API_VERSION || '2025-01-01';
  const token = process.env.SANITY_READ_TOKEN || undefined;

  if (!projectId || !dataset) {
    return null;
  }

  const useCdn = perspective === 'published';

  return createClient({
    projectId,
    dataset,
    apiVersion,
    token,
    useCdn,
    perspective,
  });
}

async function fetchFromSanity({ perspective = 'published' } = {}) {
  const client = getSanityClient(perspective);
  if (!client) {
    throw new Error('Sanity not configured');
  }

  // Fetch documents from Sanity
  const query = `*[_type == "toolDescription"]{
    _id,
    key,
    className,
    title,
    description,
    category,
    categoryRef->{ _id, value, label },
    subcategory,
    price,
    features,
    safetyNotes,
    commonUses,
    rentalTips
  }`;

  const docs = await client.fetch(query);

  // Normalize to a lookup by className with fallback to key
  const byClass = {};
  docs.forEach(doc => {
    const k = (doc.className || doc.key || '').trim();
    if (k) {
      const normLower = k.toLowerCase();
      const normSlug = normLower.replace(/\s+/g, '_');
      const categoryValue = doc.categoryRef?.value || doc.category || null;
      const categoryLabel = doc.categoryRef?.label || null;
      byClass[k] = {
        key: doc.key || k,
        className: doc.className || k,
        title: doc.title,
        description: doc.description,
        category: categoryValue,
        categoryLabel,
        subcategory: doc.subcategory,
        price: doc.price,
        features: doc.features || [],
        safetyNotes: doc.safetyNotes || [],
        commonUses: doc.commonUses || [],
        rentalTips: doc.rentalTips || [],
      };
      // Add normalized aliases for robust matching
      byClass[normLower] = byClass[k];
      byClass[normSlug] = byClass[k];
    }
  });
  const keys = Object.keys(byClass);

  return {
    byClass,
    all: docs,
  };
}

async function getCachedData(force = false, opts = {}) {
  const now = Date.now();
  const isFresh = cachedData && now - cachedAt < CACHE_TTL_MS;
  if (!force && isFresh) {
    return cachedData;
  }

  const data = await fetchFromSanity(opts);
  cachedData = data;
  cachedAt = now;
  return cachedData;
}

module.exports = async function toolDescriptionsHandler(req, res) {
  try {
    const force = req.query?.refresh === 'true';
    const preview = req.query?.preview === 'true';
    const hasToken = Boolean(process.env.SANITY_READ_TOKEN);
    const perspective = preview && hasToken ? 'drafts' : 'published';
    if (preview && !hasToken) {
      console.warn('[tool-descriptions] preview requested but no SANITY_READ_TOKEN set; falling back to published');
    }
    const data = await getCachedData(force, { perspective });
    const docCount = data?.all?.length || 0;
    res.status(200).json({
      ok: true,
      cachedAt,
      data,
      debug: process.env.NODE_ENV === 'development' ? {
        docCount,
      } : undefined,
    });
  } catch (e) {
    // Don’t fail the app; provide a clear error
    res.status(200).json({ ok: false, error: e.message });
  }
};


