'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLang } from '@/lib/LanguageContext';

export default function RegisterPage() {
  const { t } = useLang();
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    password: '',
    confirmPassword: '',
    village: '',
    district: '',
    state: 'Uttar Pradesh',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const districts = [
    'Lucknow', 'Varanasi', 'Agra', 'Kanpur', 'Allahabad',
    'Gorakhpur', 'Meerut', 'Aligarh', 'Bareilly', 'Moradabad',
    'Saharanpur', 'Mathura', 'Jhansi', 'Ghaziabad', 'Noida'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return; // Strict UX Debounce: Prevent rapid-fire double registration
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          password: formData.password,
          role: 'farmer',
          village: formData.village,
          district: formData.district,
          state: formData.state,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Registration failed');
        setLoading(false);
        return;
      }

      // API returns { success: true, data: { token, _id, name, ... } }
      const { token, ...userInfo } = data.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userInfo));

      // Save for Service Worker access
      try {
        const { saveAuthToken } = await import('@/lib/offlineDb');
        await saveAuthToken(token);
      } catch (e) {
        console.warn('Offline token save failed', e);
      }

      router.push('/dashboard/farmer');
    } catch (err) {
      setError('Network error. Is the backend running?');
      setLoading(false);
    }
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
        maxWidth: '480px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ fontSize: '40px', marginBottom: '8px' }}>🌾</div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#1b4332' }}>{t('registerTitle')}</h1>
          <p style={{ color: '#6b7280', fontSize: '14px' }}>Smart Crop Advisory System</p>
        </div>

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
          {[
            { label: t('fullName'), key: 'name', type: 'text', placeholder: 'Ramesh Kumar' },
            { label: t('phoneNumber'), key: 'phone', type: 'text', placeholder: '+919876543210' },
            { label: t('village'), key: 'village', type: 'text', placeholder: 'Your village name' },
            { label: t('password'), key: 'password', type: 'password', placeholder: '••••••••' },
            { label: t('confirmPassword'), key: 'confirmPassword', type: 'password', placeholder: '••••••••' },
          ].map(({ label, key, type, placeholder }) => (
            <div key={key} style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontWeight: '600', fontSize: '14px', color: '#374151', marginBottom: '5px' }}>
                {label}
              </label>
              <input
                type={type}
                placeholder={placeholder}
                value={formData[key]}
                onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                required
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '15px',
                  outline: 'none',
                }}
              />
            </div>
          ))}

          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontWeight: '600', fontSize: '14px', color: '#374151', marginBottom: '5px' }}>
              {t('district')}
            </label>
            <select
              value={formData.district}
              onChange={(e) => setFormData({ ...formData, district: e.target.value })}
              required
              style={{
                width: '100%',
                padding: '10px 14px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '15px',
                outline: 'none',
                background: 'white',
              }}
            >
              <option value="">{t('selectDistrict')}</option>
              {districts.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
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
              marginTop: '8px',
            }}
          >
            {loading ? t('registering') : t('register')}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#6b7280' }}>
          {t('alreadyRegistered')}{' '}
          <Link href="/login" style={{ color: '#2d6a4f', fontWeight: '600' }}>
            {t('signIn')}
          </Link>
        </p>
      </div>
    </div>
  );
}
