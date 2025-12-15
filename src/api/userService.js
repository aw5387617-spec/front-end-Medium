import apiClient from './apiClient';

const handleApiError = (error, defaultMessage) => {
    if (error.response?.data?.detail) {
        return error.response.data.detail;
    }
    if (error.response?.data?.message) {
        return error.response.data.message;
    }
    return defaultMessage;
};

export const getUserById = async (userId) => {
    try {
        const response = await apiClient.get(`/users/${userId}`);
        return response.data;
    } catch (error) {
        throw new Error(handleApiError(error, 'Failed to fetch user'));
    }
};

export const followUser = async (userId) => {
    try {
        const response = await apiClient.post(`/follows/${userId}`);
        return response.data;
    } catch (error) {
        throw new Error(handleApiError(error, 'Failed to follow user'));
    }
};

export const unfollowUser = async (userId) => {
    try {
        await apiClient.delete(`/follows/${userId}`);
        return { success: true };
    } catch (error) {
        throw new Error(handleApiError(error, 'Failed to unfollow user'));
    }
};

export const getUserFollowers = async (userId, params = {}) => {
    try {
        const response = await apiClient.get(`/follows/${userId}/followers`, { params });
        return response.data;
    } catch (error) {
        throw new Error(handleApiError(error, 'Failed to fetch followers'));
    }
};

export const getUserFollowing = async (userId, params = {}) => {
    try {
        const response = await apiClient.get(`/follows/${userId}/following`, { params });
        return response.data;
    } catch (error) {
        throw new Error(handleApiError(error, 'Failed to fetch following'));
    }
};

export const isFollowing = async (userId, targetUserId) => {
    try {
        const response = await apiClient.get(`/follows/${userId}/is-following/${targetUserId}`);
        return response.data;
    } catch (error) {
        throw new Error(handleApiError(error, 'Failed to check follow status'));
    }
};