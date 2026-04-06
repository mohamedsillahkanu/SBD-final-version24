// ============================================================
//  SBD 2026 — ITN Distribution Survey · Service Worker
//  To force a full refresh: bump CACHE_VERSION
// ============================================================
const CACHE_VERSION = 'sbd-2026-v4';

const APP_FILES = [
  './index.html',
  './script_option2.js',
  './ai_agent.js',
  './cascading_data1.csv',
  './manifest.json',
  './offline.html',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-192.png',
  './icons/icon-maskable-512.png',
];

const OPTIONAL_FILES = [
  './ICF-SL.jpg',
  './logo_mohs.png',
  './logo_nmcp.png',
  './logo_pmi.png',
  './favicon.svg',
];

const CDN_FILES = [
  'https://fonts.googleapis.com/css2?family=Oswald:wght@300;400;500;600;700&display=swap',
  'https://cdn.jsdelivr.net/npm/papaparse@5.4.1/papaparse.min.js',
  'https://cdn.jsdelivr.net/npm/signature_pad@4.1.7/dist/signature_pad.umd.min.js',
  'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js',
];

const NEVER_CACHE = [
  'script.google.com',
  'docs.google.com',
  'api.anthropic.com',
];

function toAbs(url) {
  return url.startsWith('http') ? url : new URL(url, self.location.href).href;
}

async function cacheOne(cache, url) {
  try { await cache.add(url); }
  catch(e) { console.warn('[SW] Skipped:', url, '-', e.message); }
}

// INSTALL — never throws, skips missing files individually
self.addEventListener('install', event => {
  console.log('[SW] Install', CACHE_VERSION);
  event.waitUntil(
    caches.open(CACHE_VERSION).then(async cache => {
      await Promise.all([...APP_FILES, ...CDN_FILES].map(u => cacheOne(cache, toAbs(u))));
      await Promise.all(OPTIONAL_FILES.map(u => cacheOne(cache, toAbs(u))));
      console.log('[SW] Cache ready');
      return self.skipWaiting();
    })
  );
});

// ACTIVATE — wipe old caches, claim all tabs
self.addEventListener('activate', event => {
  console.log('[SW] Activate', CACHE_VERSION);
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE_VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// FETCH — cache-first, network fallback, offline page for navigation
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = event.request.url;
  if (NEVER_CACHE.some(p => url.includes(p))) return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      // Serve from cache immediately
      if (cached) {
        // Background refresh
        fetch(event.request).then(r => {
          if (r && r.status === 200)
            caches.open(CACHE_VERSION).then(c => c.put(event.request, r));
        }).catch(() => {});
        return cached;
      }
      // Not cached — fetch & store
      return fetch(event.request).then(r => {
        if (r && r.status === 200)
          caches.open(CACHE_VERSION).then(c => c.put(event.request, r.clone()));
        return r;
      }).catch(() => {
        if (event.request.mode === 'navigate')
          return caches.match(new URL('./offline.html', self.location.href).href);
        return new Response('', { status: 503 });
      });
    })
  );
});

self.addEventListener('message', event => {
  if (!event.data) return;
  if (event.data.type === 'SKIP_WAITING') self.skipWaiting();
  if (event.data.type === 'CLEAR_CACHE')  caches.delete(CACHE_VERSION);
});

self.addEventListener('sync', event => {
  if (event.tag === 'sync-submissions') console.log('[SW] Sync triggered');
});
