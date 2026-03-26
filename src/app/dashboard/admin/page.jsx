'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useLang } from '@/lib/LanguageContext';

export default function AdminDashboard() {
  const { t } = useLang();
  const [stats, setStats] = useState(null);
  const [notification, setNotification] = useState({ channel: 'sms', content: '', targetRole: 'farmer', targetDistrict: '' });
  const [sending, setSending] = useState(false);
  const [notifResult, setNotifResult] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/admin/dashboard');
        setStats(res.data.data);
      } catch (err) {
        console.error('Failed to fetch stats:', err);
      }
    };
    fetchStats();
  }, []);

  const handleBulkNotify = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      const res = await api.post('/notifications/bulk', notification);
      setNotifResult(res.data.data);
    } catch (err) {
      console.error('Notification failed:', err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">🏛️ Government Admin Dashboard</h1>
          <p style={{ color: '#6b7280', marginTop: '4px' }}>System-wide monitoring and notifications</p>
        </div>
        <span className="dashboard-role-badge badge-admin">Admin</span>
      </div>

      {stats && (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{stats.tickets.total}</div>
              <div className="stat-label">{t('totalTicketsAdmin')}</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.tickets.resolved}</div>
              <div className="stat-label">{t('resolved')}</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.tickets.escalatedAdmin}</div>
              <div className="stat-label">{t('escalatedGovt')}</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.performance.avgResolutionHours}h</div>
              <div className="stat-label">{t('avgResolution')}</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.performance.slaCompliance}%</div>
              <div className="stat-label">{t('slaCompliance')}</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.users.farmers}</div>
              <div className="stat-label">{t('registeredFarmers')}</div>
            </div>
          </div>

          {stats.categoryBreakdown?.length > 0 && (
            <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', marginBottom: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              <h3 style={{ marginBottom: '12px', color: '#1b4332' }}>Issue Categories</h3>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                {stats.categoryBreakdown.map((cat) => (
                  <div key={cat._id} style={{ padding: '8px 16px', background: '#f0fdf4', borderRadius: '8px', fontSize: '14px' }}>
                    <strong>{cat._id || 'unknown'}</strong>: {cat.count}
                  </div>
                ))}
              </div>
            </div>
          )}

          {stats.breachedTickets?.length > 0 && (
            <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', marginBottom: '24px', boxShadow: '0 2px 12px rgba(239, 68, 68, 0.1)', border: '1px solid #fee2e2' }}>
              <h3 style={{ marginBottom: '16px', color: '#991b1b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                🚨 Active SLA Breaches (Action Required)
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                {stats.breachedTickets.map((ticket) => (
                  <div key={ticket._id} style={{ padding: '16px', borderRadius: '12px', background: '#fef2f2', border: '1px solid #fee2e2' }}>
                    <div style={{ fontWeight: '700', fontSize: '14px' }}>{ticket.description.slice(0, 80)}...</div>
                    <div style={{ fontSize: '12px', color: '#7f1d1d', marginTop: '4px' }}>
                      Farmer: {ticket.farmer?.name} ({ticket.farmer?.district})
                    </div>
                    <div style={{ fontSize: '11px', color: '#991b1b', fontWeight: 'bold', marginTop: '8px', textTransform: 'uppercase' }}>
                      Assigned To: {ticket.assignedWorker?.name || 'Unassigned'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
        <h3 style={{ marginBottom: '16px', color: '#1b4332' }}>📢 Bulk Notification</h3>
        <form onSubmit={handleBulkNotify} id="bulk-notification-form">
          <div style={{ display: 'flex', gap: '12px', marginBottom: '12px', flexWrap: 'wrap' }}>
            <select value={notification.channel} onChange={(e) => setNotification({ ...notification, channel: e.target.value })} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db' }} id="notif-channel">
              <option value="sms">SMS (Twilio)</option>
              <option value="push">Push (Firebase)</option>
              <option value="email">Email (SMTP)</option>
            </select>
            <select value={notification.targetRole} onChange={(e) => setNotification({ ...notification, targetRole: e.target.value })} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db' }} id="notif-role">
              <option value="farmer">All Farmers</option>
              <option value="worker">All Workers</option>
              <option value="subhead">All Sub-Heads</option>
            </select>
            <input placeholder="District (optional)" value={notification.targetDistrict} onChange={(e) => setNotification({ ...notification, targetDistrict: e.target.value })} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', flex: 1 }} id="notif-district" />
          </div>
          <textarea placeholder="Notification message..." value={notification.content} onChange={(e) => setNotification({ ...notification, content: e.target.value })} rows={3} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', marginBottom: '12px', resize: 'vertical', boxSizing: 'border-box' }} id="notif-content" />
          <button type="submit" disabled={sending} className="btn btn-primary" id="send-notification">
            {sending ? 'Sending...' : '🚀 Send Notification'}
          </button>
        </form>
        {notifResult && (
          <div style={{ marginTop: '12px', padding: '12px', background: '#d1fae5', borderRadius: '8px', fontSize: '14px' }}>
            ✅ Sent to {notifResult.sent}/{notifResult.totalRecipients} recipients ({notifResult.failed} failed)
          </div>
        )}
      </div>

      {/* 🌪️ DIGITAL TWIN: SCENARIO SIMULATION CONTROL */}
      <div style={{ 
        background: '#f8fafc', 
        borderRadius: '16px', 
        padding: '24px', 
        marginTop: '24px',
        border: '2px dashed #94a3b8',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
      }}>
        <h3 style={{ marginBottom: '16px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
          🌪️ Digital Twin: Scenario Simulation
        </h3>
        <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '16px', fontWeight: 'bold' }}>
          FOR PRESENTATION & STRESS-TESTING ONLY
        </p>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <button 
            onClick={async () => {
              if(!notification.targetDistrict) return alert("Please specify a district above! / कृपया ऊपर एक जिले का नाम दें।");
              if(confirm(`⚠️ Trigger DISTRICT-WIDE HAILSTORM in ${notification.targetDistrict}? This will escalate all active cases to Critical.`)) {
                try {
                  const res = await api.post('/simulation/trigger', { scenario: 'hailstorm', district: notification.targetDistrict });
                  alert(res.data.message);
                } catch(e) { alert("Simulation failed: " + e.message); }
              }
            }}
            style={{ padding: '16px', backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', cursor: 'pointer', textAlign: 'left' }}
          >
            <div style={{ fontSize: '20px', marginBottom: '8px' }}>⛈️</div>
            <div style={{ fontWeight: '700', fontSize: '14px', color: '#1e293b' }}>Trigger Hailstorm</div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>Escalates all district tickets to Critical + Siren</div>
          </button>

          <button 
            onClick={async () => {
              if(!notification.targetDistrict) return alert("Please specify a district above! / कृपया ऊपर एक जिले का नाम दें।");
              try {
                const res = await api.post('/simulation/trigger', { scenario: 'pest_outbreak', district: notification.targetDistrict });
                alert(res.data.message);
              } catch(e) { alert("Simulation failed: " + e.message); }
            }}
            style={{ padding: '16px', backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', cursor: 'pointer', textAlign: 'left' }}
          >
            <div style={{ fontSize: '20px', marginBottom: '8px' }}>🐝</div>
            <div style={{ fontWeight: '700', fontSize: '14px', color: '#1e293b' }}>Trigger Pest Alert</div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>Broadcasts 'Medium Severity' alert to all workers</div>
          </button>
        </div>
      </div>

      {/* Staff Management Quick Link */}
      <div style={{ background: 'linear-gradient(135deg, #1b4332, #2d6a4f)', borderRadius: '14px', padding: '20px', marginTop: '12px' }}>
        <h2 style={{ color: '#fff', fontWeight: '700', fontSize: '16px', marginBottom: '8px' }}>👥 Staff Account Management</h2>
        <p style={{ color: '#a7f3d0', fontSize: '13px', marginBottom: '16px' }}>
          Create IDs & passwords for Workers, Sub-Heads, and Admins. Farmers self-register publicly.
        </p>
        <a href="/dashboard/admin/staff" style={{
          display: 'inline-block',
          background: '#fff', color: '#1b4332', fontWeight: '700',
          padding: '12px 24px', borderRadius: '10px', textDecoration: 'none', fontSize: '14px'
        }}>
          🏛️ Open Staff Management →
        </a>
      </div>
    </div>
  );
}
