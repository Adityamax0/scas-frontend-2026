/* eslint-disable no-restricted-globals */
// ============================================================
// SCAS 2026 — Master Service Worker (Merged from sw.js + service-worker.js)
// Handles: Asset caching (offline shell) + Background Sync
// ============================================================

importScripts('https://unpkg.com/dexie@3.2.4/dist/dexie.js');

const CACHE_NAME = 'scas-cache-v2';
const ASSETS_TO_CACHE = ['/', '/manifest.json', '/scas_pwa_icon.png', '/offline'];

// Use the production API URL — no more hardcoded localhost
const API_URL = 'https://scas-backend.onrender.com';

// ── Dexie offline DB (mirrors the frontend offlineDb.js schema) ──
const db = new Dexie('SCAS_OfflineDB');
db.version(1).stores({
  pendingTickets: 'clientId, syncStatus, createdAt',
  auth: 'id',
});

// ─────────────────────────────────────────────────────────────
// 1. INSTALL: Pre-cache the app shell
// ─────────────────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
  self.skipWaiting();
});

// ─────────────────────────────────────────────────────────────
// 2. ACTIVATE: Wipe old caches
// ─────────────────────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    )
  );
  self.clients.claim();
});

// ─────────────────────────────────────────────────────────────
// 3. FETCH: Stale-While-Revalidate for GET requests
// ─────────────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.open(CACHE_NAME).then((cache) =>
      cache.match(event.request).then((cachedResponse) => {
        const fetchPromise = fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse.status === 200) {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          })
          .catch(() => cachedResponse || caches.match('/offline'));

        return cachedResponse || fetchPromise;
      })
    )
  );
});

// ─────────────────────────────────────────────────────────────
// 4. BACKGROUND SYNC: Send offline tickets when network restores
// ─────────────────────────────────────────────────────────────
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-tickets') {
    event.waitUntil(syncTickets());
  }
});

async function syncTickets() {
  console.log('[SW] Background Sync started...');
  try {
    const pending = await db.pendingTickets.where('syncStatus').equals('pending').toArray();
    if (pending.length === 0) return;

    // Read token from the auth table (saved by the frontend on login)
    const auth = await db.auth.get('current');
    if (!auth || !auth.token) {
      console.warn('[SW] No auth token found. Cannot sync.');
      return;
    }

    const payload = pending.map((t) => ({
      clientId: t.clientId,
      description: t.description,
      cropType: t.cropType,
      category: t.category,
      priority: t.priority,
      coordinates: t.coordinates,
    }));

    const response = await fetch(`${API_URL}/api/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${auth.token}`,
      },
      body: JSON.stringify({ tickets: payload }),
    });

    const data = await response.json();

    if (data.success) {
      const { synced, duplicates } = data.data;
      const allSynced = [...synced, ...duplicates];

      for (const clientId of allSynced) {
        await db.pendingTickets.update(clientId, { syncStatus: 'synced' });
      }

      const clients = await self.clients.matchAll();
      clients.forEach((client) =>
        client.postMessage({ type: 'SYNC_COMPLETE', count: allSynced.length })
      );

      console.log(`[SW] Successfully synced ${allSynced.length} tickets.`);
    }
  } catch (error) {
    console.error('[SW] Sync error:', error);
  }
}
