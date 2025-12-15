import React, { useState } from 'react';
import { updateUserProfile } from '../api/authService';
import './EditProfileModal.css';

const EditProfileModal = ({ user, onClose, onUpdate }) => {
    const [formData, setFormData] = useState({
        full_name: user?.full_name || '',
        username: user?.username || '',
        bio: user?.bio || '',
        profile_image_url: user?.profile_image_url || ''
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const updateData = {
                full_name: formData.full_name,
                bio: formData.bio,
                profile_image_url: formData.profile_image_url
            };

            const updatedUser = await updateUserProfile(updateData);
            setSuccess('Profile updated successfully!');
            if (onUpdate) {
                onUpdate(updatedUser);
            }

            setTimeout(() => {
                onClose();
            }, 1500);
        } catch (err) {
            setError(err.message || 'Failed to update profile');
            console.error('Profile update error:', err);
        } finally {
            setLoading(false);
        }
    };

    const getInitials = (name) => {
        if (!name) return 'U';
        return name.charAt(0).toUpperCase();
    };

    return (
        <div className="edit-profile-modal-overlay" onClick={onClose}>
            <div className="edit-profile-modal" onClick={e => e.stopPropagation()}>
                <div className="edit-profile-modal-header">
                    <h2 className="edit-profile-modal-title">Edit Profile</h2>
                    <button className="edit-profile-modal-close" onClick={onClose}>
                        ×
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="edit-profile-modal-body">
                        <div className="edit-profile-avatar-preview">
                            {getInitials(formData.full_name || user?.full_name)}
                        </div>

                        <div className="edit-profile-form-group">
                            <label className="edit-profile-form-label">Full Name</label>
                            <input
                                type="text"
                                name="full_name"
                                className="edit-profile-form-input"
                                value={formData.full_name}
                                onChange={handleChange}
                                placeholder="Enter your full name"
                                required
                            />
                        </div>

                        <div className="edit-profile-form-group">
                            <label className="edit-profile-form-label">Username</label>
                            <input
                                type="text"
                                name="username"
                                className="edit-profile-form-input"
                                value={formData.username}
                                onChange={handleChange}
                                placeholder="Enter your username"
                                disabled
                            />
                            <p style={{ fontSize: '12px', color: 'rgba(0,255,0,0.5)', marginTop: '4px' }}>
                                Username cannot be changed
                            </p>
                        </div>

                        <div className="edit-profile-form-group">
                            <label className="edit-profile-form-label">Bio</label>
                            <textarea
                                name="bio"
                                className="edit-profile-form-textarea"
                                value={formData.bio}
                                onChange={handleChange}
                                placeholder="Tell us about yourself"
                            />
                        </div>

                        <div className="edit-profile-form-group">
                            <label className="edit-profile-form-label">Profile Image URL</label>
                            <input
                                type="text"
                                name="profile_image_url"
                                className="edit-profile-form-input"
                                value={formData.profile_image_url}
                                onChange={handleChange}
                                placeholder="Enter image URL"
                            />
                        </div>

                        {error && <div className="edit-profile-error">{error}</div>}
                        {success && <div className="edit-profile-success">{success}</div>}
                    </div>

                    <div className="edit-profile-modal-footer">
                        <button
                            type="button"
                            className="edit-profile-cancel-btn"
                            onClick={onClose}
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="edit-profile-save-btn"
                            disabled={loading}
                        >
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditProfileModal;