

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

import { useNavigate } from 'react-router-dom';


import {
    Container,
    Box,
    TextField,
    Button,
    Typography,
    CircularProgress,
    Alert,
    InputAdornment,
    IconButton,
} from '@mui/material';


import { AccountCircle, Lock, Visibility, VisibilityOff } from '@mui/icons-material';

const Login = () => {
    const { loginUser, loading } = useAuth();
    const navigate = useNavigate(); 
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loginError, setLoginError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleClickShowPassword = () => setShowPassword((show) => !show);
    const handleMouseDownPassword = (event) => {
        event.preventDefault();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoginError('');
        try {
            await loginUser(username, password);
        } catch (error) {
            setLoginError(error.message || 'An unexpected error occurred during login. Please try again.');
        }
    };

    return (
        
        <Container
            component="main"
            maxWidth="xs" 
            sx={{
               
                minHeight: { xs: 'calc(100vh - 64px)', md: '100vh' }, // Adjust 64px if you have a header
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center', // Center vertically
                alignItems: 'center',    // Center horizontally
                backgroundColor: '#f8f9fa', // A light background for the whole page (Google-like)
                padding: { xs: 2, sm: 3, md: 4 }, // Responsive padding around the container
                boxSizing: 'border-box', // Include padding in element's total width and height
            }}
        >
            {/* Box component to act as the login card/form container */}
            <Box
                sx={{
                    marginTop: { xs: 4, sm: 8 }, // Responsive top margin
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    padding: { xs: 3, sm: 4 }, // Responsive inner padding for the card
                    borderRadius: 2,
                    boxShadow: 3,
                    bgcolor: 'background.paper',
                    width: '100%', // Take full width of its parent (maxWidth="xs")
                }}
            >
                {/* Optional: Add your GrowthFlow logo here for branding */}
                {/* Ensure you have a logo.png in your /public folder or remove this img tag */}
                {/* <img src="/growthflow_logo.png" alt="GrowthFlow Logo" style={{ width: '100px', marginBottom: '20px' }} /> */}

                <Typography component="h1" variant="h5" sx={{ mb: { xs: 2, sm: 3 }, fontWeight: 'bold', color: '#333' }}>
                    Sign in to GrowthFlow
                </Typography>

                <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, width: '100%' }}>
                    {loginError && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {loginError}
                        </Alert>
                    )}

                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="username"
                        label="Username"
                        name="username"
                        autoComplete="username"
                        autoFocus
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        sx={{ mb: 2 }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <AccountCircle />
                                </InputAdornment>
                            ),
                        }}
                    />

                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label="Password"
                        type={showPassword ? 'text' : 'password'}
                        id="password"
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        sx={{ mb: 3 }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Lock />
                                </InputAdornment>
                            ),
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        aria-label="toggle password visibility"
                                        onClick={handleClickShowPassword}
                                        onMouseDown={handleMouseDownPassword}
                                        edge="end"
                                    >
                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />

                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2, py: 1.5 }}
                        disabled={loading}
                    >
                        {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
                    </Button>

                    <Typography variant="body2" color="text.secondary" align="center">
                        Don't have an account? Please contact your administrator.
                    </Typography>
                </Box>
            </Box>
        </Container>
    );
};

export default Login;