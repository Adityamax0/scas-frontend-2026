import Dexie from 'dexie';

/**
 * SCAS Offline Database using Dexie.js (IndexedDB wrapper)
 * Stores tickets locally when the user is offline.
 * Each ticket has a unique clientId (UUID) for idempotent syncing.
 */
const db = new Dexie('SCAS_OfflineDB');

db.version(1).stores({
  pendingTickets: 'clientId, syncStatus, createdAt',
});

// Version 2 adds the auth store for Service Worker JWT access
db.version(2).stores({
  pendingTickets: 'clientId, syncStatus, createdAt',
  auth: 'id', // stores { id: 'current', token }
});

/**
 * Save a ticket to IndexedDB for offline storage
 * @param {Object} ticketData - { clientId, description, cropType, category, priority, coordinates, mediaBlobs }
 */
export const savePendingTicket = async (ticketData) => {
  return db.pendingTickets.put({
    ...ticketData,
    syncStatus: 'pending',
    createdAt: new Date().toISOString(),
  });
};

/**
 * Get all pending (unsynced) tickets
 */
export const getPendingTickets = async () => {
  return db.pendingTickets.where('syncStatus').equals('pending').toArray();
};

/**
 * Mark a ticket as synced
 * @param {string} clientId
 */
export const markAsSynced = async (clientId) => {
  return db.pendingTickets.update(clientId, { syncStatus: 'synced' });
};

/**
 * Mark a ticket with sync error
 * @param {string} clientId
 * @param {string} error
 */
export const markSyncError = async (clientId, error) => {
  return db.pendingTickets.update(clientId, { syncStatus: 'error', syncError: error });
};

/**
 * Clear all synced tickets from local storage
 */
export const clearSyncedTickets = async () => {
  return db.pendingTickets.where('syncStatus').equals('synced').delete();
};

/**
 * Get count of pending tickets
 */
export const getPendingCount = async () => {
  return db.pendingTickets.where('syncStatus').equals('pending').count();
};

/**
 * Auth Token Management (for Service Worker access)
 */
export const saveAuthToken = async (token) => {
  return db.auth.put({ id: 'current', token });
};

export const getAuthToken = async () => {
  const record = await db.auth.get('current');
  return record ? record.token : null;
};

export default db;
