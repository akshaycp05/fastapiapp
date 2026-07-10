import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

import {
  getCompanies,
  updateCompany,
  deleteCompany,
  createCompany,
} from "../Services/CompanyService";

import {
  getJobs,
  updateJob,
  deleteJob,
  createJob,
} from "../Services/JobService";

import type { Company } from "../types/company";
import type { Job } from "../types/job";

type AppDataContextValue = {
  companies: Company[];
  jobs: Job[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  addCompany: (company: Company) => Promise<void>;
  editCompany: (company: Company) => Promise<void>;
  removeCompany: (id: number) => Promise<void>;
  addJob: (job: Job) => Promise<void>;
  editJob: (job: Job) => Promise<void>;
  removeJob: (id: number) => Promise<void>;
};

const AppDataContext = createContext<AppDataContextValue | undefined>(undefined);

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  async function fetchData() {
    setLoading(true);
    try {
      const [companiesData, jobsData] = await Promise.all([getCompanies(), getJobs()]);
      setCompanies(Array.isArray(companiesData) ? companiesData : []);
      setJobs(Array.isArray(jobsData) ? jobsData : []);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void fetchData();
  }, []);

  async function addCompany(company: Company) {
    const newCompany = await createCompany(company);
    setCompanies((prev) => [...prev, newCompany]);
  }

  async function editCompany(company: Company) {
    const updated = await updateCompany(company.id, company);
    setCompanies((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
  }

  async function removeCompany(id: number) {
    await deleteCompany(id);
    setCompanies((prev) => prev.filter((c) => c.id !== id));
  }

  async function addJob(job: Job) {
    const newJob = await createJob(job);
    setJobs((prev) => [...prev, newJob]);
  }

  async function editJob(job: Job) {
    const updated = await updateJob(job.id, job);
    setJobs((prev) => prev.map((j) => (j.id === updated.id ? updated : j)));
  }

  async function removeJob(id: number) {
    await deleteJob(id);
    setJobs((prev) => prev.filter((j) => j.id !== id));
  }

  const value: AppDataContextValue = {
    companies,
    jobs,
    loading,
    error,
    refetch: fetchData,
    addCompany,
    editCompany,
    removeCompany,
    addJob,
    editJob,
    removeJob,
  };

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error("useAppData must be used within an AppDataProvider");
  return ctx;
}
