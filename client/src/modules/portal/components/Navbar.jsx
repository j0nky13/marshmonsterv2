import { useNavigate } from "react-router-dom";
import { getCurrentUser, logout } from "../lib/auth";

export default function Navbar() {
  const navigate = useNavigate();
  const user = getCurrentUser();

  async function handleLogout() {
    try {
      await logout();
      navigate("/login");
    } catch (err) {
      console.error("Logout failed", err);
    }
  }

  return (
    <header className="h-14 w-full bg-[#050712]/80 backdrop-blur border-b border-white/10 flex items-center justify-between px-4 md:px-6">
      {/* Left */}
      <div
        onClick={() => navigate("/projects")}
        className="cursor-pointer font-semibold text-white tracking-tight"
      >
        Marsh Monster
        <span className="text-xs text-slate-500 ml-2">/ Portal</span>
      </div>

      {/* Right */}
      {user && (
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-300 truncate max-w-[160px]">
            {user.name || user.email}
          </span>
          <button
            onClick={handleLogout}
            className="text-xs px-4 py-1.5 rounded-full border border-slate-600 hover:bg-slate-800 text-slate-200"
          >
            Logout
          </button>
        </div>
      )}
    </header>
  );
}