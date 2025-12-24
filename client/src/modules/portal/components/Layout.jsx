import { useState } from "react";
import Sidebar from "./Sidebar.jsx";
import { Menu } from "lucide-react";
import { Outlet } from "react-router-dom";

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="h-[100dvh] w-full bg-[#0F1117] text-slate-100 overflow-hidden">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="relative flex h-full w-full">
        {/* Sidebar */}
        <aside
          className={`
            fixed inset-y-0 left-0 z-50 w-64
            bg-[#0B0F1A] border-r border-white/10
            transform transition-transform duration-300 ease-out
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
            md:translate-x-0 md:static
          `}
        >
          <Sidebar onNavigate={() => setSidebarOpen(false)} />
        </aside>

        {/* RIGHT COLUMN (must be a real column with height) */}
        <div className="flex flex-col flex-1 h-full">
          {/* Mobile hamburger */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="
              md:hidden fixed top-4 left-4 z-30
              rounded-xl p-2
              bg-black/80 border border-white/10 backdrop-blur
            "
            aria-label="Open sidebar"
          >
            <Menu size={20} />
          </button>

          {/* Spacer so hamburger never overlaps content */}
          <div className="md:hidden h-16 shrink-0" />

          {/* SCROLL CONTAINER */}
          <main className="flex-1 overflow-y-auto px-4 py-6 md:px-6 md:py-6 [WebkitOverflowScrolling:touch]">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}