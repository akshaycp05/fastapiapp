// import Welcome from "./components/Welcome";
import CompanyCard from "./components/CompanyCard";
import JobCard from "./components/JobCard";
import Footer from "./components/footer";

import { useEffect, useState, useRef, type FormEvent } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import "./App.css";

import {
  getCompanies,
  updateCompany,
  deleteCompany,
  createCompany,
} from "./Services/CompanyService";

import {
  getJobs,
  updateJob,
  deleteJob,
  createJob,
} from "./Services/JobService";
import { sendChatMessage } from "./Services/ChatService.ts";
import {
  embedJobs,
  semanticSearch,
  ragAsk,
  analyseResume,
  matchJobs,
} from "./Services/RagService";

import type { Company } from "./types/company";
import type { Job } from "./types/job";

import Login from "./pages/Login";
import Register from "./pages/Register";

type ChatMessage = {
  id: number;
  role: "user" | "assistant";
  text: string;
};

function App() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const [companies, setCompanies] = useState<Company[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      role: "assistant",
      text: "Hi! I can help with jobs, resumes, interview prep, and company insights.",
    },
  ]);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatMode, setChatMode] = useState<"chat" | "ragAsk" | "semanticSearch" | "jobMatch" | "analyseResume">("chat");
  const [skillsInput, setSkillsInput] = useState("");
  const [experienceInput, setExperienceInput] = useState("");
  const [syncingEmbeddings, setSyncingEmbeddings] = useState(false);

  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token")
  );

  const [page, setPage] = useState<"login" | "register">("login");

  // Animation scope ref for GSAP
  const containerRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Smooth entry animations for dashboard elements
  useGSAP(() => {
    if (token && !loading && !error) {
      const tl = gsap.timeline();

      // Sidebar slide-in
      tl.fromTo(".sidebar", 
        { x: -100, opacity: 0 }, 
        { x: 0, opacity: 1, duration: 0.6, ease: "power2.out" }
      );

      // Navbar drop-down
      tl.fromTo(".navbar", 
        { y: -50, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 0.5, ease: "power2.out" },
        "-=0.4"
      );

      // Staggered entry for Stat Cards
      tl.fromTo(".stat-card", 
        { y: 30, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 0.4, stagger: 0.1, ease: "power1.out" },
        "-=0.2"
      );

      // Fade in the layout cards & footer
      tl.fromTo([".company-section-wrapper", ".job-section-wrapper", "footer"],
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.15, ease: "power2.out" },
        "-=0.3"
      );
    }
  }, [token, loading, error]);

  const handleLogin = (newToken: string) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
  };

  async function fetchData() {
    setLoading(true);

    try {
      const [companiesData, jobsData] = await Promise.all([
        getCompanies(),
        getJobs(),
      ]);

      setCompanies(Array.isArray(companiesData) ? companiesData : []);
      setJobs(Array.isArray(jobsData) ? jobsData : []);
    } catch (error) {
      setError(error as Error);
    } finally {
      setLoading(false);
    }
  }

  async function handleEdit(company: Company) {
    try {
      const updatedCompany = await updateCompany(company.id, company);

      setCompanies((prev) =>
        prev.map((c) =>
          c.id === updatedCompany.id ? updatedCompany : c
        )
      );
    } catch (error) {
      setError(error as Error);
    }
  }

  async function handleDelete(id: number) {
    try {
      await deleteCompany(id);

      setCompanies((prev) =>
        prev.filter((company) => company.id !== id)
      );
    } catch (error) {
      setError(error as Error);
    }
  }

  async function handleAdd(company: Company) {
    try {
      const newCompany = await createCompany(company);

      setCompanies((prev) => [...prev, newCompany]);
    } catch (error) {
      setError(error as Error);
    }
  }

  async function handleJobEdit(job: Job) {
    try {
      const updatedJob = await updateJob(job.id, job);

      setJobs((prev) =>
        prev.map((j) =>
          j.id === updatedJob.id ? updatedJob : j
        )
      );
    } catch (error) {
      setError(error as Error);
    }
  }

  async function handleJobDelete(id: number) {
    try {
      await deleteJob(id);

      setJobs((prev) =>
        prev.filter((job) => job.id !== id)
      );
    } catch (error) {
      setError(error as Error);
    }
  }

  async function handleJobAdd(job: Job) {
    try {
      const newJob = await createJob(job);

      setJobs((prev) => [...prev, newJob]);
    } catch (error) {
      setError(error as Error);
    }
  }

  useEffect(() => {
    if (!token) return;

    const timer = window.setTimeout(() => {
      void fetchData();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [token]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, chatLoading]);

  async function handleSyncEmbeddings() {
    if (syncingEmbeddings) return;
    setSyncingEmbeddings(true);
    
    const startMsgId = Date.now();
    setChatMessages((prev) => [
      ...prev,
      {
        id: startMsgId,
        role: "assistant",
        text: "Syncing jobs to vector database (Qdrant)... Please wait.",
      }
    ]);

    try {
      const res = await embedJobs();
      setChatMessages((prev) => [
        ...prev.filter(m => m.id !== startMsgId),
        {
          id: Date.now(),
          role: "assistant",
          text: `✅ Sync Completed! ${res.message} (Total embedded: ${res.count})`,
        }
      ]);
    } catch (e: any) {
      setChatMessages((prev) => [
        ...prev.filter(m => m.id !== startMsgId),
        {
          id: Date.now(),
          role: "assistant",
          text: `❌ Sync Failed: ${e?.message || e || "Unknown error"}`,
        }
      ]);
    } finally {
      setSyncingEmbeddings(false);
    }
  }

  async function handleChatSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    let displayMessage = "";
    let messageToSend = "";
    if (chatMode === "jobMatch") {
      if (!skillsInput.trim() || !experienceInput.trim() || chatLoading) return;
      displayMessage = `Job Match Request:\n- Skills: ${skillsInput.trim()}\n- Experience: ${experienceInput.trim()}`;
    } else {
      if (!chatInput.trim() || chatLoading) return;
      displayMessage = chatInput.trim();
      messageToSend = chatInput.trim();
    }

    const userMessage: ChatMessage = {
      id: Date.now(),
      role: "user",
      text: displayMessage,
    };

    setChatMessages((prev) => [...prev, userMessage]);
    setChatInput("");
    setChatLoading(true);

    try {
      let reply = "";
      if (chatMode === "chat") {
        reply = await sendChatMessage(messageToSend);
      } else if (chatMode === "ragAsk") {
        const ragRes = await ragAsk(messageToSend);
        reply = ragRes.answer;
      } else if (chatMode === "semanticSearch") {
        const searchRes = await semanticSearch(messageToSend);
        if (!searchRes.results || searchRes.results.length === 0) {
          reply = "No matching jobs found.";
        } else {
          reply = "Here are the top semantic search results for jobs:\n\n" + 
            searchRes.results.map((r, index) => 
              `${index + 1}. **${r.title}** (Score: ${(r.score * 100).toFixed(1)}%)\n` + 
              `   - Salary: ${r.salary || "N/A"}\n` + 
              `   - Description: ${r.description.length > 150 ? r.description.substring(0, 150) + "..." : r.description}`
            ).join("\n\n");
        }
      } else if (chatMode === "jobMatch") {
        const matchRes = await matchJobs(skillsInput, experienceInput);
        if (!matchRes.matches || matchRes.matches.length === 0) {
          reply = "No matching jobs found for your profile.";
        } else {
          reply = "Here are the best matching jobs for your profile:\n\n" + 
            matchRes.matches.map((r, index) => 
              `${index + 1}. **${r.title}** (Match Score: ${(r.match_score * 100).toFixed(1)}%)\n` + 
              `   - Salary: ${r.salary || "N/A"}\n` + 
              `   - Description: ${r.description.length > 150 ? r.description.substring(0, 150) + "..." : r.description}`
            ).join("\n\n");
        }
        setSkillsInput("");
        setExperienceInput("");
      } else if (chatMode === "analyseResume") {
        const analysisRes = await analyseResume(messageToSend);
        reply = `**Resume Analysis:**\n\n${analysisRes.analysis}`;
      }

      setChatMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: "assistant",
          text: reply,
        },
      ]);
    } catch (e: any) {
      setChatMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 2,
          role: "assistant",
          text: `The assistant is temporarily unavailable. Please try again. (Details: ${e?.message || e || "Unknown error"})`,
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  }

  if (!token) {
    return (
      <>
        {page === "login" ? (
          <Login
            onLogin={handleLogin}
            onSwitchToRegister={() => setPage("register")}
          />
        ) : (
          <Register
            onSwitchToLogin={() => setPage("login")}
          />
        )}
      </>
    );
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="app" ref={containerRef}>

      {/* Main */}
      <div className="main">

        {/* Navbar */}
        <div className="navbar">

          <h1>Admin Dashboard</h1>

          <button
            className="logout-btn"
            onClick={() => {
              localStorage.removeItem("token");
              setToken(null);
            }}
          >
            Logout
          </button>

        </div>

        {/* Statistics */}

        <div className="stats">

          <div className="stat-card">
            <h3>Total Companies</h3>
            <h2>{companies.length}</h2>
          </div>

          <div className="stat-card">
            <h3>Total Jobs</h3>
            <h2>{jobs.length}</h2>
          </div>

          <div className="stat-card">
            <h3>Total Users</h3>
            <h2>12</h2>
          </div>

          <div className="stat-card">
            <h3>AI Chats</h3>
            <h2>35</h2>
          </div>

        </div>

        <section className="chat-panel" id="chat-panel">
          <div className="chat-panel-header">
            <div>
              <p className="chat-panel-eyebrow">AI assistant</p>
              <h3>Talk with TalentSpark</h3>
            </div>
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <button 
                type="button"
                className="sync-embeddings-btn" 
                onClick={handleSyncEmbeddings}
                disabled={syncingEmbeddings}
                title="Sync current jobs to Qdrant vector database"
              >
                {syncingEmbeddings ? "Syncing..." : "Sync Jobs (Embed)"}
              </button>
              <span className="chat-status">Online</span>
            </div>
          </div>

          {/* RAG & Chat Mode Tabs */}
          <div className="chat-tabs">
            <button 
              type="button"
              className={`chat-tab ${chatMode === "chat" ? "active" : ""}`}
              onClick={() => setChatMode("chat")}
            >
              General Chat
            </button>
            <button 
              type="button"
              className={`chat-tab ${chatMode === "ragAsk" ? "active" : ""}`}
              onClick={() => setChatMode("ragAsk")}
            >
              RAG Q&A
            </button>
            <button 
              type="button"
              className={`chat-tab ${chatMode === "semanticSearch" ? "active" : ""}`}
              onClick={() => setChatMode("semanticSearch")}
            >
              Job Search
            </button>
            <button 
              type="button"
              className={`chat-tab ${chatMode === "jobMatch" ? "active" : ""}`}
              onClick={() => setChatMode("jobMatch")}
            >
              Job Match
            </button>
            <button 
              type="button"
              className={`chat-tab ${chatMode === "analyseResume" ? "active" : ""}`}
              onClick={() => setChatMode("analyseResume")}
            >
              Analyze Resume
            </button>
          </div>

          <div className="chat-messages">
            {chatMessages.map((message) => (
              <div key={message.id} className={`message ${message.role}`}>
                <span>{message.text}</span>
              </div>
            ))}
            {chatLoading && (
              <div className="message assistant">
                <span>Thinking...</span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <form className="chat-input-row" onSubmit={handleChatSubmit}>
            {chatMode === "jobMatch" ? (
              <div className="job-match-inputs">
                <input
                  type="text"
                  value={skillsInput}
                  onChange={(event) => setSkillsInput(event.target.value)}
                  placeholder="Skills (e.g. Python, SQL)"
                  required
                />
                <input
                  type="text"
                  value={experienceInput}
                  onChange={(event) => setExperienceInput(event.target.value)}
                  placeholder="Experience (e.g. 3 years)"
                  required
                />
              </div>
            ) : (
              <input
                type="text"
                value={chatInput}
                onChange={(event) => setChatInput(event.target.value)}
                placeholder={
                  chatMode === "chat" 
                    ? "Ask about jobs, career guidance, or resumes" 
                    : chatMode === "ragAsk"
                    ? "Ask a question about jobs in database..."
                    : chatMode === "semanticSearch"
                    ? "Enter search keywords or job preferences..."
                    : "Paste your resume text here for AI analysis..."
                }
                required
              />
            )}
            <button type="submit" disabled={chatLoading}>
              {chatLoading ? "Sending..." : "Send"}
            </button>
          </form>
        </section>

        {/* Company Section */}
        <div className="company-section-wrapper">
          <CompanyCard
            companies={companies}
            jobs={jobs}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onAdd={handleAdd}
          />
        </div>

        {/* Job Section */}
        <div className="job-section-wrapper">
          <JobCard
            jobs={jobs}
            companies={companies}
            onEdit={handleJobEdit}
            onDelete={handleJobDelete}
            onAdd={handleJobAdd}
          />
        </div>

        <Footer />

      </div>

    </div>
  );
}

export default App;