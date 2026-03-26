'use client';

import { useLang } from '@/lib/LanguageContext';
import Link from 'next/link';

export default function OfflinePage() {
  const { t } = useLang();

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.icon}>📴</div>
        <h1 style={styles.title}>You are currently Offline</h1>
        <p style={styles.text}>
          It seems you have lost your internet connection. Don't worry, Krishi Mitra is still with you! 
          You can still submit tickets offline and they will sync once you are back online.
        </p>
        
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
    maxWidth: '500px',
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: '24px',
    padding: '40px',
    textAlign: 'center',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  },
  icon: {
    fontSize: '64px',
    marginBottom: '24px',
  },
  title: {
    fontSize: '24px',
    fontWeight: '800',
    color: '#1b4332',
    marginBottom: '16px',
  },
  text: {
    fontSize: '16px',
    color: '#4b5563',
    lineHeight: '1.6',
    marginBottom: '32px',
  },
  buttonGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  primaryButton: {
    display: 'block',
    padding: '16px',
    backgroundColor: '#059669',
    color: '#fff',
    borderRadius: '12px',
    fontWeight: '700',
    textDecoration: 'none',
    transition: 'background-color 0.2s',
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
