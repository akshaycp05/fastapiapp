import Welcome from "./components/Welcome";
import NavBar from "./components/NavBar";
import CompanyCard from "./components/CompanyCard";
import JobCard from "./components/JobCard";
import Footer from "./components/footer";
import { useEffect, useState } from "react";
import { getCompanies, createCompany, updateCompany, deleteCompany } from "./Services/CompanyService";
import type { Company } from "./types/company";

function App() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);

  async function fetchCompanies() {
    setLoading(true);
    try {
      const companies = await getCompanies();
      setCompanies(companies);
    } catch (error) {
      setError(error instanceof Error ? error : new Error(String(error)));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let isMounted = true;

    const loadCompanies = async () => {
      await fetchCompanies();
      if (!isMounted) {
        return;
      }
    };

    void loadCompanies();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleDelete = async (id: number) => {
    try {
      await deleteCompany(String(id));
      await fetchCompanies();
    } catch (error) {
      console.error(error);
    }
  };

  const handleEdit = async (company: Company) => {
    try {
      const updated = await updateCompany(String(company.id), company);
      setCompanies((current) => current.map((item) => (item.id === updated.id ? updated : item)));
    } catch (error) {
      console.error(error);
    }
  };

  const handleAdd = async (company: Company) => {
    try {
      await createCompany(company);
      await fetchCompanies();
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <>
      <NavBar />
      <Welcome />
      <br />
      <CompanyCard 
        companies={companies}
        onadd={handleAdd}
        onedit={handleEdit}
        ondelete={handleDelete}
      />
      <JobCard />
      <Footer />
    </>
  );
}

export default App;