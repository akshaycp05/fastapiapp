import Welcome from './components/Welcome';
import NavBar from './components/NavBar';
import Footer from './components/footer';
import CompanyCard from './components/CompanyCard';
import JobCard from './components/JobCard';

function App() {
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