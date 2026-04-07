'use client';

import { useState, useEffect } from 'react';
import nextDynamic from 'next/dynamic';
import WeatherAdvisory from '@/components/WeatherAdvisory';
import NotificationCenter from '@/components/NotificationCenter';
import { useLang } from '@/lib/LanguageContext';
import api from '@/lib/api';

// ðŸ”„ Dynamically import window-heavy components with SSR disabled
const DiseaseHeatmap = nextDynamic(() => import('@/components/DiseaseHeatmap'), { ssr: false });
const OperationalAnalytics = nextDynamic(() => import('@/components/OperationalAnalytics'), { ssr: false });





export default function SubHeadDashboard() {
  const { t } = useLang();
  const [tickets, setTickets] = useState([]);
  const [resolvedTickets, setResolvedTickets] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('tickets'); // 'tickets' | 'analytics'

  const fetchData = async () => {
    try {
      setLoading(true);
      const [escalated, resolved, stats] = await Promise.all([
        api.get('/tickets?status=escalated_subhead'),
        api.get('/tickets?status=resolved'),
        api.get('/analytics/operational'),
      ]);
      setTickets(escalated.data.data || []);
      setResolvedTickets(resolved.data.data || []);
      setAnalytics(stats.data.data || null);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleResolve = async (ticketId) => {
    try {
      await api.patch(`/tickets/${ticketId}/status`, {
        status: 'resolved',
        notes: 'Resolved after sub-head verification and official review',
        proofOfWorkUrl: `internal://subhead-verified/${ticketId}`,
        proofOfWorkType: 'subhead_internal',
      });
      fetchData();
    } catch (err) {
      console.error('Failed to resolve:', err);
    }
  };

  const handleEscalateToAdmin = async (ticketId) => {
    try {
      await api.post(`/tickets/${ticketId}/escalate`, {
        reason: 'Requires government-level intervention',
      });
      fetchData();
    } catch (err) {
      console.error('Failed to escalate:', err);
    }
  };

  const priorityColors = {
    critical: { bg: '#fee2e2', color: '#991b1b' },
    high: { bg: '#ffedd5', color: '#9a3412' },
    medium: { bg: '#fef9c3', color: '#713f12' },
    low: { bg: '#f0fdf4', color: '#166534' },
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="dashboard-title">ðŸ›ï¸ Government Oversight Portal</h1>
          <p style={{ color: '#6b7280', marginTop: '4px' }}>District-level operations & critical case management</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <NotificationCenter />
          <span className="dashboard-role-badge badge-subhead">Sub-Head</span>
        </div>
      </div>

      <WeatherAdvisory />

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#ef4444' }}>{tickets.length}</div>
          <div className="stat-label">Active Escalations</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#10b981' }}>{resolvedTickets.length}</div>
          <div className="stat-label">Resolved This Week</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#3b82f6' }}>
            {analytics?.districtPerformance?.[0]?.avgART || 'N/A'}h
          </div>
          <div className="stat-label">Avg Res. Time</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb', marginBottom: '24px', gap: '32px' }}>
        <button 
          onClick={() => setActiveTab('tickets')}
          style={{
            padding: '12px 4px',
            fontSize: '15px',
            fontWeight: 700,
            border: 'none',
            background: 'none',
            borderBottom: activeTab === 'tickets' ? '3px solid #1b4332' : '3px solid transparent',
            color: activeTab === 'tickets' ? '#1b4332' : '#6b7280',
            cursor: 'pointer'
          }}
        >
          ðŸ“‚ Case Management
        </button>
        <button 
          onClick={() => setActiveTab('analytics')}
          style={{
            padding: '12px 4px',
            fontSize: '15px',
            fontWeight: 700,
            border: 'none',
            background: 'none',
            borderBottom: activeTab === 'analytics' ? '3px solid #1b4332' : '3px solid transparent',
            color: activeTab === 'analytics' ? '#1b4332' : '#6b7280',
            cursor: 'pointer'
          }}
        >
          ðŸ“ˆ District Analytics
        </button>
      </div>

      {activeTab === 'analytics' ? (
        <div className="analytics-view">
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#1b4332' }}>ðŸ“ Disease Outbreak Heatmap</h2>
          <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '16px' }}>
            Real-time geospatial locations of reported crop failures.
          </p>
          <DiseaseHeatmap data={analytics?.heatmap || []} />
          <OperationalAnalytics data={analytics} />
        </div>
      ) : (
        <div className="tickets-view">
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#1b4332', marginBottom: '16px' }}>
            Escalated Cases Needs Attention
          </h2>
          {loading ? (
            <p style={{ color: '#6b7280' }}>{t('loading')}</p>
          ) : tickets.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>âœ…</div>
              <p>No escalated cases at this time. All under control!</p>
            </div>
          ) : (
            <div className="ticket-list">
              {tickets.map((ticket) => {
                const pColors = priorityColors[ticket.priority] || priorityColors.medium;
                return (
                  <div 
                    key={ticket._id} 
                    className="ticket-card status-escalated_subhead"
                    style={ticket.slaBreached ? { border: '2px solid #ef4444', boxShadow: '0 0 15px rgba(239,68,68,0.15)' } : {}}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontSize: '10px', fontWeight: 800, padding: '2px 10px', borderRadius: '12px', backgroundColor: pColors.bg, color: pColors.color, textTransform: 'uppercase' }}>
                          {ticket.priority || 'medium'}
                        </span>
                        {ticket.slaBreached && (
                          <span style={{ fontSize: '11px', fontWeight: 900, color: '#ef4444' }}>ðŸš¨ SLA BREACHED</span>
                        )}
                      </div>
                      
                      <div style={{ fontWeight: 600, marginBottom: '4px' }}>{ticket.description.slice(0, 120)}</div>
                      <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '4px' }}>
                        Farmer: <strong>{ticket.farmer?.name}</strong> ({ticket.farmer?.district}) â€¢ Worker: {ticket.assignedWorker?.name || 'Unassigned'}
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                          className="btn btn-primary" 
                          onClick={() => handleResolve(ticket._id)}
                        >
                          âœ… Resolve
                        </button>
                        <button 
                          className="btn btn-danger" 
                          onClick={() => handleEscalateToAdmin(ticket._id)}
                        >
                          ðŸ›ï¸ Escalate
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

