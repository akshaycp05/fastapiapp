import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

type Props = {
  onLogout: () => void;
  userName: string;
  userRole: string;
};

function DashboardLayout({ onLogout, userName, userRole }: Props) {
  return (
    <div className="flex min-h-screen overflow-hidden">
      <Sidebar onLogout={onLogout} userName={userName} userRole={userRole} />
      <main className="flex-1 flex flex-col h-screen relative overflow-y-auto custom-scrollbar">
        <Topbar />
        <Outlet />
      </main>
    </div>
  );
}

export default DashboardLayout;
