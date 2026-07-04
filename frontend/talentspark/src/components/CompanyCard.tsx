import type { Company } from "../types/company";
import type { Job } from "../types/job";
import { useState } from "react";
import "../companycard.css";

type Props = {
  companies: Company[];
  jobs: Job[];
  onEdit: (company: Company) => void;
  onDelete: (id: number) => void;
  onAdd: (company: Company) => void;
}

function CompanyCard({
  companies, jobs, onAdd, onEdit, onDelete }: Props) {
  const [editCompanyId, setEditCompanyId] = useState<number | null>(null);
  const [addform, setAddform] = useState<Company>({
    id: 0,
    name: "",
    email: "",
    phone: "",
    location: "",
    jobs: []
  });
  const [editform, setEditform] = useState<Company>({
    id: 0,
    name: "",
    email: "",
    phone: "",
    location: "",
    jobs: []
  });

  const handleAdd = () => {
    onAdd(addform);
    setAddform({
      id: 0,
      name: "",
      email: "",
      phone: "",
      location: "",
      jobs: []
    })
  }

  const handleSave = () => {
    onEdit(editform);
    setEditCompanyId(null);
    setEditform({
      id: 0,
      name: "",
      email: "",
      phone: "",
      location: "",
      jobs: []
    })
  }

  const handlecancel = () => {
    setEditCompanyId(null);
    setEditform({
      id: 0,
      name: "",
      email: "",
      phone: "",
      location: "",
      jobs: []
    })
  }

  return (
    <div className="company-container">
      <h2 className="title">Registered Companies</h2>

      {/* Grid wrapper for structured card positioning */}
      <div className="company-grid">
        {companies.map((company) => {
          const currentCompanyJobs = jobs.filter(j => j.company_id === company.id).length;
          
          return (
            <div className="company-card" key={company.id}>
              {editCompanyId === company.id ? (
                <>
                  <input className="input" type="text" value={editform.name} onChange={(e) => setEditform({ ...editform, name: e.target.value })} placeholder="Name" />
                  <input className="input" type="text" value={editform.email} onChange={(e) => setEditform({ ...editform, email: e.target.value })} placeholder="Email" />
                  <input className="input" type="text" value={editform.phone} onChange={(e) => setEditform({ ...editform, phone: e.target.value })} placeholder="Phone" />
                  <input className="input" type="text" value={editform.location} onChange={(e) => setEditform({ ...editform, location: e.target.value })} placeholder="Location" />
                  <div className="button-group">
                    <button className="save-btn" onClick={handleSave}>Save</button>
                    <button className="cancel-btn" onClick={handlecancel}>Cancel</button>
                  </div>
                </>
              ) : (
                <>
                  <h2 style={{ color: 'var(--text-h)', fontWeight: 600 }}>{company.name}</h2>
                  <p style={{ margin: '8px 0 4px 0', fontSize: '15px' }}><strong>Email:</strong> {company.email}</p>
                  <p style={{ margin: '4px 0', fontSize: '15px' }}><strong>Phone:</strong> {company.phone}</p>
                  <p style={{ margin: '4px 0', fontSize: '15px' }}><strong>Location:</strong> {company.location}</p>
                  <p style={{ margin: '4px 0 16px 0', fontSize: '15px', color: 'var(--accent)' }}>
                    <strong>Active Openings:</strong> {currentCompanyJobs} opening{currentCompanyJobs === 1 ? '' : 's'}
                  </p>
                  <div className="button-group">
                    <button
                      className="edit-btn"
                      onClick={() => {
                        setEditCompanyId(company.id);
                        setEditform({
                          id: company.id,
                          name: company.name,
                          email: company.email,
                          phone: company.phone,
                          location: company.location,
                          jobs: company.jobs,
                        });
                      }}
                    >Edit</button>
                    <button className="delete-btn" onClick={() => onDelete(company.id)}>Delete</button>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Creation workspace form */}
      <div className="add-company">
        <h2 style={{ color: 'var(--text-h)', marginBottom: '16px' }}>Add New Company</h2>
        <input className="input" type="text" value={addform.name} onChange={(e) => setAddform({ ...addform, name: e.target.value })} placeholder="Name" />
        <input className="input" type="text" value={addform.email} onChange={(e) => setAddform({ ...addform, email: e.target.value })} placeholder="Email" />
        <input className="input" type="text" value={addform.phone} onChange={(e) => setAddform({ ...addform, phone: e.target.value })} placeholder="Phone" />
        <input className="input" type="text" value={addform.location} onChange={(e) => setAddform({ ...addform, location: e.target.value })} placeholder="Location" />
        <button className="add-btn" onClick={handleAdd}>Add Profile</button>
      </div>
    </div>
  )
}

export default CompanyCard;