'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

/**
 * DiseaseHeatmap: Visualizes active crop issues on a map.
 * @param {Array} data - [ { lat, lng, category, priority } ]
 */
export default function DiseaseHeatmap({ data = [] }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return <div style={{ height: '400px', background: '#f3f4f6', borderRadius: '16px' }} />;

  const getMarkerColor = (priority) => {
    switch (priority) {
      case 'critical': return '#ef4444';
      case 'high': return '#f97316';
      case 'medium': return '#eab308';
      default: return '#22c55e';
    }
  };

  return (
    <div style={{ height: '450px', width: '100%', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb' }}>
      <MapContainer 
        center={[26.8467, 80.9462]} // Default to Lucknow center
        zoom={6} 
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {data.map((point, idx) => (
          <CircleMarker
            key={idx}
            center={[point.lat, point.lng]}
            radius={8}
            pathOptions={{
              fillColor: getMarkerColor(point.priority),
              color: '#fff',
              weight: 2,
              opacity: 1,
              fillOpacity: 0.8
            }}
          >
            <Popup>
              <div style={{ padding: '4px' }}>
                <strong style={{ textTransform: 'capitalize', color: getMarkerColor(point.priority) }}>
                  {point.category.replace('_', ' ')}
                </strong>
                <p style={{ margin: '4px 0 0', fontSize: '12px' }}>
                  Priority: {point.priority}
                </p>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}
