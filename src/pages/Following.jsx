import React, { useState, useEffect } from 'react'
import { useSidebar } from '../contexts/SidebarContext'
import { useAuth } from '../contexts/AuthContext'
import { getUserFollowing, unfollowUser } from '../api/userService'
import './Following.css'

function Following() {
  const [activeTab, setActiveTab] = useState('Writers')
  const [writers, setWriters] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { isLeftSidebarOpen, areBothSidebarsClosed } = useSidebar()
  const { user } = useAuth()

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        if (!user?.id) {
          setError('User not logged in')
          return
        }

        const followingResponse = await getUserFollowing(user.id)
        setWriters(Array.isArray(followingResponse) ? followingResponse : [])
      } catch (err) {
        setError(err.message || 'Failed to fetch following data')
        console.error('Error fetching following data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user?.id])

  const handleUnfollow = async (userId) => {
    try {
      await unfollowUser(userId)
      setWriters(prev => prev.filter(writer => writer.id !== userId))
    } catch (err) {
      console.error('Error unfollowing user:', err)
      alert('Failed to unfollow user: ' + (err.message || 'Unknown error'))
    }
  }

  if (loading) {
    return (
      <div className="following-page" style={{
        marginLeft: isLeftSidebarOpen ? '240px' : '0',
        width: '100%'
      }}>
        <div className="following-content" style={{
          maxWidth: '100%',
          padding: '40px 20px'
        }}>
          <div className="loading">Loading...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="following-page" style={{
        marginLeft: isLeftSidebarOpen ? '240px' : '0',
        width: '100%'
      }}>
        <div className="following-content" style={{
          maxWidth: '100%',
          padding: '40px 20px'
        }}>
          <div className="error">Error: {error}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="following-page" style={{
      marginLeft: isLeftSidebarOpen ? '240px' : '0',
      width: '100%'
    }}>
      <div className="following-content" style={{
        maxWidth: '100%',
        padding: '40px 20px'
      }}>
        <div className="page-header">
          <h1 className="page-title">Following</h1>
          <p className="page-subtitle">People and topics you follow</p>
        </div>

        <div className="following-tabs">
          <button
            className={`following-tab ${activeTab === 'Writers' ? 'active' : ''}`}
            onClick={() => setActiveTab('Writers')}
          >
            Writers
          </button>
          <button
            className={`following-tab ${activeTab === 'Topics' ? 'active' : ''}`}
            onClick={() => setActiveTab('Topics')}
          >
            Topics
          </button>
        </div>

        {activeTab === 'Writers' && (
          <div className="writers-section">
            {writers.length > 0 ? (
              <div className="writers-grid">
                {writers.map((writer) => (
                  <div key={writer.id} className="writer-card">
                    <div className="writer-header">
                      <div className="writer-avatar">
                        {(writer.full_name || writer.name || writer.username || 'U')?.charAt(0)}
                      </div>
                      <div className="writer-info">
                        <div className="writer-name-row">
                          <span className="writer-name">{writer.full_name || writer.name || 'Unknown User'}</span>
                        </div>
                        {writer.username && (
                          <span className="writer-username">@{writer.username}</span>
                        )}
                      </div>
                    </div>

                    {writer.bio && (
                      <p className="writer-bio">{writer.bio}</p>
                    )}

                    <div className="writer-stats">
                      {writer.followers_count !== undefined && (
                        <span>{writer.followers_count} followers</span>
                      )}
                    </div>

                    <button
                      className="writer-action-btn"
                      onClick={() => handleUnfollow(writer.id)}
                    >
                      Unfollow
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-following">
                <h3>You aren't following anyone yet</h3>
                <p>When you follow people, their stories will show up here.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'Topics' && (
          <div className="topics-section">
            <div className="topics-grid">
              {['Technology', 'Programming', 'Web Development', 'Data Science', 'AI', 'Machine Learning'].map((topic, index) => (
                <div key={index} className="topic-card">
                  <h3 className="topic-name">{topic}</h3>
                  <p className="topic-description">Stay updated with the latest in {topic.toLowerCase()}</p>
                  <div className="topic-stats">
                    <div className="topic-stat">
                      <span className="topic-stat-value">1.2K</span>
                      <span className="topic-stat-label">Stories</span>
                    </div>
                    <div className="topic-stat">
                      <span className="topic-stat-value">45K</span>
                      <span className="topic-stat-label">Followers</span>
                    </div>
                  </div>
                  <button className="topic-action-btn">Following</button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Following