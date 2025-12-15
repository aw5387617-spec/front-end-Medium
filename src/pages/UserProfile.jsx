import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useSidebar } from '../contexts/SidebarContext'
import { useAuth } from '../contexts/AuthContext'
import { getUserById, getUserFollowers, getUserFollowing, followUser, unfollowUser, isFollowing } from '../api/userService'
import { getUserPosts } from '../api/postService'
import PostCard from '../components/PostCard'
import './Profile.css'
import '../styles/CommonStyles.css'

function UserProfile() {
  const { userId } = useParams()
  const [activeTab, setActiveTab] = useState('Articles')
  const [user, setUser] = useState(null)
  const [userPosts, setUserPosts] = useState([])
  const [followingList, setFollowingList] = useState([])
  const [followersList, setFollowersList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isFollowingUser, setIsFollowingUser] = useState(false)
  const [followLoading, setFollowLoading] = useState(false)

  const { isLeftSidebarOpen, areBothSidebarsClosed } = useSidebar()
  const { user: currentUser } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true)
        setError(null)

        const userResponse = await getUserById(userId)
        const userData = userResponse.data || userResponse
        setUser(userData)

        const postsResponse = await getUserPosts(userId)
        const posts = Array.isArray(postsResponse) ? postsResponse : (postsResponse.data || postsResponse.results || [])
        setUserPosts(posts)

        const followersResponse = await getUserFollowers(userId)
        const followers = Array.isArray(followersResponse) ? followersResponse : (followersResponse.data || followersResponse.results || [])
        setFollowersList(followers)

        const followingResponse = await getUserFollowing(userId)
        const following = Array.isArray(followingResponse) ? followingResponse : (followingResponse.data || followingResponse.results || [])
        setFollowingList(following)

        if (currentUser && currentUser.id !== parseInt(userId)) {
          const isFollowingResponse = await isFollowing(currentUser.id, userId)
          setIsFollowingUser(isFollowingResponse.is_following || false)
        }
      } catch (err) {
        setError(err.message || 'Failed to fetch user data')
        console.error('Error fetching user data:', err)
      } finally {
        setLoading(false)
      }
    }

    if (userId) {
      fetchUserData()
    }
  }, [userId, currentUser])

  const handleFollow = async () => {
    if (!currentUser) {
      navigate('/login')
      return
    }

    try {
      setFollowLoading(true)
      await followUser(userId)
      setIsFollowingUser(true)
      const followersResponse = await getUserFollowers(userId)
      const followers = Array.isArray(followersResponse) ? followersResponse : (followersResponse.data || followersResponse.results || [])
      setFollowersList(followers)
    } catch (err) {
      console.error('Error following user:', err)
      alert('Failed to follow user: ' + (err.message || 'Unknown error'))
    } finally {
      setFollowLoading(false)
    }
  }

  const handleUnfollow = async () => {
    try {
      setFollowLoading(true)
      await unfollowUser(userId)
      setIsFollowingUser(false)
      const followersResponse = await getUserFollowers(userId)
      const followers = Array.isArray(followersResponse) ? followersResponse : (followersResponse.data || followersResponse.results || [])
      setFollowersList(followers)
    } catch (err) {
      console.error('Error unfollowing user:', err)
      alert('Failed to unfollow user: ' + (err.message || 'Unknown error'))
    } finally {
      setFollowLoading(false)
    }
  }

  const handleViewArticle = (articleId) => {
    navigate(`/article/${articleId}`)
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
          <button onClick={() => navigate(-1)} className="common-button">Go Back</button>
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
          <button onClick={() => navigate(-1)} className="common-button">Go Back</button>
        </div>
      </div>
    )
  }

  const isOwnProfile = currentUser && currentUser.id === user.id

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
          <h1 className="page-title">{user.name || user.username || 'User Profile'}</h1>
          <p className="page-subtitle">View user's profile and articles</p>
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
                <span className="stat-value">{userPosts.length}</span>
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

            {!isOwnProfile && (
              <div className="profile-actions">
                <button
                  className={`profile-button common-button ${isFollowingUser ? '' : 'primary'}`}
                  onClick={isFollowingUser ? handleUnfollow : handleFollow}
                  disabled={followLoading}
                >
                  {followLoading ? 'Loading...' : (isFollowingUser ? 'Following' : 'Follow')}
                </button>
              </div>
            )}
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
              <h2 className="section-title">Articles ({userPosts.length})</h2>
              {userPosts.length > 0 ? (
                <div className="articles-list" style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '32px'
                }}>
                  {userPosts.map((post) => (
                    <PostCard key={post.id} post={post} />
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
    </div>
  )
}

export default UserProfile