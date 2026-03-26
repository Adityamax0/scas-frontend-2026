'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';

export default function GovAdvisory() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function fetchAdvisory(coords = null) {
      try {
        let url = '/advisory';
        if (coords) url += `?lat=${coords.latitude}&lon=${coords.longitude}`;
        
        const res = await api.get(url);
        if (isMounted) setData(res.data.data);
      } catch (err) {
        console.error('Advisory fetch error:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    // Auto-detect location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => fetchAdvisory(pos.coords),
        () => fetchAdvisory() // Fallback to profile district if blocked
      );
    } else {
      fetchAdvisory();
    }

    return () => { isMounted = false; };
  }, []);

  if (loading) return <div style={{ height: '300px', backgroundColor: '#f1f5f9', borderRadius: '24px', animation: 'pulse 2s infinite' }}></div>;
  if (!data) return null;

  return (
    <div style={{ marginBottom: '32px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        <span style={{ fontSize: '24px' }}>🏛️</span>
        <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#111827', margin: 0 }}>
          Government Portal & District Insights
        </h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        
        {/* Left: Subsidies */}
        <div style={{ 
          backgroundColor: '#fff', 
          borderRadius: '24px', 
          padding: '24px', 
          border: '1px solid #e5e7eb',
          boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1b4332', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            📜 Available Subsidies
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {!data?.subsidies || data.subsidies.length === 0 ? (
              <p style={{ color: '#6b7280', fontSize: '14px' }}>No schemes currently found for {data?.location?.state || 'your region'}.</p>
            ) : data.subsidies.map((s, i) => (
              <div key={i} style={{ 
                padding: '16px', 
                borderRadius: '16px', 
                backgroundColor: '#f9fafb',
                border: '1px solid #f1f5f9'
              }}>
                <div style={{ fontWeight: '700', fontSize: '15px', color: '#111827', marginBottom: '4px' }}>{s?.name || 'Unknown Scheme'}</div>
                <p style={{ fontSize: '13px', color: '#4b5563', margin: '0 0 8px 0', lineHeight: '1.4' }}>{s?.description}</p>
                <div style={{ fontSize: '12px', fontWeight: '600', color: '#059669', marginBottom: '10px' }}>🎁 {s.benefits}</div>
                <a 
                  href={s.applicationLink} 
                  target="_blank" 
                  rel="noreferrer"
                  style={{ 
                    display: 'inline-block', 
                    padding: '6px 12px', 
                    backgroundColor: '#1b4332', 
                    color: '#fff', 
                    borderRadius: '8px', 
                    fontSize: '11px', 
                    textDecoration: 'none',
                    fontWeight: '700'
                  }}
                >
                  Apply Online ↗
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Crop Recommendations */}
        <div style={{ 
          backgroundColor: '#fff', 
          borderRadius: '24px', 
          padding: '24px', 
          border: '1px solid #e5e7eb',
          boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            🌾 District Yield Strategy
          </h3>
          <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '16px' }}>
            Top recommendations for <b>{data?.location?.district || 'your district'}</b> soil.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {!data?.recommendations || data.recommendations.length === 0 ? (
              <p style={{ color: '#6b7280', fontSize: '14px' }}>Collecting soil data for your region...</p>
            ) : data.recommendations.map((c, i) => (
              <div key={i} style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                padding: '12px 16px', 
                borderRadius: '16px', 
                backgroundColor: '#fff',
                border: '1px solid #f1f5f9'
              }}>
                <div>
                   <div style={{ fontWeight: '700', color: '#111827' }}>{c.name}</div>
                   <div style={{ fontSize: '11px', color: '#9ca3af' }}>{c.season} • {c.expectedYield}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                   <div style={{ fontSize: '14px', fontWeight: '800', color: '#1b4332' }}>{c.suitabilityScore}%</div>
                   <div style={{ fontSize: '9px', fontWeight: '800', color: '#9ca3af', textTransform: 'uppercase' }}>Suitability</div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
