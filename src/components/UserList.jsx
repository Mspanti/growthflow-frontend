

import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

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
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Chip 
} from '@mui/material';


import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import WorkIcon from '@mui/icons-material/Work'; // For role
import GroupsIcon from '@mui/icons-material/Groups'; // For team members
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter'; // For manager's name

const UserList = () => {
    const { axiosInstance, user, loading: authLoading } = useAuth(); // Renamed loading to authLoading
    const [users, setUsers] = useState([]);
    const [error, setError] = useState(null);
    const [listLoading, setListLoading] = useState(true); // New state for list specific loading

    useEffect(() => {
        const fetchUsers = async () => {
            setListLoading(true);
            setError(null);
            try {
                let response;
                if (user && (user.is_superuser || user.role === 'manager')) {
                    response = await axiosInstance.get('/users/');
                } else if (user) {
                    
                    response = await axiosInstance.get(`/users/${user.user_id}/`);
                } else {
                    setUsers([]);
                    setListLoading(false);
                    return;
                }

                if (Array.isArray(response.data)) {
                    setUsers(response.data);
                } else {
                    setUsers([response.data]); // If it returns a single user object
                }

            } catch (err) {
                console.error('Failed to fetch users:', err.response?.data || err.message);
                setError(err.response?.data?.detail || 'Failed to fetch user list. Please ensure you are logged in and have permission.');
            } finally {
                setListLoading(false);
            }
        };

        if (!authLoading && user) { // Only fetch if user data is loaded and a user is logged in
            fetchUsers();
        } else if (!authLoading && !user) {
            setListLoading(false); // If no user logged in, stop loading
        }
    }, [axiosInstance, user, authLoading]);

    // Consolidated loading state for the component
    if (authLoading || listLoading) {
        return (
            <Container sx={{ mt: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
                <CircularProgress sx={{ mb: 2 }} />
                <Typography variant="h6" color="text.secondary">Loading user list...</Typography>
            </Container>
        );
    }

    if (!user) {
        return (
            <Container sx={{ mt: 4, textAlign: 'center' }}>
                <Alert severity="warning" sx={{ mb: 2, display: 'inline-flex', alignItems: 'center' }}>
                    <Typography variant="body1" sx={{ mr: 1 }}>Please log in to view user information.</Typography>
                </Alert>
            </Container>
        );
    }

    if (error) {
        return (
            <Container sx={{ mt: 4, textAlign: 'center' }}>
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            </Container>
        );
    }

    if (users.length === 0) {
        return (
            <Container sx={{ mt: 4, textAlign: 'center' }}>
                <Alert severity="info" sx={{ mb: 2 }}>
                    No user data available or you do not have permission to view other users.
                </Alert>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4, py: 3, borderRadius: 2, boxShadow: 3, bgcolor: 'background.paper' }}>
            <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4, fontWeight: 'bold', color: 'text.primary', textAlign: 'center', borderBottom: '2px solid', borderColor: 'primary.main', pb: 1 }}>
                User List
            </Typography>

            <Grid container spacing={3}>
                {users.map((u) => (
                    <Grid item xs={12} sm={6} md={4} key={u.id}>
                        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderRadius: 2, boxShadow: 3, transition: 'transform 0.2s ease-in-out', '&:hover': { transform: 'translateY(-5px)' } }}>
                            <CardContent>
                                <Typography variant="h6" component="div" sx={{ color: 'primary.dark', mb: 2, borderBottom: '1px dashed #eee', pb: 1 }}>
                                    {u.username}
                                    <Chip
                                        label={u.role.toUpperCase()}
                                        color={u.role === 'manager' ? 'secondary' : (u.is_superuser ? 'error' : 'primary')}
                                        size="small"
                                        sx={{ ml: 1, fontWeight: 'bold' }}
                                    />
                                </Typography>
                                <List dense>
                                    <ListItem disablePadding>
                                        <ListItemIcon sx={{ minWidth: 35 }}><EmailIcon color="action" /></ListItemIcon>
                                        <ListItemText primary={`Email: ${u.email}`} />
                                    </ListItem>
                                    <ListItem disablePadding>
                                        <ListItemIcon sx={{ minWidth: 35 }}><WorkIcon color="action" /></ListItemIcon>
                                        <ListItemText primary={`Role: ${u.role}`} />
                                    </ListItem>
                                    {u.role === 'employee' && u.manager_username && ( // Display manager for employee
                                        <ListItem disablePadding>
                                            <ListItemIcon sx={{ minWidth: 35 }}><BusinessCenterIcon color="action" /></ListItemIcon>
                                            <ListItemText primary={`Manager: ${u.manager_username}`} />
                                        </ListItem>
                                    )}
                                    {u.role === 'manager' && u.team_members && ( // Display team members for manager
                                        <ListItem disablePadding>
                                            <ListItemIcon sx={{ minWidth: 35 }}><GroupsIcon color="action" /></ListItemIcon>
                                            <ListItemText primary={`Team Members: ${u.team_members.length > 0 ? u.team_members.map(tm => tm.username).join(', ') : 'None'}`} />
                                        </ListItem>
                                    )}
                                </List>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Container>
    );
};

export default UserList;