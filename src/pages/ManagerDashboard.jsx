

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';


import {
    Container,
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    CircularProgress,
    Alert,
    Paper,
    LinearProgress,
    List,         
    ListItem,     
    ListItemText  
} from '@mui/material';
import { styled } from '@mui/system';


import FeedbackList from '../components/FeedbackList';


const StatCard = styled(Card)(({ theme, color = 'primary' }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing(3),
    textAlign: 'center',
    height: '100%',
    borderRadius: theme.shape.borderRadius || 8, 
    boxShadow: theme.shadows[3], 
    transition: 'transform 0.2s ease-in-out',
    '&:hover': {
        transform: 'translateY(-5px)', 
    },
    
    borderLeft: `5px solid ${theme.palette[color] ? theme.palette[color].main : theme.palette.grey[400]}`,
}));

const ManagerDashboard = () => {
    const { user, axiosInstance, loading: authLoading, logoutUser } = useAuth();
    const navigate = useNavigate();
    const [dashboardData, setDashboardData] = useState(null);
    const [error, setError] = useState("");
    const [statsLoading, setStatsLoading] = useState(true);

    const getSentimentColor = (sentiment) => {
        switch (sentiment.toLowerCase()) {
            case 'positive': return 'success';
            case 'neutral': return 'warning';
            case 'needs improvement': return 'error';
            case 'very impressive': return 'info';
            default: return 'text.secondary';
        }
    };

    const fetchDashboardData = useCallback(async () => {
        setError("");
        setStatsLoading(true);
        try {
            const response = await axiosInstance.get("/feedback/manager-summary/");
            setDashboardData(response.data);
            setStatsLoading(false);
        } catch (err) {
            console.error("Error fetching manager dashboard data:", err.response?.data || err.message);
            if (err.response && err.response.status === 401) {
                setError("Your session has expired. Please log in again.");
               
            } else {
                setError(err.response?.data?.detail || "Failed to load dashboard data. Please try again.");
            }
            setStatsLoading(false);
        }
    }, [axiosInstance]); 

    useEffect(() => {
        if (!authLoading) { 
            if (!user) {
                console.log("Redirecting: User not logged in.");
                navigate("/login");
            } else if (user.role !== 'manager') { // If user is logged in but not a manager
                console.log("Redirecting: User is not a manager.");
            
                navigate(user.role === 'employee' ? '/employee-dashboard' : '/'); // Or just '/'
            } else {
               
                fetchDashboardData();
            }
        }
    }, [user, authLoading, navigate, fetchDashboardData]);


    if (authLoading || statsLoading) {
        return (
            <Container sx={{ mt: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
                <CircularProgress sx={{ mb: 2 }} />
                <Typography variant="h6" color="text.secondary">Loading manager dashboard...</Typography>
                <LinearProgress sx={{ width: '50%', mt: 2 }} />
            </Container>
        );
    }

  
    if (!user || user.role !== 'manager') {
        return (
            <Container sx={{ mt: 4, textAlign: 'center' }}>
                <Alert severity="error" sx={{ mb: 2, display: 'inline-flex', alignItems: 'center' }}>
                    <Typography variant="body1" sx={{ mr: 1 }}>Access Denied. You must be logged in as a manager to view this page.</Typography>
                    <Link to="/login" style={{ color: "inherit", textDecoration: "underline", fontWeight: 'bold' }}>Go to Login</Link>
                </Alert>
            </Container>
        );
    }
    
  
    if (error) {
        return (
            <Container sx={{ mt: 4, textAlign: 'center' }}>
                <Alert severity="error" sx={{ mb: 2, display: 'inline-flex', alignItems: 'center' }}>
                    {error}
                </Alert>
                <Typography variant="body1" align="center" color="text.secondary" sx={{ mt: 2 }}>
                    Please try refreshing the page or contact support if the issue persists.
                </Typography>
            </Container>
        );
    }

   
    if (!dashboardData) {
        return (
            <Container sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
                <Typography variant="h6" color="text.secondary">
                    No dashboard data available.
                </Typography>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4, fontWeight: 'bold', color: 'text.primary', textAlign: 'center' }}>
                Manager Dashboard
                <Box sx={{ borderBottom: '3px solid', borderColor: 'primary.main', width: '100px', mx: 'auto', mt: 1 }} />
            </Typography>

            {/* Overall Feedback Statistics */}
            <Paper elevation={3} sx={{ p: { xs: 2, md: 4 }, mb: 4, borderRadius: 2 }}>
                <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 3, fontWeight: 'medium', color: 'primary.dark' }}>
                    Overall Feedback Statistics
                </Typography>
                <Grid container spacing={{ xs: 2, md: 3 }}>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard>
                            <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                                {dashboardData.total_feedback_given_by_me || 0}
                            </Typography>
                            <Typography variant="subtitle1" color="text.secondary">
                                Feedback I Given
                            </Typography>
                        </StatCard>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard>
                            <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                                {dashboardData.total_feedback_for_my_reports || 0}
                            </Typography>
                            <Typography variant="subtitle1" color="text.secondary">
                                Feedback for My Reports
                            </Typography>
                        </StatCard>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard color="success">
                            <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                                {dashboardData.reports_feedback_acknowledgment_status?.acknowledged || 0}
                            </Typography>
                            <Typography variant="subtitle1" color="text.secondary">
                                Reports Acknowledged
                            </Typography>
                        </StatCard>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard color="error">
                            <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', color: 'error.main' }}>
                                {dashboardData.reports_feedback_acknowledgment_status?.pending || 0}
                            </Typography>
                            <Typography variant="subtitle1" color="text.secondary">
                                Reports Pending Acknowledge
                            </Typography>
                        </StatCard>
                    </Grid>
                </Grid>
            </Paper>

            {/* My Given Feedback Sentiment Breakdown */}
            <Paper elevation={3} sx={{ p: { xs: 2, md: 4 }, mb: 4, borderRadius: 2 }}>
                <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 3, fontWeight: 'medium', color: 'primary.dark' }}>
                    My Given Feedback Sentiment Breakdown
                </Typography>
                <Grid container spacing={{ xs: 2, md: 3 }}>
                    {dashboardData.sentiment_trends_given_by_me && Object.entries(dashboardData.sentiment_trends_given_by_me).map(([sentiment, count]) => (
                        <Grid item xs={12} sm={6} md={3} key={sentiment}>
                            <StatCard color={getSentimentColor(sentiment)}>
                                <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', color: `${getSentimentColor(sentiment)}.main` }}>
                                    {count}
                                </Typography>
                                <Typography variant="subtitle1" color="text.secondary">
                                    {sentiment.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                                </Typography>
                            </StatCard>
                        </Grid>
                    ))}
                </Grid>
                <Box sx={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', mt: 3, gap: 2 }}>
                    <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box sx={{ height: 12, width: 12, borderRadius: '50%', bgcolor: 'success.main', mr: 0.5 }} />Positive
                    </Typography>
                    <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box sx={{ height: 12, width: 12, borderRadius: '50%', bgcolor: 'info.main', mr: 0.5 }} />Very Impressive
                    </Typography>
                    <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box sx={{ height: 12, width: 12, borderRadius: '50%', bgcolor: 'warning.main', mr: 0.5 }} />Neutral
                    </Typography>
                    <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box sx={{ height: 12, width: 12, borderRadius: '50%', bgcolor: 'error.main', mr: 0.5 }} />Needs Improvement
                    </Typography>
                </Box>
            </Paper>

            {/* My Given Feedback Monthly Trends (Last 6 Months) */}
            <Paper elevation={3} sx={{ p: { xs: 2, md: 4 }, mb: 4, borderRadius: 2 }}>
                <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 3, fontWeight: 'medium', color: 'primary.dark' }}>
                    My Given Feedback Monthly Trends (Last 6 Months)
                </Typography>
                {dashboardData.monthly_trends_given_by_me && dashboardData.monthly_trends_given_by_me.length === 0 ? (
                    <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center' }}>
                        No monthly trend data available for your given feedback.
                    </Typography>
                ) : (
                    <List sx={{ width: '100%', bgcolor: 'background.paper', p: 0 }}>
                        {dashboardData.monthly_trends_given_by_me && dashboardData.monthly_trends_given_by_me.map((data, index) => (
                            <ListItem key={index} divider={index < dashboardData.monthly_trends_given_by_me.length - 1}> {/* Add divider for all but last item */}
                                <ListItemText
                                    primary={
                                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>{data.month}</Typography>
                                    }
                                    secondary={
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: { xs: 1, sm: 2 }, mt: 0.5 }}>
                                            <Typography variant="body2" component="span">Total: {data.total}</Typography>
                                            <Typography variant="body2" component="span" color="success.main">Pos: {data.positive}</Typography>
                                            <Typography variant="body2" component="span" color="warning.main">Neu: {data.neutral}</Typography>
                                            <Typography variant="body2" component="span" color="error.main">Needs Imp: {data.needs_improvement}</Typography>
                                        </Box>
                                    }
                                />
                            </ListItem>
                        ))}
                    </List>
                )}
            </Paper>

            {/* My Given Feedback List */}
            <Paper elevation={3} sx={{ p: { xs: 2, md: 4 }, borderRadius: 2 }}>
                <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 3, fontWeight: 'medium', color: 'primary.dark' }}>
                    My Given Feedback List
                </Typography>
                <FeedbackList />
            </Paper>
        </Container>
    );
};

export default ManagerDashboard;