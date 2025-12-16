import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSidebar } from '../contexts/SidebarContext'
import { useAuth } from '../contexts/AuthContext'
import { getPostById } from '../api/postService'
import { getCommentsByPostId, createComment, deleteComment, createReply, updateComment } from '../api/commentService'
import './ArticleDetail.css'
import '../styles/CommonStyles.css'

function ArticleDetail() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [article, setArticle] = useState(null)
    const [comments, setComments] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [newComment, setNewComment] = useState('')
    const [replyContent, setReplyContent] = useState({})
    const [replyingTo, setReplyingTo] = useState(null)
    const [expandedReplies, setExpandedReplies] = useState({})
    const [editingCommentId, setEditingCommentId] = useState(null)
    const [editingContent, setEditingContent] = useState({})
    const fetchedRef = useRef(false)

    const { isLeftSidebarOpen, areBothSidebarsClosed } = useSidebar()
    const { user } = useAuth()

    useEffect(() => {
        const fetchArticleAndComments = async () => {
            try {
                setLoading(true)
                setError(null)

                const articleResponse = await getPostById(id)
                const articleData = articleResponse.data || articleResponse
                setArticle(articleData)

                await fetchComments()
            } catch (err) {
                setError(err.message || 'Failed to fetch article')
                console.error('Error fetching article and comments:', err)
            } finally {
                setLoading(false)
            }
        }

        if (id && !fetchedRef.current) {
            fetchedRef.current = true
            fetchArticleAndComments()
        }
    }, [id])

    const fetchComments = async () => {
        try {
            const response = await getCommentsByPostId(id)
            const commentsArray = Array.isArray(response) ? response : []

            setComments(commentsArray)
        } catch (err) {
            console.error('Error fetching comments:', err)
        }
    }

    const toggleReplies = (commentId) => {
        setExpandedReplies(prev => ({
            ...prev,
            [commentId]: !prev[commentId]
        }))
    }

    const handleAddComment = async () => {
        if (!newComment.trim()) return

        try {
            const response = await createComment({
                post_id: parseInt(id),
                content: newComment
            })

            const newCommentData = response.data || response
            setComments(prev => [{ ...newCommentData, replies: [] }, ...prev])
            setNewComment('')
        } catch (err) {
            console.error('Error adding comment:', err)
            alert('Failed to add comment: ' + (err.message || 'Unknown error'))
        }
    }

    const handleDeleteComment = async (commentId) => {
        if (!window.confirm('Are you sure you want to delete this comment?')) return

        try {
            await deleteComment(commentId)

            setComments(prev => {
                const removeComment = (commentsList) => {
                    return commentsList.map(comment => {
                        if (comment.id === commentId) {
                            return null
                        }

                        if (comment.replies && comment.replies.length > 0) {
                            return {
                                ...comment,
                                replies: removeComment(comment.replies).filter(Boolean)
                            }
                        }

                        return comment
                    }).filter(Boolean)
                }

                return removeComment(prev)
            })
        } catch (err) {
            console.error('Error deleting comment:', err)
            alert('Failed to delete comment: ' + (err.message || 'Unknown error'))
        }
    }

    const handleAddReply = async (parentId) => {
        const content = replyContent[parentId]
        if (!content?.trim()) return

        try {
            const response = await createReply(parentId, {
                post_id: parseInt(id),
                content: content
            })

            const newReplyData = response.data || response

            setComments(prev =>
                prev.map(comment => {
                    if (comment.id === parentId) {
                        return {
                            ...comment,
                            replies: [...(comment.replies || []), newReplyData]
                        }
                    }

                    const updateReplies = (replies) => {
                        return replies.map(reply => {
                            if (reply.id === parentId) {
                                return {
                                    ...reply,
                                    replies: [...(reply.replies || []), newReplyData]
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

            setReplyContent(prev => ({ ...prev, [parentId]: '' }))
            setReplyingTo(null)
        } catch (err) {
            console.error('Error adding reply:', err)
            alert('Failed to add reply: ' + (err.message || 'Unknown error'))
        }
    }

    const handleUpdateComment = async (commentId, content) => {
        if (!content?.trim()) return

        try {
            const response = await updateComment(commentId, content)
            const updatedComment = response.data || response

            setComments(prev => {
                const updateCommentInList = (commentsList) => {
                    return commentsList.map(comment => {
                        if (comment.id === commentId) {
                            return { ...comment, content: updatedComment.content || content }
                        }

                        if (comment.replies && comment.replies.length > 0) {
                            return {
                                ...comment,
                                replies: updateCommentInList(comment.replies)
                            }
                        }

                        return comment
                    })
                }

                return updateCommentInList(prev)
            })

            setEditingCommentId(null)
            setEditingContent(prev => {
                const newContent = { ...prev }
                delete newContent[commentId]
                return newContent
            })
        } catch (err) {
            console.error('Error updating comment:', err)
            alert('Failed to update comment: ' + (err.message || 'Unknown error'))
        }
    }

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    const renderReplies = (replies, depth = 1) => {
        if (!replies || replies.length === 0) return null;

        return (
            <div className="replies" style={{ marginLeft: `${depth * 20}px` }}>
                {replies.map((reply) => (
                    <div key={reply.id} className="comment reply">
                        <div className="comment-header">
                            <div className="author-avatar">
                                {(reply.author_name || reply.author?.name || 'U')?.charAt(0) || 'U'}
                            </div>
                            <div className="comment-info">
                                <div className="comment-author">{reply.author_name || reply.author?.name || 'Unknown User'}</div>
                                <div className="comment-date">{formatDate(reply.created_at)}</div>
                            </div>
                        </div>
                        <div className="comment-content">
                            {editingCommentId === reply.id ? (
                                <textarea
                                    className="comment-textarea"
                                    value={editingContent[reply.id] || ''}
                                    onChange={(e) => setEditingContent(prev => ({
                                        ...prev,
                                        [reply.id]: e.target.value
                                    }))}
                                    rows={4}
                                />
                            ) : (
                                reply.content
                            )}
                        </div>

                        {editingCommentId === reply.id ? (
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '12px' }}>
                                <button
                                    className="common-button"
                                    onClick={() => {
                                        setEditingCommentId(null);
                                        setEditingContent(prev => {
                                            const newContent = { ...prev };
                                            delete newContent[reply.id];
                                            return newContent;
                                        });
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="submit-comment-btn common-button primary"
                                    onClick={() => handleUpdateComment(reply.id, editingContent[reply.id])}
                                    disabled={!(editingContent[reply.id] || '').trim()}
                                >
                                    Save Changes
                                </button>
                            </div>
                        ) : (
                            <div className="comment-actions">
                                <button
                                    className="comment-action"
                                    onClick={() => {
                                        setReplyingTo(replyingTo === reply.id ? null : reply.id)
                                        setReplyContent(prev => ({
                                            ...prev,
                                            [reply.id]: ''
                                        }))
                                    }}
                                >
                                    Reply
                                </button>
                                {isCommentAuthor(user, reply) && (
                                    <>
                                        <button
                                            className="comment-action"
                                            onClick={() => {
                                                setEditingCommentId(editingCommentId === reply.id ? null : reply.id);
                                                setEditingContent(prev => ({
                                                    ...prev,
                                                    [reply.id]: reply.content
                                                }));
                                            }}
                                            title="Edit reply"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className="comment-action delete"
                                            onClick={() => handleDeleteComment(reply.id)}
                                            title="Delete reply"
                                        >
                                            Delete
                                        </button>
                                    </>
                                )}
                            </div>
                        )}

                        {replyingTo === reply.id && (
                            <div className="reply-form">
                                <textarea
                                    className="comment-textarea"
                                    placeholder="Write a reply..."
                                    value={replyContent[reply.id] || ''}
                                    onChange={(e) => setReplyContent(prev => ({
                                        ...prev,
                                        [reply.id]: e.target.value
                                    }))}
                                    rows={3}
                                />
                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                    <button
                                        className="common-button"
                                        onClick={() => {
                                            setReplyingTo(null)
                                            setReplyContent(prev => {
                                                const newContent = { ...prev }
                                                delete newContent[reply.id]
                                                return newContent
                                            })
                                        }}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        className="submit-comment-btn common-button primary"
                                        onClick={() => handleAddReply(reply.id)}
                                        disabled={!(replyContent[reply.id] || '').trim()}
                                    >
                                        Post Reply
                                    </button>
                                </div>
                            </div>
                        )}

                        {reply.replies && reply.replies.length > 0 && renderReplies(reply.replies, depth + 1)}
                    </div>
                ))}
            </div>
        );
    };

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
                    <div className="loading">Loading article...</div>
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

    if (!article) {
        return (
            <div className="common-page" style={{
                marginLeft: isLeftSidebarOpen ? '240px' : '0',
                width: '100%'
            }}>
                <div className="common-content" style={{
                    maxWidth: '100%',
                    padding: '40px 20px'
                }}>
                    <div className="error">Article not found</div>
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
                    <h1 className="page-title">Article</h1>
                    <p className="page-subtitle">Read and engage with this story</p>
                </div>

                <div className="article common-card">
                    <div className="article-top-header">
                        <button
                            className="back-to-feed-btn"
                            onClick={() => navigate(-1)}
                        >
                            ← Back to Feed
                        </button>
                    </div>

                    <div className="article-author-section">
                        <div className="author-info-top">
                            <div className="author-avatar-large">
                                {(article.author_full_name || article.author?.name)?.charAt(0) || 'A'}
                            </div>
                            <div className="author-details-top">
                                <div className="author-name-top">{article.author_full_name || article.author?.name || 'Unknown Author'}</div>
                                <div className="article-date-top">{formatDate(article.created_at)}</div>
                            </div>
                        </div>
                    </div>

                    <div className="article-header">
                        <h1 className="article-title">{article.title || 'Untitled'}</h1>
                    </div>

                    <div className="article-content">
                        {article.content?.split('\n').map((paragraph, index) => (
                            <p key={index}>{paragraph}</p>
                        ))}
                    </div>

                    <div className="article-actions"></div>
                </div>

                <div className="comments-section common-card">
                    <h2 className="section-title">Comments ({comments.reduce((acc, comment) => acc + 1 + (comment.replies?.length || 0), 0)})</h2>

                    <div className="comment-form">
                        <textarea
                            className="comment-textarea"
                            placeholder="Write a comment..."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            rows={4}
                        />
                        <button
                            className="submit-comment-btn common-button primary"
                            onClick={handleAddComment}
                            disabled={!newComment.trim()}
                        >
                            Post Comment
                        </button>
                    </div>

                    <div className="comments-list">
                        {comments.map((comment) => (
                            <div key={comment.id} className="comment">
                                <div className="comment-header">
                                    <div className="author-avatar">
                                        {(comment.author_name || comment.author?.name || 'U')?.charAt(0) || 'U'}
                                    </div>
                                    <div className="comment-info">
                                        <div className="comment-author">{comment.author_name || comment.author?.name || 'Unknown User'}</div>
                                        <div className="comment-date">{formatDate(comment.created_at)}</div>
                                    </div>
                                </div>
                                <div className="comment-content">
                                    {editingCommentId === comment.id ? (
                                        <textarea
                                            className="comment-textarea"
                                            value={editingContent[comment.id] || ''}
                                            onChange={(e) => setEditingContent(prev => ({
                                                ...prev,
                                                [comment.id]: e.target.value
                                            }))}
                                            rows={4}
                                        />
                                    ) : (
                                        comment.content
                                    )}
                                </div>

                                {editingCommentId === comment.id ? (
                                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '12px' }}>
                                        <button
                                            className="common-button"
                                            onClick={() => {
                                                setEditingCommentId(null);
                                                setEditingContent(prev => {
                                                    const newContent = { ...prev };
                                                    delete newContent[comment.id];
                                                    return newContent;
                                                });
                                            }}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            className="submit-comment-btn common-button primary"
                                            onClick={() => handleUpdateComment(comment.id, editingContent[comment.id])}
                                            disabled={!(editingContent[comment.id] || '').trim()}
                                        >
                                            Save Changes
                                        </button>
                                    </div>
                                ) : (
                                    <div className="comment-actions">
                                        <button
                                            className="comment-action"
                                            onClick={() => {
                                                setReplyingTo(replyingTo === comment.id ? null : comment.id)
                                                setReplyContent(prev => ({
                                                    ...prev,
                                                    [comment.id]: ''
                                                }))
                                            }}
                                        >
                                            Reply
                                        </button>
                                        {isCommentAuthor(user, comment) && (
                                            <>
                                                <button
                                                    className="comment-action"
                                                    onClick={() => {
                                                        setEditingCommentId(editingCommentId === comment.id ? null : comment.id);
                                                        setEditingContent(prev => ({
                                                            ...prev,
                                                            [comment.id]: comment.content
                                                        }));
                                                    }}
                                                    title="Edit comment"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    className="comment-action delete"
                                                    onClick={() => handleDeleteComment(comment.id)}
                                                    title="Delete comment"
                                                >
                                                    Delete
                                                </button>
                                            </>
                                        )}
                                        {comment.replies && comment.replies.length > 0 && (
                                            <button
                                                className="comment-action"
                                                onClick={() => toggleReplies(comment.id)}
                                            >
                                                {expandedReplies[comment.id] ? 'Hide Replies' : `View Replies `}
                                            </button>
                                        )}
                                    </div>
                                )}

                                {replyingTo === comment.id && (
                                    <div className="reply-form">
                                        <textarea
                                            className="comment-textarea"
                                            placeholder="Write a reply..."
                                            value={replyContent[comment.id] || ''}
                                            onChange={(e) => setReplyContent(prev => ({
                                                ...prev,
                                                [comment.id]: e.target.value
                                            }))}
                                            rows={3}
                                        />
                                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                            <button
                                                className="common-button"
                                                onClick={() => {
                                                    setReplyingTo(null)
                                                    setReplyContent(prev => {
                                                        const newContent = { ...prev }
                                                        delete newContent[comment.id]
                                                        return newContent
                                                    })
                                                }}
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                className="submit-comment-btn common-button primary"
                                                onClick={() => handleAddReply(comment.id)}
                                                disabled={!(replyContent[comment.id] || '').trim()}
                                            >
                                                Post Reply
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {comment.replies && comment.replies.length > 0 && expandedReplies[comment.id] && renderReplies(comment.replies)}
                            </div>
                        ))}

                        {comments.length === 0 && (
                            <div className="no-comments" style={{
                                textAlign: 'center',
                                padding: '40px 20px',
                                color: 'rgba(255, 255, 255, 0.6)'
                            }}>
                                No comments yet. Be the first to comment!
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

// Helper function to check if user is the author of a comment
const isCommentAuthor = (user, comment) => {
    if (!user || !comment) return false;

    // Get user ID (could be number or string)
    const userId = String(user.id);

    // Try multiple possible property names for author ID
    const authorId = String(
        comment.author?.id ||
        comment.author_id ||
        comment.authorId ||
        comment.user_id ||
        ''
    );

    return userId === authorId && userId !== '';
};

export default ArticleDetail