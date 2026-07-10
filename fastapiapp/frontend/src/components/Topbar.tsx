import { useLocation, useNavigate } from "react-router-dom";

type Props = {
  searchPlaceholder?: string;
};

function Topbar({ searchPlaceholder = "Search system..." }: Props) {
  const navigate = useNavigate();
  const { pathname, search } = useLocation();
  const params = new URLSearchParams(search);
  const active = params.get("tab") || "overview";

  function go(tab: string) {
    const p = "/dashboard";
    const q = tab === "overview" ? "" : `?tab=${tab}`;
    navigate(p + q);
  }

  const tabClass = (tab: string) =>
    `font-body-md text-body-md transition-colors ${active === tab ? "text-primary font-bold border-b-2 border-primary pb-1" : "text-on-surface-variant hover:text-primary"}`;

  return (
    <header className="navbar bg-surface sticky top-0 w-full h-16 flex justify-between items-center px-lg z-40">
      <div className="flex items-center gap-8">
        <div className="relative w-64">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">
            search
          </span>
          <input
            className="w-full bg-white border border-outline-variant py-2 pl-10 pr-4 rounded-lg text-body-sm focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all"
            placeholder={searchPlaceholder}
            type="text"
          />
        </div>
        <nav className="hidden md:flex items-center gap-6">
          <button onClick={() => go("overview")} className={tabClass("overview")}>Overview</button>
          <button onClick={() => go("reports")} className={tabClass("reports")}>Reports</button>
          <button onClick={() => go("activity")} className={tabClass("activity")}>Activity</button>
        </nav>
      </div>
      <div className="flex items-center gap-4">
        <div className="h-6 w-px bg-outline-variant mx-2" />
        <button className="text-on-surface-variant hover:text-primary transition-colors">
          <span className="material-symbols-outlined">notifications</span>
        </button>
        <button className="text-on-surface-variant hover:text-primary transition-colors">
          <span className="material-symbols-outlined">account_circle</span>
        </button>
      </div>
    </header>
  );
}

export default Topbar;
