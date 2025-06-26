import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const FeedbackEditForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, axiosInstance, loading } = useAuth();

    const [feedback, setFeedback] = useState(null);
    const [strengths, setStrengths] = useState("");
    const [areasToImprove, setAreasToImprove] = useState("");
    const [sentiment, setSentiment] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        if (!loading && user) {
            fetchFeedbackDetails();
        } else if (!loading && !user) {
            navigate("/login");
        }
    }, [id, user, loading, navigate]);

    const fetchFeedbackDetails = async () => {
        setError("");
        try {
            const response = await axiosInstance.get(`/feedback/${id}/`);
            const feedbackData = response.data;

            
            if (user.role !== "manager" || feedbackData.manager !== user.user_id) {
                setError("You are not authorized to edit this feedback or it was not given by you.");
                setFeedback(null);
                setTimeout(() => navigate("/feedback"), 3000);
                return;
            }

            setFeedback(feedbackData);
            setStrengths(feedbackData.strengths || "");
            setAreasToImprove(feedbackData.areas_to_improve || "");
            setSentiment(feedbackData.sentiment || "");
        } catch (err) {
            console.error("Error fetching feedback details:", err.response?.data || err.message);
            setError(err.response?.data?.detail || "Failed to load feedback for editing. Please try again.");
            setFeedback(null);
            setTimeout(() => navigate("/feedback"), 3000);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");
        setError("");

        if (!strengths || !areasToImprove || !sentiment) {
            setError("Please fill in all fields (Strengths, Areas to Improve, Sentiment).");
            return;
        }

        try {
            const updatedFeedbackData = {
                strengths,
                areas_to_improve: areasToImprove,
                sentiment,
            };
            const response = await axiosInstance.patch(`/feedback/${id}/`, updatedFeedbackData);

            if (response.status === 200) {
                setMessage("Feedback updated successfully!");
                console.log("Feedback updated:", response.data);
                setTimeout(() => navigate("/feedback"), 2000);
            }
        } catch (err) {
            console.error("Error updating feedback:", err.response?.data || err.message);
            setError(err.response?.data?.detail || "Failed to update feedback. Please check your input.");
            if (err.response?.data) {
                const errorMessages = Object.entries(err.response.data).map(([key, value]) => {
                    const val = Array.isArray(value) ? value.join(", ") : value;
                    return `${key}: ${val}`;
                }).join("\n");
                setError(`Update failed: \n${errorMessages}`);
            }
        }
    };

    if (loading) {
        return (
            <p style={{ textAlign: "center", padding: "20px" }}>Loading feedback details...</p>
        );
    }

    if (error) {
        return (
            <p style={errorMessageStyle}>{error}</p>
        );
    }

    if (!feedback) {
        return (
            <p style={{ textAlign: "center", padding: "20px" }}>Feedback not found or you are not authorized to view it.</p>
        );
    }

    return (
        <div style={containerStyle}>
            <h2 style={headingStyle}>Edit Feedback for {feedback.employee_username}</h2>
            {message && <p style={successMessageStyle}>{message}</p>}
            <form onSubmit={handleSubmit} style={formStyle}>
                <div style={inputGroupStyle}>
                    <label style={labelStyle}>Given By:</label>
                    <input type="text" value={feedback.manager_username} style={disabledInputStyle} disabled />
                </div>
                <div style={inputGroupStyle}>
                    <label style={labelStyle}>Given To:</label>
                    <input type="text" value={feedback.employee_username} style={disabledInputStyle} disabled />
                </div>
                <div style={inputGroupStyle}>
                    <label htmlFor="strengths" style={labelStyle}>Strengths:</label>
                    <textarea
                        id="strengths"
                        value={strengths}
                        onChange={(e) => setStrengths(e.target.value)}
                        required
                        style={textareaStyle}
                        rows="4"
                    ></textarea>
                </div>
                <div style={inputGroupStyle}>
                    <label htmlFor="areasToImprove" style={labelStyle}>Areas to Improve:</label>
                    <textarea
                        id="areasToImprove"
                        value={areasToImprove}
                        onChange={(e) => setAreasToImprove(e.target.value)}
                        required
                        style={textareaStyle}
                        rows="4"
                    ></textarea>
                </div>
                <div style={inputGroupStyle}>
                    <label htmlFor="sentiment" style={labelStyle}>Overall Sentiment:</label>
                    <select
                        id="sentiment"
                        value={sentiment}
                        onChange={(e) => setSentiment(e.target.value)}
                        required
                        style={inputStyle}
                    >
                        <option value="">Select Sentiment</option>
                        <option value="Positive">Positive</option>
                        <option value="Neutral">Neutral</option>
                        <option value="Needs Improvement">Needs Improvement</option>
                    </select>
                </div>
                <div style={buttonGroupStyle}>
                    <button type="submit" style={saveButtonStyle}>Save Changes</button>
                    <button type="button" onClick={() => navigate("/feedback")} style={cancelButtonStyle}>Cancel</button>
                </div>
            </form>
        </div>
    );
};


const containerStyle = {
    padding: "30px",
    maxWidth: "600px",
    margin: "30px auto",
    border: "1px solid #eee",
    borderRadius: "8px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    backgroundColor: "#fdfdfd",
};

const headingStyle = {
    color: "#333",
    borderBottom: "2px solid #007bff",
    paddingBottom: "15px",
    marginBottom: "30px",
    textAlign: "center",
    fontSize: "2em",
};

const formStyle = {
    display: "flex",
    flexDirection: "column",
};

const inputGroupStyle = {
    marginBottom: "20px",
};

const labelStyle = {
    display: "block",
    marginBottom: "8px",
    fontWeight: "bold",
    color: "#555",
    fontSize: "1em",
};

const inputStyle = {
    width: "100%",
    padding: "10px 12px",
    border: "1px solid #ddd",
    borderRadius: "5px",
    fontSize: "1em",
    boxSizing: "border-box",
};

const disabledInputStyle = {
    ...inputStyle,
    backgroundColor: "#e9ecef",
    color: "#6c757d",
    cursor: "not-allowed",
};

const textareaStyle = {
    ...inputStyle,
    resize: "vertical",
    minHeight: "100px",
};

const buttonGroupStyle = {
    display: "flex",
    justifyContent: "flex-end",
    marginTop: "20px",
    gap: "10px", // Space between buttons
};

const saveButtonStyle = {
    backgroundColor: "#007bff", // Blue for Save
    color: "white",
    padding: "12px 20px",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "1.1em",
    fontWeight: "bold",
    transition: "background-color 0.3s ease",
};

const cancelButtonStyle = {
    backgroundColor: "#6c757d", // Grey for Cancel
    color: "white",
    padding: "12px 20px",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "1.1em",
    fontWeight: "bold",
    transition: "background-color 0.3s ease",
};

const successMessageStyle = {
    backgroundColor: "#d4edda",
    color: "#155724",
    border: "1px solid #c3e6cb",
    padding: "10px",
    borderRadius: "5px",
    marginBottom: "20px",
    textAlign: "center",
};

const errorMessageStyle = {
    backgroundColor: "#f8d7da",
    color: "#721c24",
    border: "1px solid #f5c6cb",
    padding: "10px",
    borderRadius: "5px",
    marginBottom: "20px",
    textAlign: "center",
};

export default FeedbackEditForm;