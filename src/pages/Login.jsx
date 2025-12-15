import React, { useState, useEffect } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { GoogleLoginButton } from '../components/GoogleLoginButton'
import './Login.css'
import '../styles/AuthStyles.css'

function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState('')
    const { login, loginWithGoogle } = useAuth()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()

    useEffect(() => {
        const googleAccessToken = searchParams.get('google_token')
        if (googleAccessToken) {
            handleGoogleLoginSuccess(googleAccessToken)
        }
    }, [searchParams])

    const handleGoogleLoginSuccess = async (accessToken) => {
        try {
            console.warn('Google OAuth callback detected, but new implementation uses GoogleLoginButton component')
        } catch (err) {
            setError('Google login failed: ' + err.message)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!email || !password) {
            setError('Please fill in all fields')
            return
        }

        const result = await login(email, password)

        if (result.success) {
            navigate('/')
        } else {
            setError(result.error || 'Failed to login')
        }
    }

    const handleGoogleLoginSuccessCallback = () => {
        navigate('/')
    }

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-header">
                    <h1 className="auth-app-name">Clone Medium</h1>
                    <h2 className="auth-title">Login</h2>
                </div>

                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <div className="input-wrapper">
                            <input
                                type="email"
                                className="form-input"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                                maxLength="100"
                            />
                            <span className="char-count">{email.length} / 100</span>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <div className="input-wrapper">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                className="form-input"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
                                maxLength="100"
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                                aria-label="Toggle password visibility"
                            >
                                {showPassword ? '👁️' : '👁️‍🗨️'}
                            </button>
                            <span className="char-count">{password.length} / 100</span>
                        </div>
                        <Link to="#forgot" className="forgot-password">
                            Forgot password?
                        </Link>
                    </div>

                    <button type="submit" className="auth-button">
                        Log In
                    </button>
                </form>

                <div className="auth-link">
                    Don't have an account? <Link to="/register">Sign up</Link>
                </div>

                <div className="divider">
                    <div className="divider-line"></div>
                    <div className="divider-text">or continue with</div>
                    <div className="divider-line"></div>
                </div>

                <div className="social-buttons">
                    <GoogleLoginButton onSuccess={handleGoogleLoginSuccessCallback} />
                </div>
            </div>
        </div>
    )
}

export default Login