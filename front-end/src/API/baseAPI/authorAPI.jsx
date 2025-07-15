import axios from 'axios';
import authAPI from '../authAPI';

// Create Axios instance
const authorApi = axios.create({
    baseURL: 'http://localhost:9999',
    headers: {
        'Content-Type': 'application/json'
    },
    withCredentials: true // Ensures cookies are sent with requests
});

// Request Interceptor
authorApi.interceptors.request.use(config => {
    // Get the token from localStorage or cookies
    const token = localStorage.getItem('authToken');
    console.log("Token from localStorage:", token);
    if (token) {
        // Attach the token to the Authorization header
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    // Optionally, you can log the request or modify it further
    // Return the modified config
    return config;
}, (error) => {
    return Promise.reject(error);
});

// Response Interceptor
authorApi.interceptors.response.use(
    response => response,
    async error => {
        const originalRequest = error.config;

        if (error.response && error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true; // Prevent infinite loops

            const response = await authAPI.refreshToken();
            localStorage.setItem('authToken', response.data.accessToken); // Update token in localStorage
            if (response) return authorApi(originalRequest);
            // If refresh fails, redirect to login
            window.location.href = '/login';
        }

        return Promise.reject(error);
    }
);

export default authorApi;
