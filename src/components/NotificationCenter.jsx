'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchNotifs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/notifications');
      setNotifications(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
    // Refresh every 2 mins
    const interval = setInterval(fetchNotifs, 120000);
    return () => clearInterval(interval);
  }, []);

  const markRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div style={{ position: 'relative' }}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: 'none',
          border: 'none',
          fontSize: '24px',
          cursor: 'pointer',
          position: 'relative',
          padding: '8px',
          borderRadius: '50%',
          transition: 'background 0.2s'
        }}
        onMouseEnter={(e) => e.target.style.backgroundColor = '#f3f4f6'}
        onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
      >
        🔔
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: '4px',
            right: '4px',
            backgroundColor: '#ef4444',
            color: '#fff',
            borderRadius: '50%',
            width: '18px',
            height: '18px',
            fontSize: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            border: '2px solid #fff'
          }}>
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '50px',
          right: '0',
          width: '320px',
          maxHeight: '400px',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(12px)',
          borderRadius: '20px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
          border: '1px solid rgba(255,255,255,0.3)',
          zIndex: 1000,
          overflowY: 'auto',
          padding: '16px'
        }}>
          <h4 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '800', color: '#1b4332' }}>
            Latest Updates
          </h4>
          
          {loading && notifications.length === 0 ? (
            <p style={{ fontSize: '12px', color: '#6b7280' }}>Loading alerts...</p>
          ) : notifications.length === 0 ? (
            <p style={{ fontSize: '12px', color: '#6b7280', textAlign: 'center', padding: '20px' }}>
              No new notifications 🌾
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {notifications.map((n) => (
                <div 
                  key={n._id} 
                  onClick={() => !n.isRead && markRead(n._id)}
                  style={{
                    padding: '12px',
                    borderRadius: '12px',
                    backgroundColor: n.isRead ? 'transparent' : '#f0fdf4',
                    borderLeft: n.isRead ? '3px solid transparent' : '3px solid #1b4332',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#111827', marginBottom: '2px' }}>{n.title}</div>
                  <div style={{ fontSize: '12px', color: '#4b5563', lineHeight: '1.4' }}>{n.content}</div>
                  <div style={{ fontSize: '10px', color: '#9ca3af', marginTop: '6px' }}>
                    {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
