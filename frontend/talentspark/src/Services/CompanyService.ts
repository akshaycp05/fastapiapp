import axios from "axios";
import type { Company } from "../types/company";

const API_BASE_URL = "http://127.0.0.1:8000";

export async function getCompanies(): Promise<Company[]> {
    const response = await axios.get(`${API_BASE_URL}/company`);
    return response.data;
}

export async function getCompany(id: number): Promise<Company> {
    const response = await axios.get(`${API_BASE_URL}/company/${id}`);
    return response.data;
}

export async function createCompany(company: Company): Promise<Company> {
    const response = await axios.post(`${API_BASE_URL}/company`, company);
    return response.data;
}

export async function updateCompany(id: string, company: Company): Promise<Company> {
    const response = await axios.put(`${API_BASE_URL}/company/${id}`, company);
    return response.data;
}

export async function deleteCompany(id: string): Promise<void> {
    const response = await axios.delete(`${API_BASE_URL}/company/${id}`);
    return response.data;
}