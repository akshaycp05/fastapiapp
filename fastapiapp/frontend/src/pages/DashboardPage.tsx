import ReactMarkdown from "react-markdown";
import { useAppData } from "../context/AppDataContext";
import { useSearchParams } from "react-router-dom";
import { useChatAssistant, CHAT_MODES } from "../hooks/useChatAssistant";

const MODE_ICONS: Record<string, string> = {
  chat: "chat_bubble",
  ragAsk: "database",
  semanticSearch: "person_search",
  jobMatch: "join_inner",
  analyseResume: "description",
};

function DashboardPage() {
  const { companies, jobs, loading, error } = useAppData();
  const {
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
  } = useChatAssistant();

  const [searchParams] = useSearchParams();
  const tab = searchParams.get("tab") || "overview";
  const priorityJobs = jobs.slice(0, 5);

  function companyName(companyId: number) {
    return companies.find((c) => c.id === companyId)?.name ?? "Unknown Company";
  }

  return (
    <div className="p-lg max-w-[1440px] mx-auto w-full">
      <div className="mb-lg">
        <h2 className="font-headline-lg text-headline-lg text-primary mb-2">Platform Overview</h2>
        <p className="text-on-surface-variant text-body-md">
          Real-time talent acquisition and management insights.
        </p>
      </div>

      {error && (
        <div className="mb-md p-3 bg-error-container text-on-error-container rounded text-body-sm">
          Could not load live data: {error.message}
        </div>
      )}

      {tab === "overview" ? (
        <>
          {/* METRIC CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter mb-xl">
            <div className="stat-card bg-white p-md rounded shadow-[0px_4px_20px_rgba(0,0,0,0.04)] border border-surface-variant/20 hover:scale-[1.01] transition-all">
              <div className="flex justify-between items-start mb-4">
                <span className="font-label-md text-label-md text-on-primary-container uppercase tracking-widest">
                  Total Companies
                </span>
                <span className="material-symbols-outlined text-secondary">business</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-headline-lg text-headline-lg text-primary">
                  {loading ? "…" : companies.length}
                </span>
              </div>
            </div>

            <div className="stat-card bg-white p-md rounded shadow-[0px_4px_20px_rgba(0,0,0,0.04)] border border-surface-variant/20 hover:scale-[1.01] transition-all">
              <div className="flex justify-between items-start mb-4">
                <span className="font-label-md text-label-md text-on-primary-container uppercase tracking-widest">
                  Total Jobs
                </span>
                <span className="material-symbols-outlined text-secondary">work</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-headline-lg text-headline-lg text-primary">{loading ? "…" : jobs.length}</span>
              </div>
            </div>

            <div className="stat-card bg-white p-md rounded shadow-[0px_4px_20px_rgba(0,0,0,0.04)] border border-surface-variant/20 hover:scale-[1.01] transition-all">
              <div className="flex justify-between items-start mb-4">
                <span className="font-label-md text-label-md text-on-primary-container uppercase tracking-widest">
                  Total Users
                </span>
                <span className="material-symbols-outlined text-secondary">group</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-headline-lg text-headline-lg text-primary">—</span>
              </div>
            </div>

            <div className="stat-card bg-white p-md rounded shadow-[0px_4px_20px_rgba(0,0,0,0.04)] border border-surface-variant/20 hover:scale-[1.01] transition-all">
              <div className="flex justify-between items-start mb-4">
                <span className="font-label-md text-label-md text-on-primary-container uppercase tracking-widest">
                  AI Chats
                </span>
                <span className="material-symbols-outlined text-secondary">forum</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-headline-lg text-headline-lg text-primary">{chatMessages.length}</span>
              </div>
            </div>
          </div>

          {/* AI ASSISTANT SECTION */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter h-[600px]">
            {/* Mode selection panel */}
            <div className="lg:col-span-3 bg-white rounded shadow-[0px_4px_20px_rgba(0,0,0,0.04)] border border-surface-variant/20 flex flex-col overflow-hidden">
              <div className="p-4 border-b border-surface-variant/10">
                <h3 className="font-headline-sm text-headline-sm text-primary mb-1">AI Assistant</h3>
                <p className="text-body-sm text-on-surface-variant opacity-60 italic">Enhanced with RAG context</p>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
                {CHAT_MODES.map((mode) => (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => setChatMode(mode.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all text-left ${
                      chatMode === mode.id
                        ? "bg-surface-container-low text-primary font-bold"
                        : "text-on-surface-variant hover:bg-surface-container-low"
                    }`}
                  >
                    <span className="material-symbols-outlined text-xl">{MODE_ICONS[mode.id]}</span>
                    <span className="text-body-md">{mode.label}</span>
                  </button>
                ))}
                <div className="pt-4 px-3 pb-2">
                  <p className="text-[10px] font-label-md text-on-primary-container uppercase opacity-50">Vector DB</p>
                </div>
                <button
                  type="button"
                  onClick={handleSyncEmbeddings}
                  disabled={syncingEmbeddings}
                  className="w-full p-3 rounded-lg text-on-surface-variant hover:bg-surface-container-low transition-all text-left text-body-sm disabled:opacity-50"
                >
                  {syncingEmbeddings ? "Syncing jobs…" : "Sync Jobs to Qdrant"}
                </button>
              </div>
            </div>

            {/* Chat window */}
            <div className="lg:col-span-9 bg-white rounded shadow-[0px_4px_20px_rgba(0,0,0,0.04)] border border-surface-variant/20 flex flex-col overflow-hidden">
              <div className="flex items-center justify-between border-b border-surface-variant/10 px-4">
                <div className="py-4 font-bold text-primary text-body-sm border-b-2 border-primary">
                  {CHAT_MODES.find((m) => m.id === chatMode)?.label}
                </div>
                <span className="flex items-center gap-1 text-[10px] font-label-md text-secondary uppercase">
                  <span className="w-2 h-2 rounded-full bg-secondary inline-block" /> Online
                </span>
              </div>

              <div className="flex-1 p-md overflow-y-auto custom-scrollbar space-y-6 bg-surface/30">
                {chatMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-4 max-w-[80%] ${message.role === "user" ? "flex-row-reverse ml-auto" : ""}`}
                  >
                    <div
                      className={`w-8 h-8 rounded flex items-center justify-center flex-shrink-0 ${
                        message.role === "user" ? "bg-secondary" : "bg-primary-container"
                      }`}
                    >
                      <span
                        className={`material-symbols-outlined text-sm ${
                          message.role === "user" ? "text-white" : "text-primary-fixed-dim"
                        }`}
                      >
                        {message.role === "user" ? "person" : "smart_toy"}
                      </span>
                    </div>
                    {message.role === "user" ? (
                      <div className="bg-primary-container text-white p-4 rounded-xl rounded-tr-none shadow-sm">
                        <p className="text-body-md whitespace-pre-wrap">{message.text}</p>
                      </div>
                    ) : (
                      <div className="bg-surface-container-low p-4 rounded-xl rounded-tl-none border border-surface-variant/10">
                        <div className="text-body-md text-on-surface prose prose-sm max-w-none [&_p]:my-1">
                          <ReactMarkdown>{message.text}</ReactMarkdown>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                {chatLoading && (
                  <div className="flex gap-4 max-w-[80%]">
                    <div className="w-8 h-8 rounded bg-primary-container flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined text-primary-fixed-dim text-sm">smart_toy</span>
                    </div>
                    <div className="bg-surface-container-low p-4 rounded-xl rounded-tl-none border border-surface-variant/10">
                      <p className="text-body-md text-on-surface">Thinking…</p>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              <form className="p-4 border-t border-surface-variant/10 bg-white" onSubmit={handleChatSubmit}>
                {chatMode === "jobMatch" ? (
                  <div className="flex gap-2">
                    <input
                      className="flex-1 bg-surface py-4 px-4 rounded-xl border border-outline-variant focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all text-body-md"
                      type="text"
                      value={skillsInput}
                      onChange={(e) => setSkillsInput(e.target.value)}
                      placeholder="Skills (e.g. Python, SQL)"
                      required
                    />
                    <input
                      className="flex-1 bg-surface py-4 px-4 rounded-xl border border-outline-variant focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all text-body-md"
                      type="text"
                      value={experienceInput}
                      onChange={(e) => setExperienceInput(e.target.value)}
                      placeholder="Experience (e.g. 3 years)"
                      required
                    />
                    <button
                      type="submit"
                      disabled={chatLoading}
                      className="bg-primary text-white px-6 rounded-xl hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
                    >
                      <span className="material-symbols-outlined">send</span>
                    </button>
                  </div>
                ) : (
                  <div className="relative flex items-center">
                    <input
                      className="w-full bg-surface py-4 pl-4 pr-16 rounded-xl border border-outline-variant focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all text-body-md"
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
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
                    <button
                      type="submit"
                      disabled={chatLoading}
                      className="absolute right-2 bg-primary text-white p-2 rounded-lg hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
                    >
                      <span className="material-symbols-outlined">send</span>
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>
        </>
      ) : tab === "reports" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter mb-xl">
          <div className="bg-white rounded shadow-[0px_4px_20px_rgba(0,0,0,0.04)] border border-surface-variant/20 p-md">
            <h3 className="font-headline-sm text-headline-sm text-primary mb-3">Reports summary</h3>
            <p className="text-body-sm text-on-surface-variant">
              View aggregated performance and hiring funnel metrics. This section is wired to the dashboard and ready for your reports data.
            </p>
          </div>
          <div className="bg-white rounded shadow-[0px_4px_20px_rgba(0,0,0,0.04)] border border-surface-variant/20 p-md">
            <h3 className="font-headline-sm text-headline-sm text-primary mb-3">Hiring pipeline</h3>
            <p className="text-body-sm text-on-surface-variant">
              Track job postings, applications, and candidate engagement in one place. Use this view to verify active hiring status.
            </p>
          </div>
          <div className="bg-white rounded shadow-[0px_4px_20px_rgba(0,0,0,0.04)] border border-surface-variant/20 p-md">
            <h3 className="font-headline-sm text-headline-sm text-primary mb-3">Insights</h3>
            <p className="text-body-sm text-on-surface-variant">
              Reports can display job trends, company demand, and AI-assisted staffing recommendations for your platform.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-6 mb-xl">
          <div className="bg-white rounded shadow-[0px_4px_20px_rgba(0,0,0,0.04)] border border-surface-variant/20 p-md">
            <h3 className="font-headline-sm text-headline-sm text-primary mb-3">Recent activity</h3>
            <p className="text-body-sm text-on-surface-variant">
              The activity feed is connected and ready to show recent updates, user actions, and workflow events from your HR platform.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
            <div className="bg-white rounded shadow-[0px_4px_20px_rgba(0,0,0,0.04)] border border-surface-variant/20 p-md">
              <p className="font-medium text-body-md text-primary mb-2">Latest job postings</p>
              <p className="text-body-sm text-on-surface-variant">Review the most recent jobs added to the platform and monitor candidate interest.</p>
            </div>
            <div className="bg-white rounded shadow-[0px_4px_20px_rgba(0,0,0,0.04)] border border-surface-variant/20 p-md">
              <p className="font-medium text-body-md text-primary mb-2">Recent user actions</p>
              <p className="text-body-sm text-on-surface-variant">Activity updates will surface user logins, application events, and key admin actions.</p>
            </div>
          </div>
        </div>
      )}

      {/* PRIORITY OPENINGS TABLE */}

      {/* PRIORITY OPENINGS TABLE */}
      <div className="mt-xl bg-white rounded shadow-[0px_4px_20px_rgba(0,0,0,0.04)] border border-surface-variant/20 overflow-hidden">
        <div className="p-md flex justify-between items-center border-b border-surface-variant/10">
          <h3 className="font-headline-sm text-headline-sm text-primary">Priority Openings</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface">
                <th className="p-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
                  Position
                </th>
                <th className="p-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
                  Company
                </th>
                <th className="p-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
                  Salary
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-variant/10">
              {priorityJobs.length === 0 ? (
                <tr>
                  <td className="p-4 text-body-sm text-on-surface-variant" colSpan={3}>
                    {loading ? "Loading openings…" : "No job openings yet."}
                  </td>
                </tr>
              ) : (
                priorityJobs.map((job) => (
                  <tr key={job.id} className="hover:bg-surface transition-colors">
                    <td className="p-4">
                      <p className="font-bold text-body-md text-primary">{job.title}</p>
                      <p className="text-body-sm text-on-surface-variant opacity-60 line-clamp-1">
                        {job.description}
                      </p>
                    </td>
                    <td className="p-4 text-body-md">{companyName(job.company_id)}</td>
                    <td className="p-4 text-body-md text-on-surface font-medium">{job.salary || "N/A"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
