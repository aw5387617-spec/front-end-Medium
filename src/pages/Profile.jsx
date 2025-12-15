import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSidebar } from '../contexts/SidebarContext'
import { useAuth } from '../contexts/AuthContext'
import { getCurrentUser, updateUserProfile } from '../api/authService'
import { getUserFollowers, getUserFollowing, followUser, unfollowUser } from '../api/userService'
import { getUserPosts, deletePost } from '../api/postService'
import EditProfileModal from '../components/EditProfileModal'
import './Profile.css'
import '../styles/CommonStyles.css'

function Profile() {
  const [activeTab, setActiveTab] = useState('Articles')
  const [user, setUser] = useState(null)
  const [recentArticles, setRecentArticles] = useState([])
  const [followingList, setFollowingList] = useState([])
  const [followersList, setFollowersList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  const { isLeftSidebarOpen, areBothSidebarsClosed } = useSidebar()
  const { user: currentUser } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        const userResponse = await getCurrentUser()
        const userData = userResponse.data || userResponse
        setUser(userData)

        const articlesResponse = await getUserPosts(userData.id)
        const articles = Array.isArray(articlesResponse) ? articlesResponse : (articlesResponse.data || articlesResponse.results || [])
        setRecentArticles(articles.slice(0, 5))

        const followersResponse = await getUserFollowers(userData.id)
        const followers = Array.isArray(followersResponse) ? followersResponse : (followersResponse.data || followersResponse.results || [])
        setFollowersList(followers)

        const followingResponse = await getUserFollowing(userData.id)
        const following = Array.isArray(followingResponse) ? followingResponse : (followingResponse.data || followingResponse.results || [])
        setFollowingList(following)
      } catch (err) {
        setError(err.message || 'Failed to fetch profile data')
        console.error('Error fetching profile data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleEditProfile = async (updatedProfile) => {
    try {
      const response = await updateUserProfile(updatedProfile)
      const updatedUser = response.data || response
      setUser(updatedUser)
      setIsEditModalOpen(false)
    } catch (err) {
      console.error('Error updating profile:', err)
      alert('Failed to update profile: ' + (err.message || 'Unknown error'))
    }
  }

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return

    try {
      await deletePost(postId)
      setRecentArticles(prev => prev.filter(article => article.id !== postId))
    } catch (err) {
      console.error('Error deleting post:', err)
      alert('Failed to delete post: ' + (err.message || 'Unknown error'))
    }
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
          <div className="loading">Loading profile...</div>
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

  if (!user) {
    return (
      <div className="common-page" style={{
        marginLeft: isLeftSidebarOpen ? '240px' : '0',
        width: '100%'
      }}>
        <div className="common-content" style={{
          maxWidth: '100%',
          padding: '40px 20px'
        }}>
          <div className="error">User not found</div>
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
          <h1 className="page-title">Profile</h1>
          <p className="page-subtitle">Manage your profile and articles</p>
        </div>

        <div className="profile-header common-card">
          <div className="profile-avatar-large">
            <span>{user.name?.charAt(0) || user.username?.charAt(0) || 'U'}</span>
          </div>

          <div className="profile-info">
            <h1 className="profile-name">{user.name || user.username || 'Unknown User'}</h1>

            {user.email && (
              <p className="profile-username">{user.email}</p>
            )}

            {user.bio && (
              <p className="profile-bio">{user.bio}</p>
            )}

            <div className="profile-stats">
              <div className="stat-item">
                <span className="stat-value">{recentArticles.length}</span>
                <span className="stat-label">Posts</span>
              </div>

              <div className="stat-item">
                <span className="stat-value">{followersList.length}</span>
                <span className="stat-label">Followers</span>
              </div>

              <div className="stat-item">
                <span className="stat-value">{followingList.length}</span>
                <span className="stat-label">Following</span>
              </div>
            </div>

            <div className="profile-actions">
              <button
                className="profile-button common-button primary"
                onClick={() => setIsEditModalOpen(true)}
              >
                Edit Profile
              </button>
            </div>
          </div>
        </div>

        <div className="filter-buttons">
          <button
            className={`filter-btn ${activeTab === 'Articles' ? 'active' : ''}`}
            onClick={() => setActiveTab('Articles')}
          >
            Articles
          </button>
          <button
            className={`filter-btn ${activeTab === 'Following' ? 'active' : ''}`}
            onClick={() => setActiveTab('Following')}
          >
            Following
          </button>
          <button
            className={`filter-btn ${activeTab === 'Followers' ? 'active' : ''}`}
            onClick={() => setActiveTab('Followers')}
          >
            Followers
          </button>
        </div>

        <div className="profile-tab-content">
          {activeTab === 'Articles' && (
            <div className="profile-articles">
              <h2 className="section-title">Recent Articles ({recentArticles.length})</h2>
              {recentArticles.length > 0 ? (
                <div className="articles-list" style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '32px'
                }}>
                  {recentArticles.map((article) => (
                    <div key={article.id} className="profile-article-card common-card" style={{
                      padding: '24px',
                      borderRadius: '12px',
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      transition: 'all 0.3s ease',
                      position: 'relative'
                    }}>
                      <div className="article-content" style={{
                        marginBottom: '16px'
                      }}>
                        <h3 className="article-title" style={{
                          fontSize: '24px',
                          fontWeight: '700',
                          color: '#ffffff',
                          marginBottom: '8px',
                          lineHeight: '1.3'
                        }}>{article.title || 'Untitled'}</h3>

                        {article.excerpt && (
                          <p className="article-description" style={{
                            fontSize: '16px',
                            color: 'rgba(255, 255, 255, 0.7)',
                            marginBottom: '16px',
                            lineHeight: '1.5'
                          }}>{article.excerpt}</p>
                        )}

                        <div className="article-stats" style={{
                          display: 'flex',
                          gap: '16px',
                          alignItems: 'center',
                          flexWrap: 'wrap',
                          fontSize: '14px',
                          color: 'rgba(255, 255, 255, 0.6)',
                          marginBottom: '16px'
                        }}>
                          <span>{new Date(article.created_at).toLocaleDateString()}</span>
                          <span>{article.views_count || 0} views</span>
                          <span>{article.comments_count || 0} comments</span>
                          <span className={`badge ${article.status}`}>{article.status}</span>
                        </div>
                      </div>

                      <div className="article-actions" style={{
                        display: 'flex',
                        gap: '8px',
                        justifyContent: 'flex-end',
                        marginTop: '12px'
                      }}>
                        <button
                          className="article-action-button common-button"
                          onClick={() => navigate(`/write/${article.id}`)}
                          title="Edit article"
                          style={{
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '50%',
                            width: '32px',
                            height: '32px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#ffffff',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            fontSize: '16px'
                          }}
                        >
                          ✏️
                        </button>
                        <button
                          className="article-action-button common-button danger"
                          onClick={() => handleDeletePost(article.id)}
                          title="Delete article"
                          style={{
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '50%',
                            width: '32px',
                            height: '32px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#ffffff',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            fontSize: '16px'
                          }}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state" style={{
                  padding: '60px 20px',
                  textAlign: 'center',
                  color: 'rgba(255, 255, 255, 0.6)',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px'
                }}>
                  <p>No articles yet</p>
                </div>
              )}
            </div>
          )}

          {(activeTab === 'Followers' || activeTab === 'Following') && (
            <div className="profile-users">
              <h2 className="section-title">{activeTab} ({(activeTab === 'Followers' ? followersList : followingList).length})</h2>
              {(activeTab === 'Followers' ? followersList : followingList).length > 0 ? (
                <div className="people-list" style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '32px'
                }}>
                  {(activeTab === 'Followers' ? followersList : followingList).map((person) => (
                    <div key={person.id} className="person-card common-card" style={{
                      padding: '24px',
                      borderRadius: '12px',
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      transition: 'all 0.3s ease',
                      position: 'relative'
                    }}>
                      <div className="person-info" style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px'
                      }}>
                        <div className="person-avatar" style={{
                          width: '60px',
                          height: '60px',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: 'rgba(255, 255, 255, 0.1)',
                          border: '2px solid rgba(0, 255, 0, 0.3)',
                          color: '#ffffff',
                          fontWeight: '700',
                          fontSize: '24px'
                        }}>
                          {(person.full_name || person.name || person.username || 'U')?.charAt(0)}
                        </div>
                        <div className="person-details" style={{
                          display: 'flex',
                          flexDirection: 'column'
                        }}>
                          <h3 className="person-name" style={{
                            fontSize: '18px',
                            fontWeight: '700',
                            color: '#ffffff',
                            marginBottom: '4px'
                          }}>{person.full_name || person.name || 'Unknown User'}</h3>
                          {person.username && (
                            <p className="person-username" style={{
                              fontSize: '14px',
                              color: 'rgba(255, 255, 255, 0.6)',
                              marginBottom: '8px'
                            }}>@{person.username}</p>
                          )}
                          {person.bio && (
                            <p className="person-bio" style={{
                              fontSize: '14px',
                              color: 'rgba(255, 255, 255, 0.8)'
                            }}>{person.bio}</p>
                          )}
                        </div>
                      </div>
                      <div className="person-stats" style={{
                        margin: '0 24px'
                      }}>
                        <span className="followers-count" style={{
                          fontSize: '14px',
                          color: 'rgba(255, 255, 255, 0.6)'
                        }}>{person.followers_count || 0} followers</span>
                      </div>
                      <div className="person-actions" style={{
                        flexShrink: '0'
                      }}>
                        <button
                          className="profile-button common-button"
                          onClick={() => navigate(`/user/${person.id}`)}
                          style={{
                            padding: '8px 16px',
                            borderRadius: '8px',
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            color: '#ffffff',
                            fontSize: '14px',
                            fontWeight: '500',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease'
                          }}
                        >
                          View Profile
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state" style={{
                  padding: '60px 20px',
                  textAlign: 'center',
                  color: 'rgba(255, 255, 255, 0.6)',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px'
                }}>
                  <p>No {activeTab.toLowerCase()} yet</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {isEditModalOpen && (
        <EditProfileModal
          user={user}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleEditProfile}
        />
      )}
    </div>
  )
}

export default Profile