interface JobMatchResult {
    job_id: number | null;
    title: string;
    description: string;
    salary: number | null;
    match_score: number;
}

interface SemanticSearchResult {
    job_id: number | null;
    title: string;
    description: string;
    salary: number | null;
    score: number;
}

interface ResumeAnalysis {
    analysis: string;
}

interface RagAnswer {
    answer: string;
}

interface EmbedResult {
    message: string;
    count: number;
}

interface JobMatchResponse {
    matches: JobMatchResult[];
}

interface SemanticSearchResponse {
    results: SemanticSearchResult[];
}

export type {
    JobMatchResult,
    SemanticSearchResult,
    ResumeAnalysis,
    RagAnswer,
    EmbedResult,
    JobMatchResponse,
    SemanticSearchResponse
}