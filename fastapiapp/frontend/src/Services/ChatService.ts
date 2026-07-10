import axios from "axios";
import type { ChatRequest, ChatResponse } from "../types/chat";

const API_URL = import.meta.env.VITE_API_URL;

export const sendChatMessage = async (
  data: string | ChatRequest
): Promise<ChatResponse | string> => {
  const base = API_URL ?? "";
  const url = base.endsWith("/") ? `${base}chat` : `${base}/chat`;
  const payload = typeof data === "string" ? { message: data, session_id: "default" } : data;
  const response = await axios.post(url, payload);
  return response.data;
};