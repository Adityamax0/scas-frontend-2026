'use client';

import { useState, useEffect } from 'react';
import WeatherAdvisory from '@/components/WeatherAdvisory';
import TicketCard from '@/components/TicketCard';
import { TicketSkeleton } from '@/components/SkeletonLoader';
import { useLang } from '@/lib/LanguageContext';
import { getSocket, joinDistrictRoom, disconnectSocket } from '@/lib/socket';
import { toast } from 'react-hot-toast';
import api from '@/lib/api';


export default function WorkerDashboard() {
  const { t } = useLang();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [proofFile, setProofFile] = useState({}); // { ticketId: file }
  const [isUploading, setIsUploading] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null); // State for the detail modal
  const [user, setUser] = useState(null);

  const fetchTickets = async () => {
    try {
      const res = await api.get('/tickets');
      setTickets(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    const initData = async () => {
      setLoading(true);
      try {
        // 1. Fetch user profile for district
        const profileRes = await api.get('/auth/me');
        const userData = profileRes.data.data;
        setUser(userData);

        // 2. Initial ticket fetch
        await fetchTickets();

        // 3. Socket Connection
        if (userData?.district) {
          joinDistrictRoom(userData.district);
          const socket = getSocket();

          socket.on('new_ticket', (payload) => {
            const ticket = payload.data;
            const isUrgent = ticket.metadata?.requires_human_intervention;
            
            console.log('[REALTIME] New ticket received:', ticket);
            
            toast.success(`${isUrgent ? 'ðŸ†˜ URGENT AI ESCALATION' : 'ðŸ†˜ NEW TICKET'}: ${ticket.description.slice(0, 30)}...`, {
              duration: isUrgent ? 10000 : 6000,
              icon: isUrgent ? 'ðŸŒ‹' : 'ðŸš¨',
              style: isUrgent ? { border: '2px solid #ef4444', backgroundColor: '#fef2f2', color: '#991b1b', fontWeight: 'bold' } : {}
            });
            
            // Play sound based on urgency
            try { 
              const soundUrl = isUrgent 
                ? 'https://assets.mixkit.co/active_storage/sfx/993/993-preview.mp3' // Intense Siren
                : 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3'; // Standard Ping
              new Audio(soundUrl).play(); 
            } catch(e){}

            // Refresh list automatically
            fetchTickets();
          });

          // ðŸŒªï¸ DIGITAL TWIN: District-Wide Emergency Broadcast Listener
          socket.on('emergency_broadcast', (payload) => {
            console.log('[EMERGENCY] Global Alert:', payload);
            
            toast.error(payload.message, {
              duration: 15000,
              icon: 'ðŸŒªï¸',
              style: { 
                border: '3px solid #dc2626', 
                backgroundColor: '#fef2f2', 
                color: '#991b1b', 
                fontWeight: '900',
                fontSize: '16px'
              }
            });

            // Play the "Emergency Siren"
            try { new Audio('https://assets.mixkit.co/active_storage/sfx/993/993-preview.mp3').play(); } catch(e){}
            
            fetchTickets(); // Refresh list to see the newly automated critical tickets
          });
        }
      } catch (err) {
        console.error('Initialization error:', err);
      } finally {
        setLoading(false);
      }
    };

    initData();

    // Cleanup: remove listeners and disconnect socket on unmount
    return () => {
      const socket = getSocket();
      if (socket) {
        socket.off('new_ticket');
        socket.off('emergency_broadcast');
      }
      disconnectSocket();
    };
  }, []);

  // â”€â”€ PULL-TO-REFRESH LOGIC (Mobile Optimized) â”€â”€
  const [startY, setStartY] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const handleTouchStart = (e) => setStartY(e.touches[0].pageY);
  const handleTouchMove = (e) => {
    const currentY = e.touches[0].pageY;
    if (currentY - startY > 100 && window.scrollY === 0 && !refreshing) {
      setRefreshing(true);
      fetchTickets().then(() => {
        setRefreshing(false);
        toast.success('Sync Complete', { id: 'worker-ptr' });
      });
    }
  };

  const handleResolve = async (ticketId) => {
    const file = proofFile[ticketId];
    if (!file) {
      alert("Please upload a photo as proof of work first! / à¤•à¥ƒà¤ªà¤¯à¤¾ à¤ªà¤¹à¤²à¥‡ à¤•à¤¾à¤® à¤•à¤¾ à¤¸à¤¬à¥‚à¤¤ (à¤«à¥‹à¤Ÿà¥‹) à¤…à¤ªà¤²à¥‹à¤¡ à¤•à¤°à¥‡à¤‚à¥¤");
      return;
    }

    setIsUploading(true);
    try {
      // 1. Upload proof to Cloudinary
      const formData = new FormData();
      formData.append('image', file);
      const uploadRes = await api.post('/tickets/upload-only', formData);
      const proofUrl = uploadRes.data.url;

      // 2. Resolve ticket with proof
      await api.patch(`/tickets/${ticketId}/status`, {
        status: 'resolved',
        notes: 'Resolved by field worker with proof',
        proofOfWorkUrl: proofUrl,
        proofOfWorkType: 'image'
      });
      
      setProofFile(prev => {
        const next = { ...prev };
        delete next[ticketId];
        return next;
      });
      fetchTickets();
    } catch (err) {
      console.error('Failed to resolve:', err);
      alert('Error uploading proof. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleEscalate = async (ticketId) => {
    try {
      await api.post(`/tickets/${ticketId}/escalate`, {
        reason: 'Requires specialist â€” escalating to sub-head',
      });
      fetchTickets();
    } catch (err) {
      console.error('Failed to escalate:', err);
    }
  };

  const statusColors = {
    submitted: '#6b7280', assigned: '#3b82f6', in_progress: '#f59e0b',
    escalated_subhead: '#ef4444', escalated_admin: '#dc2626', resolved: '#10b981', closed: '#9ca3af',
  };

  const activeTickets = tickets.filter(t => ['assigned', 'in_progress'].includes(t.status));
  const resolvedTickets = tickets.filter(t => t.status === 'resolved' || t.status === 'closed');

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">{t('workerDashboard')}</h1>
          <p style={{ color: '#6b7280', marginTop: '4px' }}>{t('manageCases')}</p>
        </div>
        <span className="dashboard-role-badge badge-worker">Worker</span>
      </div>

      <WeatherAdvisory />

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{activeTickets.length}</div>
          <div className="stat-label">{t('activeCases')}</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{resolvedTickets.length}</div>
          <div className="stat-label">{t('resolved')}</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{tickets.length}</div>
          <div className="stat-label">{t('totalAssigned')}</div>
        </div>
      </div>

      <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '16px', color: '#1b4332' }}>Active Cases</h2>

      <div 
        onTouchStart={handleTouchStart} 
        onTouchMove={handleTouchMove} 
        className={refreshing ? 'pull-refreshing' : ''}
      >
        {loading ? (
          <div className="ticket-list">
            {[1, 2, 3].map(i => <TicketSkeleton key={i} />)}
          </div>
        ) : activeTickets.length === 0 ? (
          <p style={{ color: '#6b7280' }}>No active cases. All caught up! âœ…</p>
        ) : (
          <div className="ticket-list">
            {activeTickets.map((ticket) => (
              <TicketCard 
                key={ticket._id} 
                ticket={ticket} 
                onClick={() => setSelectedTicket(ticket)}
                statusColors={statusColors} 
                t={t} 
              />
            ))}
          </div>
        )}
      </div>

      {/* TICKET DETAILS MODAL */}
      {selectedTicket && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
          backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', padding: '16px'
        }} onClick={() => setSelectedTicket(null)}>
          <div 
            style={{
              backgroundColor: '#fff', borderRadius: '24px', width: '100%', maxWidth: '600px', 
              maxHeight: '90vh', overflowY: 'auto', padding: '32px', position: 'relative',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
            }}
            onClick={(e) => e.stopPropagation()} // Prevent close when clicking inside
          >
            <button 
              onClick={() => setSelectedTicket(null)}
              style={{ position: 'absolute', top: '24px', right: '24px', background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', fontWeight: 'bold', color: '#64748b' }}
            >
              âœ•
            </button>
            
            <div style={{ display: 'inline-block', padding: '4px 12px', borderRadius: '12px', backgroundColor: selectedTicket.priority === 'critical' ? '#fee2e2' : '#f1f5f9', color: selectedTicket.priority === 'critical' ? '#991b1b' : '#475569', fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', marginBottom: '16px' }}>
              {selectedTicket.priority || 'medium'} Priority Case
            </div>
            
            <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#111827', marginBottom: '24px' }}>Case Details</h2>
            
            <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
              <p style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>ðŸ§‘â€ðŸŒ¾ Farmer Information</p>
              <p style={{ margin: '0 0 4px 0', fontWeight: '600', color: '#1e293b' }}>{selectedTicket.farmer?.name || 'Unknown Farmer'}</p>
              <p style={{ margin: '0 0 4px 0', color: '#475569', fontSize: '14px' }}>ðŸ“ž {selectedTicket.farmer?.phone || 'No phone provided'}</p>
              {selectedTicket.location?.coordinates && (
                <p style={{ margin: 0, color: '#475569', fontSize: '14px' }}>ðŸ“ GPS: {selectedTicket.location.coordinates[1].toFixed(4)}, {selectedTicket.location.coordinates[0].toFixed(4)}</p>
              )}
            </div>

            <div style={{ marginBottom: '24px' }}>
              <p style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>ðŸ“ Full Transcript & Assessment</p>
              <p style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>📝 Full Transcript & Assessment</p>
              <div style={{ backgroundColor: '#fffbe6', padding: '20px', borderLeft: '4px solid #f59e0b', borderRadius: '8px', fontSize: '15px', color: '#374151', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                {selectedTicket.description}
              </div>
            </div>

            {selectedTicket.mediaUrls?.length > 0 && (
              <div style={{ marginBottom: '24px' }}>
                <p style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>🖼️ Attached Evidence</p>
                <img src={selectedTicket.mediaUrls[0]} alt="Evidence" style={{ width: '100%', borderRadius: '16px', border: '1px solid #e2e8f0' }} />
              </div>
            )}

            {/* ACTION AREA - Only for non-resolved tickets */}
            {selectedTicket.status !== 'resolved' && (
              <div style={{ backgroundColor: '#f8fafc', padding: '24px', borderRadius: '20px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
                <p style={{ fontSize: '12px', fontWeight: '800', color: '#1b4332', textTransform: 'uppercase', marginBottom: '12px' }}>ðŸ› ï¸ Resolution Actions</p>
                
                {/* Proof Selection UI */}
                <div style={{ marginBottom: '20px' }}>
                  <label className="cursor-pointer flex items-center gap-3 p-4 border-2 border-dashed border-slate-300 rounded-xl hover:border-emerald-500 transition-colors bg-white">
                    <input 
                      type="file" 
                      accept="image/*" 
                      capture="environment"
                      className="hidden" 
                      onChange={(e) => setProofFile(prev => ({ ...prev, [selectedTicket._id]: e.target.files[0] }))}
                    />
                    <span style={{ fontSize: '24px' }}>ðŸ“¸</span>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '14px', fontWeight: '700', color: '#1e293b' }}>
                        {proofFile[selectedTicket._id] ? 'âœ… Photo Proof Selected' : 'Take Photo of Resolution'}
                      </p>
                      <p style={{ fontSize: '11px', color: '#64748b' }}>Required to resolve the ticket</p>
                    </div>
                  </label>
                </div>

                <div style={{ display: 'flex', gap: '16px' }}>
                  <button 
                    className="btn btn-primary" 
                    style={{ flex: 1, padding: '16px', fontSize: '16px', borderRadius: '14px', fontWeight: '700' }}
                    onClick={() => { handleResolve(selectedTicket._id); setSelectedTicket(null); }} 
                    disabled={!proofFile[selectedTicket._id] || isUploading}
                  >
                    {isUploading ? 'Uploading...' : 'âœ… Resolve Case'}
                  </button>
                  <button 
                    className="btn btn-danger" 
                    style={{ flex: 0.4, padding: '16px', fontSize: '14px', borderRadius: '14px' }}
                    onClick={() => { handleEscalate(selectedTicket._id); setSelectedTicket(null); }} 
                  >
                    â¬†ï¸ Escalate
                  </button>
                </div>
              </div>
            )}

            <button 
              onClick={() => setSelectedTicket(null)}
              style={{ width: '100%', padding: '16px', backgroundColor: '#64748b', color: '#fff', border: 'none', borderRadius: '16px', fontWeight: '700', fontSize: '16px', cursor: 'pointer' }}
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

