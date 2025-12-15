import React, { useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './GoogleLoginButton.css';

export const GoogleLoginButton = ({ onSuccess }) => {
    const { loginWithGoogle } = useAuth();
    const googleButtonRef = useRef(null);

    useEffect(() => {
        if (window.google && window.google.accounts) {
            window.google.accounts.id.initialize({
                client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
                callback: handleCredentialResponse,
            });
            if (googleButtonRef.current) {
                window.google.accounts.id.renderButton(
                    googleButtonRef.current,
                    {
                        theme: 'outline',
                        size: 'large',
                        width: '100%',
                    }
                );
            }
            window.google.accounts.id.prompt();
        }
    }, []);

    const handleCredentialResponse = async (response) => {
        try {
            const idToken = response.credential;

            if (idToken && idToken.startsWith('ey')) {
                const result = await loginWithGoogle(idToken);

                if (result.success) {
                    if (onSuccess && typeof onSuccess === 'function') {
                        onSuccess();
                    }
                } else {
                }
            } else {
                const tokenType = idToken ?
                    (idToken.startsWith('ya29') ? 'Access Token (wrong)' : 'Unknown Token') :
                    'No credential';

                throw new Error(`Invalid token type. Expected ID token (JWT), got ${tokenType}.`);
            }
        } catch (error) {
        }
    };

    return (
        <div className="google-login-container">
            <div ref={googleButtonRef} id="google-signin-button"></div>
        </div>
    );
};