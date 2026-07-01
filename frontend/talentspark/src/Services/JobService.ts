import axios from "axios";
import type { Job } from "../types/job";

const API_BASE_URL = "http://127.0.0.1:8000";

export async function getJob(id: number): Promise<Job> {
    const response = await axios.get(`${API_BASE_URL}/job/${id}`);
    return response.data;
}

export async function createJob(job: Job): Promise<Job> {
    const response = await axios.post(`${API_BASE_URL}/job`, job);
    return response.data;
}

export async function updateJob(id: string, job: Job): Promise<Job> {
    const response = await axios.put(`${API_BASE_URL}/job/${id}`, job);
    return response.data;
}

export async function deleteJob(id: string): Promise<void> {
    const response = await axios.delete(`${API_BASE_URL}/job/${id}`);
    return response.data;
}