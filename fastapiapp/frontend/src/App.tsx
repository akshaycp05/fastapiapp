import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { AppDataProvider } from "./context/AppDataContext";
import DashboardLayout from "./layouts/DashboardLayout";
import DashboardPage from "./pages/DashboardPage";
import CompaniesPage from "./pages/CompaniesPage";
import JobsPage from "./pages/JobsPage";
import Login from "./pages/Login";
import Register from "./pages/Register";

function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [userName, setUserName] = useState<string>(localStorage.getItem("userName") || "");
  const [userRole, setUserRole] = useState<string>(localStorage.getItem("userRole") || "");
  const [authPage, setAuthPage] = useState<"login" | "register">("login");
  const [prefillEmail, setPrefillEmail] = useState<string>("");

  const handleLogin = (newToken: string, name: string, role: string) => {
    localStorage.setItem("token", newToken);
    localStorage.setItem("userName", name);
    localStorage.setItem("userRole", role);
    setToken(newToken);
    setUserName(name);
    setUserRole(role);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    localStorage.removeItem("userRole");
    setToken(null);
    setUserName("");
    setUserRole("");
  };

  const showLoginPage = (email = "") => {
    setPrefillEmail(email);
    setAuthPage("login");
  };

  if (!token) {
    return authPage === "login" ? (
      <Login defaultEmail={prefillEmail} onLogin={handleLogin} onSwitchToRegister={() => setAuthPage("register")} />
    ) : (
      <Register onSwitchToLogin={showLoginPage} />
    );
  }

  return (
    <AppDataProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<DashboardLayout onLogout={handleLogout} userName={userName} userRole={userRole} />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/companies" element={<CompaniesPage />} />
            <Route path="/jobs" element={<JobsPage />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppDataProvider>
  );
}

export default App;
