import React, { useContext, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
    const { user } = useContext(AuthContext);
    const location = useLocation();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check if token exists in localStorage
        const token = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');
        
        // If we have a token and saved user, but context user is null, 
        // we need to wait for context to initialize
        if (token && savedUser && !user) {
            // Token exists, user will be loaded from context's useEffect
            // Give it a moment to initialize
            setTimeout(() => setIsLoading(false), 100);
        } else {
            setIsLoading(false);
        }
    }, [user]);

    // Show loading while checking auth state
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    // If no user in context and no token in localStorage, redirect to login
    if (!user && !localStorage.getItem('token')) {
        // Redirect to login but save the attempted location
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
};

export default ProtectedRoute;
