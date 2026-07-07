import api from "./api";
import type {
    ResumeAnalysis,
    RagAnswer,
    EmbedResult,
    JobMatchResponse,
    SemanticSearchResponse
} from "../types/rag.ts";

export async function embedJobs(): Promise<EmbedResult> {
    const response = await api.post<EmbedResult>("/rag/embed-jobs");
    return response.data;
}

export async function semanticSearch(query: string): Promise<SemanticSearchResponse> {
    const response = await api.post<SemanticSearchResponse>("/rag/search", { query });
    return response.data;
}

export async function ragAsk(question: string): Promise<RagAnswer> {
    const response = await api.post<RagAnswer>("/rag/ask", { question });
    return response.data;
}

export async function analyseResume(resume_text: string): Promise<ResumeAnalysis> {
    const response = await api.post<ResumeAnalysis>("/rag/analyse-resume", { resume_text });
    return response.data;
}

export async function matchJobs(skills: string, experience: string): Promise<JobMatchResponse> {
    const response = await api.post<JobMatchResponse>("/rag/job-match", { skills, experience });
    return response.data;
}