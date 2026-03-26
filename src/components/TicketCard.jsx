'use client';

import React, { memo } from 'react';

/**
 * HIGH-EFFICIENCY COMPONENT: TicketCard
 * Memoized to prevent unnecessary re-renders when other parts of the dashboard update.
 * Provides a consistent UI for both Farmers and Workers.
 */
const TicketCard = memo(({ ticket, onClick, statusColors, t }) => {
  const isSlaBreached = ticket.slaBreached;
  const needsExpert = ticket.metadata?.requires_human_intervention;
  
  return (
    <div 
      className={`ticket-card status-${ticket.status} ${needsExpert ? 'needs-expert' : ''}`}
      style={{
        ...(isSlaBreached || needsExpert ? { border: '2px solid #ef4444', boxShadow: '0 0 15px rgba(239, 68, 68, 0.2)' } : {}),
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.2s',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px',
        backgroundColor: '#fff',
        borderRadius: '12px',
        marginBottom: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        border: '1px solid #f1f5f9'
      }}
      onClick={onClick ? () => onClick(ticket) : undefined}
      onMouseOver={onClick ? (e) => e.currentTarget.style.transform = 'scale(1.01)' : undefined}
      onMouseOut={onClick ? (e) => e.currentTarget.style.transform = 'scale(1)' : undefined}
    >
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ 
              fontSize: '10px', 
              fontWeight: '800', 
              padding: '2px 8px', 
              borderRadius: '12px', 
              backgroundColor: ticket.priority === 'critical' || needsExpert ? '#fee2e2' : '#f3f4f6',
              color: ticket.priority === 'critical' || needsExpert ? '#991b1b' : '#374151',
              textTransform: 'uppercase'
            }}>
              {needsExpert ? '🚨 NEEDS EXPERT' : (ticket.priority || 'medium')}
            </span>
            {isSlaBreached && (
              <span style={{ fontSize: '10px', fontWeight: '900', color: '#ef4444', textTransform: 'uppercase' }}>
                ⚠️ SLA BREACHED
              </span>
            )}
          </div>
        </div>
        
        <div style={{ fontWeight: 600, marginBottom: '4px', color: '#111827' }}>
          {ticket.description.length > 80 ? `${ticket.description.slice(0, 80)}...` : ticket.description}
        </div>
        
        <div style={{ fontSize: '12px', color: '#64748b', display: 'flex', gap: '8px' }}>
          {ticket.cropType && <span>{ticket.cropType}</span>}
          {ticket.cropType && <span>•</span>}
          <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
          {ticket.farmer?.name && (
             <>
               <span>•</span>
               <span style={{ fontWeight: 600 }}>{ticket.farmer.name}</span>
             </>
          )}
        </div>
      </div>

      <div style={{ marginLeft: '16px', textAlign: 'right' }}>
        <span className="status-badge" style={{ 
          backgroundColor: `${statusColors[ticket.status] || '#6b7280'}20`, 
          color: statusColors[ticket.status] || '#6b7280',
          padding: '4px 12px',
          borderRadius: '20px',
          fontSize: '12px',
          fontWeight: 700,
          whiteSpace: 'nowrap'
        }}>
          {ticket.status.replace(/_/g, ' ')}
        </span>
      </div>
    </div>
  );
});

TicketCard.displayName = 'TicketCard';

export default TicketCard;
