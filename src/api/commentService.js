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

export const getCommentsByPostId = async (postId, params = {}) => {
    try {
        const response = await apiClient.get(`/comments/post/${postId}/all`, { params });

        if (response.data && response.data.comments && Array.isArray(response.data.comments)) {
            return response.data.comments;
        }

        return response.data || [];
    } catch (error) {
        throw new Error(handleApiError(error, 'Failed to fetch comments'));
    }
};

export const createComment = async (commentData) => {
    try {
        const payload = {
            post_id: commentData.post_id,
            content: commentData.content,
            parent_id: commentData.parent_id || null
        };

        const response = await apiClient.post('/comments', payload);

        return response.data;
    } catch (error) {
        throw new Error(handleApiError(error, 'Failed to create comment'));
    }
};

export const deleteComment = async (commentId) => {
    try {
        await apiClient.delete(`/comments/${commentId}`);

        return { success: true };
    } catch (error) {
        throw new Error(handleApiError(error, 'Failed to delete comment'));
    }
};

export const createReply = async (parentCommentId, replyData) => {
    try {
        const payload = {
            post_id: replyData.post_id,
            content: replyData.content,
            parent_id: parentCommentId
        };

        const response = await apiClient.post('/comments', payload);

        return response.data;
    } catch (error) {
        throw new Error(handleApiError(error, 'Failed to create reply'));
    }
};