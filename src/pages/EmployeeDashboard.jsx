

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext'; 
import { useNavigate, Link } from 'react-router-dom';

const EmployeeDashboard = () => {
    
    const { user, axiosInstance, loading, logoutUser } = useAuth();
    const navigate = useNavigate();

    const [receivedFeedback, setReceivedFeedback] = useState([]);
    const [feedbackLoading, setFeedbackLoading] = useState(true);
    const [error, setError] = useState("");

   
    const errorMessageStyle = {
        backgroundColor: "#f8d7da",
        color: "#721c24",
        border: "1px solid #f5c6cb",
        padding: "10px",
        borderRadius: "5px",
        marginBottom: "15px",
        textAlign: "center",
        fontWeight: "bold", 
    };

  
    const fetchReceivedFeedback = useCallback(async () => {
        setError(""); // Clear previous errors
        setFeedbackLoading(true); // Indicate loading
        try {
           
            const response = await axiosInstance.get("/feedback/");
            setReceivedFeedback(response.data);
            setFeedbackLoading(false);
        } catch (err) {
            console.error("Error fetching employee feedback:", err.response?.data || err.message);
           
            if (err.response && err.response.status === 401) {
                setError("Your session has expired. Please log in again.");
                logoutUser(); // Force logout if 401
            } else {
                setError(err.response?.data?.detail || "Failed to load received feedback. Please try again.");
            }
            setFeedbackLoading(false);
        }
    }, [axiosInstance, logoutUser]); 

  
    const handleAcknowledge = async (feedbackId) => {
        setError(""); // Clear errors before new action
        try {
            const response = await axiosInstance.patch(`/feedback/${feedbackId}/acknowledge/`, { is_acknowledged: true });
            if (response.status === 200) {
                setReceivedFeedback(prevList =>
                    prevList.map(feedback =>
                        feedback.id === feedbackId ? { ...feedback, is_acknowledged: true } : feedback
                    )
                );
                alert("Feedback acknowledged successfully!"); 
            }
        } catch (err) {
            console.error("Error acknowledging feedback:", err.response?.data || err.message);
            setError(err.response?.data?.detail || "Failed to acknowledge feedback.");
        }
    };

    
    useEffect(() => {
        
        if (!loading) {
            if (!user || user.role !== 'employee') {
                console.log("Redirecting: User not logged in or not an employee.");
                navigate("/login"); 
            } else {
               
                fetchReceivedFeedback();
            }
        }
    }, [user, loading, navigate, fetchReceivedFeedback]);

    
    if (loading || feedbackLoading) {
        return (
            <p style={{ textAlign: "center", padding: "20px", fontSize: "1.2em", color: "#555" }}>
                Loading your feedback timeline...
            </p>
        );
    }

    
    if (!user || user.role !== 'employee') {
        return (
            <div style={errorMessageStyle}>
                <p>Access Denied. You must be logged in as an employee to view this page.</p>
                <Link to="/login" style={{ color: "#007bff", textDecoration: "underline" }}>Go to Login</Link>
            </div>
        );
    }

   
    return (
        <div style={{
            padding: '20px',
            maxWidth: '900px',
            margin: '20px auto',
            backgroundColor: '#fdfdfd',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            fontFamily: '"Inter", sans-serif' // Apply Inter font
        }}>
            <h1 style={{ textAlign: 'center', color: '#333', marginBottom: '30px', borderBottom: '2px solid #007bff', paddingBottom: '10px' }}>Your Feedback Timeline</h1>

            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                <p style={{ color: '#555', fontSize: '1.1em' }}>Need more feedback? <Link to="/request-feedback" style={{ color: '#007bff', textDecoration: 'none', fontWeight: 'bold' }}>Request it here!</Link></p>
                <p style={{ color: '#555', fontSize: '1.1em' }}>See feedback given by your peers: <Link to="/peer-feedback" style={{ color: '#007bff', textDecoration: 'none', fontWeight: 'bold' }}>View Peer Feedback</Link></p>
            </div>

            {error && <p style={errorMessageStyle}>{error}</p>} {/* Display fetch error */}

            {receivedFeedback.length === 0 ? (
                <p style={{ textAlign: "center", color: "#777", fontSize: "1.1em", marginTop: "30px" }}>
                    No feedback received yet.
                </p>
            ) : (
                receivedFeedback
                    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at)) // Sort by date descending
                    .map((feedback) => (
                        <div key={feedback.id} style={{
                            backgroundColor: '#fff',
                            border: '1px solid #e0e0e0',
                            borderRadius: '6px',
                            marginBottom: '15px',
                            padding: '15px 20px',
                            position: 'relative',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                            borderLeft: feedback.is_acknowledged ? '5px solid #28a745' : '5px solid #ffc107', // Green if acknowledged, yellow if pending
                        }}>
                            <span style={{
                                backgroundColor: '#007bff',
                                color: 'white',
                                padding: '5px 10px',
                                borderRadius: '4px',
                                fontSize: '0.85em',
                                fontWeight: 'bold',
                                position: 'absolute',
                                top: '-15px',
                                left: '20px',
                                zIndex: 1,
                            }}>{new Date(feedback.created_at).toLocaleDateString()}</span>
                            <h3 style={{ marginTop: '20px', marginBottom: '10px', color: '#007bff' }}>
                                Feedback from {feedback.manager_username || "N/A"}
                            </h3> {/* Use manager_username if available, else N/A */}
                            <p><strong>Strengths:</strong> {feedback.strengths}</p>
                            <p><strong>Areas to Improve:</strong> {feedback.areas_to_improve}</p>
                            {feedback.sentiment && <p><strong>Sentiment:</strong> {feedback.sentiment}</p>}
                            <p>
                                <strong>Status:</strong>{" "}
                                <span style={{ fontWeight: "bold", color: feedback.is_acknowledged ? "#28a745" : "#ffc107" }}>
                                    {feedback.is_acknowledged ? "Acknowledged" : "Pending Acknowledgment"}
                                </span>
                            </p>
                            {!feedback.is_acknowledged && (
                                <button
                                    onClick={() => handleAcknowledge(feedback.id)}
                                    style={{
                                        backgroundColor: "#28a745",
                                        color: "white",
                                        padding: "8px 15px",
                                        border: "none",
                                        borderRadius: "5px",
                                        cursor: "pointer",
                                        fontSize: "0.9em",
                                        fontWeight: "bold",
                                        marginTop: "15px",
                                        transition: "background-color 0.3s ease",
                                        boxShadow: "0 2px 4px rgba(0,0,0,0.2)" // Added shadow
                                    }}
                                >
                                    Acknowledge Feedback
                                </button>
                            )}
                        </div>
                    ))
            )}
        </div>
    );
};

export default EmployeeDashboard;