import { NavLink, useNavigate } from "react-router-dom";
import { LogOut, User } from "lucide-react";
import { logout } from "../lib/auth";

const GREEN = "#B6F24A";

export default function Sidebar({ profile, onNavigate }) {
  const navigate = useNavigate();

  const role = profile?.role || "user";
  const isPrivileged = role === "admin" || role === "staff";

  const nav = [
    { label: "Dashboard", to: "/portal", end: true },
    { label: "Projects", to: "/portal/projects" },
    { label: "Inbox", to: "/portal/inbox" },

    // 🔐 Hidden from normal users
    ...(isPrivileged
      ? [
          { label: "Leads", to: "/portal/leads" },
          { label: "Pipeline", to: "/portal/pipeline" },
          { label: "Stats", to: "/portal/stats" },
        ]
      : []),

    { label: "Settings", to: "/portal/settings" },
  ];

  const handleSignOut = async () => {
    try {
      await logout();
      onNavigate?.();
      navigate("/portal/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <div
      className="flex flex-col h-full bg-[#0A0A0A]"
      style={{ borderRight: "1px solid rgba(255,255,255,0.08)" }}
    >
      {/* HEADER */}
      <div
        className="h-16 px-6 flex flex-col justify-center border-b"
        style={{ borderColor: "rgba(255,255,255,0.08)" }}
      >
        <div
          className="text-xl font-bold tracking-wide leading-none"
          style={{ color: GREEN }}
        >
          Marsh Monster
        </div>

        <div className="text-xs text-slate-500 mt-1">
          Internal Portal
        </div>
      </div>

      {/* NAV */}
      <nav className="flex-1 px-4 py-4 space-y-1">
        {nav.map((n) => (
          <NavLink
            key={n.to}
            to={n.to}
            end={n.end}
            onClick={onNavigate}
            className={({ isActive }) =>
              `
              block rounded-lg px-4 py-2 text-sm transition
              ${
                isActive
                  ? "shadow-[inset_0_0_0_1px_rgba(182,242,74,0.35)]"
                  : "hover:bg-white/5"
              }
            `
            }
            style={({ isActive }) => ({
              color: isActive ? GREEN : "#cbd5e1",
              backgroundColor: isActive
                ? "rgba(182,242,74,0.12)"
                : "transparent",
            })}
          >
            {n.label}
          </NavLink>
        ))}
      </nav>

      {/* USER */}
      <div
        className="px-4 py-4 border-t"
        style={{ borderColor: "rgba(255,255,255,0.08)" }}
      >
        <div className="flex items-center gap-3 mb-4">
          <div
            className="h-9 w-9 rounded-full flex items-center justify-center"
            style={{
              backgroundColor: "rgba(182,242,74,0.15)",
              color: GREEN,
            }}
          >
            <User size={16} />
          </div>

          <div className="min-w-0">
            <div className="text-sm font-semibold truncate text-slate-200">
              {profile?.name || "Portal User"}
            </div>

            <div className="text-xs text-slate-500 truncate">
              {profile?.email}
            </div>
          </div>
        </div>

        <button
          onClick={handleSignOut}
          className="
            w-full flex items-center justify-center gap-2
            rounded-lg px-3 py-2 text-sm
            text-slate-300
            border border-white/10
            hover:bg-white/5 transition
          "
        >
          <LogOut size={16} />
          Sign out
        </button>

        <div className="mt-3 text-center text-xs text-slate-500">
          Marsh Monster • v0.1.0
        </div>
      </div>
    </div>
  );
}