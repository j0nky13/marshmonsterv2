// src/modules/portal/components/Sidebar.jsx
import { NavLink } from "react-router-dom";

const GREEN = "#B6F24A";

const nav = [
  { label: "Dashboard", to: "/portal", end: true },
  { label: "Projects", to: "/portal/projects" },
  { label: "Inbox", to: "/portal/inbox" },
  { label: "Stats", to: "/portal/stats" },
  { label: "Settings", to: "/portal/settings" },
];

export default function Sidebar() {
  return (
    <aside
      className="w-64 bg-[#0c1118] border-r flex flex-col"
      style={{ borderColor: "rgba(182,242,74,0.15)" }}
    >
      {/* Header (LOCK HEIGHT to match Topbar) */}
      <div
        className="h-16 px-6 border-b flex flex-col justify-center"
        style={{ borderColor: "rgba(182,242,74,0.15)" }}
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

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-1">
        {nav.map((n) => (
          <NavLink
            key={n.to}
            to={n.to}
            end={n.end}
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
              backgroundColor: isActive ? "rgba(182,242,74,0.12)" : "transparent",
            })}
          >
            {n.label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div
        className="px-6 py-4 border-t text-xs text-slate-500"
        style={{ borderColor: "rgba(182,242,74,0.15)" }}
      >
        Marsh Monster • v0.1.0
      </div>
    </aside>
  );
}