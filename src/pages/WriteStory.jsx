import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useSidebar } from '../contexts/SidebarContext'
import { useAuth } from '../contexts/AuthContext'
import { createPost, updatePost, getPostById, deletePost } from '../api/postService'
import './WriteStory.css'

function WriteStory() {
    const [story, setStory] = useState({
        title: '',
        content: '',
        excerpt: '',
        featured_image_url: '',
        status: 'draft'
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const { isLeftSidebarOpen, areBothSidebarsClosed } = useSidebar()
    const { user } = useAuth()
    const navigate = useNavigate()
    const { id } = useParams()

    useEffect(() => {
        const fetchPost = async () => {
            if (id) {
                try {
                    setLoading(true)
                    setError(null)
                    const postData = await getPostById(id)

                    setStory({
                        title: postData.title || '',
                        content: postData.content || '',
                        excerpt: postData.excerpt || '',
                        featured_image_url: postData.featured_image_url || '',
                        status: postData.status || 'draft'
                    })
                } catch (err) {
                    setError(err.message || 'Failed to fetch post')
                    console.error('Error fetching post:', err)
                } finally {
                    setLoading(false)
                }
            }
        }

        fetchPost()
    }, [id])

    const handleChange = (e) => {
        const { name, value } = e.target
        setStory(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleSubmit = async (publish = false) => {
        if (!story.title.trim()) {
            alert('Please enter a title for your story')
            return
        }

        try {
            setLoading(true)
            setError(null)

            const postData = {
                ...story,
                status: publish ? 'published' : 'draft'
            }

            let response
            if (id) {
                response = await updatePost(id, postData)
            } else {
                response = await createPost(postData)
            }

            const savedPost = response.data || response
            navigate(`/article/${savedPost.id}`)
        } catch (err) {
            setError(err.message || `Failed to ${id ? 'update' : 'create'} post`)
            console.error(`Error ${id ? 'updating' : 'creating'} post:`, err)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async () => {
        if (!id) return
        if (!window.confirm('Are you sure you want to delete this story?')) return

        try {
            setLoading(true)
            await deletePost(id)
            navigate('/stories')
        } catch (err) {
            setError(err.message || 'Failed to delete post')
            console.error('Error deleting post:', err)
        } finally {
            setLoading(false)
        }
    }

    if (loading && id) {
        return (
            <div className="write-story-page" style={{
                marginLeft: isLeftSidebarOpen ? '240px' : '0',
                width: '100%'
            }}>
                <div className="write-story-content" style={{
                    maxWidth: '100%',
                    padding: '40px 20px'
                }}>
                    <div className="loading">Loading story...</div>
                </div>
            </div>
        )
    }

    return (
        <div className="write-story-page" style={{
            marginLeft: isLeftSidebarOpen ? '240px' : '0',
            width: '100%'
        }}>
            <div className="write-story-content" style={{
                maxWidth: '100%',
                padding: '40px 20px'
            }}>
                <div className="page-header">
                    <h1 className="page-title">{id ? 'Edit Story' : 'Write a Story'}</h1>
                    <p className="page-subtitle">Share your thoughts with the world</p>
                </div>

                {error && (
                    <div className="error" style={{
                        padding: '12px',
                        borderRadius: '8px',
                        background: 'rgba(255, 0, 0, 0.1)',
                        border: '1px solid rgba(255, 0, 0, 0.3)',
                        color: '#ff4444',
                        marginBottom: '24px'
                    }}>
                        Error: {error}
                    </div>
                )}

                <form className="story-form" onSubmit={(e) => {
                    e.preventDefault()
                    handleSubmit()
                }}>
                    <div className="form-group">
                        <label className="form-label">Title</label>
                        <input
                            type="text"
                            name="title"
                            value={story.title}
                            onChange={handleChange}
                            className="form-input"
                            placeholder="Enter a title for your story"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Excerpt</label>
                        <input
                            type="text"
                            name="excerpt"
                            value={story.excerpt}
                            onChange={handleChange}
                            className="form-input"
                            placeholder="Brief summary of your story (optional)"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Content</label>
                        <textarea
                            name="content"
                            value={story.content}
                            onChange={handleChange}
                            className="form-input form-textarea"
                            placeholder="Write your story here..."
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Featured Image URL (optional)</label>
                        <input
                            type="text"
                            name="featured_image_url"
                            value={story.featured_image_url}
                            onChange={handleChange}
                            className="form-input"
                            placeholder="https://example.com/image.jpg"
                        />
                    </div>

                    <div className="action-buttons">
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => navigate(-1)}
                            disabled={loading}
                        >
                            Cancel
                        </button>

                        {id && (
                            <button
                                type="button"
                                className="btn btn-danger"
                                onClick={handleDelete}
                                disabled={loading}
                            >
                                Delete
                            </button>
                        )}

                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => handleSubmit(false)}
                            disabled={loading}
                        >
                            Save Draft
                        </button>

                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={() => handleSubmit(true)}
                            disabled={loading}
                        >
                            Publish
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default WriteStory