import React, { useState, useEffect } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { GoogleLoginButton } from '../components/GoogleLoginButton'
import './Register.css'
import '../styles/AuthStyles.css'

function Register() {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [error, setError] = useState('')
    const { register } = useAuth()
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
            setError('Google registration failed: ' + err.message)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!name || !email || !password || !confirmPassword) {
            setError('Please fill in all fields')
            return
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match')
            return
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters')
            return
        }

        const result = await register(name, email, password)

        if (result.success) {
            navigate('/')
        } else {
            setError(result.error || 'Failed to register')
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
                    <h2 className="auth-title">Sign Up</h2>
                </div>

                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Full Name</label>
                        <div className="input-wrapper">
                            <input
                                type="text"
                                className="form-input"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Enter your full name"
                                maxLength="100"
                            />
                            <span className="char-count">{name.length} / 100</span>
                        </div>
                    </div>

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
                    </div>

                    <div className="form-group">
                        <label className="form-label">Confirm Password</label>
                        <div className="input-wrapper">
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                className="form-input"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm your password"
                                maxLength="100"
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                aria-label="Toggle password visibility"
                            >
                                {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                            </button>
                            <span className="char-count">{confirmPassword.length} / 100</span>
                        </div>
                    </div>

                    <button type="submit" className="auth-button">
                        Sign Up
                    </button>
                </form>

                <div className="auth-link">
                    Already have an account? <Link to="/login">Sign in</Link>
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

export default Register