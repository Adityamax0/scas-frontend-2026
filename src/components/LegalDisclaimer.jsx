'use client';

import React, { useState, useEffect } from 'react';

/**
 * LegalDisclaimer Modal
 * Ensures farmers understand the limitations of AI advice.
 * Essential for production-grade liability protection.
 */
const LegalDisclaimer = ({ onAccept }) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem('scas_disclaimer_accepted');
    if (!accepted) {
      setIsOpen(true);
    } else {
      onAccept?.();
    }
  }, [onAccept]);

  const handleAccept = () => {
    localStorage.setItem('scas_disclaimer_accepted', 'true');
    setIsOpen(false);
    onAccept?.();
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
      backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', padding: '16px'
    }}>
      <div style={{
        backgroundColor: '#fff', borderRadius: '24px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
        width: '100%', maxWidth: '450px', overflow: 'hidden',
      }}>
        <div style={{ backgroundColor: '#f59e0b', padding: '24px', color: '#fff', textAlign: 'center' }}>
          <div style={{
            width: '64px', height: '64px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto'
          }}>
            <svg style={{ width: '32px', height: '32px', color: '#fff' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 4px 0' }}>Important Notice</h2>
          <p style={{ fontSize: '14px', opacity: 0.9, margin: 0 }}>महत्वपूर्ण सूचना</p>
        </div>

        <div style={{ padding: '32px', color: '#374151', fontSize: '15px', lineHeight: '1.6' }}>
          <div style={{ marginBottom: '24px' }}>
            <p style={{ fontWeight: '600', color: '#111827', margin: '0 0 8px 0' }}>English:</p>
            <p style={{ margin: 0 }}>
              AI advice is for recommendation only. It may not be 100% accurate. 
              Always consult your local Field Worker for high-value crops or severe outbreaks.
            </p>
          </div>

          <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '24px', marginBottom: '32px' }}>
            <p style={{ fontWeight: '600', color: '#111827', margin: '0 0 8px 0' }}>हिन्दी:</p>
            <p style={{ margin: 0 }}>
              AI सलाह केवल सिफारिश के लिए है। यह 100% सटीक नहीं हो सकती है। 
              महत्वपूर्ण फसलों या गंभीर बीमारियों के लिए हमेशा अपने स्थानीय मैदानी कार्यकर्ता से सलाह लें।
            </p>
          </div>
          
          <button
            onClick={handleAccept}
            style={{
              width: '100%', backgroundColor: '#16a34a', color: '#fff', fontWeight: 'bold', border: 'none',
              padding: '16px', borderRadius: '12px', cursor: 'pointer', fontSize: '16px',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#15803d'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#16a34a'}
          >
            I Accept / स्वीकार है
          </button>
        </div>
      </div>
    </div>
  );
};

export default LegalDisclaimer;
