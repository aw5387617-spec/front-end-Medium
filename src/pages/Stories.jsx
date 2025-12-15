import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSidebar } from '../contexts/SidebarContext'
import { useAuth } from '../contexts/AuthContext'
import { getDrafts, deletePost } from '../api/postService'
import { getUserPosts } from '../api/postService'
import './Stories.css'
import '../styles/CommonStyles.css'

function Stories() {
  const [filter, setFilter] = useState('Published')
  const [stories, setStories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const { isLeftSidebarOpen, areBothSidebarsClosed } = useSidebar()
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const fetchStories = async () => {
      try {
        setLoading(true)
        setError(null)
        let storiesData = []

        if (filter === 'Published') {
          const response = await getUserPosts(user.id)
          storiesData = Array.isArray(response) ? response.filter(p => p.status === 'published') : []
        } else if (filter === 'Draft') {
          const response = await getDrafts()
          storiesData = Array.isArray(response) ? response : []
        } else {
          const response = await getUserPosts(user.id)
          storiesData = Array.isArray(response) ? response : []
        }

        setStories(storiesData)
      } catch (err) {
        setError(err.message || 'Failed to fetch stories')
        console.error('Error fetching stories:', err)
      } finally {
        setLoading(false)
      }
    }

    if (user?.id) {
      fetchStories()
    }
  }, [filter, user?.id])

  const handleDelete = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this story?')) return

    try {
      await deletePost(postId)
      setStories(prev => prev.filter(story => story.id !== postId))
    } catch (err) {
      console.error('Error deleting story:', err)
      alert('Failed to delete story: ' + (err.message || 'Unknown error'))
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="common-page" style={{
        marginLeft: isLeftSidebarOpen ? '240px' : '0',
        width: '100%'
      }}>
        <div className="common-content" style={{
          maxWidth: '100%',
          padding: '40px 20px'
        }}>
          <div className="loading">Loading stories...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="common-page" style={{
        marginLeft: isLeftSidebarOpen ? '240px' : '0',
        width: '100%'
      }}>
        <div className="common-content" style={{
          maxWidth: '100%',
          padding: '40px 20px'
        }}>
          <div className="error">Error: {error}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="common-page" style={{
      marginLeft: isLeftSidebarOpen ? '240px' : '0',
      width: '100%'
    }}>
      <div className="common-content" style={{
        maxWidth: '100%',
        padding: '40px 20px'
      }}>
        <div className="page-header">
          <h1 className="page-title">Stories</h1>
          <p className="page-subtitle">Manage your stories and drafts</p>
        </div>

        <div className="stories-actions">
          <div className="filter-buttons">
            <button
              className={`filter-btn ${filter === 'Published' ? 'active' : ''}`}
              onClick={() => setFilter('Published')}
            >
              Published
            </button>
            <button
              className={`filter-btn ${filter === 'Draft' ? 'active' : ''}`}
              onClick={() => setFilter('Draft')}
            >
              Draft
            </button>
          </div>

          <button
            className="new-story-button common-button primary"
            onClick={() => navigate('/write')}
          >
            <span>+</span>
            <span>New story</span>
          </button>
        </div>

        <div className="stories-list">
          {stories && stories.length > 0 ? (
            stories.map((story) => (
              <div key={story.id} className="story-card common-card">
                <div className="story-header">
                  <div className="story-info">
                    <h3 className="story-title">{story.title || 'Untitled'}</h3>
                    <span className={`badge story-badge ${story.status}`}>
                      {story.status}
                    </span>
                  </div>

                  <div className="story-meta" style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: '16px',
                    fontSize: '14px',
                    color: 'rgba(255, 255, 255, 0.6)'
                  }}>
                    <span>{formatDate(story.created_at)}</span>
                    <div className="story-actions" style={{
                      display: 'flex',
                      gap: '8px'
                    }}>
                      {story.status === 'published' && (
                        <button
                          className="common-button"
                          onClick={() => navigate(`/article/${story.id}`)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '6px',
                            background: 'rgba(0, 255, 0, 0.1)',
                            border: '1px solid rgba(0, 255, 0, 0.3)',
                            color: '#00ff00',
                            fontSize: '14px',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease'
                          }}
                        >
                          View
                        </button>
                      )}
                      <button
                        className="common-button"
                        onClick={() => navigate(`/write/${story.id}`)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '6px',
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          color: '#ffffff',
                          fontSize: '14px',
                          cursor: 'pointer'
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className="common-button danger"
                        onClick={() => handleDelete(story.id)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '6px',
                          background: 'rgba(255, 0, 0, 0.1)',
                          border: '1px solid rgba(255, 0, 0, 0.3)',
                          color: '#ff4444',
                          fontSize: '14px',
                          cursor: 'pointer'
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state" style={{
              padding: '60px 20px',
              textAlign: 'center',
              color: 'rgba(255, 255, 255, 0.6)',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px'
            }}>
              <p>No {filter.toLowerCase()} stories yet</p>
              <button
                className="common-button primary"
                onClick={() => navigate('/write')}
                style={{
                  marginTop: '16px',
                  padding: '10px 20px'
                }}
              >
                Write your first story
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Stories