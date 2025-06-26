

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import CommentSection from './CommentSection'; 


import {
    Container,
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    Button,
    CircularProgress,
    Alert,
    IconButton,
    Collapse 
} from '@mui/material';


import EditIcon from '@mui/icons-material/Edit';
import DownloadIcon from '@mui/icons-material/Download';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

const FeedbackList = () => {
    const { user, axiosInstance, loading: authLoading } = useAuth(); 
    const navigate = useNavigate();
    const [feedbackList, setFeedbackList] = useState([]);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [listLoading, setListLoading] = useState(false); 
    const [showCommentsFor, setShowCommentsFor] = useState(null); 

    useEffect(() => {
        if (!authLoading && user) {
            fetchFeedback();
        } else if (!authLoading && !user) {
            navigate("/login");
        }
    }, [user, authLoading, navigate]);

    const fetchFeedback = async () => {
        setError("");
        setMessage(""); 
        setListLoading(true); 
        try {
            const response = await axiosInstance.get("/feedback/");
            setFeedbackList(response.data);
            setListLoading(false); // End loading
        } catch (err) {
            console.error("Error fetching feedback:", err.response?.data || err.message);
            setError(err.response?.data?.detail || "Failed to load feedback. Please try again.");
            setListLoading(false); // End loading even on error
        }
    };

    const handleAcknowledge = async (feedbackId) => {
        setError("");
        setMessage("");
        try {
            const response = await axiosInstance.patch(`/feedback/${feedbackId}/acknowledge/`, { is_acknowledged: true });
            if (response.status === 200) {
                setMessage("Feedback acknowledged successfully!");
                setFeedbackList((prevList) =>
                    prevList.map((feedback) =>
                        feedback.id === feedbackId ? { ...feedback, is_acknowledged: true } : feedback
                    )
                );
            }
        } catch (err) {
            console.error("Error acknowledging feedback:", err.response?.data || err.message);
            setError(err.response?.data?.detail || "Failed to acknowledge feedback.");
        }
    };

    const handleEdit = (feedbackId) => {
        navigate(`/edit-feedback/${feedbackId}`);
    };

    const handleExportPdf = async (feedbackId, employeeUsername) => {
        setError("");
        setMessage("");
        try {
            const response = await axiosInstance.get(`/feedback/${feedbackId}/export-pdf/`, {
                responseType: 'blob',
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `feedback_${employeeUsername}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);
            setMessage('PDF exported successfully!');
        } catch (err) {
            console.error('Error exporting PDF:', err.response?.data || err.message);
            setError('Failed to export PDF. Please try again.');
        }
    };

   
    if (authLoading || listLoading) {
        return (
            <Container sx={{ mt: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
                <CircularProgress sx={{ mb: 2 }} />
                <Typography variant="h6" color="text.secondary">Loading feedback list...</Typography>
            </Container>
        );
    }

    if (!user) {
        return (
            <Container sx={{ mt: 4, textAlign: 'center' }}>
                <Alert severity="error" sx={{ mb: 2, display: 'inline-flex', alignItems: 'center' }}>
                    <Typography variant="body1" sx={{ mr: 1 }}>Please log in to view feedback.</Typography>
                </Alert>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4, py: 3, borderRadius: 2, boxShadow: 3, bgcolor: 'background.paper' }}>
            <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4, fontWeight: 'bold', color: 'text.primary', textAlign: 'center', borderBottom: '2px solid', borderColor: 'primary.main', pb: 1 }}>
                Your Feedback Overview
            </Typography>

            {message && (
                <Alert severity="success" sx={{ mb: 3 }}>
                    {message}
                </Alert>
            )}
            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            {feedbackList.length === 0 ? (
                <Typography variant="h6" color="text.secondary" sx={{ textAlign: 'center', mt: 5 }}>
                    No feedback available for you.
                </Typography>
            ) : (
                <Grid container spacing={3}>
                    {feedbackList.map((feedback) => (
                        <Grid item xs={12} sm={6} md={4} key={feedback.id}>
                            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderRadius: 2, boxShadow: 3, transition: 'transform 0.2s ease-in-out', '&:hover': { transform: 'translateY(-5px)' } }}>
                                <CardContent>
                                    <Typography variant="h6" component="div" sx={{ color: 'primary.dark', mb: 2, borderBottom: '1px dashed #eee', pb: 1 }}>
                                        Feedback Details
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                        <strong>From:</strong> {feedback.manager_username}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                        <strong>To:</strong> {feedback.employee_username}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                        <strong>Date:</strong> {new Date(feedback.created_at).toLocaleDateString()}
                                    </Typography>

                                    <Box sx={{ my: 2 }}>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'text.primary' }}>Strengths:</Typography>
                                        <Box sx={{ mt: 0.5, pl: 1.5, borderLeft: '3px solid', borderColor: 'primary.light', whiteSpace: 'pre-wrap', maxHeight: 100, overflowY: 'auto', bgcolor: 'grey.50', p: 1, borderRadius: 1 }}>
                                            <Typography variant="body2">{feedback.strengths}</Typography>
                                        </Box>
                                    </Box>

                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'text.primary' }}>Areas to Improve:</Typography>
                                        <Box sx={{ mt: 0.5, pl: 1.5, borderLeft: '3px solid', borderColor: 'warning.light', whiteSpace: 'pre-wrap', maxHeight: 100, overflowY: 'auto', bgcolor: 'grey.50', p: 1, borderRadius: 1 }}>
                                            <Typography variant="body2">{feedback.areas_to_improve}</Typography>
                                        </Box>
                                    </Box>

                                    {feedback.sentiment && (
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                            <strong>Sentiment:</strong> {feedback.sentiment}
                                        </Typography>
                                    )}
                                    <Typography variant="body2" sx={{ mb: 2 }}>
                                        <strong>Status:</strong>{" "}
                                        <Typography component="span" sx={{ fontWeight: "bold", color: feedback.is_acknowledged ? "success.main" : "warning.main" }}>
                                            {feedback.is_acknowledged ? " Acknowledged" : " Pending Acknowledgment"}
                                        </Typography>
                                    </Typography>

                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                                        {/* Acknowledge Button for Employees */}
                                        {user.role === "employee" && !feedback.is_acknowledged && Number(feedback.employee) === Number(user.user_id) && (
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                size="small"
                                                onClick={() => handleAcknowledge(feedback.id)}
                                                startIcon={<CheckCircleOutlineIcon />}
                                                sx={{ flexGrow: 1 }}
                                            >
                                                Acknowledge
                                            </Button>
                                        )}

                                        {/* Edit Button for Managers */}
                                        {user.role === "manager" && Number(feedback.manager) === Number(user.user_id) && (
                                            <Button
                                                variant="contained"
                                                color="warning"
                                                size="small"
                                                onClick={() => handleEdit(feedback.id)}
                                                startIcon={<EditIcon />}
                                                sx={{ flexGrow: 1 }}
                                            >
                                                Edit
                                            </Button>
                                        )}

                                        {/* PDF Export Button for Managers */}
                                        {user.role === "manager" && Number(feedback.manager) === Number(user.user_id) && (
                                            <Button
                                                variant="contained"
                                                color="info" // Using info color for PDF export
                                                size="small"
                                                onClick={() => handleExportPdf(feedback.id, feedback.employee_username)}
                                                startIcon={<DownloadIcon />}
                                                sx={{ flexGrow: 1 }}
                                            >
                                                Export PDF
                                            </Button>
                                        )}
                                    </Box>

                                    {/* Toggle Comments Button */}
                                    <Box sx={{ mt: 2, textAlign: 'right' }}>
                                        <Button
                                            variant="outlined"
                                            color="secondary"
                                            size="small"
                                            onClick={() => setShowCommentsFor(showCommentsFor === feedback.id ? null : feedback.id)}
                                            startIcon={showCommentsFor === feedback.id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                        >
                                            Comments ({feedback.comments ? feedback.comments.length : 0})
                                        </Button>
                                    </Box>

                                </CardContent>
                                {/* Render CommentSection if toggled */}
                                <Collapse in={showCommentsFor === feedback.id} timeout="auto" unmountOnExit>
                                    <Box sx={{ px: 2, pb: 2 }}> {/* Padding for comments section */}
                                        <CommentSection
                                            feedbackId={feedback.id}
                                            initialComments={feedback.comments || []}
                                            onCommentAdded={fetchFeedback} // Refresh feedback list to update comments count
                                        />
                                    </Box>
                                </Collapse>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}
        </Container>
    );
};

export default FeedbackList;