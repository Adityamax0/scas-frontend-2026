'use client';

import { Component } from 'react';

/**
 * ErrorBoundary — catches unexpected React render errors and shows a
 * friendly fallback instead of a blank white screen ("White Screen of Death").
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('[SCAS ErrorBoundary] Caught error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f3f4f6',
          fontFamily: "'Inter', sans-serif",
          padding: '24px',
        }}>
          <div style={{
            maxWidth: '480px',
            width: '100%',
            backgroundColor: '#fff',
            borderRadius: '24px',
            padding: '48px 40px',
            textAlign: 'center',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
          }}>
            <div style={{ fontSize: '64px', marginBottom: '24px' }}>⚠️</div>
            <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#1b4332', marginBottom: '12px' }}>
              Something went wrong
            </h1>
            <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: '1.6', marginBottom: '28px' }}>
              An unexpected error occurred. Your saved tickets are safe. Please try reloading the page.
            </p>
            <button
              onClick={() => { this.setState({ hasError: false, error: null }); window.location.reload(); }}
              style={{
                width: '100%',
                padding: '14px',
                backgroundColor: '#1b4332',
                color: '#fff',
                border: 'none',
                borderRadius: '12px',
                fontSize: '15px',
                fontWeight: '700',
                cursor: 'pointer',
              }}
            >
              Reload SCAS
            </button>
            {process.env.NODE_ENV === 'development' && (
              <details style={{ marginTop: '20px', textAlign: 'left' }}>
                <summary style={{ fontSize: '12px', color: '#9ca3af', cursor: 'pointer' }}>
                  Developer Details
                </summary>
                <pre style={{ fontSize: '11px', color: '#ef4444', marginTop: '8px', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                  {this.state.error?.toString()}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
