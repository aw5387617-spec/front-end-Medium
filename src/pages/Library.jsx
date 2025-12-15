import React, { useState, useEffect } from 'react'
import { useSidebar } from '../contexts/SidebarContext'
import { useAuth } from '../contexts/AuthContext'
import { getAllPosts } from '../api/postService'
import './Library.css'

function Library() {
  const [filter, setFilter] = useState('All')
  const [savedArticles, setSavedArticles] = useState([])
  const [lists, setLists] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { isLeftSidebarOpen, areBothSidebarsClosed } = useSidebar()
  const { user } = useAuth()

  useEffect(() => {
    const fetchLibraryData = async () => {
      try {
        setLoading(true)
        setError(null)

        if (!user) return;
        const draftsResponse = await getAllPosts({ status: 'draft' })
        console.log('Library drafts response:', draftsResponse)
        const articles = Array.isArray(draftsResponse) ? draftsResponse : (draftsResponse.data || draftsResponse.results || [])
        setSavedArticles(articles)

        setLists([])
      } catch (err) {
        setError(err.message || 'Failed to fetch library data')
        console.error('Error fetching library data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchLibraryData()
  }, [user])

  if (loading) {
    return (
      <div className="library-page" style={{
        marginLeft: isLeftSidebarOpen ? '240px' : '0',
        width: '100%'
      }}>
        <div className="library-content" style={{
          maxWidth: '100%',
          padding: '40px 20px'
        }}>
          <div className="loading">Loading library...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="library-page" style={{
        marginLeft: isLeftSidebarOpen ? '240px' : '0',
        width: '100%'
      }}>
        <div className="library-content" style={{
          maxWidth: '100%',
          padding: '40px 20px'
        }}>
          <div className="error">Error: {error}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="library-page" style={{
      marginLeft: isLeftSidebarOpen ? '240px' : '0',
      width: '100%'
    }}>
      <div className="library-content" style={{
        maxWidth: '100%',
        padding: '40px 20px'
      }}>
        <div className="page-header">
          <h1 className="page-title">Library</h1>
          <p className="page-subtitle">Your saved articles and reading lists</p>
        </div>

        <div className="filter-tabs">
          <button
            className={`filter-tab ${filter === 'All' ? 'active' : ''}`}
            onClick={() => setFilter('All')}
          >
            All
          </button>
          <button
            className={`filter-tab ${filter === 'Saved' ? 'active' : ''}`}
            onClick={() => setFilter('Saved')}
          >
            Saved articles
          </button>
          <button
            className={`filter-tab ${filter === 'Lists' ? 'active' : ''}`}
            onClick={() => setFilter('Lists')}
          >
            Lists
          </button>
        </div>

        <div className="library-section">
          <h2 className="section-title">
            {filter === 'All' && 'All items'}
            {filter === 'Saved' && 'Saved articles'}
            {filter === 'Lists' && 'Reading lists'}
          </h2>

          {filter !== 'Lists' ? (
            <div className="articles-grid">
              {savedArticles.length > 0 ? (
                savedArticles.map((article) => (
                  <div key={article.id} className="library-card">
                    <span className="card-category">{article.category || 'Article'}</span>
                    <h3 className="card-title">{article.title || 'Untitled'}</h3>
                    <p className="card-author">by {article.author_full_name || article.author?.name || 'Unknown Author'}</p>
                    <div className="card-meta">
                      <span>{new Date(article.created_at).toLocaleDateString()}</span>
                      <span>{article.read_time || '5 min'} read</span>
                    </div>
                    <div className="card-actions">
                      <button className="card-button">Read</button>
                      <button className="card-button">Remove</button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state" style={{
                  gridColumn: '1 / -1',
                  padding: '60px 20px',
                  textAlign: 'center',
                  color: 'rgba(255, 255, 255, 0.6)'
                }}>
                  <p>No saved articles yet</p>
                  <p style={{ marginTop: '8px', fontSize: '14px' }}>
                    Save articles to read them later
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="lists-grid">
              {lists.length > 0 ? (
                lists.map((list, index) => (
                  <div key={index} className="list-card">
                    <div className="list-header">
                      <h3 className="list-name">{list.name || 'Unnamed List'}</h3>
                      <span className="list-count">{list.count || 0} stories</span>
                    </div>
                    <div className="list-date">
                      Created {list.created_at ? new Date(list.created_at).toLocaleDateString() : 'recently'}
                    </div>
                    <button className="list-button">View list</button>
                  </div>
                ))
              ) : (
                <div className="empty-state" style={{
                  gridColumn: '1 / -1',
                  padding: '60px 20px',
                  textAlign: 'center',
                  color: 'rgba(255, 255, 255, 0.6)'
                }}>
                  <p>No reading lists yet</p>
                  <p style={{ marginTop: '8px', fontSize: '14px' }}>
                    Create lists to organize your saved articles
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Library