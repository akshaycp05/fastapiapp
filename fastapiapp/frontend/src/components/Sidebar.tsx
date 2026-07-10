import { NavLink } from "react-router-dom";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: "dashboard" },
  { to: "/companies", label: "Companies", icon: "business" },
  { to: "/jobs", label: "Jobs", icon: "work" },
];

type Props = {
  onLogout: () => void;
  userName: string;
  userRole: string;
};

function Sidebar({ onLogout, userName, userRole }: Props) {
  return (
    <aside className="sidebar bg-surface-container-lowest h-screen w-64 flex-shrink-0 shadow-[0px_4px_20px_rgba(0,0,0,0.04)] flex flex-col py-md px-sm z-50">
      <div className="mb-xl px-xs">
        <h1 className="font-headline-sm text-headline-sm font-bold text-primary mb-1">TalentSpark</h1>
        <p className="text-on-surface-variant text-body-sm tracking-wider uppercase opacity-60">
          Executive Portal
        </p>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 py-3 px-3 transition-all duration-200 ${
                isActive
                  ? "text-primary font-bold border-r-4 border-primary bg-surface-container-low"
                  : "text-on-surface-variant hover:text-primary hover:bg-surface-container-low"
              }`
            }
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            <span className="font-body-md text-body-md">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto space-y-1 pt-md border-t border-surface-variant/30">
        <button
          type="button"
          onClick={onLogout}
          className="w-full flex items-center gap-3 py-2 px-3 text-on-surface-variant hover:text-primary transition-colors"
        >
          <span className="material-symbols-outlined">logout</span>
          <span className="font-body-md text-body-md">Logout</span>
        </button>

        <div className="flex items-center gap-3 pt-md px-3">
          <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-primary-fixed-dim text-xl">account_circle</span>
          </div>
          <div className="overflow-hidden">
            <p className="font-body-md text-body-md font-bold text-on-surface truncate">{userName || "Admin User"}</p>
            <p className="text-[10px] text-on-surface-variant opacity-60 uppercase tracking-tighter">
              {userRole ? userRole : "Executive Level"}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
