import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { getCommentsByPostId, createComment, deleteComment, createReply } from '../api/commentService'
import './PostCard.css'

function PostCard({ post }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [comments, setComments] = useState([])
  const [replyingTo, setReplyingTo] = useState(null)
  const [replyContent, setReplyContent] = useState('')
  const [showComments, setShowComments] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [loadingComments, setLoadingComments] = useState(false)
  const [commentError, setCommentError] = useState(null)
  const [expandedReplies, setExpandedReplies] = useState({})

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

  const toggleReplies = (commentId) => {
    setExpandedReplies(prev => ({
      ...prev,
      [commentId]: !prev[commentId]
    }))
  }

  const renderReplies = (replies, depth = 1) => {
    if (!replies || replies.length === 0) return null;

    return (
      <div className="replies-container" style={{ marginTop: '12px', paddingLeft: `${depth * 24}px` }}>
        {replies.map((reply) => (
          <div key={reply.id} className="comment-item" style={{ padding: '8px 0' }}>
            <img
              src={reply.author?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${reply.author?.name}`}
              alt={reply.author?.name}
              className="comment-avatar"
              style={{ width: '32px', height: '32px' }}
            />
            <div className="comment-content">
              <div className="comment-header">
                <h4 className="comment-author" style={{ fontSize: '13px' }}>{reply.author_name || reply.author?.name || 'Anonymous'}</h4>
                <span className="comment-time" style={{ fontSize: '11px' }}>
                  {reply.created_at ? new Date(reply.created_at).toLocaleDateString() : 'Unknown date'}
                </span>
              </div>
              <p className="comment-text" style={{ fontSize: '13px', margin: '0 0 4px 0' }}>{reply.content}</p>
              <div className="comment-actions" style={{ fontSize: '11px' }}>
                <button
                  className="comment-action"
                  onClick={() => {
                    setReplyingTo(replyingTo === reply.id ? null : reply.id)
                    setReplyContent('')
                  }}
                >
                  {replyingTo === reply.id ? 'Cancel' : 'Reply'}
                </button>
                {user?.id === reply.author_id && (
                  <button
                    className="comment-action delete"
                    onClick={() => handleDeleteComment(reply.id, true, reply.parent_id)}
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>

            {replyingTo === reply.id && (
              <form
                className="new-comment-form"
                onSubmit={(e) => handleReplySubmit(e, reply.id)}
                style={{ marginTop: '12px', paddingLeft: '48px' }}
              >
                <img
                  src={user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
                  alt={user.name}
                  className="comment-avatar"
                  style={{ width: '32px', height: '32px' }}
                />
                <div className="comment-input-wrapper">
                  <input
                    type="text"
                    className="comment-input"
                    placeholder="Write a reply..."
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    style={{ fontSize: '13px' }}
                  />
                  <button
                    type="submit"
                    className="comment-submit"
                    disabled={!replyContent.trim()}
                    style={{ padding: '8px 12px', fontSize: '13px' }}
                  >
                    Reply
                  </button>
                </div>
              </form>
            )}

            {reply.replies && reply.replies.length > 0 && renderReplies(reply.replies, depth + 1)}
          </div>
        ))}
      </div>
    );
  };

  useEffect(() => {
    if (showComments && comments.length === 0) {
      fetchComments()
    }
  }, [showComments])

  const fetchComments = async () => {
    try {
      setLoadingComments(true)
      setCommentError(null)

      const response = await getCommentsByPostId(post.id)
      const commentsArray = Array.isArray(response) ? response : []

      setComments(commentsArray)
    } catch (err) {
      setCommentError(err.message || 'Failed to load comments')
      console.error('Error fetching comments:', err)
    } finally {
      setLoadingComments(false)
    }
  }

  const handleCommentSubmit = async (e) => {
    e.preventDefault()
    if (!newComment.trim()) return

    try {
      const response = await createComment({
        post_id: post.id,
        content: newComment
      })
      const newCommentData = response.data || response
      setComments([newCommentData, ...comments])
      setNewComment('')
    } catch (err) {
      setCommentError(err.message || 'Failed to post comment')
      console.error('Error posting comment:', err)
    }
  }

  const handleReplySubmit = async (e, parentCommentId) => {
    e.preventDefault()
    if (!replyContent.trim()) return

    try {
      const response = await createReply(parentCommentId, {
        post_id: post.id,
        content: replyContent
      })

      const newReply = response.data || response

      setComments(prevComments =>
        prevComments.map(comment => {
          if (comment.id === parentCommentId) {
            return {
              ...comment,
              replies: [...(comment.replies || []), newReply]
            }
          }

          const updateReplies = (replies) => {
            return replies.map(reply => {
              if (reply.id === parentCommentId) {
                return {
                  ...reply,
                  replies: [...(reply.replies || []), newReply]
                }
              }

              if (reply.replies && reply.replies.length > 0) {
                return {
                  ...reply,
                  replies: updateReplies(reply.replies)
                }
              }

              return reply
            })
          }

          if (comment.replies && comment.replies.length > 0) {
            return {
              ...comment,
              replies: updateReplies(comment.replies)
            }
          }

          return comment
        })
      )

      setReplyContent('')
      setReplyingTo(null)
    } catch (err) {
      setCommentError(err.message || 'Failed to post reply')
      console.error('Error posting reply:', err)
    }
  }

  const handleDeleteComment = async (commentId, isReply = false, parentId = null) => {
    try {
      await deleteComment(commentId)

      if (isReply && parentId) {
        setComments(prevComments =>
          prevComments.map(comment => {
            if (comment.id === parentId) {
              return {
                ...comment,
                replies: (comment.replies || []).filter(reply => reply.id !== commentId)
              }
            }

            const removeReplyFromReplies = (replies) => {
              return replies.map(reply => {
                if (reply.id === commentId) {
                  return null
                }

                if (reply.replies && reply.replies.length > 0) {
                  return {
                    ...reply,
                    replies: removeReplyFromReplies(reply.replies).filter(Boolean)
                  }
                }

                return reply
              }).filter(Boolean)
            }

            if (comment.replies && comment.replies.length > 0) {
              return {
                ...comment,
                replies: removeReplyFromReplies(comment.replies)
              }
            }

            return comment
          })
        )
      } else {
        setComments(comments.filter(comment => comment.id !== commentId))
      }
    } catch (err) {
      setCommentError(err.message || 'Failed to delete comment')
      console.error('Error deleting comment:', err)
    }
  }

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
        <button className="more-options">•••</button>
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
          <span className="stat-icon">👁️</span>
          <span className="stat-text">{post.views_count?.toLocaleString() || 0} views</span>
        </div>
        <div className="stat-item">
          <span className="stat-icon">💬</span>
          <span className="stat-text">{post.comments_count || 0} comments</span>
        </div>
      </div>

      <div className="post-actions">
        <button
          className="action-btn"
          onClick={() => setShowComments(!showComments)}
          title="View comments"
        >
          <span className="action-icon">💬</span>
          <span className="action-text">Comment</span>
        </button>
        <button
          className="action-btn"
          onClick={() => navigate(`/article/${post.id}`)}
          title="Read full post"
        >
          <span className="action-icon">📖</span>
          <span className="action-text">Read</span>
        </button>
      </div>

      {showComments && (
        <div className="comments-section">
          <div className="comments-divider"></div>

          {user && (
            <form className="new-comment-form" onSubmit={handleCommentSubmit}>
              <img
                src={user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
                alt={user.name}
                className="comment-avatar"
              />
              <div className="comment-input-wrapper">
                <input
                  type="text"
                  className="comment-input"
                  placeholder="Write a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
                <button
                  type="submit"
                  className="comment-submit"
                  disabled={!newComment.trim()}
                >
                  Post
                </button>
              </div>
            </form>
          )}

          {!user && (
            <p className="login-prompt">
              <a href="/login">Log in</a> to comment
            </p>
          )}

          <div className="comments-list">
            {loadingComments && <p className="loading">Loading comments...</p>}
            {commentError && <p className="error">Error: {commentError}</p>}

            {!loadingComments && comments.length === 0 && (
              <p className="no-comments">No comments yet. Be the first to comment!</p>
            )}

            {comments.map((comment) => (
              <div key={comment.id} className="comment-item">
                <img
                  src={comment.author?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.author?.name}`}
                  alt={comment.author?.name}
                  className="comment-avatar"
                />
                <div className="comment-content">
                  <div className="comment-header">
                    <h4 className="comment-author">{comment.author_name || comment.author?.name || 'Anonymous'}</h4>
                    <span className="comment-time">
                      {comment.created_at ? new Date(comment.created_at).toLocaleDateString() : 'Unknown date'}
                    </span>
                  </div>
                  <p className="comment-text">{comment.content}</p>
                  <div className="comment-actions">
                    <button
                      className="comment-action"
                      onClick={() => {
                        setReplyingTo(replyingTo === comment.id ? null : comment.id)
                        setReplyContent('')
                      }}
                    >
                      {replyingTo === comment.id ? 'Cancel' : 'Reply'}
                    </button>
                    {comment.replies && comment.replies.length > 0 && (
                      <button
                        className="comment-action"
                        onClick={() => toggleReplies(comment.id)}
                      >
                        {expandedReplies[comment.id] ? 'Hide Replies' : `View Replies (${comment.replies.length})`}
                      </button>
                    )}
                    {user?.id === comment.author_id && (
                      <button
                        className="comment-action delete"
                        onClick={() => handleDeleteComment(comment.id, false, null)}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>

                {replyingTo === comment.id && (
                  <form
                    className="new-comment-form"
                    onSubmit={(e) => handleReplySubmit(e, comment.id)}
                    style={{ marginTop: '12px', paddingLeft: '48px' }}
                  >
                    <img
                      src={user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
                      alt={user.name}
                      className="comment-avatar"
                      style={{ width: '32px', height: '32px' }}
                    />
                    <div className="comment-input-wrapper">
                      <input
                        type="text"
                        className="comment-input"
                        placeholder="Write a reply..."
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        style={{ fontSize: '13px' }}
                      />
                      <button
                        type="submit"
                        className="comment-submit"
                        disabled={!replyContent.trim()}
                        style={{ padding: '8px 12px', fontSize: '13px' }}
                      >
                        Reply
                      </button>
                    </div>
                  </form>
                )}

                {comment.replies && comment.replies.length > 0 && expandedReplies[comment.id] && renderReplies(comment.replies)}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default PostCard