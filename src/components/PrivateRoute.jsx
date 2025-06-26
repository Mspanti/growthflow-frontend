

import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = () => {
    const { user, loading } = useAuth(); 

    if (loading) {
        return <p>Checking authentication...</p>; 
    }

    
    return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;