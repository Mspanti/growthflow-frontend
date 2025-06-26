

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const PeerFeedbackList = () => {
    const { user, axiosInstance, loading } = useAuth();
    const navigate = useNavigate();
    const [peerFeedbackList, setPeerFeedbackList] = useState([]);
    const [error, setError] = useState('');
    const [listLoading, setListLoading] = useState(true);

    useEffect(() => {
        if (!loading) {
            if (!user) {
                navigate("/login"); 
            } else {
                fetchPeerFeedback();
            }
        }
    }, [user, loading, navigate]);

    const fetchPeerFeedback = async () => {
        setError('');
        setListLoading(true);
        try {
            const response = await axiosInstance.get('/peer-feedback/');
            setPeerFeedbackList(response.data);
            setListLoading(false);
        } catch (err) {
            console.error('Error fetching peer feedback:', err.response?.data || err.message);
            setError(err.response?.data?.detail || 'Failed to load peer feedback.');
            setListLoading(false);
        }
    };

    if (loading || listLoading) {
        return <p style={{ textAlign: 'center', padding: '20px' }}>Loading peer feedback...</p>;
    }

    if (error) {
        return <p style={errorMessageStyle}>{error}</p>;
    }

    if (!user) {
        return <p style={errorMessageStyle}>Access Denied. Please log in.</p>;
    }

    const containerStyle = {
        padding: '20px',
        maxWidth: '1000px',
        margin: '20px auto',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
    };

    const headingStyle = {
        color: '#333',
        borderBottom: '2px solid #007bff',
        paddingBottom: '10px',
        marginBottom: '20px',
        textAlign: 'center',
    };

    const peerFeedbackCardStyle = {
        backgroundColor: '#fff',
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '15px 20px',
        marginBottom: '15px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        borderLeft: '5px solid #20c997', // Teal/Green highlight
    };

    const anonymousStyle = {
        fontStyle: 'italic',
        color: '#888',
    };

    const errorMessageStyle = {
        backgroundColor: '#f8d7da',
        color: '#721c24',
        border: '1px solid #f5c6cb',
        padding: '10px',
        borderRadius: '5px',
        marginBottom: '15px',
        textAlign: 'center',
    };

    return (
        <div style={containerStyle}>
            <h2 style={headingStyle}>Peer Feedback Overview</h2>
            
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                <p style={{ color: '#555', fontSize: '1.1em' }}>Want to give feedback to a colleague? <Link to="/submit-peer-feedback" style={{ color: '#007bff', textDecoration: 'none', fontWeight: 'bold' }}>Submit Peer Feedback</Link></p>
            </div>

            {peerFeedbackList.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#777', fontSize: '1.1em', marginTop: '30px' }}>
                    No peer feedback available for you.
                </p>
            ) : (
                peerFeedbackList.map(feedback => (
                    <div key={feedback.id} style={peerFeedbackCardStyle}>
                        <p><strong>Feedback To:</strong> {feedback.receiver_username}</p>
                        <p>
                            <strong>Feedback From:</strong>{" "}
                            {feedback.is_anonymous && feedback.giver !== user.user_id ? ( // Only show "Anonymous" if it's anonymous AND not given by the current user
                                <span style={anonymousStyle}>Anonymous</span>
                            ) : (
                                feedback.giver_username
                            )}
                        </p>
                        <p><strong>Date:</strong> {new Date(feedback.created_at).toLocaleDateString()}</p>
                        <p><strong>Feedback:</strong> {feedback.feedback_text}</p>
                    </div>
                ))
            )}
        </div>
    );
};

export default PeerFeedbackList;