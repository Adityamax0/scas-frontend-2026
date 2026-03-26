'use client';

import { useState, useRef, useEffect } from 'react';
import api from '@/lib/api';

export default function ImageScanner({ onScanComplete }) {
  const [isScanning, setIsScanning] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [result, setResult] = useState(null);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const fileInputRef = useRef(null);
  const tfliteModel = useRef(null);

  // 🧠 EDGE AI: Load TensorFlow.js from CDN for offline fallback
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const loadTF = async () => {
      if (window.tf) return;
      const script1 = document.createElement('script');
      script1.src = "https://cdn.jsdelivr.net/npm/@tensorflow/tfjs";
      script1.async = true;
      document.body.appendChild(script1);
      
      script1.onload = async () => {
        const script2 = document.createElement('script');
        script2.src = "https://cdn.jsdelivr.net/npm/@tensorflow-models/mobilenet";
        script2.async = true;
        document.body.appendChild(script2);
        
        script2.onload = async () => {
          console.log('[EDGE AI] TF.js & MobileNet Loaded. Ready for offline fallbacks.');
          tfliteModel.current = await window.mobilenet.load();
        };
      };
    };
    loadTF();
  }, []);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => setPreviewUrl(reader.result);
    reader.readAsDataURL(file);

    setIsScanning(true);
    setResult(null);
    setIsOfflineMode(false);

    // 🌐 ONLINE SCAN (Primary)
    try {
      const formData = new FormData();
      formData.append('image', file);

      const res = await api.post('/tickets/scan-disease', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 8000 // Fast timeout to trigger offline fallback
      });
      
      setResult(res.data.data);
      if (onScanComplete) onScanComplete(res.data.data);
    } catch (err) {
      console.warn('[SCAN] Online AI failed or timed out. Pivoting to Edge AI...');
      
      // 📱 EDGE AI FALLBACK (Offline/Timeout)
      if (tfliteModel.current && fileInputRef.current) {
        try {
          // Create temp image for TF.js
          const img = new Image();
          img.src = URL.createObjectURL(file);
          await new Promise(resolve => img.onload = resolve);
          
          const predictions = await tfliteModel.current.classify(img);
          const top = predictions[0];
          
          const offlineData = {
            label: top.className.split(',')[0],
            confidence: top.probability,
            isHealthy: top.className.toLowerCase().includes('healthy'),
            recommendation: "📍 [EDGE AI PRELIMINARY]: Analysis performed locally due to low connectivity. Please visit a network zone for a detailed government-certified report.",
            isOffline: true
          };
          
          setResult(offlineData);
          setIsOfflineMode(true);
          if (onScanComplete) onScanComplete(offlineData);
          
        } catch (edgeErr) {
          console.error('[EDGE AI] Failed:', edgeErr);
          alert('System error: Both cloud and local AI modules are currently unavailable.');
        }
      } else {
        alert('Connectivity lost. Please wait for the local AI module to finish loading.');
      }
    } finally {
      setIsScanning(false);
    }
  };

  const handleCreateTicket = async () => {
    if (!result || isScanning) return;
    
    setIsScanning(true);
    try {
      const { v4: uuidv4 } = require('uuid');
      await api.post('/tickets', {
        clientId: `scan-${Date.now()}`,
        description: `🚨 [AI SCAN REPORT]: ${result.label} detected with ${Math.round(result.confidence * 100)}% confidence.\n\nAI RECOMMENDATION: ${result.recommendation}`,
        cropType: 'Detected via AI',
        category: 'disease',
        priority: 'high'
      });
      // Clear UI immediately so spinner disappears
      setResult(null);
      setPreviewUrl(null);
      setIsScanning(false);
      
      // Async UI popup
      setTimeout(() => alert('✅ Ticket created! A worker will be assigned to visit your field.'), 100);
      
    } catch (err) {
      console.error('Ticket creation error:', err);
      setIsScanning(false);
      setTimeout(() => alert('❌ Failed to create ticket. Please try manually.'), 100);
    } finally {
      setIsScanning(false);
    }
  };

  const triggerUpload = () => {
    fileInputRef.current.click();
  };

  return (
    <div style={{ 
      background: '#fff', 
      borderRadius: '16px', 
      padding: '24px', 
      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
      border: '1px solid #e5e7eb',
      marginTop: '24px'
    }}>
      <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1b4332', marginBottom: '16px' }}>
        🔬 AI Disease Scanner
      </h3>
      
      <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '20px' }}>
        Take a photo of a leaf to instantly identify diseases.
      </p>

      <div style={{ textAlign: 'center' }}>
        <input 
          type="file" 
          accept="image/*" 
          capture="environment" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          style={{ display: 'none' }} 
        />
        
        {!previewUrl ? (
          <button 
            onClick={triggerUpload}
            style={{
              padding: '16px 32px',
              backgroundColor: '#1b4332',
              color: '#fff',
              borderRadius: '16px',
              border: 'none',
              fontWeight: '800',
              fontSize: '15px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              margin: '0 auto',
              boxShadow: '0 8px 16px rgba(27,67,50,0.2)',
              transition: 'transform 0.2s'
            }}
          >
            <span style={{ fontSize: '20px' }}>📸</span> Click / Upload Leaf Photo
          </button>
        ) : (
          <div style={{ position: 'relative', width: 'fit-content', margin: '0 auto' }}>
            <img 
              src={previewUrl} 
              alt="Preview" 
              style={{ 
                maxWidth: '400px', 
                width: '100%', 
                borderRadius: '24px', 
                border: '8px solid #fff',
                boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
              }} 
            />
            {isScanning && (
              <div style={{
                position: 'fixed',
                top: 0, left: 0, right: 0, bottom: 0,
                background: 'rgba(255,255,255,0.7)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '0',
                zIndex: 2000
              }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  border: '6px solid #1b4332',
                  borderTopColor: 'transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></div>
                <h4 style={{ marginTop: '24px', fontSize: '18px', fontWeight: '800', color: '#1b4332' }}>
                  AI IS ANALYZING LEAF...
                </h4>
                <p style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold' }}>
                  Identifying diseases & crop health data
                </p>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              </div>
            )}
            {!isScanning && (
              <button 
                onClick={() => { setPreviewUrl(null); setResult(null); }}
                style={{
                  position: 'absolute',
                  top: '-10px', right: '-10px',
                  background: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50%',
                  width: '24px', height: '24px',
                  cursor: 'pointer'
                }}
              >✕</button>
            )}
          </div>
        )}
      </div>

      {result && (
        <div style={{ 
          marginTop: '20px', 
          padding: '16px', 
          backgroundColor: result.isHealthy ? '#f0fdf4' : '#fff1f2',
          borderRadius: '12px',
          border: `1px solid ${result.isHealthy ? '#bbf7d0' : '#fecaca'}`
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <h4 style={{ fontWeight: 'bold', color: result.isHealthy ? '#166534' : '#991b1b' }}>
              {result.isHealthy ? '✅ Plant Healthy' : `🚨 Potential: ${result.label}`}
            </h4>
            <span style={{ fontSize: '12px', background: '#fff', padding: '2px 8px', borderRadius: '12px', border: '1px solid #ddd' }}>
              {Math.round(result.confidence * 100)}% Match
            </span>
          </div>
          <p style={{ fontSize: '14px', color: '#374151' }}>
            {result.recommendation}
          </p>
          
          {!result.isHealthy && (
            <button
              style={{
                marginTop: '12px',
                fontSize: '13px',
                color: '#991b1b',
                background: 'none',
                border: 'none',
                padding: 0,
                textDecoration: 'underline',
                cursor: 'pointer'
              }}
              onClick={handleCreateTicket}
              disabled={isScanning}
            >
              {isScanning ? 'Creating Ticket...' : 'Raise support ticket for this?'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
