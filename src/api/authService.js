import apiClient from './apiClient';


const handleApiError = (error, defaultMessage) => {
    if (error.response?.data?.detail) {
        return error.response.data.detail;
    }
    if (error.response?.data?.message) {
        return error.response.data.message;
    }
    if (error.message === 'Network Error') {
        return 'Network error. Please check your connection.';
    }
    return defaultMessage;
};

export const register = async (userData) => {
    try {
        const backendUserData = {
            username: userData.name,
            email: userData.email,
            full_name: userData.name,
            password: userData.password
        };

        const response = await apiClient.post('/auth/register', backendUserData);
        return response.data;
    } catch (error) {
        const errorMessage = handleApiError(error, 'Registration failed');
        throw new Error(errorMessage);
    }
};

export const login = async (credentials) => {
    try {
        const loginData = {
            email: credentials.email || credentials.username,
            password: credentials.password
        };

        const response = await apiClient.post('/auth/login', loginData);
        const data = response.data;

        if (!data?.access_token) {
            throw new Error('Invalid response: missing access_token');
        }

        return data;
    } catch (error) {
        const errorMessage = handleApiError(error, 'Login failed');
        throw new Error(errorMessage);
    }
};


export const googleLogin = async (googleToken) => {
    try {
        let tokenToSend = '';

        if (typeof googleToken === 'object') {

            tokenToSend = googleToken.access_token || googleToken.token || '';
        } else if (typeof googleToken === 'string') {
            tokenToSend = googleToken;
        }

        if (!tokenToSend) {
            throw new Error('No valid Google token provided');
        }

        const response = await apiClient.post('/auth/google', {
            token: tokenToSend
        });

        return response.data;
    } catch (error) {
        const errorMessage = handleApiError(error, 'Google login failed');
        throw new Error(errorMessage);
    }
};

export const getCurrentUser = async () => {
    try {
        const response = await apiClient.get('/users/me');
        const user = response.data;

        if (!user?.id || !user?.username) {
            throw new Error('Invalid user data structure');
        }

        return user;
    } catch (error) {
        const errorMessage = handleApiError(error, 'Failed to fetch user profile');
        throw new Error(errorMessage);
    }
};

export const updateUserProfile = async (userData) => {
    try {
        const updateData = {
            full_name: userData.full_name || userData.name,
            bio: userData.bio,
            profile_image_url: userData.profile_image_url
        };

        const response = await apiClient.put('/users/me', updateData);
        return response.data;
    } catch (error) {
        const errorMessage = handleApiError(error, 'Failed to update profile');
        throw new Error(errorMessage);
    }
};