

import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';


import {
    AppBar, Toolbar, Typography, Button, Box, IconButton, Drawer, List, ListItem, ListItemButton, ListItemText, Divider, CircularProgress
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu'; 
import AccountCircleIcon from '@mui/icons-material/AccountCircle'; 
import LogoutIcon from '@mui/icons-material/Logout'; 


import Login from './components/Login';
import FeedbackForm from './components/FeedbackForm';
import FeedbackList from './components/FeedbackList';
import UserList from './components/UserList';
import ManagerDashboard from './pages/ManagerDashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';
import FeedbackEditForm from './components/FeedbackEditForm';
import FeedbackRequestForm from './components/FeedbackRequestForm';
import FeedbackRequestList from './components/FeedbackRequestList';
import PeerFeedbackForm from './components/PeerFeedbackForm';
import PeerFeedbackList from './components/PeerFeedbackList';


const PrivateRoute = ({ children, allowedRoles }) => {
    const { user, loading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (!loading) {
            if (!user) {
                console.log('PrivateRoute: User not logged in. Redirecting to /login.');
                navigate("/login", { replace: true, state: { from: location } });
            } else if (allowedRoles && !allowedRoles.includes(user.role) && !user.is_superuser) {
                console.warn(`PrivateRoute: User ${user.username} (role: ${user.role}) attempted to access forbidden route. Redirecting.`);
                navigate(user.role === 'manager' ? '/manager-dashboard' : '/employee-dashboard', { replace: true });
            }
        }
    }, [loading, user, allowedRoles, navigate, location]);

    if (loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '1.2em' }}>Loading authentication...</Box>;
    }

    if (!user || (allowedRoles && !allowedRoles.includes(user.role) && !user.is_superuser)) {
        return null; // Will be redirected by useEffect
    }

    return children;
};


