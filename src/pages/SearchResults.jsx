import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useSidebar } from '../contexts/SidebarContext'
import { useAuth } from '../contexts/AuthContext'
import { getAllPosts } from '../api/postService'
import './SearchResults.css'

function SearchResults() {
    const location = useLocation()
    const navigate = useNavigate()
    const [searchQuery, setSearchQuery] = useState('')
    const [results, setResults] = useState([])
    const [allPosts, setAllPosts] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const { isLeftSidebarOpen, areBothSidebarsClosed } = useSidebar()
    const { user } = useAuth()

    useEffect(() => {
        const params = new URLSearchParams(location.search)
        const query = params.get('q') || ''
        setSearchQuery(query)

        if (allPosts.length === 0) {
            fetchAllPosts()
        } else if (query) {
            filterPostsLocally(query)
        } else {
            setResults([])
        }
    }, [location.search, allPosts])

    const fetchAllPosts = async () => {
        try {
            setLoading(true)
            setError(null)

            const response = await getAllPosts({ status: 'published' })
            let postsData = []
            if (Array.isArray(response)) {
                postsData = response
            } else if (response && typeof response === 'object') {
                if (Array.isArray(response.data)) {
                    postsData = response.data
                } else if (Array.isArray(response.results)) {
                    postsData = response.results
                } else if (Object.keys(response).length > 0 && !response.message) {
                    postsData = [response]
                }
            }

            setAllPosts(postsData)

            if (searchQuery) {
                filterPostsLocally(searchQuery, postsData)
            }
        } catch (err) {
            console.error('Error fetching posts:', err)
            setError(err.message || 'Failed to fetch posts.')
            setAllPosts([])
        } finally {
            setLoading(false)
        }
    }

    const filterPostsLocally = (query, posts = allPosts) => {
        if (!query) {
            setResults([])
            return
        }

        const filtered = posts.filter(post => {
            if (!post || typeof post !== 'object') return false

            const title = (post.title || '').toLowerCase()
            const content = (post.content || '').toLowerCase()
            const excerpt = (post.excerpt || '').toLowerCase()
            const authorFullName = (post.author_full_name || '').toLowerCase()
            const authorName = (post.author?.name || '').toLowerCase()
            const searchTerm = query.toLowerCase()

            return title.includes(searchTerm) ||
                content.includes(searchTerm) ||
                excerpt.includes(searchTerm) ||
                authorFullName.includes(searchTerm) ||
                authorName.includes(searchTerm)
        })

        setResults(filtered)
    }

    const handleResultClick = (postId) => {
        navigate(`/article/${postId}`)
    }

    if (loading && allPosts.length === 0) {
        return (
            <div className="search-results-page" style={{
                marginLeft: isLeftSidebarOpen ? '240px' : '0',
                width: '100%'
            }}>
                <div className="search-results-content" style={{
                    maxWidth: '100%',
                    padding: '40px 20px'
                }}>
                    <div className="loading">Loading posts...</div>
                </div>
            </div>
        )
    }

    if (error && allPosts.length === 0) {
        return (
            <div className="search-results-page" style={{
                marginLeft: isLeftSidebarOpen ? '240px' : '0',
                width: '100%'
            }}>
                <div className="search-results-content" style={{
                    maxWidth: '100%',
                    padding: '40px 20px'
                }}>
                    <div className="error">Error: {error}</div>
                </div>
            </div>
        )
    }

    return (
        <div className="search-results-page" style={{
            marginLeft: isLeftSidebarOpen ? '240px' : '0',
            width: '100%'
        }}>
            <div className="search-results-content" style={{
                maxWidth: '100%',
                padding: '40px 20px'
            }}>
                <div className="page-header">
                    <h1 className="search-title">
                        Search results for "<span className="search-query">{searchQuery}</span>"
                    </h1>
                    <p className="search-stats">
                        {results.length} {results.length === 1 ? 'result' : 'results'}
                    </p>
                </div>

                {results.length > 0 ? (
                    <div className="search-results-list">
                        {results.map((result) => (
                            <div
                                key={result.id}
                                className="result-card"
                                onClick={() => handleResultClick(result.id)}
                            >
                                <h2 className="result-title">{result.title || 'Untitled'}</h2>
                                <div className="result-content">
                                    {result.excerpt || result.content?.substring(0, 150) + '...'}
                                </div>
                                <div className="result-meta">
                                    <span className="result-author">
                                        by {result.author_full_name || result.author?.name || 'Unknown Author'}
                                    </span>
                                    <span>{new Date(result.created_at).toLocaleDateString()}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : searchQuery ? (
                    <div className="no-results">
                        <h2 className="no-results-title">No results found</h2>
                        <p className="no-results-message">
                            We couldn't find anything matching "{searchQuery}". Try different keywords.
                        </p>
                        <button
                            className="back-to-home"
                            onClick={() => navigate('/')}
                        >
                            Back to Home
                        </button>
                    </div>
                ) : (
                    <div className="no-results">
                        <h2 className="no-results-title">Start searching</h2>
                        <p className="no-results-message">
                            Enter a search term to find articles, authors, and more.
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default SearchResults