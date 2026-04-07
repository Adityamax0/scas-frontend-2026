'use client';

import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Geolocation } from '@capacitor/geolocation';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';
import { savePendingTicket } from '@/lib/offlineDb';
import syncEngine from '@/lib/syncEngine';
import api from '@/lib/api';
import { toast } from 'react-hot-toast';

/**
 * TicketForm — Unified ticket submission form.
 * Routes to online API if connected, or Dexie.js IndexedDB if offline.
 */
export default function TicketForm({ onSuccess }) {
  const [form, setForm] = useState({
    description: '',
    cropType: '',
    category: 'other',
    priority: 'medium',
  });
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  /**
   * NATIVE: Trigger Capacitor Camera
   */
  const takeNativePhoto = async () => {
    if (!Capacitor.isNativePlatform()) {
      toast.error('Native Camera is only available on our Android/iOS app! / कैमरा केवल हमारे एंड्रॉइड/आईओएस ऐप पर उपलब्ध है!', { id: 'native-only' });
      return;
    }
    try {
      const image = await Camera.getPhoto({
        quality: 80,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera
      });

      const response = await fetch(image.webPath);
      const blob = await response.blob();
      const file = new File([blob], `native-photo-${Date.now()}.jpg`, { type: 'image/jpeg' });
      
      setFiles(prev => [...prev, file]);
      await Haptics.impact({ style: ImpactStyle.Light });
    } catch (err) {
      console.error('Camera error:', err);
    }
  };

  /**
   * Utility to compress images using HTML5 Canvas before uploading
   * Reduces bandwidth by 90% for rural mobile users.
   */
  const compressImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1024;
          const MAX_HEIGHT = 1024;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          canvas.toBlob((blob) => {
            resolve(new File([blob], file.name, { type: 'image/jpeg', lastModified: Date.now() }));
          }, 'image/jpeg', 0.7);
        };
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return; // STRICT LOCK: Prevent rapid-fire double submissions!
    
    setLoading(true);
    setMessage(null);

    // 🛡️ DIRTY DATA PROTECTION (Client-Side)
    if (form.description.length > 5000) {
      setMessage({ type: 'error', text: '❌ Description is too long (Max 5,000 chars).' });
      setLoading(false);
      return;
    }

    const clientId = uuidv4();

    try {
      // ── NATIVE: High-Accuracy GPS ──
      let coordinates = [0, 0];
      try {
        const position = await Geolocation.getCurrentPosition({
          enableHighAccuracy: true,
          timeout: 10000
        });
        coordinates = [position.coords.longitude, position.coords.latitude];
      } catch (gpsErr) {
        console.warn('[NATIVE GPS] Failed, falling back to browser:', gpsErr);
        if (navigator.geolocation) {
          const pos = await new Promise((resolve) => {
            navigator.geolocation.getCurrentPosition(resolve, () => resolve(null), { timeout: 5000 });
          });
          if (pos) coordinates = [pos.coords.longitude, pos.coords.latitude];
        }
      }

      if (navigator.onLine) {
        // ── ONLINE: Submit directly to API ──
        const formData = new FormData();
        formData.append('clientId', clientId);
        formData.append('description', form.description);
        formData.append('cropType', form.cropType);
        formData.append('category', form.category);
        formData.append('priority', form.priority);
        formData.append('coordinates', JSON.stringify(coordinates));

        // Compress images before sending to reduce bandwidth for rural users
        const processedFiles = await Promise.all(
          files.map(async (f) => {
            if (f.type.startsWith('image/')) return await compressImage(f);
            return f;
          })
        );

        processedFiles.forEach((file) => formData.append('media', file));

        await api.post('/tickets', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        // ── NATIVE: Haptic Feedback on Success ──
        await Haptics.impact({ style: ImpactStyle.Heavy });
        await Haptics.vibrate();

        setMessage({ type: 'success', text: '✅ Ticket submitted successfully!' });
      } else {
        // ── OFFLINE: Save to IndexedDB ──
        await savePendingTicket({
          clientId,
          description: form.description,
          cropType: form.cropType,
          category: form.category,
          priority: form.priority,
          coordinates,
        });
        
        // Trigger Background Sync Registration
        syncEngine.requestBackgroundSync();

        // ── NATIVE: Light Haptic Feedback for Offset Save ──
        await Haptics.impact({ style: ImpactStyle.Medium });

        setMessage({ type: 'info', text: '📴 Saved offline — will sync when connected.' });
      }

      // Reset form
      setForm({ description: '', cropType: '', category: 'other', priority: 'medium' });
      setFiles([]);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('[TICKET] Submit error:', error);
      // Fallback to offline storage on network errors
      try {
        await savePendingTicket({
          clientId,
          description: form.description,
          cropType: form.cropType,
          category: form.category,
          priority: form.priority,
          coordinates: [0, 0],
        });
        
        // Trigger Background Sync Registration
        syncEngine.requestBackgroundSync();
        
        setMessage({ type: 'info', text: '📴 Network error — saved offline. Will sync later.' });
      } catch {
        setMessage({ type: 'error', text: '❌ Failed to save ticket.' });
      }

    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} id="ticket-form" style={styles.form}>
      <h2 style={styles.title}>🌾 Report Crop Issue</h2>

      {message && (
        <div style={{
          ...styles.message,
          backgroundColor: message.type === 'success' ? '#d1fae5' : message.type === 'error' ? '#fee2e2' : '#dbeafe',
          color: message.type === 'success' ? '#065f46' : message.type === 'error' ? '#991b1b' : '#1e40af',
        }}>
          {message.text}
        </div>
      )}

      <div style={styles.field}>
        <label style={styles.label}>Description *</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          required
          rows={4}
          placeholder="Describe the crop problem you are facing..."
          style={styles.textarea}
          id="ticket-description"
        />
        <div style={{ 
          fontSize: '11px', 
          textAlign: 'right', 
          marginTop: '4px',
          color: form.description.length > 4500 ? '#ef4444' : '#9ca3af',
          fontWeight: form.description.length > 4500 ? 700 : 400
        }}>
          {form.description.length} / 5000
        </div>
      </div>

      <div style={styles.row}>
        <div style={styles.field}>
          <label style={styles.label}>Crop Type</label>
          <input
            name="cropType"
            value={form.cropType}
            onChange={handleChange}
            placeholder="e.g., Rice, Wheat"
            style={styles.input}
            id="ticket-crop-type"
          />
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Category</label>
          <select name="category" value={form.category} onChange={handleChange} style={styles.select} id="ticket-category">
            <option value="pest">Pest Attack</option>
            <option value="disease">Disease</option>
            <option value="nutrient_deficiency">Nutrient Deficiency</option>
            <option value="irrigation">Irrigation Issue</option>
            <option value="weather_damage">Weather Damage</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      <div style={styles.field}>
        <label style={styles.label}>Priority</label>
        <select name="priority" value={form.priority} onChange={handleChange} style={styles.select} id="ticket-priority">
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>
      </div>

      <div style={styles.field}>
        <label style={styles.label}>📷 Photos / 🎙️ Voice Note</label>
        
        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
          <button 
            type="button" 
            onClick={takeNativePhoto} 
            style={{ ...styles.button, backgroundColor: '#059669', flex: 1, marginTop: 0 }}
          >
            📸 Quick Photo
          </button>
          <input
            type="file"
            multiple
            accept="image/*,audio/*"
            onChange={handleFileChange}
            style={{ ...styles.input, flex: 1.5 }}
            id="ticket-media"
          />
        </div>

        {files.length > 0 && (
          <div style={{ fontSize: '12px', color: '#059669', fontWeight: 600 }}>
            {files.length} file(s) attached
          </div>
        )}
      </div>

      <button type="submit" disabled={loading} style={styles.button} id="ticket-submit">
        {loading ? 'Submitting...' : navigator.onLine ? '🚀 Submit Ticket' : '💾 Save Offline'}
      </button>
    </form>
  );
}

