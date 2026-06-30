import axios from "axios";
import type { Company } from "../types/company";

const API_BASE_URL = "http://127.0.0.1:8000";

export async function getCompanies(): Promise<Company[]> {
    const response = await axios.get(`${API_BASE_URL}/company/`);
    return response.data;
}