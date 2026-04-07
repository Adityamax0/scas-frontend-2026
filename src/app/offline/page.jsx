'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function OfflinePage() {
  const [pendingTickets, setPendingTickets] = useState([]);

  useEffect(() => {
    // Load pending tickets from IndexedDB to show the farmer their work is saved
    const loadPending = async () => {
      try {
        const { getPendingTickets } = await import('@/lib/offlineDb');
        const tickets = await getPendingTickets();
        setPendingTickets(tickets);
      } catch (e) {
        console.warn('Could not load pending tickets', e);
      }
    };
    loadPending();
  }, []);

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.icon}>📴</div>
        <h1 style={styles.title}>You are currently Offline</h1>
        <p style={styles.text}>
          Don't worry — Krishi Mitra is still with you! Any problem reports you
          submit right now are safely saved on your phone and will be sent
          automatically the moment your internet is restored.
        </p>

        {/* Pending Sync Queue — gives farmers visual peace of mind */}
        {pendingTickets.length > 0 && (
          <div style={styles.pendingBox}>
            <p style={styles.pendingTitle}>
              🕐 {pendingTickets.length} problem report{pendingTickets.length > 1 ? 's' : ''} saved — waiting to sync
            </p>
            <div style={styles.pendingList}>
              {pendingTickets.map((t, i) => (
                <div key={t.clientId || i} style={styles.pendingItem}>
                  <span style={styles.pendingCrop}>🌾 {t.cropType || 'Crop'}</span>
                  <span style={styles.pendingDesc}>
                    {t.description?.slice(0, 50)}{t.description?.length > 50 ? '…' : ''}
                  </span>
                  <span style={styles.pendingBadge}>Pending</span>
                </div>
              ))}
            </div>
            <p style={styles.pendingNote}>
              These will sync automatically when WiFi or 4G is restored.
            </p>
          </div>
        )}

        {pendingTickets.length === 0 && (
          <div style={{ ...styles.pendingBox, backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
            <p style={{ color: '#059669', fontWeight: '600', fontSize: '14px', margin: 0 }}>
              ✅ No pending reports — you're all caught up!
            </p>
          </div>
        )}

        <div style={styles.buttonGroup}>
          <Link href="/dashboard/farmer" style={styles.primaryButton}>
            Go to Farmer Dashboard
          </Link>
          <button
            onClick={() => window.location.reload()}
            style={styles.secondaryButton}
          >
            Retry Connection
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: '#f3f4f6',
    padding: '20px',
    fontFamily: "'Inter', sans-serif",
  },
  card: {
    maxWidth: '540px',
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: '24px',
    padding: '40px',
    textAlign: 'center',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  },
  icon: { fontSize: '64px', marginBottom: '24px' },
  title: { fontSize: '24px', fontWeight: '800', color: '#1b4332', marginBottom: '16px' },
  text: { fontSize: '15px', color: '#4b5563', lineHeight: '1.6', marginBottom: '24px' },
  pendingBox: {
    backgroundColor: '#fffbeb',
    border: '1px solid #fde68a',
    borderRadius: '16px',
    padding: '20px',
    marginBottom: '24px',
    textAlign: 'left',
  },
  pendingTitle: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#92400e',
    marginBottom: '12px',
    margin: '0 0 12px 0',
  },
  pendingList: { display: 'flex', flexDirection: 'column', gap: '8px' },
  pendingItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    backgroundColor: '#fff',
    borderRadius: '8px',
    padding: '10px 12px',
    fontSize: '13px',
    flexWrap: 'wrap',
  },
  pendingCrop: { fontWeight: '700', color: '#1b4332', flexShrink: 0 },
  pendingDesc: { color: '#6b7280', flex: 1 },
  pendingBadge: {
    backgroundColor: '#fef3c7',
    color: '#92400e',
    padding: '2px 10px',
    borderRadius: '20px',
    fontWeight: '600',
    fontSize: '11px',
    flexShrink: 0,
  },
  pendingNote: { fontSize: '12px', color: '#78716c', marginTop: '12px', marginBottom: 0 },
  buttonGroup: { display: 'flex', flexDirection: 'column', gap: '12px' },
  primaryButton: {
    display: 'block',
    padding: '16px',
    backgroundColor: '#059669',
    color: '#fff',
    borderRadius: '12px',
    fontWeight: '700',
    textDecoration: 'none',
  },
  secondaryButton: {
    padding: '16px',
    backgroundColor: '#e5e7eb',
    color: '#374151',
    border: 'none',
    borderRadius: '12px',
    fontWeight: '700',
    cursor: 'pointer',
  },
};
