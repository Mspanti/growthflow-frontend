

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

// Import Material-UI Components
import {
    Container,
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    CircularProgress,
    Alert,
    Button,
    Chip, // For status display
    Stack, // For grouping buttons
    List, ListItem, ListItemIcon, ListItemText // For detailed list items
} from '@mui/material';

// Import Material-UI Icons
import PersonIcon from '@mui/icons-material/Person';
import WorkIcon from '@mui/icons-material/Work'; // For manager
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'; // For requested date
import InfoIcon from '@mui/icons-material/Info'; // For reason
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'; // For Mark as Fulfilled
import SendIcon from '@mui/icons-material/Send'; // For Give Feedback

const FeedbackRequestList = () => {
    const { user, axiosInstance, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [requests, setRequests] = useState([]);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [listLoading, setListLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false); // For button loading

    useEffect(() => {
        if (!authLoading) {
            if (!user || user.role !== 'manager') {
                navigate("/login"); // Only managers can view requests
            } else {
                fetchFeedbackRequests();
            }
        }
    }, [user, authLoading, navigate]);

    const fetchFeedbackRequests = async () => {
        setError('');
        setListLoading(true);
        try {
            // Fetch requests relevant to the current manager (from views.py get_queryset)
            const response = await axiosInstance.get('/feedback-requests/');
            setRequests(response.data);
            setListLoading(false);
        } catch (err) {
            console.error('Error fetching feedback requests:', err.response?.data || err.message);
            setError(err.response?.data?.detail || 'Failed to load feedback requests. Please try again.');
            setListLoading(false);
        }
    };

    const handleMarkFulfilled = async (requestId) => {
        setError('');
        setMessage('');
        setActionLoading(true); // Start loading for action
        try {
            const response = await axiosInstance.patch(`/feedback-requests/${requestId}/mark-fulfilled/`);
            if (response.status === 200) {
                setMessage('Request marked as fulfilled!');
                fetchFeedbackRequests(); // Refresh the list
            }
        } catch (err) {
            console.error('Error marking request fulfilled:', err.response?.data || err.message);
            setError(err.response?.data?.detail || 'Failed to mark request as fulfilled.');
        } finally {
            setActionLoading(false); // End loading for action
        }
    };

    if (authLoading || listLoading) {
        return (
            <Container sx={{ mt: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
                <CircularProgress sx={{ mb: 2 }} />
                <Typography variant="h6" color="text.secondary">Loading feedback requests...</Typography>
            </Container>
        );
    }

    if (!user || user.role !== 'manager') {
        return (
            <Container sx={{ mt: 4, textAlign: 'center' }}>
                <Alert severity="error" sx={{ mb: 2, display: 'inline-flex', alignItems: 'center' }}>
                    <Typography variant="body1" sx={{ mr: 1 }}>Access Denied. Only managers can view feedback requests.</Typography>
                </Alert>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4, py: 3, borderRadius: 2, boxShadow: 3, bgcolor: 'background.paper' }}>
            <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4, fontWeight: 'bold', color: 'text.primary', textAlign: 'center', borderBottom: '2px solid', borderColor: 'primary.main', pb: 1 }}>
                Manage Feedback Requests
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

            {requests.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 5 }}>
                    <Typography variant="h6" color="text.secondary">
                        No feedback requests to review at this time.
                    </Typography>
                </Box>
            ) : (
                <Grid container spacing={3}>
                    {requests.map(request => (
                        <Grid item xs={12} md={6} lg={4} key={request.id}>
                            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderRadius: 2, boxShadow: 3, transition: 'transform 0.2s ease-in-out', '&:hover': { transform: 'translateY(-5px)' } }}>
                                <CardContent>
                                    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                                        <Typography variant="h6" component="div" sx={{ color: 'primary.dark' }}>
                                            Request from {request.requester_username}
                                        </Typography>
                                        <Chip
                                            label={request.is_fulfilled ? 'Fulfilled' : 'Pending'}
                                            color={request.is_fulfilled ? 'success' : 'warning'}
                                            size="small"
                                            sx={{ fontWeight: 'bold' }}
                                        />
                                    </Stack>
                                    <List dense>
                                        <ListItem disablePadding>
                                            <ListItemIcon sx={{ minWidth: 35 }}><PersonIcon color="action" /></ListItemIcon>
                                            <ListItemText primary={`Requester: ${request.requester_username}`} />
                                        </ListItem>
                                        <ListItem disablePadding>
                                            <ListItemIcon sx={{ minWidth: 35 }}><WorkIcon color="action" /></ListItemIcon>
                                            <ListItemText primary={`For Manager: ${request.target_manager_username || 'Not Assigned'}`} />
                                        </ListItem>
                                        <ListItem disablePadding>
                                            <ListItemIcon sx={{ minWidth: 35 }}><CalendarMonthIcon color="action" /></ListItemIcon>
                                            <ListItemText primary={`Requested On: ${new Date(request.created_at).toLocaleDateString()}`} />
                                        </ListItem>
                                        <ListItem disablePadding>
                                            <ListItemIcon sx={{ minWidth: 35 }}><InfoIcon color="action" /></ListItemIcon>
                                            <ListItemText primary={`Reason: ${request.reason}`} />
                                        </ListItem>
                                    </List>
                                    
                                    <Stack direction="row" spacing={1} sx={{ mt: 3, flexWrap: 'wrap' }}>
                                        {!request.is_fulfilled && (
                                            <Button
                                                variant="contained"
                                                color="success"
                                                size="small"
                                                onClick={() => handleMarkFulfilled(request.id)}
                                                startIcon={<CheckCircleOutlineIcon />}
                                                disabled={actionLoading}
                                                sx={{ flexGrow: 1 }}
                                            >
                                                {actionLoading ? <CircularProgress size={20} color="inherit" /> : 'Mark as Fulfilled'}
                                            </Button>
                                        )}
                                        <Button
                                            variant="outlined"
                                            color="primary"
                                            size="small"
                                            onClick={() => navigate(`/submit-feedback?employeeId=${request.requester}&requestId=${request.id}`)}
                                            startIcon={<SendIcon />}
                                            sx={{ flexGrow: 1 }}
                                        >
                                            Give Feedback
                                        </Button>
                                    </Stack>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}
        </Container>
    );
};

export default FeedbackRequestList;