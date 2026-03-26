'use client';

import React from 'react';

/**
 * Production Hardening: Self-Healing Error Boundary
 * Wraps fragile widgets so that if one crashes (e.g. malformed API payload),
 * it isolates the failure and displays a localized fallback UI instead of crashing the entire React tree.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service here
    console.error('[ERROR BOUNDARY CAUGHT CRASH]:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '24px',
          backgroundColor: '#fee2e2',
          border: '1px solid #ef4444',
          borderRadius: '16px',
          textAlign: 'center',
          color: '#991b1b',
          marginBottom: '20px',
          fontFamily: 'system-ui, sans-serif'
        }}>
          <span style={{ fontSize: '32px', display: 'block', marginBottom: '12px' }}>⚠️</span>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 'bold' }}>
            {this.props.fallbackMessage || 'This widget encountered a temporary issue.'}
          </h3>
          <p style={{ margin: '0 0 16px 0', fontSize: '13px', opacity: 0.8 }}>
            Our self-healing systems have isolated the error to protect your dashboard.
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            style={{
              padding: '8px 16px',
              backgroundColor: '#b91c1c',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            Retry Widget
          </button>
        </div>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;
