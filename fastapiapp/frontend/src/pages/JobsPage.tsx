import { useState } from "react";
import { useAppData } from "../context/AppDataContext";
import type { Job } from "../types/job";

function emptyJob(companyId: number): Job {
  return { id: 0, title: "", description: "", salary: "", company_id: companyId };
}

function JobsPage() {
  const { companies, jobs, loading, error, addJob, editJob, removeJob } = useAppData();

  const [addForm, setAddForm] = useState<Job>(emptyJob(companies[0]?.id ?? 0));
  const [editId, setEditId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Job>(emptyJob(0));
  const [submitting, setSubmitting] = useState(false);

  function companyName(id: number) {
    return companies.find((c) => c.id === id)?.name ?? `Unknown company (#${id})`;
  }

  async function handleAddSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await addJob(addForm);
      setAddForm(emptyJob(companies[0]?.id ?? 0));
    } catch (err) {
      console.error(err);
      alert("Could not publish job. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function startEdit(job: Job) {
    setEditId(job.id);
    setEditForm(job);
  }

  function cancelEdit() {
    setEditId(null);
    setEditForm(emptyJob(0));
  }

  async function saveEdit() {
    try {
      await editJob(editForm);
      cancelEdit();
    } catch (err) {
      console.error(err);
      alert("Could not update job.");
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Remove this job posting?")) return;
    try {
      await removeJob(id);
    } catch (err) {
      console.error(err);
      alert("Could not delete job.");
    }
  }

  return (
    <div className="flex-1 flex flex-col">
      <div className="p-lg space-y-lg max-w-container-max mx-auto w-full">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-md">
          <div>
            <span className="font-label-md text-label-md text-secondary uppercase tracking-widest mb-2 block">
              Opportunity Management
            </span>
            <h2 className="font-headline-lg text-headline-lg text-primary">Available Job Positions</h2>
          </div>
          <p className="text-body-sm text-on-surface-variant">
            {loading ? "Loading roles…" : `Reviewing ${jobs.length} live roles`}
          </p>
        </div>

        {error && (
          <div className="p-3 bg-error-container text-on-error-container rounded text-body-sm">
            Could not load live data: {error.message}
          </div>
        )}

        <div className="grid grid-cols-12 gap-gutter">
          {/* Job Feed */}
          <div className="col-span-12 lg:col-span-8 space-y-md">
            {jobs.length === 0 && !loading && (
              <p className="text-on-surface-variant">No job positions posted yet.</p>
            )}
            {jobs.map((job) => {
              const isEditing = editId === job.id;
              return (
                <div
                  key={job.id}
                  className="bg-surface-container-lowest p-md border border-outline-variant/30 rounded-xl card-hover-effect flex flex-col md:flex-row gap-md"
                >
                  <div className="w-16 h-16 bg-surface-container-high rounded-lg flex-shrink-0 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary text-3xl">work</span>
                  </div>
                  <div className="flex-1">
                    {isEditing ? (
                      <div className="space-y-2">
                        <input
                          className="w-full p-2 border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary text-body-sm"
                          value={editForm.title}
                          onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                          placeholder="Title"
                        />
                        <textarea
                          className="w-full p-2 border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary text-body-sm resize-none"
                          rows={2}
                          value={editForm.description}
                          onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                          placeholder="Description"
                        />
                        <div className="flex gap-2">
                          <input
                            className="flex-1 p-2 border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary text-body-sm"
                            value={editForm.salary}
                            onChange={(e) => setEditForm({ ...editForm, salary: e.target.value })}
                            placeholder="Salary"
                          />
                          <select
                            className="flex-1 p-2 border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary text-body-sm bg-white"
                            value={editForm.company_id}
                            onChange={(e) => setEditForm({ ...editForm, company_id: Number(e.target.value) })}
                          >
                            {companies.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="flex gap-2 pt-1">
                          <button
                            type="button"
                            className="flex-1 bg-secondary text-on-secondary py-2 font-bold text-body-sm"
                            onClick={saveEdit}
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            className="flex-1 bg-surface-container text-on-surface py-2 font-bold text-body-sm"
                            onClick={cancelEdit}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-headline-sm text-headline-sm text-primary">{job.title}</h3>
                          <span className="bg-secondary-container/30 text-on-secondary-container px-2 py-1 font-label-md text-[10px] rounded uppercase">
                            Active
                          </span>
                        </div>
                        <p className="text-on-surface-variant font-body-md line-clamp-2 mb-md">{job.description}</p>
                        <div className="flex flex-wrap gap-md items-center text-body-sm text-on-surface-variant">
                          <div className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">business</span>
                            {companyName(job.company_id)}
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">payments</span>
                            {job.salary || "N/A"}
                          </div>
                          <div className="ml-auto flex gap-3">
                            <button
                              type="button"
                              className="text-body-sm font-bold text-primary hover:underline"
                              onClick={() => startEdit(job)}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              className="text-body-sm font-bold text-error hover:underline"
                              onClick={() => handleDelete(job.id)}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Sidebar: Stats & Form */}
          <div className="col-span-12 lg:col-span-4 space-y-gutter">
            <div className="bg-primary text-on-primary p-lg rounded-xl shadow-lg relative overflow-hidden">
              <div className="relative z-10">
                <span className="font-label-md text-primary-fixed-dim text-[10px] uppercase tracking-[0.2em] mb-4 block">
                  Portfolio Snapshot
                </span>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="font-headline-lg text-4xl">{jobs.length}</span>
                  <span className="text-secondary font-bold text-body-sm">Open Roles</span>
                </div>
                <p className="text-body-sm text-on-primary-container mt-4">
                  Across {companies.length} partner organization{companies.length === 1 ? "" : "s"}.
                </p>
              </div>
              <div className="absolute -right-8 -bottom-8 opacity-10">
                <span className="material-symbols-outlined text-[160px]">insights</span>
              </div>
            </div>

            <div className="bg-surface-container-lowest p-lg border border-outline-variant/30 rounded-xl">
              <div className="flex items-center gap-sm mb-lg">
                <span className="material-symbols-outlined text-primary">add_circle</span>
                <h3 className="font-headline-sm text-headline-sm text-primary">Add New Job</h3>
              </div>
              <form className="space-y-md" onSubmit={handleAddSubmit}>
                <div className="space-y-1">
                  <label className="font-label-md text-on-surface-variant text-[11px] uppercase">Job Title</label>
                  <input
                    className="w-full p-sm border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none transition-all font-body-md"
                    placeholder="e.g. Creative Director"
                    type="text"
                    value={addForm.title}
                    onChange={(e) => setAddForm({ ...addForm, title: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-label-md text-on-surface-variant text-[11px] uppercase">Company</label>
                  <select
                    className="w-full p-sm border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none transition-all font-body-md bg-white"
                    value={addForm.company_id}
                    onChange={(e) => setAddForm({ ...addForm, company_id: Number(e.target.value) })}
                    required
                  >
                    <option value={0} disabled>
                      Select Company
                    </option>
                    {companies.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-label-md text-on-surface-variant text-[11px] uppercase">Salary</label>
                  <input
                    className="w-full p-sm border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none transition-all font-body-md"
                    placeholder="$120k - $180k"
                    type="text"
                    value={addForm.salary}
                    onChange={(e) => setAddForm({ ...addForm, salary: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-label-md text-on-surface-variant text-[11px] uppercase">Description</label>
                  <textarea
                    className="w-full p-sm border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none transition-all font-body-md resize-none"
                    placeholder="Outline primary responsibilities..."
                    rows={4}
                    value={addForm.description}
                    onChange={(e) => setAddForm({ ...addForm, description: e.target.value })}
                  />
                </div>
                <button
                  className="w-full bg-primary text-on-primary font-bold py-md rounded-lg hover:opacity-90 transition-colors active:scale-[0.98] disabled:opacity-50"
                  type="submit"
                  disabled={submitting || companies.length === 0}
                >
                  {submitting ? "Publishing…" : "Publish Position"}
                </button>
                {companies.length === 0 && (
                  <p className="text-body-sm text-error">Add a company first before posting a job.</p>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default JobsPage;
