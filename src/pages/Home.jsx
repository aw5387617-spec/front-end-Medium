import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSidebar } from '../contexts/SidebarContext'
import { useAuth } from '../contexts/AuthContext'
import { getAllPosts } from '../api/postService'
import PostCard from '../components/PostCard'
import './Home.css'
import '../styles/CommonStyles.css'

function Home() {
  const [activeTab, setActiveTab] = useState('For you')
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()
  const { isLeftSidebarOpen, areBothSidebarsClosed } = useSidebar()
  const { user } = useAuth()

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await getAllPosts({ status: 'published' })
        const posts = Array.isArray(response) ? response : (response.data || response.results || [])
        setArticles(posts)
      } catch (err) {
        setError(err.message || 'Failed to fetch articles')
        console.error('Error fetching articles:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchArticles()
  }, [])

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
          <div className="loading">Loading articles...</div>
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
          <h1 className="page-title">Home</h1>
          <p className="page-subtitle">Discover stories from writers you follow</p>
        </div>

        <div className="filter-buttons">
          <button
            className={`filter-btn ${activeTab === 'For you' ? 'active' : ''}`}
            onClick={() => setActiveTab('For you')}
          >
            For you
          </button>
        </div>

        <div className="info-banner glass-effect">
          <p>"Following" and your topics are now part of the new Following page, which you can find from the sidebar.</p>
          <a href="#" className="banner-link">Okay, got it</a>
        </div>

        {articles && articles.length > 0 && (
          <div className="articles-list">
            {articles.map((article) => (
              <PostCard key={article.id} post={article} />
            ))}
          </div>
        )}

        {(!articles || articles.length === 0) && !loading && (
          <div className="loading">No articles yet</div>
        )}
      </div>
    </div>
  )
}

export default Home