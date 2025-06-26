

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';


import {
    Container,
    Box,
    Typography,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Button,
    CircularProgress,
    Alert,
    Paper // For the form container
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send'; // Icon for submit button
import RateReviewIcon from '@mui/icons-material/RateReview'; // Specific icon for feedback request

const FeedbackRequestForm = () => {
    const { user, axiosInstance, loading: authLoading } = useAuth(); // Renamed loading to authLoading
    const navigate = useNavigate();

    const [managers, setManagers] = useState([]);
    const [selectedManager, setSelectedManager] = useState('');
    const [reason, setReason] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [formLoading, setFormLoading] = useState(true); // Initial loading for fetching managers
    const [submitting, setSubmitting] = useState(false); // For submit button loading state

    useEffect(() => {
        if (!authLoading) {
            if (!user || user.role !== 'employee') {
                navigate("/login"); // Only employees can request feedback
            } else {
                fetchManagers();
            }
        }
    }, [user, authLoading, navigate]);

    const fetchManagers = async () => {
        setError('');
        setFormLoading(true);
        try {
            // Fetch all users who are managers
            // Assuming your backend supports filtering by role: /users/?role=manager
            const response = await axiosInstance.get('/users/?role=manager');
            setManagers(response.data.filter(u => u.role === 'manager')); // Filter to be safe
            setFormLoading(false);
        } catch (err) {
            console.error('Error fetching managers:', err.response?.data || err.message);
            setError('Failed to load managers. Please try again.');
            setFormLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        if (!selectedManager || !reason.trim()) {
            setError('Please select a manager and provide a reason.');
            return;
        }

        setSubmitting(true); // Start submitting loading
        try {
            const response = await axiosInstance.post('/feedback-requests/', {
                target_manager: parseInt(selectedManager), // Ensure ID is integer
                reason: reason,
            });

            if (response.status === 201) {
                setMessage('Feedback request submitted successfully!');
                setSelectedManager('');
                setReason('');
                setTimeout(() => navigate('/employee-dashboard'), 2000); // Redirect after success
            }
        } catch (err) {
            console.error('Error submitting feedback request:', err.response?.data || err.message);
            if (err.response?.data) {
                const errorMessages = Object.entries(err.response.data)
                    .map(([key, value]) => {
                        const val = Array.isArray(value) ? value.join(', ') : value;
                        return `${key.replace(/_/g, ' ')}: ${val}`; // Format key for readability
                    })
                    .join('\n');
                setError(`Submission failed: \n${errorMessages}`);
            } else {
                setError('Failed to submit feedback request. Please try again.');
            }
        } finally {
            setSubmitting(false); // End submitting loading
        }
    };

    // Consolidated loading state for the component
    if (authLoading || formLoading) {
        return (
            <Container sx={{ mt: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
                <CircularProgress sx={{ mb: 2 }} />
                <Typography variant="h6" color="text.secondary">Loading feedback request form...</Typography>
            </Container>
        );
    }

    if (!user || user.role !== 'employee') {
        return (
            <Container sx={{ mt: 4, textAlign: 'center' }}>
                <Alert severity="error" sx={{ mb: 2, display: 'inline-flex', alignItems: 'center' }}>
                    <Typography variant="body1" sx={{ mr: 1 }}>Access Denied. Only employees can request feedback.</Typography>
                </Alert>
            </Container>
        );
    }
    
    if (managers.length === 0) {
        return (
            <Container sx={{ mt: 4, textAlign: 'center' }}>
                <Alert severity="info" sx={{ mb: 2 }}>
                    No managers available to request feedback from. Please contact your administrator.
                </Alert>
            </Container>
        );
    }

    return (
        <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
            <Paper elevation={3} sx={{ p: { xs: 2, md: 4 }, borderRadius: 2 }}>
                <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4, fontWeight: 'bold', color: 'text.primary', textAlign: 'center', borderBottom: '2px solid', borderColor: 'info.main', pb: 1 }}>
                    Request Feedback
                </Typography>

                {message && (
                    <Alert severity="success" sx={{ mb: 3, whiteSpace: 'pre-wrap' }}>
                        {message}
                    </Alert>
                )}
                {error && (
                    <Alert severity="error" sx={{ mb: 3, whiteSpace: 'pre-wrap' }}>
                        {error}
                    </Alert>
                )}

                <form onSubmit={handleSubmit}>
                    <FormControl fullWidth margin="normal" required>
                        <InputLabel id="manager-select-label">Request Feedback From</InputLabel>
                        <Select
                            labelId="manager-select-label"
                            id="managerSelect"
                            value={selectedManager}
                            label="Request Feedback From"
                            onChange={(e) => setSelectedManager(e.target.value)}
                        >
                            <MenuItem value="">Select a Manager</MenuItem>
                            {managers.map(manager => (
                                <MenuItem key={manager.id} value={manager.id}>
                                    {manager.username}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="reason"
                        label="Reason for Request"
                        multiline
                        rows={4}
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        variant="outlined"
                        placeholder="e.g., 'For my mid-year performance review' or 'To discuss recent project X'"
                    />

                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        color="info" // Using info color for feedback requests
                        sx={{ mt: 3, mb: 2, py: 1.5, fontSize: '1.1em' }}
                        endIcon={<RateReviewIcon />} // Changed icon
                        disabled={submitting} // Disable button while submitting
                    >
                        {submitting ? <CircularProgress size={24} color="inherit" /> : 'Submit Request'}
                    </Button>
                </form>
            </Paper>
        </Container>
    );
};

export default FeedbackRequestForm;