import { getPendingTickets, markAsSynced, markSyncError, clearSyncedTickets } from './offlineDb';
import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

/**
 * SyncEngine: Manages offline/online state detection and ticket synchronization.
 *
 * Workflow:
 * 1. Listens for `online`/`offline` browser events.
 * 2. When online, reads all pending tickets from IndexedDB.
 * 3. POSTs them to the idempotent /api/sync endpoint.
 * 4. Marks successfully synced tickets in IndexedDB.
 * 5. Provides state callbacks: onStatusChange(status) where
 *    status = 'offline' | 'syncing' | 'synced' | 'error'
 */
class SyncEngine {
  constructor() {
    this.status = typeof navigator !== 'undefined' && navigator.onLine ? 'synced' : 'offline';
    this.listeners = [];
    this.isSyncing = false;
  }

  /**
   * Initialize the sync engine with event listeners
   */
  init() {
    if (typeof window === 'undefined') return;

    window.addEventListener('online', () => {
      console.log('[SYNC] Network restored — triggering sync...');
      this.requestBackgroundSync();
    });

    window.addEventListener('offline', () => {
      console.log('[SYNC] Network lost — switching to offline mode');
      this._setStatus('offline');
    });

    // Listen for messages from Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'SYNC_COMPLETE') {
          console.log(`[SYNC] Service Worker finished syncing ${event.data.count} tickets`);
          this.syncPendingTickets(); // Refresh local state
        }
      });
    }

    // Attempt initial sync on load
    if (navigator.onLine) {
      this.requestBackgroundSync();
    }
  }

  /**
   * Register a sync event with the Service Worker (the "Magic" layer)
   */
  async requestBackgroundSync() {
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      try {
        const registration = await navigator.serviceWorker.ready;
        await registration.sync.register('sync-tickets');
        console.log('[SYNC] Background Sync event registered');
      } catch (err) {
        console.warn('[SYNC] Background Sync registration failed, falling back to manual sync', err);
        this.syncPendingTickets();
      }
    } else {
      this.syncPendingTickets();
    }
  }

  /**
   * Register a status change listener
   * @param {Function} callback - (status: 'offline'|'syncing'|'synced'|'error') => void
   */
  onStatusChange(callback) {
    this.listeners.push(callback);
    // Immediately invoke with current status
    callback(this.status);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== callback);
    };
  }

  _setStatus(status) {
    this.status = status;
    this.listeners.forEach((cb) => cb(status));
  }

  /**
   * Sync all pending offline tickets to the server
   */
  async syncPendingTickets() {
    if (this.isSyncing) return;
    this.isSyncing = true;

    try {
      const pending = await getPendingTickets();

      if (pending.length === 0) {
        this._setStatus('synced');
        this.isSyncing = false;
        return;
      }

      this._setStatus('syncing');

      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('[SYNC] No auth token found in localStorage. Skipping sync.');
        this._setStatus('error');
        this.isSyncing = false;
        return;
      }

      // Prepare payload (strip blobs — media needs separate handling)
      const payload = pending.map((t) => ({
        clientId: t.clientId,
        description: t.description,
        cropType: t.cropType,
        category: t.category,
        priority: t.priority,
        coordinates: t.coordinates,
      }));

      const response = await axios.post(`${API_URL}/api/sync`, { tickets: payload }, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 30000,
      });

      if (response.data.success) {
        const { synced, duplicates } = response.data.data;

        // Mark synced and duplicates
        for (const clientId of [...synced, ...duplicates]) {
          await markAsSynced(clientId);
        }

        // Handle errors
        for (const err of response.data.data.errors || []) {
          await markSyncError(err.clientId, err.error);
        }

        // Clean up synced records
        await clearSyncedTickets();

        console.log(`[SYNC] Complete: ${synced.length} synced, ${duplicates.length} duplicates`);
        this._setStatus('synced');
      }
    } catch (error) {
      console.error('[SYNC] Failed:', error.message);
      this._setStatus('error');
    } finally {
      this.isSyncing = false;
    }
  }
}

// Singleton
const syncEngine = new SyncEngine();
export default syncEngine;
