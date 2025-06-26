

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import ReactMarkdown from 'react-markdown'; 
import remarkGfm from 'remark-gfm';      

const CommentSection = ({ feedbackId, initialComments, onCommentAdded }) => {
    const { axiosInstance } = useAuth();
    const [newComment, setNewComment] = useState('');
    const [isMarkdown, setIsMarkdown] = useState(false); 
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmitComment = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        if (!newComment.trim()) {
            setError('Comment cannot be empty.');
            return;
        }

        try {
            const response = await axiosInstance.post('/comments/', {
                feedback: feedbackId,
                content: newComment,
                is_markdown: isMarkdown,
            });
            if (response.status === 201) {
                setMessage('Comment added successfully!');
                setNewComment(''); 
                setIsMarkdown(false); 
                onCommentAdded(); 
            }
        } catch (err) {
            console.error('Error adding comment:', err.response?.data || err.message);
            setError(err.response?.data?.detail || 'Failed to add comment.');
        }
    };

    const commentSectionStyle = {
        marginTop: '20px',
        borderTop: '1px solid #eee',
        paddingTop: '20px',
    };

    const commentItemStyle = {
        backgroundColor: '#f9f9f9',
        border: '1px solid #e0e0e0',
        borderRadius: '5px',
        padding: '10px 15px',
        marginBottom: '10px',
        fontSize: '0.9em',
        wordBreak: 'break-word',
    };

    const commentMetaStyle = {
        fontSize: '0.8em',
        color: '#666',
        marginBottom: '5px',
        borderBottom: '1px dashed #ddd',
        paddingBottom: '3px',
    };

    const commentFormStyle = {
        marginTop: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
    };

    const textareaStyle = {
        width: '100%',
        padding: '10px',
        border: '1px solid #ddd',
        borderRadius: '5px',
        minHeight: '80px',
        resize: 'vertical',
        boxSizing: 'border-box',
    };

    const submitButtonStyle = {
        backgroundColor: '#007bff',
        color: 'white',
        padding: '10px 15px',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '1em',
        fontWeight: 'bold',
        transition: 'background-color 0.3s ease',
        alignSelf: 'flex-end',
    };

    const toggleMarkdownStyle = {
        display: 'flex',
        alignItems: 'center',
        gap: '5px',
        fontSize: '0.9em',
        color: '#555',
    };

    const messageStyle = {
        backgroundColor: '#d4edda',
        color: '#155724',
        border: '1px solid #c3e6cb',
        padding: '10px',
        borderRadius: '5px',
        marginBottom: '10px',
        textAlign: 'center',
    };

    const errorStyle = {
        backgroundColor: '#f8d7da',
        color: '#721c24',
        border: '1px solid #f5c6cb',
        padding: '10px',
        borderRadius: '5px',
        marginBottom: '10px',
        textAlign: 'center',
    };

    return (
        <div style={commentSectionStyle}>
            <h4>Comments:</h4>
            {initialComments.length === 0 ? (
                <p style={{ color: '#777', fontSize: '0.9em' }}>No comments yet.</p>
            ) : (
                initialComments.map(comment => (
                    <div key={comment.id} style={commentItemStyle}>
                        <div style={commentMetaStyle}>
                            <strong>{comment.author_username}</strong> on {new Date(comment.created_at).toLocaleDateString()}
                        </div>
                        {comment.is_markdown ? (
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {comment.content}
                            </ReactMarkdown>
                        ) : (
                            <p>{comment.content}</p>
                        )}
                    </div>
                ))
            )}

            <form onSubmit={handleSubmitComment} style={commentFormStyle}>
                <h5>Add a Comment:</h5>
                {message && <p style={messageStyle}>{message}</p>}
                {error && <p style={errorStyle}>{error}</p>}
                <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Type your comment here..."
                    style={textareaStyle}
                ></textarea>
                <label style={toggleMarkdownStyle}>
                    <input
                        type="checkbox"
                        checked={isMarkdown}
                        onChange={(e) => setIsMarkdown(e.target.checked)}
                    />
                    Enable Markdown
                </label>
                <button type="submit" style={submitButtonStyle}>Post Comment</button>
            </form>
        </div>
    );
};

export default CommentSection;