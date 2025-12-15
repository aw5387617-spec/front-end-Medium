import React, { createContext, useContext, useState, useEffect } from 'react'
import { login as apiLogin, register as apiRegister, getCurrentUser, googleLogin } from '../api/authService'

const AuthContext = createContext()

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const [token, setToken] = useState(null)

    useEffect(() => {
        const initializeAuth = async () => {
            try {
                const storedToken = localStorage.getItem('token')

                if (storedToken) {
                    setToken(storedToken)
                    const userData = await getCurrentUser()
                    setUser(userData)
                }
            } catch (error) {
                console.error('Error initializing auth:', error)
                localStorage.removeItem('token')
            } finally {
                setLoading(false)
            }
        }

        initializeAuth()
    }, [])

    const login = async (email, password) => {
        try {
            const credentials = { email, password }
            const response = await apiLogin(credentials)

            if (!response?.access_token) {
                throw new Error('No access token in response')
            }

            localStorage.setItem('token', response.access_token)
            if (response.refresh_token) {
                localStorage.setItem('refreshToken', response.refresh_token)
            }
            setToken(response.access_token)

            const userData = await getCurrentUser()
            setUser(userData)

            return { success: true }
        } catch (error) {
            console.error('Login error:', error)
            return { success: false, error: error.message || 'Login failed' }
        }
    }

    const loginWithGoogle = async (googleToken) => {
        try {

            if (googleToken.startsWith && googleToken.startsWith('ya29')) {
                throw new Error('Invalid token type. Expected ID token (JWT), got access token.');
            }

            const response = await googleLogin(googleToken)

            if (!response?.access_token) {
                throw new Error('No access token in response')
            }

            localStorage.setItem('token', response.access_token)
            if (response.refresh_token) {
                localStorage.setItem('refreshToken', response.refresh_token)
            }
            setToken(response.access_token)

            const userData = await getCurrentUser()
            setUser(userData)

            return { success: true }
        } catch (error) {
            console.error('[AuthContext] Google login error:', error)
            return { success: false, error: error.message || 'Google login failed' }
        }
    }

    const register = async (name, email, password) => {
        try {
            const userData = { name, email, password }
            await apiRegister(userData)

            return await login(email, password)
        } catch (error) {
            if (error.detail) {
                if (Array.isArray(error.detail)) {
                    const errorMessages = error.detail.map(err => `${err.loc[1]}: ${err.msg}`).join(', ')
                    return { success: false, error: errorMessages }
                } else {
                    return { success: false, error: error.detail }
                }
            }
            return { success: false, error: error.message || 'Registration failed' }
        }
    }

    const logout = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')

        setToken(null)
        setUser(null)

        if (window.google && window.google.accounts) {
            window.google.accounts.id.disableAutoSelect();
        }
    }

    const value = {
        user,
        token,
        loading,
        login,
        loginWithGoogle,
        register,
        logout
    }

    return (
        <AuthContext.Provider value={value}>
            {loading ? (
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100vh',
                    backgroundColor: '#000',
                    color: '#fff',
                    fontSize: '18px'
                }}>
                    Loading...
                </div>
            ) : (
                children
            )}
        </AuthContext.Provider>
    )
}

export default AuthContext