/* eslint-disable no-restricted-globals */
importScripts('https://unpkg.com/dexie@3.2.4/dist/dexie.js');

const db = new Dexie('SCAS_OfflineDB');
db.version(1).stores({
  pendingTickets: 'clientId, syncStatus, createdAt',
  auth: 'id',
});

const API_URL = 'http://localhost:5000'; // Fallback for local dev

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

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
      
      // Notify active clients if any
      const clients = await self.clients.matchAll();
      clients.forEach(client => {
        client.postMessage({ type: 'SYNC_COMPLETE', count: allSynced.length });
      });

      console.log(`[SW] Successfully synced ${allSynced.length} tickets.`);
    }
  } catch (error) {
    console.error('[SW] Sync error:', error);
  }
}
