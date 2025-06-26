

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

// Import Material-UI Components
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
    Alert, // Import Alert
    Paper, // For the form container
    Checkbox,
    FormControlLabel // For checkbox
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send'; // Icon for submit button

const PeerFeedbackForm = () => {
    const { user, axiosInstance, loading: authLoading } = useAuth(); // Renamed loading to authLoading
    const navigate = useNavigate();

    const [usersForFeedback, setUsersForFeedback] = useState([]); // Renamed from employees to be more generic
    const [selectedReceiver, setSelectedReceiver] = useState('');
    const [feedbackText, setFeedbackText] = useState('');
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [formLoading, setFormLoading] = useState(true); // Initial loading for fetching users
    const [submitting, setSubmitting] = useState(false); // For submit button loading state

    useEffect(() => {
        if (!authLoading) {
            if (!user) {
                navigate("/login"); // Must be logged in
            } else {
                fetchUsers(); // Fetch all users (employees and managers) for peer selection
            }
        }
    }, [user, authLoading, navigate]);

    const fetchUsers = async () => {
        setError('');
        setFormLoading(true);
        try {
            // Fetch all users, as peers can be employees or managers
            const response = await axiosInstance.get('/users/');
            // Filter out the current user to prevent self-feedback
            // Also, ensure we have at least one other user to provide feedback to.
            setUsersForFeedback(response.data.filter(u => u.id !== user.user_id));
            setFormLoading(false);
        } catch (err) {
            console.error('Error fetching users:', err.response?.data || err.message);
            setError('Failed to load users for peer feedback. Please try again.');
            setFormLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        if (!selectedReceiver || !feedbackText.trim()) {
            setError('Please select a receiver and provide feedback text.');
            return;
        }

        setSubmitting(true); // Start submitting loading
        try {
            const response = await axiosInstance.post('/peer-feedback/', {
                receiver: parseInt(selectedReceiver), // Ensure ID is integer
                feedback_text: feedbackText,
                is_anonymous: isAnonymous,
            });

            if (response.status === 201) {
                setMessage('Peer feedback submitted successfully!');
                setSelectedReceiver('');
                setFeedbackText('');
                setIsAnonymous(false);
                setTimeout(() => navigate('/peer-feedback-list'), 2000); // Navigate to peer feedback list
            }
        } catch (err) {
            console.error('Error submitting peer feedback:', err.response?.data || err.message);
            if (err.response?.data) {
                const errorMessages = Object.entries(err.response.data)
                    .map(([key, value]) => {
                        const val = Array.isArray(value) ? value.join(', ') : value;
                        return `${key.replace(/_/g, ' ')}: ${val}`; // Format key for readability
                    })
                    .join('\n');
                setError(`Submission failed: \n${errorMessages}`);
            } else {
                setError('Failed to submit peer feedback. Please try again.');
            }
        } finally {
            setSubmitting(false); // End submitting loading
        }
    };

    if (authLoading || formLoading) {
        return (
            <Container sx={{ mt: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
                <CircularProgress sx={{ mb: 2 }} />
                <Typography variant="h6" color="text.secondary">Loading form...</Typography>
            </Container>
        );
    }

    if (!user) {
        return (
            <Container sx={{ mt: 4, textAlign: 'center' }}>
                <Alert severity="warning" sx={{ mb: 2, display: 'inline-flex', alignItems: 'center' }}>
                    <Typography variant="body1" sx={{ mr: 1 }}>Access Denied. Please log in to submit peer feedback.</Typography>
                </Alert>
            </Container>
        );
    }
    
    // **CHANGED THIS BLOCK**
    if (usersForFeedback.length === 0) {
        return (
            <Container sx={{ mt: 4, textAlign: 'center' }}>
                <Alert severity="info" sx={{ mb: 2 }}>
                    No other users available to provide peer feedback to.
                </Alert>
            </Container>
        );
    }

    return (
        <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
            <Paper elevation={3} sx={{ p: { xs: 2, md: 4 }, borderRadius: 2 }}>
                <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4, fontWeight: 'bold', color: 'text.primary', textAlign: 'center', borderBottom: '2px solid', borderColor: 'secondary.main', pb: 1 }}>
                    Submit Peer Feedback
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
                        <InputLabel id="receiver-select-label">Feedback For</InputLabel>
                        <Select
                            labelId="receiver-select-label"
                            id="receiverSelect"
                            value={selectedReceiver}
                            label="Feedback For"
                            onChange={(e) => setSelectedReceiver(e.target.value)}
                        >
                            <MenuItem value="">Select a Peer</MenuItem>
                            {usersForFeedback.map(peer => (
                                <MenuItem key={peer.id} value={peer.id}>
                                    {peer.username} ({peer.role})
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="feedbackText"
                        label="Your Feedback"
                        multiline
                        rows={5}
                        value={feedbackText}
                        onChange={(e) => setFeedbackText(e.target.value)}
                        variant="outlined"
                        placeholder="Provide constructive feedback for your peer's performance and collaboration."
                    />

                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={isAnonymous}
                                onChange={(e) => setIsAnonymous(e.target.checked)}
                                name="isAnonymous"
                                color="primary"
                            />
                        }
                        label="Submit Anonymously"
                        sx={{ mt: 1, mb: 2 }}
                    />

                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        color="secondary" // Using secondary color for peer feedback to differentiate
                        sx={{ mt: 3, mb: 2, py: 1.5, fontSize: '1.1em' }}
                        endIcon={<SendIcon />}
                        disabled={submitting} // Disable button while submitting
                    >
                        {submitting ? <CircularProgress size={24} color="inherit" /> : 'Submit Peer Feedback'}
                    </Button>
                </form>
            </Paper>
        </Container>
    );
};

export default PeerFeedbackForm;