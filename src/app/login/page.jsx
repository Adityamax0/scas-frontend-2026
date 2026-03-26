'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLang } from '@/lib/LanguageContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function LoginPage() {
  const { t } = useLang();
  const router = useRouter();
  const [formData, setFormData] = useState({ phone: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoUsers, setDemoUsers] = useState(null);
  useEffect(() => {
    const fetchDemoUsers = async () => {
      try {
        const res = await fetch(`${API_URL}/api/auth/demo-credentials`);
        if (res.ok) {
          const data = await res.json();
          setDemoUsers(data.data);
        }
      } catch (err) {
        // If endpoint doesn't exist, no demo credentials shown
      }
    };
    fetchDemoUsers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return; // Strict UX Debounce: Prevent double-click spam
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Login failed');
        setLoading(false);
        return;
      }

      // Save token — response is { success, data: { _id, name, phone, role, token } }
      const user = data.data;
      localStorage.setItem('token', user.token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Save for Service Worker access
      const { saveAuthToken } = require('@/lib/offlineDb');
      await saveAuthToken(user.token);

      // Redirect based on role
      const role = user.role;
      if (role === 'farmer') router.push('/dashboard/farmer');
      else if (role === 'worker') router.push('/dashboard/worker');
      else if (role === 'subhead') router.push('/dashboard/subhead');
      else if (role === 'admin') router.push('/dashboard/admin');
      else router.push('/');
    } catch (err) {
      setError('Network error. Is the backend running?');
      setLoading(false);
    }
  };

  const fillDemo = (phone) => {
    setFormData({ phone, password: 'password123' });
    setError('');
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 50%, #f0f9ff 100%)',
      padding: '20px',
    }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '40px',
        width: '100%',
        maxWidth: '420px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '40px', marginBottom: '8px' }}>🌾</div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#1b4332' }}>SCAS</h1>
          <p style={{ color: '#6b7280', fontSize: '14px' }}>Smart Crop Advisory System</p>
        </div>

        <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1f2937', marginBottom: '24px' }}>
          {t('signInTitle')}
        </h2>

        {error && (
          <div style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#dc2626',
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '16px',
            fontSize: '14px',
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontWeight: '600', fontSize: '14px', color: '#374151', marginBottom: '6px' }}>
              {t('phoneNumber')}
            </label>
            <input
              type="text"
              placeholder="+91XXXXXXXXXX"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
              style={{
                width: '100%',
                padding: '10px 14px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '15px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontWeight: '600', fontSize: '14px', color: '#374151', marginBottom: '6px' }}>
              {t('password')}
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              style={{
                width: '100%',
                padding: '10px 14px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '15px',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              background: loading ? '#9ca3af' : '#2d6a4f',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '700',
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? t('signingIn') : t('signIn')}
          </button>
        </form>

        {/* Demo credentials */}
        {demoUsers && (
          <div style={{
            marginTop: '24px',
            padding: '16px',
            background: '#f0fdf4',
            borderRadius: '8px',
            border: '1px solid #bbf7d0',
          }}>
            <p style={{ fontSize: '12px', fontWeight: '700', color: '#065f46', marginBottom: '8px' }}>
              {t('demoNotice')} (password: password123)
            </p>
            <div style={{ fontSize: '11px', color: '#374151', lineHeight: '2.2' }}>
              {demoUsers.farmer && (
                <div onClick={() => fillDemo(demoUsers.farmer)} style={{ cursor: 'pointer' }}>
                  👨‍🌾 Farmer: {demoUsers.farmer}
                </div>
              )}
              {demoUsers.worker && (
                <div onClick={() => fillDemo(demoUsers.worker)} style={{ cursor: 'pointer' }}>
                  👷 Worker: {demoUsers.worker}
                </div>
              )}
              {demoUsers.subhead && (
                <div onClick={() => fillDemo(demoUsers.subhead)} style={{ cursor: 'pointer' }}>
                  🔍 Sub-Head: {demoUsers.subhead}
                </div>
              )}
              {demoUsers.admin && (
                <div onClick={() => fillDemo(demoUsers.admin)} style={{ cursor: 'pointer' }}>
                  🏛️ Admin: {demoUsers.admin}
                </div>
              )}
            </div>
          </div>
        )}

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#6b7280' }}>
          {t('newFarmer')}{' '}
          <Link href="/register" style={{ color: '#2d6a4f', fontWeight: '600' }}>
            {t('registerHere')}
          </Link>
        </p>
      </div>
    </div>
  );
}
