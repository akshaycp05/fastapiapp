import type { Job } from "../types/job";
import type { Company } from "../types/company";

import { useState } from "react";

type Props = {
  jobs: Job[];
  companies: Company[];
  onEdit: (job: Job) => void;
  onDelete: (id: number) => void;
  onAdd: (job: Job) => void;
}

function JobCard({
  jobs, companies, onEdit, onDelete, onAdd }: Props) {
  const [editJobId, setEditJobId] = useState<number | null>(null);
  const [addform, setAddform] = useState<Job>({
    id: 0,
    title: "",
    description: "",
    salary: "",
    company_id: companies[0]?.id || 0 // Default to the first company if available
  });
  const [editform, setEditform] = useState<Job>({
    id: 0,
    title: "",
    description: "",
    salary: "",
    company_id: 0
  });
  
  const handleAdd = () => {
    onAdd(addform);
    setAddform({
      id: 0,
      title: "",
      description: "",
      salary: "",
      company_id: companies[0]?.id || 0
    })
  }
  const handleSave = () => {
    onEdit(editform);
    setEditJobId(null);
    setEditform({
      id: 0,
      title: "",
      description: "",
      salary: "",
      company_id: 0
    })
  }
  const handlecancel = () => {
    setEditJobId(null);
    setEditform({
      id: 0,
      title: "",
      description: "",
      salary: "",
      company_id: 0
    })
  }

  return (
    <div className="company-container">
      <h2 className="title">Available Job Positions</h2>

      <div className="company-grid">
        {jobs.map((job) => (
          <div className="company-card" key={job.id}>
            {editJobId === job.id ? (
              <>
                <input className="input" type="text" value={editform.title} onChange={(e) => setEditform({ ...editform, title: e.target.value })} placeholder="Title" />
                <input className="input" type="text" value={editform.description} onChange={(e) => setEditform({ ...editform, description: e.target.value })} placeholder="Description" />
                <input className="input" type="text" value={editform.salary} onChange={(e) => setEditform({ ...editform, salary: e.target.value })} placeholder="Salary" />
                
                {/* Clean Dropdown Selection for Editing */}
                <select 
                  className="input" 
                  value={editform.company_id} 
                  onChange={(e) => setEditform({ ...editform, company_id: Number(e.target.value) })}
                >
                  <option value={0} disabled>Select Company</option>
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>

                <div className="button-group">
                  <button className="save-btn" onClick={handleSave}>Save</button>
                  <button className="cancel-btn" onClick={handlecancel}>Cancel</button>
                </div>
              </>
            ) : (
              <>
                <h2 style={{ color: 'var(--text-h)', fontWeight: 600 }}>{job.title}</h2>
                <p style={{ margin: '8px 0', fontSize: '15px' }}><strong>Description:</strong> {job.description}</p>
                <p style={{ margin: '4px 0', fontSize: '15px' }}><strong>Salary:</strong> {job.salary}</p>
                <p style={{ margin: '4px 0 16px 0', fontSize: '15px', color: 'var(--accent)' }}>
                  <strong>Company:</strong> {companies.find(c => c.id === job.company_id)?.name || `Unknown ID: ${job.company_id}`}
                </p>
                <div className="button-group">
                  <button
                    className="edit-btn"
                    onClick={() => {
                      setEditJobId(job.id);
                      setEditform({
                        id: job.id,
                        title: job.title,
                        description: job.description,
                        salary: job.salary,
                        company_id: job.company_id,
                      });
                    }}
                  >Edit</button>
                  <button className="delete-btn" onClick={() => onDelete(job.id)}>Delete</button>
                </div>
              </>)}
          </div>
        ))}
      </div>

      <div className="add-company">
        <h2 style={{ color: 'var(--text-h)', marginBottom: '16px' }}>Add New Job</h2>
        <input className="input" type="text" value={addform.title} onChange={(e) => setAddform({ ...addform, title: e.target.value })} placeholder="Title" />
        <input className="input" type="text" value={addform.description} onChange={(e) => setAddform({ ...addform, description: e.target.value })} placeholder="Description" />
        <input className="input" type="text" value={addform.salary} onChange={(e) => setAddform({ ...addform, salary: e.target.value })} placeholder="Salary" />
        
        {/* Clean Dropdown Selection for Creating */}
        <select 
          className="input" 
          value={addform.company_id} 
          onChange={(e) => setAddform({ ...addform, company_id: Number(e.target.value) })}
        >
          {companies.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        <button className="add-btn" onClick={handleAdd}>Add Job Position</button>
      </div>
    </div>
  )
}

export default JobCard;