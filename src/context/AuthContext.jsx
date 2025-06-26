

import { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();


const API_BASE_URL = 'http://localhost:8000/api';


const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const AuthProvider = ({ children }) => {
    const [authToken, setAuthToken] = useState(() => {
        try {
            const storedTokens = localStorage.getItem('authTokens');
            return storedTokens ? JSON.parse(storedTokens) : null;
        } catch (e) {
            console.error("Error parsing authTokens from localStorage:", e);
            localStorage.removeItem('authTokens');
            return null;
        }
    });

    const [user, setUser] = useState(() => {
        if (authToken && authToken.access) {
            try {
                return jwtDecode(authToken.access);
            } catch (e) {
                console.error("Error decoding initial access token:", e);
                localStorage.removeItem('authTokens');
                return null;
            }
        }
        return null;
    });

    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const logoutUser = useCallback(() => {
        console.log('User logging out...');
        setAuthToken(null);
        setUser(null);
        localStorage.removeItem('authTokens');
        console.log('User logged out. Redirecting to login.');
        navigate('/login');
    }, [navigate]);

    const refreshAccessToken = useCallback(async () => {
        if (!authToken?.refresh) {
            console.warn('No refresh token available to renew access token. Logging out.');
            logoutUser();
            return null;
        }

        try {
            console.log('Attempting to refresh token...');
            const response = await axios.post(`${API_BASE_URL}/token/refresh/`, {
                refresh: authToken.refresh,
            });

            if (response.status === 200) {
                const newAccess = response.data.access;
                const newAuthToken = { access: newAccess, refresh: authToken.refresh };
                setAuthToken(newAuthToken);
                localStorage.setItem('authTokens', JSON.stringify(newAuthToken));

                try {
                    setUser(jwtDecode(newAccess));
                } catch (e) {
                    console.error("Error decoding new access token after refresh:", e);
                    logoutUser();
                    return null;
                }
                
                console.log('Token refreshed successfully!');
                return newAuthToken;
            } else {
                console.error('Token refresh failed:', response.status, response.data);
                logoutUser();
                return null;
            }
        } catch (error) {
            console.error('Error refreshing token (caught exception):', error.response?.data || error.message);
            logoutUser();
            return null;
        }
    }, [authToken, logoutUser]);

  
    useEffect(() => {
       
        if (axiosInstance.defaults.headers.common['Authorization']) {
            delete axiosInstance.defaults.headers.common['Authorization'];
        }

       
        if (authToken?.access) {
            axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${authToken.access}`;
        }
        
       
        const requestInterceptor = axiosInstance.interceptors.request.use(
            async (config) => {
                
                if (config.url.endsWith('/token/') || config.url.endsWith('/token/refresh/') || !authToken?.access) {
                    return config;
                }

                try {
                    const decodedToken = jwtDecode(authToken.access);
                    const isExpired = decodedToken.exp * 1000 < Date.now();

                    if (!isExpired) {
                        return config;
                    }

                   
                    console.log('Access token expired. Attempting refresh for:', config.url);
                    const newTokens = await refreshAccessToken();
                    if (newTokens) {
                        
                        config.headers.Authorization = `Bearer ${newTokens.access}`;
                    } else {
                       
                        return Promise.reject(new Error("Token refresh failed, request aborted."));
                    }
                } catch (e) {
                    console.error("Error in request interceptor token handling:", e);
                    logoutUser(); 
                    return Promise.reject(new Error("Authentication failed, request aborted."));
                }
                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );

        
        const responseInterceptor = axiosInstance.interceptors.response.use(
            (response) => response,
            async (error) => {
                const originalRequest = error.config;
              
                if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url.endsWith('/token/refresh/')) {
                    originalRequest._retry = true;
                    console.log('401 Unauthorized caught. Retrying request after token refresh.');
                    try {
                        const newTokens = await refreshAccessToken();
                        if (newTokens) {
                            originalRequest.headers.Authorization = `Bearer ${newTokens.access}`;
                           
                            return axiosInstance(originalRequest);
                        }
                    } catch (refreshError) {
                        console.error('Error during 401 retry refresh:', refreshError);
                        
                        logoutUser();
                        return Promise.reject(refreshError);
                    }
                }
                return Promise.reject(error);
            }
        );

        
        return () => {
            axiosInstance.interceptors.request.eject(requestInterceptor);
            axiosInstance.interceptors.response.eject(responseInterceptor);
        };
    }, [authToken, refreshAccessToken, logoutUser]); 

   
    const loginUser = async (username, password) => {
        setLoading(true);
        try {
            console.log('Attempting login...');
            
            const response = await axios.post(`${API_BASE_URL}/token/`, {
                username,
                password,
            });

            if (response.status === 200) {
                const { access, refresh } = response.data;
                const newAuthToken = { access, refresh };
                
                setAuthToken(newAuthToken);
                localStorage.setItem('authTokens', JSON.stringify(newAuthToken));

                const decodedUser = jwtDecode(access);
                setUser(decodedUser);

                console.log('Login successful! User role:', decodedUser.role);

                if (decodedUser.role === 'manager') {
                    navigate('/manager-dashboard');
                } else if (decodedUser.role === 'employee') {
                    navigate('/employee-dashboard');
                } else {
                    navigate('/dashboard');
                }

            } else {
                console.error('Login failed:', response.status, response.data);
                alert('Login failed!');
            }
        } catch (error) {
            console.error('Login error:', error.response?.data || error.message);
            const errorMessage = error.response?.data?.detail || error.message || 'An unexpected error occurred during login.';
            alert(`Login failed: ${errorMessage}`);
            
            setAuthToken(null);
            setUser(null);
            localStorage.removeItem('authTokens');
        } finally {
            setLoading(false);
        }
    };

    
    useEffect(() => {
        
        setLoading(false); 
    }, []); 

   
    const contextData = {
        user,
        authToken, 
        loginUser,
        logoutUser,
        loading,
        axiosInstance, 
    };

    return (
        <AuthContext.Provider value={contextData}>
            {/* Show a loading indicator until initial authentication check is complete */}
            {loading ? <p style={{textAlign: "center", padding: "20px", fontSize: "1.2em", color: "#555"}}>Loading application...</p> : children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};

export default AuthContext;