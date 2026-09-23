import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary caught error]:', error, errorInfo);
    this.setState({ errorInfo });
  }

  componentDidUpdate(prevProps) {
    if (this.props.resetKey !== prevProps.resetKey && this.state.hasError) {
      this.setState({ hasError: false, error: null, errorInfo: null });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '40px 20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          textAlign: 'center',
          background: 'hsl(var(--bg-main, #f8fafc))',
          borderRadius: '12px',
          margin: '20px',
          border: '1px solid hsl(var(--border, #e2e8f0))'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: '#fee2e2',
            color: '#dc2626',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.8rem',
            marginBottom: '16px'
          }}>
            <i className="fa-solid fa-triangle-exclamation"></i>
          </div>

          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'hsl(var(--text-primary, #0f172a))', marginBottom: '8px' }}>
            Something went wrong
          </h2>
          
          <p style={{ color: 'hsl(var(--text-secondary, #64748b))', maxWidth: '480px', fontSize: '0.925rem', marginBottom: '24px', lineHeight: 1.5 }}>
            An unexpected error occurred while rendering this module view. Click below to reload the page or return to the dashboard.
          </p>

          {this.state.error && (
            <div style={{
              background: '#0f172a',
              color: '#f8fafc',
              padding: '12px 16px',
              borderRadius: '8px',
              fontFamily: 'monospace',
              fontSize: '0.8rem',
              maxWidth: '600px',
              width: '100%',
              textAlign: 'left',
              overflowX: 'auto',
              marginBottom: '24px'
            }}>
              <strong>Error:</strong> {this.state.error.toString()}
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => window.location.reload()}
              className="btn btn-primary"
              style={{ padding: '10px 24px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            >
              <i className="fa-solid fa-rotate-right"></i>
              Reload Page
            </button>
            <button
              onClick={() => window.location.href = '/'}
              className="btn btn-secondary"
              style={{ padding: '10px 24px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            >
              <i className="fa-solid fa-house"></i>
              Return to Home
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
