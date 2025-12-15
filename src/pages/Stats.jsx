import React, { useState, useEffect } from 'react'
import { useSidebar } from '../contexts/SidebarContext'
import { useAuth } from '../contexts/AuthContext'
import { getAllPosts } from '../api/postService'
import { getUserFollowers, getUserFollowing } from '../api/userService'
import './Stats.css'

function Stats() {
  const [timeframe, setTimeframe] = useState('30d')
  const [stats, setStats] = useState({
    totalViews: 0,
    totalReads: 0,
    totalLikes: 0,
    totalFollowers: 0,
    avgReadTime: '0 min',
    topArticle: '',
    topArticleViews: 0
  })
  const [monthlyData, setMonthlyData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { isLeftSidebarOpen, areBothSidebarsClosed } = useSidebar()
  const { user } = useAuth()

  useEffect(() => {
    const fetchStatsData = async () => {
      try {
        setLoading(true)
        setError(null)

        if (!user) return;

        const postsResponse = await getAllPosts({ author_id: user.id })
        console.log('Stats posts response:', postsResponse)
        const posts = Array.isArray(postsResponse) ? postsResponse : (postsResponse.data || postsResponse.results || [])

        const totalViews = posts.reduce((sum, post) => sum + (post.views_count || 0), 0)
        const totalReads = posts.reduce((sum, post) => sum + (post.reads_count || 0), 0)
        const totalLikes = posts.reduce((sum, post) => sum + (post.likes_count || 0), 0)

        const topArticle = posts.reduce((top, post) =>
          (post.views_count || 0) > (top.views_count || 0) ? post : top,
          { views_count: 0 }
        )

        const followersResponse = await getUserFollowers(user.id)
        const followers = Array.isArray(followersResponse) ? followersResponse : (followersResponse.data || followersResponse.results || [])

        setStats({
          totalViews,
          totalReads,
          totalLikes,
          totalFollowers: followers.length,
          avgReadTime: '2 min',
          topArticle: topArticle.title || 'No articles yet',
          topArticleViews: topArticle.views_count || 0
        })

        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        const currentMonth = new Date().getMonth()
        const data = []

        for (let i = 0; i < 6; i++) {
          const monthIndex = (currentMonth - i + 12) % 12
          data.unshift({
            month: months[monthIndex],
            views: Math.floor(Math.random() * 1000) + 500,
            reads: Math.floor(Math.random() * 500) + 200
          })
        }

        setMonthlyData(data)
      } catch (err) {
        setError(err.message || 'Failed to fetch stats data')
        console.error('Error fetching stats data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchStatsData()
  }, [user, timeframe])

  if (loading) {
    return (
      <div className="stats-page" style={{
        marginLeft: isLeftSidebarOpen ? '240px' : '0',
        width: '100%'
      }}>
        <div className="stats-content" style={{
          maxWidth: '100%',
          padding: '40px 20px'
        }}>
          <div className="loading">Loading stats...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="stats-page" style={{
        marginLeft: isLeftSidebarOpen ? '240px' : '0',
        width: '100%'
      }}>
        <div className="stats-content" style={{
          maxWidth: '100%',
          padding: '40px 20px'
        }}>
          <div className="error">Error: {error}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="stats-page" style={{
      marginLeft: isLeftSidebarOpen ? '240px' : '0',
      width: '100%'
    }}>
      <div className="stats-content" style={{
        maxWidth: '100%',
        padding: '40px 20px'
      }}>
        <div className="page-header">
          <h1 className="page-title">Stats</h1>
          <p className="page-subtitle">Track your performance and audience engagement</p>
        </div>

        <div className="timeframe-selector">
          <button
            className={`timeframe-btn ${timeframe === '7d' ? 'active' : ''}`}
            onClick={() => setTimeframe('7d')}
          >
            7 days
          </button>
          <button
            className={`timeframe-btn ${timeframe === '30d' ? 'active' : ''}`}
            onClick={() => setTimeframe('30d')}
          >
            30 days
          </button>
          <button
            className={`timeframe-btn ${timeframe === '90d' ? 'active' : ''}`}
            onClick={() => setTimeframe('90d')}
          >
            90 days
          </button>
        </div>

        <div className="stats-overview">
          <div className="stat-card">
            <div className="stat-icon">👁️</div>
            <div className="stat-content">
              <div className="stat-value">{stats.totalViews.toLocaleString()}</div>
              <div className="stat-label">Views</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">📖</div>
            <div className="stat-content">
              <div className="stat-value">{stats.totalReads.toLocaleString()}</div>
              <div className="stat-label">Reads</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">👍</div>
            <div className="stat-content">
              <div className="stat-value">{stats.totalLikes.toLocaleString()}</div>
              <div className="stat-label">Likes</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-content">
              <div className="stat-value">{stats.totalFollowers.toLocaleString()}</div>
              <div className="stat-label">Followers</div>
            </div>
          </div>
        </div>

        <div className="chart-section">
          <h2 className="chart-title">Performance Overview</h2>
          <div className="chart-container">
            <div className="chart-bars">
              {monthlyData.map((data, index) => (
                <div key={index} className="chart-bar-group">
                  <div className="bar-container">
                    <div
                      className="bar views-bar"
                      style={{
                        height: `${(data.views / 1500) * 100}%`,
                        minHeight: '4px'
                      }}
                    ></div>
                    <div
                      className="bar reads-bar"
                      style={{
                        height: `${(data.reads / 1500) * 100}%`,
                        minHeight: '4px'
                      }}
                    ></div>
                  </div>
                  <div className="bar-label">{data.month}</div>
                </div>
              ))}
            </div>

            <div className="chart-legend">
              <div className="legend-item">
                <div className="legend-color views-bar"></div>
                <span>Views</span>
              </div>
              <div className="legend-item">
                <div className="legend-color reads-bar"></div>
                <span>Reads</span>
              </div>
            </div>
          </div>
        </div>

        <div className="insights-section">
          <div className="insight-card">
            <h3 className="insight-title">Top Performing Article</h3>
            <div className="insight-value">{stats.topArticleViews.toLocaleString()}</div>
            <div className="insight-description">{stats.topArticle}</div>
          </div>

          <div className="insight-card">
            <h3 className="insight-title">Average Read Time</h3>
            <div className="insight-value">{stats.avgReadTime}</div>
            <div className="insight-description">Keep up the good work!</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Stats