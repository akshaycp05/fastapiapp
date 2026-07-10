import { useState } from "react";
import { useAppData } from "../context/AppDataContext";
import type { Company } from "../types/company";

const EMPTY_COMPANY: Company = { id: 0, name: "", email: "", phone: "", location: "", jobs: [] };

const ICONS = ["business", "terminal", "account_balance", "eco", "rocket_launch", "domain"];

function iconFor(id: number) {
  return ICONS[id % ICONS.length];
}

function CompaniesPage() {
  const { companies, jobs, loading, error, addCompany, editCompany, removeCompany } = useAppData();

  const [addForm, setAddForm] = useState<Company>(EMPTY_COMPANY);
  const [editId, setEditId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Company>(EMPTY_COMPANY);
  const [submitting, setSubmitting] = useState(false);

  const totalOpenJobs = jobs.length;

  async function handleAddSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await addCompany(addForm);
      setAddForm(EMPTY_COMPANY);
    } catch (err) {
      console.error(err);
      alert("Could not register company. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function startEdit(company: Company) {
    setEditId(company.id);
    setEditForm(company);
  }

  function cancelEdit() {
    setEditId(null);
    setEditForm(EMPTY_COMPANY);
  }

  async function saveEdit() {
    try {
      await editCompany(editForm);
      cancelEdit();
    } catch (err) {
      console.error(err);
      alert("Could not update company.");
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Remove this company and its association with open jobs?")) return;
    try {
      await removeCompany(id);
    } catch (err) {
      console.error(err);
      alert("Could not delete company.");
    }
  }

  return (
    <div className="p-lg space-y-lg max-w-container-max mx-auto w-full">
      {/* Page Header & Stats */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-md">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-primary tracking-tight">Company Management</h2>
          <p className="text-on-surface-variant mt-xs">Monitor and scale your portfolio organization partnerships.</p>
        </div>
        <div className="flex gap-lg">
          <div className="text-right">
            <span className="font-label-md text-secondary block">ACTIVE OPENINGS</span>
            <span className="font-headline-md text-headline-md font-bold">{totalOpenJobs}</span>
          </div>
          <div className="text-right border-l border-outline-variant pl-lg">
            <span className="font-label-md text-primary block">TOTAL PARTNERS</span>
            <span className="font-headline-md text-headline-md font-bold">{companies.length}</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-error-container text-on-error-container rounded text-body-sm">
          Could not load live data: {error.message}
        </div>
      )}

      {/* Registration Form */}
      <section>
        <div className="bg-white p-lg shadow-[0px_4px_20px_rgba(0,0,0,0.04)] border border-outline-variant/20">
          <div className="flex items-center justify-between mb-lg">
            <h3 className="font-headline-sm text-headline-sm flex items-center">
              <span className="material-symbols-outlined mr-sm text-secondary">add_business</span>
              Add New Company
            </h3>
          </div>
          <form className="grid grid-cols-1 md:grid-cols-3 gap-md" onSubmit={handleAddSubmit}>
            <div className="space-y-xs">
              <label className="font-label-md text-[10px] uppercase text-on-surface-variant">Legal Name</label>
              <input
                className="w-full p-sm bg-white border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                placeholder="e.g. Acme Corp"
                type="text"
                value={addForm.name}
                onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-xs">
              <label className="font-label-md text-[10px] uppercase text-on-surface-variant">Primary Email</label>
              <input
                className="w-full p-sm bg-white border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                placeholder="contact@acme.com"
                type="email"
                value={addForm.email}
                onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                required
              />
            </div>
            <div className="space-y-xs">
              <label className="font-label-md text-[10px] uppercase text-on-surface-variant">Phone Support</label>
              <input
                className="w-full p-sm bg-white border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                placeholder="+1 (555) 000-0000"
                type="tel"
                value={addForm.phone}
                onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
                required
              />
            </div>
            <div className="space-y-xs md:col-span-2">
              <label className="font-label-md text-[10px] uppercase text-on-surface-variant">
                Headquarters Location
              </label>
              <input
                className="w-full p-sm bg-white border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                placeholder="City, Country"
                type="text"
                value={addForm.location}
                onChange={(e) => setAddForm({ ...addForm, location: e.target.value })}
                required
              />
            </div>
            <div className="flex items-end">
              <button
                className="w-full bg-secondary text-on-secondary px-lg py-[13px] font-bold hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center disabled:opacity-50"
                type="submit"
                disabled={submitting}
              >
                <span className="material-symbols-outlined mr-xs">check_circle</span>
                {submitting ? "Registering…" : "Register Partner"}
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Grid Header */}
      <div className="flex items-center justify-between mb-md">
        <h3 className="font-headline-sm text-headline-sm">Registered Companies</h3>
      </div>

      {/* Companies Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-gutter">
        {companies.length === 0 && !loading && (
          <p className="text-on-surface-variant col-span-full">No companies registered yet.</p>
        )}
        {companies.map((company) => {
          const openings = jobs.filter((j) => j.company_id === company.id).length;
          const isEditing = editId === company.id;

          return (
            <div
              key={company.id}
              className="bg-white p-lg border border-outline-variant/30 hover:shadow-[0px_12px_32px_rgba(0,0,0,0.06)] hover:scale-[1.01] transition-all duration-300 relative"
            >
              {isEditing ? (
                <div className="space-y-2">
                  <input
                    className="w-full p-2 border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary text-body-sm"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    placeholder="Name"
                  />
                  <input
                    className="w-full p-2 border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary text-body-sm"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    placeholder="Email"
                  />
                  <input
                    className="w-full p-2 border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary text-body-sm"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    placeholder="Phone"
                  />
                  <input
                    className="w-full p-2 border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary text-body-sm"
                    value={editForm.location}
                    onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                    placeholder="Location"
                  />
                  <div className="flex gap-2 pt-2">
                    <button
                      className="flex-1 bg-secondary text-on-secondary py-2 font-bold text-body-sm"
                      onClick={saveEdit}
                      type="button"
                    >
                      Save
                    </button>
                    <button
                      className="flex-1 bg-surface-container text-on-surface py-2 font-bold text-body-sm"
                      onClick={cancelEdit}
                      type="button"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between mb-md">
                    <div className="w-12 h-12 bg-surface-container flex items-center justify-center">
                      <span className="material-symbols-outlined text-primary text-3xl">{iconFor(company.id)}</span>
                    </div>
                    <div
                      className={`px-xs py-1 font-label-md rounded flex items-center ${
                        openings > 0
                          ? "bg-secondary-container/30 text-secondary"
                          : "bg-surface-container-highest text-on-surface-variant"
                      }`}
                    >
                      <span className="material-symbols-outlined text-xs mr-1">
                        {openings > 0 ? "bolt" : "pause"}
                      </span>
                      {openings} OPENING{openings === 1 ? "" : "S"}
                    </div>
                  </div>
                  <h4 className="font-headline-sm text-headline-sm mb-xs">{company.name}</h4>
                  <div className="space-y-xs mb-lg">
                    <div className="flex items-center text-on-surface-variant">
                      <span className="material-symbols-outlined text-sm mr-sm">mail</span>
                      <span className="text-body-sm">{company.email}</span>
                    </div>
                    <div className="flex items-center text-on-surface-variant">
                      <span className="material-symbols-outlined text-sm mr-sm">phone</span>
                      <span className="text-body-sm">{company.phone}</span>
                    </div>
                    <div className="flex items-center text-on-surface-variant">
                      <span className="material-symbols-outlined text-sm mr-sm">location_on</span>
                      <span className="text-body-sm">{company.location}</span>
                    </div>
                  </div>
                  <div className="pt-md border-t border-outline-variant/30 flex justify-between items-center">
                    <button
                      type="button"
                      className="text-body-sm font-bold text-primary hover:underline"
                      onClick={() => startEdit(company)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="text-body-sm font-bold text-error hover:underline"
                      onClick={() => handleDelete(company.id)}
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default CompaniesPage;
