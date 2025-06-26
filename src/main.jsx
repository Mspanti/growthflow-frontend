// D:\GrowthFlow\frontend\src\main.jsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css'; // Make sure your base CSS is imported

// Import MUI ThemeProvider and CssBaseline for global styles and consistent base styles
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline'; // For a consistent baseline CSS

// Define your MUI theme for a consistent Google-like UI
const theme = createTheme({
    palette: {
        primary: {
            main: '#1976d2', // Google Blue
        },
        secondary: {
            main: '#dc004e', // A common accent color
        },
        background: {
            default: '#f4f7f6', // Light gray background for the entire app, consistent
            paper: '#ffffff', // White for cards/components
        },
    },
    typography: {
        fontFamily: 'Roboto, Arial, sans-serif', // Google's preferred font family
        h1: {
            fontSize: '2.5rem', // Adjust heading sizes for better responsiveness
            '@media (min-width:600px)': {
                fontSize: '3rem',
            },
        },
        h2: {
            fontSize: '2rem',
            '@media (min-width:600px)': {
                fontSize: '2.5rem',
            },
        },
        // You can define other typography variants here
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: '8px', // More rounded buttons
                    textTransform: 'none', // Prevent uppercase text
                },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    borderRadius: '8px', // Rounded text fields
                },
            },
        },
        MuiAppBar: {
            styleOverrides: {
                root: {
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)', // Subtle shadow for app bar
                }
            }
        },
        MuiPaper: { // For Card, Drawer, etc.
            styleOverrides: {
                root: {
                    borderRadius: '8px', // Consistent rounded corners
                }
            }
        }
    }
});

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <ThemeProvider theme={theme}>
            <CssBaseline /> {/* Apply global CSS resets and baseline styles */}
            <App />
        </ThemeProvider>
    </React.StrictMode>
);