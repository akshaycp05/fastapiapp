import type {LoginRequest,LoginResponse,RegisterRequest,RegisterResponse} from "../types/user";
import axios from "axios";
const API_URL = "http://localhost:8000/auth";

export const login = async (credentials:LoginRequest):Promise<LoginResponse>=>{
    // Backend expects OAuth2PasswordRequestForm (form-encoded with "username" field)
    const formData = new URLSearchParams();
    formData.append("username", credentials.email);
    formData.append("password", credentials.password);

    const response = await axios.post<LoginResponse>(`${API_URL}/login`, formData, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" }
    });
    return response.data;
}

export const register = async (user:RegisterRequest):Promise<RegisterResponse>=>{
    const response = await axios.post<RegisterResponse>(`${API_URL}/register`,user);
    return response.data;
}