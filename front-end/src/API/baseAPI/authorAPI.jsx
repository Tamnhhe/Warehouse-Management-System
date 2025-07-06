import axios from "axios";
import authAPI from "../authAPI";

// Create Axios instance
const authorApi = axios.create({
  baseURL: "http://localhost:9999",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Ensures cookies are sent with requests
});

// Request Interceptor
authorApi.interceptors.request.use(
  (config) => {
    // Add Authorization header if token exists
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = token;
    }
    console.log(
      "API Request:",
      config.method?.toUpperCase(),
      config.url,
      config.data
    );
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor
authorApi.interceptors.response.use(
  (response) => {
    console.log(
      "API Response:",
      response.status,
      response.config.url,
      response.data
    );
    return response;
  },
  async (error) => {
    console.error(
      "API Error:",
      error.response?.status,
      error.config?.url,
      error.response?.data
    );
    const originalRequest = error.config;

    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true; // Prevent infinite loops

      const response = await authAPI.refreshToken();
      if (response) return authorApi(originalRequest);
      // If refresh fails, redirect to login
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default authorApi;