const styles = {
  form: {
    maxWidth: '600px',
    margin: '0 auto',
    padding: '32px',
    background: '#fff',
    borderRadius: '16px',
    boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
    fontFamily: "'Inter', sans-serif",
  },
  title: {
    fontSize: '24px',
    fontWeight: 700,
    color: '#1b4332',
    marginBottom: '24px',
  },
  message: {
    padding: '12px 16px',
    borderRadius: '8px',
    marginBottom: '16px',
    fontSize: '14px',
    fontWeight: 500,
  },
  field: {
    marginBottom: '16px',
    flex: 1,
  },
  row: {
    display: 'flex',
    gap: '16px',
  },
  label: {
    display: 'block',
    fontSize: '13px',
    fontWeight: 600,
    color: '#374151',
    marginBottom: '6px',
  },
  input: {
    width: '100%',
    padding: '10px 14px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
  },
  textarea: {
    width: '100%',
    padding: '10px 14px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '14px',
    resize: 'vertical',
    outline: 'none',
    boxSizing: 'border-box',
  },
  select: {
    width: '100%',
    padding: '10px 14px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
    background: '#fff',
  },
  button: {
    width: '100%',
    padding: '14px',
    backgroundColor: '#2d6a4f',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '16px',
    fontWeight: 700,
    cursor: 'pointer',
    marginTop: '8px',
  },
};
