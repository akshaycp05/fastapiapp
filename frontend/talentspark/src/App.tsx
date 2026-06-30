import Welcome from './components/Welcome';
import NavBar from './components/NavBar';
import Footer from './components/footer';
import CompanyCard from './components/CompanyCard';
import JobCard from './components/JobCard';
import { useEffect, useState } from 'react';
import {getCompanies} from "./Services/CompanyService"
import type { Company } from "./types/company"

interface Props {
    companies: Company[];
}

function App() {
    const [loading, setLoading] = useState(true);
    const [error,setError] = useState<Error | null>(null)
    const [companies, setCompanies] = useState<Company
  return (
      <>
          <NavBar />
          <Welcome />
          <Footer />
          <CompanyCard />
          <JobCard />
      </>
  )
}

export default App