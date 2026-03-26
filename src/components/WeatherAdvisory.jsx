'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';

export default function WeatherAdvisory() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function fetchWeather() {
      if (typeof window === 'undefined') return;
      try {
        navigator.geolocation.getCurrentPosition(async (pos) => {
          const { latitude, longitude } = pos.coords;
          const res = await api.get(`/weather?lat=${latitude}&lon=${longitude}`);
          if (isMounted) { setWeather(res.data.data); setLoading(false); }
        }, async () => {
          const res = await api.get('/weather');
          if (isMounted) { setWeather(res.data.data); setLoading(false); }
        });
      } catch (err) {
        console.error('Weather fetch error:', err);
        if (isMounted) setLoading(false);
      }
    }
    fetchWeather();

    return () => { isMounted = false; };
  }, []);

  if (loading) return <div style={{ height: '200px', backgroundColor: '#f8fafc', borderRadius: '16px', animation: 'pulse 2s infinite' }}></div>;
  if (!weather) return null;

  return (
    <div style={{
      backgroundColor: '#fff',
      borderRadius: '24px',
      padding: '32px',
      color: '#0f172a',
      marginBottom: '32px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
      border: '1px solid #f1f5f9',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Header - Printed Report Look */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '24px',
        borderBottom: '2px solid #f1f5f9',
        paddingBottom: '24px'
      }}>
        <div>
          <span style={{ 
            fontSize: '12px', 
            fontWeight: '800', 
            textTransform: 'uppercase', 
            letterSpacing: '2px', 
            color: '#1b4332',
            display: 'block',
            marginBottom: '4px'
          }}>Official Advisory</span>
          <h3 style={{ fontSize: '24px', fontWeight: '800', margin: 0, letterSpacing: '-0.5px' }}>
            7-Day Regional Weather
          </h3>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-end' }}>
             <span style={{ fontSize: '36px', fontWeight: '900', color: '#1b4332' }}>{weather?.current?.temp ? Math.round(weather.current.temp) : '--'}°C</span>
             <span style={{ fontSize: '24px' }}>☀️</span>
          </div>
          <p style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', margin: 0 }}>CURRENT FIELD TEMP</p>
        </div>
      </div>

      {/* The "Printed" Advisory Box */}
      <div style={{ 
        backgroundColor: '#f8fafc', 
        padding: '20px', 
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        marginBottom: '32px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: 0, left: 0, bottom: 0,
          width: '6px',
          backgroundColor: '#1b4332'
        }}></div>
        <h4 style={{ 
          margin: '0 0 10px 0', 
          fontSize: '13px', 
          fontWeight: '800', 
          color: '#1b4332',
          textTransform: 'uppercase'
        }}>
          🌾 Agricultural Guidance
        </h4>
        <p style={{ 
          fontSize: '16px', 
          fontWeight: '600', 
          lineHeight: '1.6', 
          color: '#334155',
          margin: 0
        }}>
          {weather?.advisory || 'No advisory data currently available for your region.'}
        </p>
      </div>

      {/* Mini Forecast Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(7, 1fr)', 
        gap: '12px'
      }}>
        {weather?.forecast?.length > 0 ? weather.forecast.map((day, i) => (
          <div key={i} style={{
            textAlign: 'center',
            padding: '16px 8px',
            borderRadius: '16px',
            backgroundColor: i === 0 ? '#1b4332' : '#fff',
            color: i === 0 ? '#fff' : '#0f172a',
            border: i === 0 ? 'none' : '1px solid #f1f5f9',
            transition: 'transform 0.2s',
            cursor: 'default'
          }}>
            <p style={{ 
              fontSize: '10px', 
              fontWeight: '800', 
              textTransform: 'uppercase',
              opacity: i === 0 ? 0.8 : 0.5,
              marginBottom: '10px'
            }}>
              {i === 0 ? 'Now' : new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
            </p>
            <p style={{ fontSize: '20px', fontWeight: '900', marginBottom: '6px' }}>{Math.round(day.maxTemp)}°</p>
            <div style={{ fontSize: '10px', fontWeight: '700' }}>
               {day.rain > 5 ? '🌧️' : (day.rain > 0 ? '🌦️' : '☀️')}
               <span style={{ marginLeft: '2px', opacity: 0.8 }}>{day.rain > 0 ? `${Math.round(day.rain)}mm` : 'Dry'}</span>
            </div>
          </div>
        )) : <p style={{ gridColumn: 'span 7', textAlign: 'center', color: '#6b7280', fontSize: '13px' }}>Forecast data unavailable.</p>}
      </div>
    </div>
  );
}
