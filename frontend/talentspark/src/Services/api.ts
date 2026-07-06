import axios from "axios";

const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) || "http://localhost:8000";

const api = axios.create({
    baseURL: API_BASE_URL,
});

// Automatically attach the Bearer token to every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers = config.headers ?? {};
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;
export { API_BASE_URL };