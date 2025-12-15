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

export const getAllPosts = async (params = {}) => {
    try {
        const response = await apiClient.get('/posts/home', { params });
        return response.data;
    } catch (error) {
        throw new Error(handleApiError(error, 'Failed to fetch posts'));
    }
};

export const getPostById = async (postId) => {
    try {
        const response = await apiClient.get(`/posts/${postId}`);
        return response.data;
    } catch (error) {
        throw new Error(handleApiError(error, 'Failed to fetch post'));
    }
};

export const createPost = async (postData) => {
    try {
        const payload = {
            title: postData.title,
            content: postData.content,
            status: postData.status || 'draft',
            excerpt: postData.excerpt,
            featured_image_url: postData.featured_image_url
        };
        const response = await apiClient.post('/posts', payload);
        return response.data;
    } catch (error) {
        throw new Error(handleApiError(error, 'Failed to create post'));
    }
};

export const updatePost = async (postId, postData) => {
    try {
        const payload = {
            title: postData.title,
            content: postData.content,
            status: postData.status,
            excerpt: postData.excerpt,
            featured_image_url: postData.featured_image_url
        };
        const response = await apiClient.put(`/posts/${postId}`, payload);
        return response.data;
    } catch (error) {
        throw new Error(handleApiError(error, 'Failed to update post'));
    }
};

export const deletePost = async (postId) => {
    try {
        await apiClient.delete(`/posts/${postId}`);
        return { success: true };
    } catch (error) {
        throw new Error(handleApiError(error, 'Failed to delete post'));
    }
};

export const getDrafts = async () => {
    try {
        const response = await apiClient.get('/posts/drafts');
        return response.data;
    } catch (error) {
        throw new Error(handleApiError(error, 'Failed to fetch drafts'));
    }
};

export const getUserPosts = async (userId, params = {}) => {
    try {
        const response = await apiClient.get(`/posts/user/${userId}`, { params });
        return response.data;
    } catch (error) {
        throw new Error(handleApiError(error, 'Failed to fetch user posts'));
    }
};