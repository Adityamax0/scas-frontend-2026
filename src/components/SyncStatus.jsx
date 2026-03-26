'use client';

import { useState, useEffect } from 'react';
import syncEngine from '@/lib/syncEngine';
import { getPendingCount } from '@/lib/offlineDb';

/**
 * SyncStatus — Visual indicator for offline/syncing/synced state.
 * Displays a persistent bar at the top of the UI.
 */
export default function SyncStatus() {
  const [status, setStatus] = useState('synced');
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    syncEngine.init();

    const unsubscribe = syncEngine.onStatusChange(async (newStatus) => {
      setStatus(newStatus);
      const count = await getPendingCount();
      setPendingCount(count);
    });

    return unsubscribe;
  }, []);

  if (status === 'synced' && pendingCount === 0) return null;

  const config = {
    offline: {
      bg: '#fef3c7',
      border: '#f59e0b',
      text: '#92400e',
      icon: '📴',
      message: `Offline — ${pendingCount} ticket(s) saved locally`,
    },
    syncing: {
      bg: '#dbeafe',
      border: '#3b82f6',
      text: '#1e40af',
      icon: '🔄',
      message: `Syncing ${pendingCount} ticket(s)...`,
    },
    synced: {
      bg: '#d1fae5',
      border: '#10b981',
      text: '#065f46',
      icon: '✅',
      message: 'All tickets synced',
    },
    error: {
      bg: '#fee2e2',
      border: '#ef4444',
      text: '#991b1b',
      icon: '⚠️',
      message: 'Sync failed — will retry when online',
    },
  };

  const c = config[status] || config.synced;

  return (
    <div
      id="sync-status-bar"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        padding: '10px 20px',
        backgroundColor: c.bg,
        borderBottom: `2px solid ${c.border}`,
        color: c.text,
        fontFamily: "'Inter', sans-serif",
        fontSize: '14px',
        fontWeight: 600,
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        animation: status === 'syncing' ? 'pulse 2s infinite' : 'none',
      }}
    >
      <span style={{ fontSize: '18px' }}>{c.icon}</span>
      <span>{c.message}</span>
      {status === 'syncing' && (
        <span
          style={{
            marginLeft: 'auto',
            width: '16px',
            height: '16px',
            border: `2px solid ${c.border}`,
            borderTop: '2px solid transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }}
        />
      )}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.85; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
