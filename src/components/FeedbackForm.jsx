

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
    Paper 
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send'; 

const FeedbackForm = () => {
    const { user, axiosInstance, loading: authLoading } = useAuth(); 
    const navigate = useNavigate();

    const [employees, setEmployees] = useState([]);
    const [formData, setFormData] = useState({
        employee: '',
        strengths: '',
        areas_to_improve: '',
        sentiment: '',
    });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [formLoading, setFormLoading] = useState(false); 

    useEffect(() => {
        if (!authLoading && user?.role === 'manager') {
            fetchEmployees();
        } else if (!authLoading && user?.role !== 'manager') {
            navigate(user ? (user.role === 'employee' ? '/employee-dashboard' : '/') : '/login');
        }
    }, [user, authLoading, navigate]);

    const fetchEmployees = async () => {
        setFormLoading(true); 
        try {
            const response = await axiosInstance.get('/users/');
            const employeeUsers = response.data.filter(u => u.role === 'employee');
            setEmployees(employeeUsers);
            if (employeeUsers.length > 0 && !formData.employee) {
                setFormData(prev => ({ ...prev, employee: employeeUsers[0].id }));
            }
            setFormLoading(false); 
        } catch (err) {
            console.error('Error fetching employees:', err.response?.data || err.message);
            setError('Failed to load employee list. Please try again.');
            setFormLoading(false); 
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: name === 'employee' && value !== '' ? parseInt(value) : value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        if (!formData.employee) {
            setError('Please select an employee.');
            return;
        }
        if (!formData.strengths || !formData.areas_to_improve) {
            setError('Strengths and Areas to Improve fields are required.');
            return;
        }

        setFormLoading(true); 
        try {
            const payload = {
                ...formData,
                employee: parseInt(formData.employee)
            };

            const response = await axiosInstance.post('/feedback/', payload);
            if (response.status === 201) {
                setMessage('Feedback submitted successfully!');
                setFormData({
                    employee: employees.length > 0 ? employees[0].id : '', 
                    strengths: '',
                    areas_to_improve: '',
                    sentiment: '',
                });
                console.log('Feedback submitted:', response.data);
            }
            setFormLoading(false); 
        } catch (err) {
            console.error('Error submitting feedback:', err.response?.data || err.message);
            setFormLoading(false); 

            if (err.response?.data) {
                const errorMessages = Object.entries(err.response.data)
                    .map(([key, value]) => {
                        const val = Array.isArray(value) ? value.join(', ') : value;
                        return `${key.replace(/_/g, ' ')}: ${val}`; 
                    })
                    .join('\n'); 
                setError(`Submission failed: \n${errorMessages}`);
            } else {
                setError('Failed to submit feedback. Please try again.');
            }
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

    if (!user || user.role !== 'manager') {
        return (
            <Container sx={{ mt: 4, textAlign: 'center' }}>
                <Alert severity="error" sx={{ mb: 2, display: 'inline-flex', alignItems: 'center' }}>
                    <Typography variant="body1" sx={{ mr: 1 }}>Access Denied. You must be logged in as a manager to submit feedback.</Typography>
                </Alert>
            </Container>
        );
    }

    return (
        <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
            <Paper elevation={3} sx={{ p: { xs: 2, md: 4 }, borderRadius: 2 }}>
                <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4, fontWeight: 'bold', color: 'text.primary', textAlign: 'center', borderBottom: '2px solid', borderColor: 'primary.main', pb: 1 }}>
                    Submit Performance Feedback
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
                        <InputLabel id="employee-select-label">Employee</InputLabel>
                        <Select
                            labelId="employee-select-label"
                            id="employee"
                            name="employee"
                            value={formData.employee}
                            label="Employee"
                            onChange={handleChange}
                            
                        >
                            <MenuItem value="">Select an Employee</MenuItem>
                            {employees.map((emp) => (
                                <MenuItem key={emp.id} value={emp.id}>
                                    {emp.username}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="strengths"
                        label="Strengths"
                        name="strengths"
                        multiline
                        rows={4}
                        value={formData.strengths}
                        onChange={handleChange}
                        variant="outlined"
                        placeholder="e.g., Excellent problem-solving skills, strong teamwork, consistently meets deadlines."
                    />

                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="areas_to_improve"
                        label="Areas to Improve"
                        name="areas_to_improve"
                        multiline
                        rows={4}
                        value={formData.areas_to_improve}
                        onChange={handleChange}
                        variant="outlined"
                        placeholder="e.g., Needs to improve communication in team meetings, time management for complex tasks."
                    />

                    <TextField
                        margin="normal"
                        fullWidth
                        id="sentiment"
                        label="Sentiment (Optional)"
                        name="sentiment"
                        value={formData.sentiment}
                        onChange={handleChange}
                        variant="outlined"
                        placeholder="e.g., Positive, Neutral, Needs Improvement, Very Impressive"
                    />

                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        color="primary"
                        sx={{ mt: 3, mb: 2, py: 1.5, fontSize: '1.1em' }}
                        endIcon={<SendIcon />}
                        disabled={formLoading} 
                    >
                        {formLoading ? <CircularProgress size={24} color="inherit" /> : 'Submit Feedback'}
                    </Button>
                </form>
            </Paper>
        </Container>
    );
};

export default FeedbackForm;