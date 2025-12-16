import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import './PostCard.css'

function PostCard({ post }) {
  const { user } = useAuth()
  const navigate = useNavigate()

  const extractHashtags = (content) => {
    if (!content) return []
    const hashtagRegex = /#(\w+)/g
    const matches = content.match(hashtagRegex)
    return matches ? [...new Set(matches)] : []
  }

  const hashtags = extractHashtags(post.content || '')

  const authorName = post.author_full_name || post.author?.full_name || post.author?.name || post.author_name || 'Unknown Author'
  const authorId = post.author_id || post.author?.id
  const authorAvatar = post.author?.avatar_url || post.author_avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${authorName}`
  const authorBio = post.author?.bio || 'User bio'

  return (
    <div className="post-card">
      <div className="post-header">
        <div className="author-profile">
          <img
            src={authorAvatar}
            alt={authorName}
            className="author-avatar"
            onClick={() => authorId && navigate(`/user/${authorId}`)}
            style={{ cursor: authorId ? 'pointer' : 'default' }}
          />
          <div className="author-info">
            <div className="author-header">
              <h3
                className="author-name"
                onClick={() => authorId && navigate(`/user/${authorId}`)}
                style={{ cursor: authorId ? 'pointer' : 'default' }}
              >
                {authorName}
              </h3>
              {post.author?.verified && <span className="verified-badge">✓</span>}
            </div>
            <p className="author-bio">{authorBio}</p>
            <p className="post-date">
              {post.published_at ? new Date(post.published_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              }) : post.created_at ? new Date(post.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              }) : 'Unknown date'}
            </p>
          </div>
        </div>
      </div>

      <div
        className="post-content"
        onClick={() => navigate(`/article/${post.id}`)}
        style={{ cursor: 'pointer' }}
      >
        <h2 className="post-title">{post.title || 'Untitled Post'}</h2>
        <p className="post-text">{post.excerpt || post.content?.substring(0, 280) || 'No content available'}...</p>

        {post.featured_image_url && (
          <div className="post-image">
            <img src={post.featured_image_url} alt={post.title} />
          </div>
        )}
      </div>

      {hashtags.length > 0 && (
        <div className="hashtags-section">
          {hashtags.slice(0, 5).map((tag, index) => (
            <a key={index} href={`/search?q=${tag}`} className="hashtag">
              {tag}
            </a>
          ))}
        </div>
      )}

      <div className="post-stats">
        <div className="stat-item">
          <span className="stat-text">{post.views_count?.toLocaleString() || 0} views</span>
        </div>
        <div className="stat-item">
          <span className="stat-text">{post.comments_count || 0} comments</span>
        </div>
      </div>

      <div className="post-actions">
        <button
          className="action-btn"
          onClick={() => navigate(`/article/${post.id}`)}
          title="Read full post"
        >
          <span className="action-text">Read</span>
        </button>
      </div>
    </div>
  )
}

export default PostCard