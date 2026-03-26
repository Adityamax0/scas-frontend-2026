'use client';

import React from 'react';

/**
 * SkeletonLoader — Pulsing grey blocks for perceived loading speed
 */
const SkeletonLoader = ({ width = '100%', height = '20px', borderRadius = '4px', margin = '0' }) => {
  return (
    <div style={{
      width,
      height,
      borderRadius,
      margin,
      backgroundColor: '#e5e7eb',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent)',
        animation: 'skeleton-shimmer 1.5s infinite',
      }} />
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes skeleton-shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}} />
    </div>
  );
};

export const TicketSkeleton = () => (
  <div style={{
    padding: '16px',
    backgroundColor: '#fff',
    borderRadius: '12px',
    marginBottom: '12px',
    border: '1px solid #f1f5f9',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  }}>
    <div style={{ flex: 1 }}>
      <SkeletonLoader width="60px" height="16px" margin="0 0 12px 0" />
      <SkeletonLoader width="80%" height="20px" margin="0 0 8px 0" />
      <SkeletonLoader width="40%" height="14px" />
    </div>
    <div style={{ marginLeft: '16px' }}>
      <SkeletonLoader width="80px" height="24px" borderRadius="20px" />
    </div>
  </div>
);

export default SkeletonLoader;