const HomePage = () => {
    const { user, logoutUser, loading } = useAuth();
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

 
    const navLinks = useCallback(() => {
        const links = [];
        if (user) {
            if (user.role === 'manager') {
                links.push({ text: 'Manager Dashboard', path: '/manager-dashboard' });
                links.push({ text: 'Submit Feedback', path: '/submit-feedback' });
                links.push({ text: 'Feedback Requests', path: '/feedback-requests' });
                links.push({ text: 'Users', path: '/users' });
            }
            if (user.role === 'employee') {
                links.push({ text: 'Employee Dashboard', path: '/employee-dashboard' });
                links.push({ text: 'Request Feedback', path: '/request-feedback' });
            }
            // Links visible to all authenticated users
            links.push({ text: 'View Feedback', path: '/feedback' });
            links.push({ text: 'Peer Feedback', path: '/peer-feedback' });
            links.push({ text: 'Give Peer Feedback', path: '/submit-peer-feedback' });
        }
        
        return links;
    }, [user]);

    const drawer = (
        <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
            <Typography variant="h6" sx={{ my: 2 }}>
                GrowthFlow
            </Typography>
            <Divider />
            <List>
                {user ? ( 
                    <>
                        {navLinks().map((item) => (
                            <ListItem key={item.text} disablePadding>
                                <ListItemButton sx={{ textAlign: 'center' }} component={Link} to={item.path}>
                                    <ListItemText primary={item.text} />
                                </ListItemButton>
                            </ListItem>
                        ))}
                        <ListItem disablePadding>
                            <ListItemButton sx={{ textAlign: 'center' }} onClick={logoutUser}>
                                <ListItemText primary="Logout" />
                            </ListItemButton>
                        </ListItem>
                    </>
                ) : ( // If no user, show login link
                    <ListItem disablePadding>
                        <ListItemButton sx={{ textAlign: 'center' }} component={Link} to="/login">
                            <ListItemText primary="Login" />
                        </ListItemButton>
                    </ListItem>
                )}
            </List>
        </Box>
    );

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            {/* AppBar (Top Navigation Bar) */}
            <AppBar position="static" sx={{ bgcolor: '#333' }}>
                <Toolbar>
                    {/* Hamburger menu icon for small screens */}
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ mr: 2, display: { sm: 'none' } }}
                    >
                        <MenuIcon />
                    </IconButton>

                    {/* GrowthFlow Title/Logo - Always visible */}
                    <Typography
                        variant="h6"
                        component={Link}
                        to="/"
                        sx={{
                            flexGrow: 1,
                            textDecoration: 'none',
                            color: 'white',
                            fontWeight: 'bold',
                            textAlign: { xs: 'center', sm: 'left' } 
                        }}
                    >
                        GrowthFlow
                    </Typography>

                    {/* Desktop Navigation Links */}
                    <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                        {user ? (
                            <>
                                {navLinks().map((item) => (
                                    <Button key={item.text} component={Link} to={item.path} sx={{ color: 'white', ml: 2 }}>
                                        {item.text}
                                    </Button>
                                ))}
                                {/* User Info for desktop */}
                                <Typography variant="body1" sx={{ color: 'white', display: 'inline-flex', alignItems: 'center', ml: 3, mr: 1 }}>
                                    <AccountCircleIcon sx={{ mr: 0.5 }} />
                                    Welcome, <Box component="span" sx={{ fontWeight: 'bold', mx: 0.5 }}>{user.username}</Box> ({user.role})
                                </Typography>
                                {/* Logout button for desktop */}
                                <Button
                                    onClick={logoutUser}
                                    sx={{ color: 'white', ml: 1, bgcolor: '#dc3545', '&:hover': { bgcolor: '#c82333' } }}
                                    startIcon={<LogoutIcon />} // Added logout icon
                                >
                                    Logout
                                </Button>
                            </>
                        ) : (
                            <Button component={Link} to="/login" sx={{ color: 'white', ml: 2 }}>
                                Login
                            </Button>
                        )}
                    </Box>
                </Toolbar>
            </AppBar>

            {/* Mobile Drawer (Sidebar) */}
            <nav>
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{ keepMounted: true }}
                    sx={{
                        display: { xs: 'block', sm: 'none' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
                    }}
                >
                    {drawer}
                </Drawer>
            </nav>

            {/* Main Content Area - Routes */}
            <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', mt: 5 }}>
                        <CircularProgress />
                        <Typography variant="h6" sx={{ ml: 2 }}>Loading application...</Typography>
                    </Box>
                ) : (
                    <Routes>
                        <Route path="/" element={!user ? (
                            <Box sx={{ p: 3, textAlign: 'center', mt: 5 }}>
                                <Typography variant="h4" component="h1" gutterBottom>Welcome to GrowthFlow!</Typography>
                                <Typography variant="body1" sx={{ mb: 2 }}>Please log in to access the system.</Typography>
                                <Typography variant="body2" color="text.secondary">If you don't have an account, please contact your administrator.</Typography>
                            </Box>
                        ) : (
                            user.role === 'manager' ? <Navigate to="/manager-dashboard" /> : <Navigate to="/employee-dashboard" />
                        )} />

                        <Route path="/login" element={<Login />} />

                        <Route path="/manager-dashboard" element={<PrivateRoute allowedRoles={['manager']}><ManagerDashboard /></PrivateRoute>} />
                        <Route path="/submit-feedback" element={<PrivateRoute allowedRoles={['manager']}><FeedbackForm /></PrivateRoute>} />
                        <Route path="/users" element={<PrivateRoute allowedRoles={['manager', 'superuser']}><UserList /></PrivateRoute>} />
                        <Route path="/edit-feedback/:id" element={<PrivateRoute allowedRoles={['manager']}><FeedbackEditForm /></PrivateRoute>} />
                        <Route path="/feedback-requests" element={<PrivateRoute allowedRoles={['manager']}><FeedbackRequestList /></PrivateRoute>} />
                        
                        <Route path="/employee-dashboard" element={<PrivateRoute allowedRoles={['employee']}><EmployeeDashboard /></PrivateRoute>} />
                        <Route path="/request-feedback" element={<PrivateRoute allowedRoles={['employee']}><FeedbackRequestForm /></PrivateRoute>} />

                        <Route path="/feedback" element={<PrivateRoute allowedRoles={['manager', 'employee']}><FeedbackList /></PrivateRoute>} />
                        <Route path="/peer-feedback" element={<PrivateRoute allowedRoles={['manager', 'employee']}><PeerFeedbackList /></PrivateRoute>} />
                        <Route path="/submit-peer-feedback" element={<PrivateRoute allowedRoles={['manager', 'employee']}><PeerFeedbackForm /></PrivateRoute>} />

                        <Route path="*" element={<Typography variant="h4" sx={{ textAlign: 'center', mt: 5 }}>404 - Page Not Found</Typography>} />
                    </Routes>
                )}
            </Box>
        </Box>
    );
};
function App() {
    return (
        <Router>
            <AuthProvider>
                <HomePage />
            </AuthProvider>
        </Router>
    );
}

export default App;