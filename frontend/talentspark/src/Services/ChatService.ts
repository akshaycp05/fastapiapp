import api from "./api";

export async function sendChatMessage(message: string): Promise<string> {
  const response = await api.post("/chat/", { question: message });
  return response.data.response;
}
