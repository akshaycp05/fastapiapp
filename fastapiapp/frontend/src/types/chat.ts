interface ChatMessage {
    role: "user" | "bot";
    content: string;
}

interface ChatRequest {
    message: string;
    session_id: string;
}

interface ChatResponse {
    response: string;
}

export type { ChatMessage, ChatRequest, ChatResponse }