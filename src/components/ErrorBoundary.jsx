import React from 'react'
import './ErrorBoundary.css'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    })

    if (import.meta.env.MODE === 'development') {
      console.error('Error Boundary caught an error:', error, errorInfo)
    }
  }

  resetError = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary-container">
          <div className="error-boundary-content">
            <div className="error-icon">⚠️</div>
            <h1 className="error-title">Oops! Something went wrong</h1>
            <p className="error-message">
              We're sorry for the inconvenience. Please try refreshing the page or go back to home.
            </p>

            {import.meta.env.MODE === 'development' && this.state.error && (
              <div className="error-details">
                <h3>Error Details:</h3>
                <pre>{this.state.error.toString()}</pre>
                <h3>Component Stack:</h3>
                <pre>{this.state.errorInfo?.componentStack}</pre>
              </div>
            )}

            <div className="error-actions">
              <button
                className="error-button primary"
                onClick={this.resetError}
              >
                Try Again
              </button>
              <button
                className="error-button secondary"
                onClick={() => window.location.href = '/'}
              >
                Go Home
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
