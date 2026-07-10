import axios from "axios";
import type { ChatRequest, ChatResponse } from "../types/chat";

const API_URL = import.meta.env.VITE_API_URL;

export const sendMessage = async (
  data: ChatRequest
): Promise<ChatResponse> => {
  const base = API_URL ?? "";
  const url = base.endsWith("/") ? `${base}chat` : `${base}/chat`;
  const response = await axios.post(url, data);
  return response.data;
};