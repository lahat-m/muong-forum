// src/api.js
import axios from 'axios';

export const api = axios.create({
    baseURL: 'http://localhost:3000/',
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("ACCESS_TOKEN") || sessionStorage.getItem("ACCESS_TOKEN");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    }, 
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor to handle token refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        
        // If error is unauthorized and we haven't tried to refresh yet
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            
            try {
                // Get refresh token
                const refreshToken = localStorage.getItem('REFRESH_TOKEN') || sessionStorage.getItem('REFRESH_TOKEN');
                
                if (!refreshToken) {
                    // If no refresh token, redirect to login
                    window.location.href = '/login';
                    return Promise.reject(error);
                }
                
                // Attempt to refresh the token
                const response = await axios.post(
                    'http://localhost:3000/auth/refresh',
                    { refreshToken }
                );
                
                const newAccessToken = response.data.accessToken;
                
                // Update token in storage (maintain the same storage location)
                if (localStorage.getItem('ACCESS_TOKEN')) {
                    localStorage.setItem('ACCESS_TOKEN', newAccessToken);
                } else {
                    sessionStorage.setItem('ACCESS_TOKEN', newAccessToken);
                }
                
                // Retry the original request with the new token
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                return axios(originalRequest);
            } catch (refreshError) {
                // If refresh fails, clear auth data and redirect to login
                localStorage.removeItem('ACCESS_TOKEN');
                localStorage.removeItem('REFRESH_TOKEN');
                localStorage.removeItem('USER');
                sessionStorage.removeItem('ACCESS_TOKEN');
                sessionStorage.removeItem('REFRESH_TOKEN');
                sessionStorage.removeItem('USER');
                
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }
        
        return Promise.reject(error);
    }
);

export default api;