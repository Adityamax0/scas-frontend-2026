'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';

/**
 * Admin Staff Management Page
 * Only accessible by admin accounts.
 * Allows creating Worker, Sub-Head, and Admin accounts.
 * Farmers Self-Register; all other roles are created here.
 */
export default function StaffManagementPage() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState(null);

  const [form, setForm] = useState({
    name: '',
    phone: '',
    password: '',
    role: 'worker',
    district: '',
    state: 'Uttar Pradesh',
  });

  const fetchStaff = async () => {
    try {
      const res = await api.get('/admin/staff');
      setStaff(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch staff:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStaff(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    setMessage(null);
    try {
      const res = await api.post('/admin/staff', form);
      setMessage({ type: 'success', text: res.data.message });
      setShowForm(false);
      setForm({ name: '', phone: '', password: '', role: 'worker', district: '', state: 'Uttar Pradesh' });
      fetchStaff();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to create account.' });
    } finally {
      setCreating(false);
    }
  };

  const handleToggle = async (id, name, isActive) => {
    if (!confirm(`${isActive ? 'Deactivate' : 'Activate'} account for ${name}?`)) return;
    try {
      const res = await api.patch(`/admin/staff/${id}/toggle`);
      setMessage({ type: 'success', text: res.data.message });
      fetchStaff();
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to toggle account.' });
    }
  };

  const roleBadgeColor = (role) => {
    if (role === 'admin') return '#dc2626';
    if (role === 'subhead') return '#7c3aed';
    if (role === 'worker') return '#2563eb';
    return '#6b7280';
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">🏛️ Staff Management</h1>
          <p style={{ color: '#6b7280', marginTop: '4px' }}>
            Create &amp; manage Worker, Sub-Head and Admin accounts. Farmers self-register publicly.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span className="dashboard-role-badge" style={{ background: '#dc2626', color: '#fff' }}>ADMIN</span>
          <button
            className="btn btn-primary"
            onClick={() => setShowForm(!showForm)}
            style={{ padding: '12px 20px', fontSize: '14px' }}
          >
            {showForm ? '✕ Cancel' : '+ Create Staff Account'}
          </button>
        </div>
      </div>

      {/* Explanation Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #1b4332, #2d6a4f)',
        color: '#fff',
        padding: '16px 20px',
        borderRadius: '14px',
        marginBottom: '24px',
        fontSize: '14px',
        lineHeight: '1.7'
      }}>
        <strong>📋 Access Control Policy:</strong>
        <ul style={{ marginTop: '8px', paddingLeft: '20px' }}>
          <li><strong>Farmers</strong> → Can self-register from the public homepage. No admin needed.</li>
          <li><strong>Field Workers</strong> → You create their ID &amp; password here. Give them the credentials directly.</li>
          <li><strong>Sub-Heads</strong> → You create their ID &amp; password here. District-level government officials.</li>
          <li><strong>Admins</strong> → Only you (project manager) can create admin accounts.</li>
        </ul>
      </div>

      {message && (
        <div style={{
          padding: '12px 16px',
          borderRadius: '10px',
          marginBottom: '20px',
          backgroundColor: message.type === 'success' ? '#d1fae5' : '#fee2e2',
          color: message.type === 'success' ? '#065f46' : '#991b1b',
          fontWeight: '600',
        }}>
          {message.type === 'success' ? '✅' : '❌'} {message.text}
        </div>
      )}

      {/* Create Staff Form */}
      {showForm && (
        <div style={{
          background: '#fff',
          border: '1px solid #e2e8f0',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '28px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.06)'
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px', color: '#1b4332' }}>
            ➕ Create New Staff Account
          </h2>
          <form onSubmit={handleCreate} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '6px' }}>Full Name *</label>
              <input className="form-input" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Ramesh Kumar" />
            </div>
            <div>
              <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '6px' }}>Phone Number *</label>
              <input className="form-input" required value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+919876543210" />
            </div>
            <div>
              <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '6px' }}>Password (give this to them) *</label>
              <input className="form-input" required type="text" minLength="8" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Min 8 characters" />
            </div>
            <div>
              <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '6px' }}>Role *</label>
              <select className="form-input" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                <option value="worker">Field Worker</option>
                <option value="subhead">Sub-Head (District Official)</option>
                <option value="admin">Admin (Project Manager)</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '6px' }}>District *</label>
              <input className="form-input" required value={form.district} onChange={e => setForm({ ...form, district: e.target.value })} placeholder="e.g. Lucknow" />
            </div>
            <div>
              <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '6px' }}>State *</label>
              <input className="form-input" required value={form.state} onChange={e => setForm({ ...form, state: e.target.value })} placeholder="e.g. Uttar Pradesh" />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <button className="btn btn-primary" type="submit" disabled={creating} style={{ width: '100%', padding: '14px', fontSize: '15px' }}>
                {creating ? 'Creating Account...' : '✅ Create Staff Account'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Staff List */}
      <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', color: '#1b4332' }}>
        All Staff ({staff.length})
      </h2>

      {loading ? (
        <p style={{ color: '#6b7280' }}>Loading staff...</p>
      ) : staff.length === 0 ? (
        <p style={{ color: '#6b7280' }}>No staff accounts yet. Create the first one above.</p>
      ) : (
        <div className="ticket-list">
          {staff.map((s) => (
            <div key={s._id} className="ticket-card" style={{ opacity: s.isActive ? 1 : 0.5 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontWeight: '700', fontSize: '16px' }}>{s.name}</span>
                    <span style={{
                      fontSize: '10px', fontWeight: '800', padding: '2px 8px',
                      borderRadius: '10px', color: '#fff',
                      backgroundColor: roleBadgeColor(s.role),
                      textTransform: 'uppercase'
                    }}>
                      {s.role}
                    </span>
                    {!s.isActive && (
                      <span style={{ fontSize: '10px', color: '#dc2626', fontWeight: '700' }}>⛔ INACTIVE</span>
                    )}
                  </div>
                  <p style={{ fontSize: '13px', color: '#6b7280' }}>📱 {s.phone}</p>
                  <p style={{ fontSize: '13px', color: '#6b7280' }}>📍 {s.district}, {s.state}</p>
                </div>
                <button
                  onClick={() => handleToggle(s._id, s.name, s.isActive)}
                  style={{
                    padding: '8px 16px', borderRadius: '8px', fontWeight: '700', fontSize: '12px', cursor: 'pointer',
                    border: 'none',
                    background: s.isActive ? '#fee2e2' : '#d1fae5',
                    color: s.isActive ? '#dc2626' : '#065f46',
                  }}
                >
                  {s.isActive ? '⛔ Deactivate' : '✅ Activate'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
