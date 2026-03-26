import { useState, useEffect } from 'react';

/**
 * 🛰️ SCAS: Satellite NDVI Monitoring Component (Mock)
 * Simulates high-resolution multispectral imagery (Sentinel-2) for proactive health monitoring.
 */
export default function SatelliteMap({ district = "Kanpur" }) {
  const [loading, setLoading] = useState(true);
  const [stressLevel, setStressLevel] = useState('low');

  useEffect(() => {
    // Simulate satellite data downlink
    const timer = setTimeout(() => {
      setLoading(false);
      setStressLevel(Math.random() > 0.7 ? 'medium' : 'low');
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={{ 
      background: '#fff', 
      borderRadius: '24px', 
      padding: '24px', 
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
      border: '1px solid #e2e8f0',
      marginTop: '24px',
      overflow: 'hidden'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#1e293b' }}>
            🛰️ Satellite Health Monitoring (NDVI)
          </h3>
          <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
            Sentinel-2 Multispectral Data — District: {district}
          </p>
        </div>
        <div style={{ 
          padding: '6px 12px', 
          borderRadius: '20px', 
          backgroundColor: stressLevel === 'low' ? '#f0fdf4' : '#fff1f2',
          color: stressLevel === 'low' ? '#166534' : '#991b1b',
          fontSize: '11px',
          fontWeight: 'bold',
          border: `1px solid ${stressLevel === 'low' ? '#bbf7d0' : '#fecaca'}`
        }}>
          {loading ? '📡 Syncing...' : `Status: ${stressLevel === 'low' ? 'Optimal' : 'Stress Detected'}`}
        </div>
      </div>

      <div style={{ 
        position: 'relative', 
        height: '250px', 
        width: '100%', 
        backgroundColor: '#f1f5f9', 
        borderRadius: '16px',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {loading ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: '40px', height: '40px', border: '4px solid #1b4332', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto mb-12px' }}></div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <p style={{ fontSize: '12px', color: '#64748b' }}>Processing Multispectral Downlink...</p>
          </div>
        ) : (
          <>
            {/* Mock Satellite Imagery Backdrop */}
            <div style={{ 
              position: 'absolute', inset: 0, 
              background: 'linear-gradient(45deg, #134e4a, #064e3b, #065f46)',
              opacity: 0.9
            }}></div>
            
            {/* NDVI Heatmap Overlay */}
            <div style={{ 
              position: 'absolute', inset: '10%',
              background: `radial-gradient(circle at 30% 40%, ${stressLevel === 'low' ? '#4ade8055' : '#ef4444aa'} 10%, transparent 40%),
                           radial-gradient(circle at 70% 60%, #4ade8055 20%, transparent 50%),
                           radial-gradient(circle at 50% 50%, #4ade8055 30%, transparent 60%)`,
              filter: 'blur(15px)',
              animation: 'pulsate 3s ease-in-out infinite'
            }}></div>
            <style>{`@keyframes pulsate { 0%, 100% { opacity: 0.6; } 50% { opacity: 0.9; } }`}</style>
            
            {/* Scanning Line */}
            <div style={{ 
              position: 'absolute', top: 0, left: 0, right: 0, height: '2px', 
              background: 'rgba(255,255,255,0.3)',
              boxShadow: '0 0 10px rgba(255,255,255,0.5)',
              animation: 'scanDown 4s linear infinite'
            }}></div>
            <style>{`@keyframes scanDown { from { top: 0; } to { top: 100%; } }`}</style>

            {/* Labels */}
            <div style={{ position: 'absolute', bottom: '12px', left: '12px', color: '#fff', backgroundColor: 'rgba(0,0,0,0.4)', padding: '4px 8px', borderRadius: '4px', fontSize: '10px', fontFamily: 'monospace' }}>
              LAT: 26.4499° N<br/>
              LON: 80.3319° E
            </div>
          </>
        )}
      </div>

      <div style={{ marginTop: '16px', display: 'flex', gap: '8px', alignItems: 'center' }}>
        <div style={{ width: '12px', height: '12px', borderRadius: '2px', backgroundColor: '#4ade80' }}></div>
        <span style={{ fontSize: '11px', color: '#64748b' }}>High Health (NDVI {'>'} 0.7)</span>
        <div style={{ width: '12px', height: '12px', borderRadius: '2px', backgroundColor: '#ef4444', marginLeft: '12px' }}></div>
        <span style={{ fontSize: '11px', color: '#64748b' }}>Biomass Stress (NDVI {'<'} 0.3)</span>
      </div>

      {stressLevel === 'medium' && (
        <div style={{ 
          marginTop: '20px', 
          padding: '12px', 
          backgroundColor: '#fff1f2', 
          border: '1px solid #fecaca', 
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <span style={{ fontSize: '20px' }}>⚠️</span>
          <div>
            <p style={{ margin: 0, fontSize: '13px', fontWeight: 'bold', color: '#991b1b' }}>
              Potential Water Stress Detected in Sector B-12
            </p>
            <p style={{ margin: 0, fontSize: '11px', color: '#b91c1c' }}>
              Remote sensing suggests "Early Stage Wilting." AI investigation recommended.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
