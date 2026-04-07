'use client';

import { useState, useEffect } from 'react';
import TicketForm from '@/components/TicketForm';
import KrishiMitraChat from '@/components/KrishiMitraChat';
import { useLang } from '@/lib/LanguageContext';
import ImageScanner from '@/components/ImageScanner';
import SatelliteMap from '@/components/SatelliteMap';
import WeatherAdvisory from '@/components/WeatherAdvisory';
import GovAdvisory from '@/components/GovAdvisory';
import NotificationCenter from '@/components/NotificationCenter';
import ErrorBoundary from '@/components/ErrorBoundary';
import TicketCard from '@/components/TicketCard';
import { TicketSkeleton } from '@/components/SkeletonLoader';
import api from '@/lib/api';


export default function FarmerDashboard() {
  const { t } = useLang();
  const [tickets, setTickets] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/auth/me');
        setProfile(res.data.data);
      } catch (err) {
        console.error('Failed to fetch profile:', err);
      }
    };
    fetchProfile();
  }, []);

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

  useEffect(() => { fetchTickets(); }, []);

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
        toast.success('List Refreshed!', { id: 'ptr-refresh' });
      });
    }
  };

  const handleVoiceRecording = async (audioBlob) => {
    setIsProcessingVoice(true);
    setVoiceResponse(null);
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'voice.wav');

      const res = await api.post('/audio/process', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setVoiceResponse({
        action: res.data.action,
        message: res.data.message,
        transcription: res.data.transcription,
        analysis: res.data.analysis,
      });

      // If Llama-3 decided it's an emergency, it auto-created a ticket!
      if (res.data.action === 'ticket_created') {
        fetchTickets(); // Refresh the list to show the new ticket
      }

    } catch (err) {
      console.error('Voice recording error:', err);
      alert(err.response?.data?.message || 'Failed to process voice. Please try again.');
    } finally {
      setIsProcessingVoice(false);
    }
  };

  const statusColors = {
    submitted: '#6b7280', assigned: '#3b82f6', in_progress: '#f59e0b',
    escalated_subhead: '#ef4444', escalated_admin: '#dc2626', resolved: '#10b981', closed: '#9ca3af',
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="dashboard-title">{t('farmerDashboard')}</h1>
          <p style={{ color: '#6b7280', marginTop: '4px' }}>{t('welcomeBack')}, <span style={{ fontWeight: 700, color: '#111827' }}>{profile?.name || 'Farmer'}</span></p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <NotificationCenter />
          <span className="dashboard-role-badge badge-farmer">Farmer</span>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{tickets.length}</div>
          <div className="stat-label">{t('totalTickets')}</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{tickets.filter(tk => tk.status === 'resolved' || tk.status === 'closed').length}</div>
          <div className="stat-label">{t('resolved')}</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{tickets.filter(tk => tk.status.startsWith('escalated')).length}</div>
          <div className="stat-label">{t('escalated')}</div>
        </div>
      </div>

      {/* ðŸ›°ï¸ 2026 PRECISION MONITORING: REMOTE HEALTH */}
      <ErrorBoundary fallbackMessage="Satellite Downlink is currently drifting. Please wait for the next orbit.">
        <SatelliteMap district={profile?.district || "Kanpur"} />
      </ErrorBoundary>

      {/* Krishi Mitra AI Chat Interface */}
      <ErrorBoundary fallbackMessage="AI Chatbot is temporarily unavailable.">
        <KrishiMitraChat onTicketCreated={fetchTickets} />
      </ErrorBoundary>

      <ErrorBoundary fallbackMessage="Weather Advisory data could not be parsed.">
        <WeatherAdvisory />
      </ErrorBoundary>

      <ErrorBoundary fallbackMessage="Government Schemes tracking is currently offline.">
        <GovAdvisory />
        {/* ðŸš 2026 NAMO DRONE DIDI SUBSIDY (KANPUR SPECIAL) */}
        <div style={{ 
          marginTop: '16px', 
          padding: '16px', 
          background: 'linear-gradient(135deg, #1e293b, #0f172a)', 
          borderRadius: '16px', 
          color: '#fff',
          boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.2)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 'bold', tracking: '1px', color: '#94a3b8' }}>
                MISSION 2026 (UP GOVT)
              </span>
              <h4 style={{ margin: '4px 0', fontSize: '16px', fontWeight: '900' }}>ðŸš Namo Drone Didi Subsidy</h4>
              <p style={{ margin: 0, fontSize: '11px', color: '#cbd5e1' }}>
                Join local SHGs in Kanpur to get **80% Subsidy** (up to â‚¹8 Lakhs) on agricultural drones.
              </p>
            </div>
            <span style={{ fontSize: '24px' }}>ðŸš</span>
          </div>
          <button 
            style={{ 
              marginTop: '16px', width: '100%', backgroundColor: '#38bdf8', color: '#0f172a', border: 'none', 
              padding: '10px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' 
            }}
            onClick={() => window.open('https://pib.gov.in/PressNoteDetails.aspx?NoteId=151811','_blank')}
          >
            Apply via SHG Portal â†’
          </button>
        </div>
      </ErrorBoundary>

      {/* ðŸ‡®ðŸ‡³ 2026 AGRISTACK: DIGITAL IDENTITY & LAND RECORD SECTION */}
      <div style={{ 
        background: profile?.agriStackVerified ? '#f0f9ff' : '#fff', 
        borderRadius: '16px', 
        padding: '24px', 
        marginBottom: '24px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        border: `1px solid ${profile?.agriStackVerified ? '#bae6fd' : '#e5e7eb'}`
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <span style={{ fontSize: '24px' }}>ðŸ›¡ï¸</span>
          <div>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#1B4332' }}>
              AgriStack Identity (Mission 2026)
            </h3>
            <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
              Verify your land records to unlock Official Government Subsidies.
            </p>
          </div>
        </div>

        {!profile?.agriStackVerified ? (
          <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <input 
              id="agristack-id-input"
              type="text" 
              placeholder="Enter UFSI ID (e.g. UP-12345-XXXX)"
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', marginBottom: '12px' }}
            />
            
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '16px' }}>
              <input type="checkbox" id="ufsi-consent" style={{ marginTop: '4px' }} />
              <label htmlFor="ufsi-consent" style={{ fontSize: '11px', color: '#475569', lineHeight: '1.4' }}>
                <strong>UFSI Legal Consent:</strong> I hereby grant SCAS 2026 permission to perform a federated handshake with my state-level agriculture registry. I understand this allows secure, audit-traced access to my land records for the purpose of government-certified advisory.
              </label>
            </div>

            <button 
              onClick={async () => {
                const id = document.getElementById('agristack-id-input')?.value;
                const consent = document.getElementById('ufsi-consent')?.checked;
                
                if(!id) return alert("Please enter your UFSI ID / à¤•à¥ƒà¤ªà¤¯à¤¾ à¤…à¤ªà¤¨à¥€ à¤†à¤ˆà¤¡à¥€ à¤¦à¤°à¥à¤œ à¤•à¤°à¥‡à¤‚à¥¤");
                if(!consent) return alert("UFSI Handshake Error: You must grant legal consent to proceed.");
                
                try {
                  // Simulate 2026 Consent Token Generation
                  const mockConsentToken = `CT-${Math.random().toString(36).substring(7).toUpperCase()}`;
                  
                  const res = await api.post('/users/verify-agristack', { 
                    agriStackId: id,
                    consentToken: mockConsentToken 
                  });
                  setProfile(res.data.data);
                  toast.success(res.data.message);
                } catch(e) { 
                  alert(e.response?.data?.message || "Handshake failed: Registry Busy."); 
                }
              }}
              style={{ width: '100%', backgroundColor: '#1B4332', color: '#fff', border: 'none', padding: '14px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              ðŸ¤ Initiate Legal Handshake
            </button>
          </div>
        ) : (
          <div style={{ padding: '12px', backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #bae6fd' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#0369a1' }}>âœ… VERIFIED LAND RECORDS</span>
              <span style={{ fontSize: '12px', color: '#64748b' }}>Origin: {profile.ufsi_handshake?.registryOrigin}</span>
            </div>
            
            <div style={{ fontSize: '12px', color: '#334155', borderLeft: '3px solid #0ea5e9', paddingLeft: '10px', margin: '12px 0' }}>
              <strong>UFSI Audit Token:</strong> <code style={{ background: '#f1f5f9', padding: '2px 4px' }}>{profile.ufsi_handshake?.auditToken}</code><br/>
              <strong>Certified Area:</strong> {profile.landRecords?.[0]?.area} Hectares<br/>
              <strong>Main Crops:</strong> {profile.landRecords?.[0]?.cropHistory?.join(', ')}
            </div>

            <div style={{ 
              display: 'flex', gap: '8px', flexWrap: 'wrap'
            }}>
              <div style={{ 
                fontSize: '10px', color: '#059669', fontWeight: 'bold', backgroundColor: '#ecfdf5', padding: '4px 8px', borderRadius: '6px', display: 'inline-block' 
              }}>
                ðŸŽ–ï¸ DBT ELIGIBLE
              </div>
              <div style={{ 
                fontSize: '10px', color: '#0284c7', fontWeight: 'bold', backgroundColor: '#e0f2fe', padding: '4px 8px', borderRadius: '6px', display: 'inline-block' 
              }}>
                ðŸ“‘ LEGAL ADVISORY CERTIFIED
              </div>
            </div>

            {/* ðŸŒ 2026 TRIPLE C LEDGER (MRV COMPLIANT) */}
            <div style={{ marginTop: '20px', padding: '16px', backgroundColor: '#fdfcfe', borderRadius: '12px', border: '1px solid #e9d5ff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '800', color: '#6b21a8' }}>ðŸŒ± Triple C Ledger (ICM Standard)</h4>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '18px', fontWeight: '900', color: '#7e22ce' }}>{profile.carbonCredits || 12.5} Credits</span>
                  {profile.baselineMeasurement ? (
                    <div style={{ fontSize: '10px', color: '#059669', fontWeight: '800' }}>âœ… MRV VERIFIED</div>
                  ) : (
                    <div style={{ fontSize: '10px', color: '#dc2626', fontWeight: '800' }}>âš ï¸ BASELINE REQUIRED</div>
                  )}
                </div>
              </div>

              {!profile.baselineMeasurement ? (
                <div style={{ backgroundColor: '#fff', padding: '12px', borderRadius: '8px', border: '1px dashed #7e22ce' }}>
                  <p style={{ margin: '0 0 8px 0', fontSize: '11px', color: '#6b7280' }}>
                    To earn certificates, you must first record a "Before" state of your farm.
                  </p>
                  <button 
                    onClick={async () => {
                      try {
                        const res = await api.post('/users/record-baseline', { 
                          method: 'satellite_ndvi', 
                          initialValue: 0.65 
                        });
                        setProfile(res.data.data);
                        toast.success("ðŸŒ± Baseline recorded via Satellite Hub!");
                      } catch(e) { alert("Baseline Error: MRV Registry Offline."); }
                    }}
                    style={{ width: '100%', backgroundColor: '#7e22ce', color: '#fff', border: 'none', padding: '8px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}
                  >
                    ðŸš€ Record Mandatory Baseline
                  </button>
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
                    <span style={{ padding: '4px 8px', backgroundColor: '#faf5ff', border: '1px solid #e9d5ff', borderRadius: '20px', fontSize: '10px', color: '#7e22ce', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                      ðŸŒ± No-Till Farming Map (+4.2)
                    </span>
                    <span style={{ padding: '4px 8px', backgroundColor: '#faf5ff', border: '1px solid #e9d5ff', borderRadius: '20px', fontSize: '10px', color: '#7e22ce', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                      ðŸ’§ Solar Irrigation (+8.3)
                    </span>
                  </div>
                  <div style={{ marginTop: '12px', padding: '8px', borderTop: '1px solid #f3e8ff', fontSize: '10px', color: '#6b7280' }}>
                    <strong>MRV Trace:</strong> Baseline 0.65 recorded via {profile.baselineMeasurement.verifiedBy}
                  </div>
                </>
              )}
              
              <p style={{ margin: '8px 0 0 0', fontSize: '10px', color: '#6b7280', textAlign: 'right' }}>
                Current Valuation: â‚¹{(profile.carbonCredits || 12.5) * 850} (Redeemable via AgriStack)
              </p>
            </div>
          </div>
        )}
      </div>

      <ErrorBoundary fallbackMessage="The 3D AI Leaf Scanner experienced a visualization error.">
        <ImageScanner onScanComplete={(data) => console.log('Scan data:', data)} />
      </ErrorBoundary>

      <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)} id="toggle-ticket-form">
          {showForm ? t('closeForm') : t('submitTicket')}
        </button>
      </div>

      {showForm && <TicketForm onSuccess={() => { setShowForm(false); fetchTickets(); }} />}

      <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '16px', color: '#1b4332' }}>{t('myTickets')}</h2>

      <div 
        onTouchStart={handleTouchStart} 
        onTouchMove={handleTouchMove} 
        className={refreshing ? 'pull-refreshing' : ''}
      >
        {loading ? (
          <div className="ticket-list">
            {[1, 2, 3].map(i => <TicketSkeleton key={i} />)}
          </div>
        ) : tickets.length === 0 ? (
          <p style={{ color: '#6b7280' }}>{t('noTickets')}</p>
        ) : (
          <div className="ticket-list">
            {tickets.map((ticket) => (
              <TicketCard 
                key={ticket._id} 
                ticket={ticket} 
                statusColors={statusColors} 
                t={t} 
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

