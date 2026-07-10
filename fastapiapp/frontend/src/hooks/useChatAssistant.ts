import { useEffect, useRef, useState, type FormEvent } from "react";
import { sendChatMessage } from "../Services/ChatService";
import { embedJobs, semanticSearch, ragAsk, analyseResume, matchJobs } from "../Services/RagService";

export type ChatMode = "chat" | "ragAsk" | "semanticSearch" | "jobMatch" | "analyseResume";

export type ChatMessage = {
  id: number;
  role: "user" | "assistant";
  text: string;
};

export const CHAT_MODES: { id: ChatMode; label: string }[] = [
  { id: "chat", label: "General Chat" },
  { id: "ragAsk", label: "RAG Q&A" },
  { id: "semanticSearch", label: "Job Search" },
  { id: "jobMatch", label: "Job Match" },
  { id: "analyseResume", label: "Analyze Resume" },
];

export function useChatAssistant() {
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      role: "assistant",
      text: "Hi! I can help with jobs, resumes, interview prep, and company insights.",
    },
  ]);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatMode, setChatMode] = useState<ChatMode>("chat");
  const [skillsInput, setSkillsInput] = useState("");
  const [experienceInput, setExperienceInput] = useState("");
  const [syncingEmbeddings, setSyncingEmbeddings] = useState(false);

  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, chatLoading]);

  async function handleSyncEmbeddings() {
    if (syncingEmbeddings) return;
    setSyncingEmbeddings(true);

    const startMsgId = Date.now();
    setChatMessages((prev) => [
      ...prev,
      { id: startMsgId, role: "assistant", text: "Syncing jobs to vector database (Qdrant)... Please wait." },
    ]);

    try {
      const res = await embedJobs();
      setChatMessages((prev) => [
        ...prev.filter((m) => m.id !== startMsgId),
        {
          id: Date.now(),
          role: "assistant",
          text: `Sync completed. ${res.message} (Total embedded: ${res.count})`,
        },
      ]);
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : String(e ?? "Unknown error");
      setChatMessages((prev) => [
        ...prev.filter((m) => m.id !== startMsgId),
        { id: Date.now(), role: "assistant", text: `Sync failed: ${errorMessage}` },
      ]);
    } finally {
      setSyncingEmbeddings(false);
    }
  }

  async function handleChatSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    let messageToSend = "";
    if (chatMode === "jobMatch") {
      if (!skillsInput.trim() || !experienceInput.trim() || chatLoading) return;
    } else {
      if (!chatInput.trim() || chatLoading) return;
      messageToSend = chatInput.trim();
    }

    const userMessage: ChatMessage = {
      id: Date.now(),
      role: "user",
      text:
        chatMode === "jobMatch"
          ? `Job Match Request:\n- Skills: ${skillsInput.trim()}\n- Experience: ${experienceInput.trim()}`
          : chatInput.trim(),
    };

    setChatMessages((prev) => [...prev, userMessage]);
    setChatInput("");
    setChatLoading(true);

    try {
      let reply = "";
      if (chatMode === "chat") {
        const res = await sendChatMessage(messageToSend);
        reply = typeof res === "string" ? res : res.response;
      } else if (chatMode === "ragAsk") {
        const ragRes = await ragAsk(messageToSend);
        reply = ragRes.answer;
      } else if (chatMode === "semanticSearch") {
        const searchRes = await semanticSearch(messageToSend);
        if (!searchRes.results || searchRes.results.length === 0) {
          reply = "No matching jobs found.";
        } else {
          reply =
            "Here are the top semantic search results for jobs:\n\n" +
            searchRes.results
              .map(
                (r, index) =>
                  `${index + 1}. ${r.title} (Score: ${(r.score * 100).toFixed(1)}%)\n` +
                  `   - Salary: ${r.salary || "N/A"}\n` +
                  `   - Description: ${
                    r.description.length > 150 ? r.description.substring(0, 150) + "..." : r.description
                  }`
              )
              .join("\n\n");
        }
      } else if (chatMode === "jobMatch") {
        const matchRes = await matchJobs(skillsInput, experienceInput);
        if (!matchRes.matches || matchRes.matches.length === 0) {
          reply = "No matching jobs found for your profile.";
        } else {
          reply =
            "Here are the best matching jobs for your profile:\n\n" +
            matchRes.matches
              .map(
                (r, index) =>
                  `${index + 1}. ${r.title} (Match Score: ${(r.match_score * 100).toFixed(1)}%)\n` +
                  `   - Salary: ${r.salary || "N/A"}\n` +
                  `   - Description: ${
                    r.description.length > 150 ? r.description.substring(0, 150) + "..." : r.description
                  }`
              )
              .join("\n\n");
        }
        setSkillsInput("");
        setExperienceInput("");
      } else if (chatMode === "analyseResume") {
        const analysisRes = await analyseResume(messageToSend);
        reply = `Resume Analysis:\n\n${analysisRes.analysis}`;
      }

      setChatMessages((prev) => [...prev, { id: Date.now() + 1, role: "assistant", text: reply }]);
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : String(e ?? "Unknown error");
      setChatMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 2,
          role: "assistant",
          text: `The assistant is temporarily unavailable. Please try again. (Details: ${errorMessage})`,
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  }

  return {
    chatInput,
    setChatInput,
    chatMessages,
    chatLoading,
    chatMode,
    setChatMode,
    skillsInput,
    setSkillsInput,
    experienceInput,
    setExperienceInput,
    syncingEmbeddings,
    chatEndRef,
    handleSyncEmbeddings,
    handleChatSubmit,
  };
}
