import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "";

if (!API_BASE_URL) {
    console.error(
        "VITE_API_URL is not set. In production this will cause requests to go to the frontend origin and return 404. Set VITE_API_URL in your hosting environment (e.g., Vercel). Falling back to http://localhost:8000 for local testing."
    );
}

const api = axios.create({
        baseURL: API_BASE_URL || "http://localhost:8000",
});

// Log the resolved base URL at runtime so we can diagnose production builds
console.info("Resolved API base URL:", api.defaults.baseURL);

// Automatically attach the Bearer token to every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem("token");
            window.location.reload();
        }
        return Promise.reject(error);
    }
);

export default api;
export { API_BASE_URL };