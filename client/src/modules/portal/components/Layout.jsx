import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar.jsx";
import { Menu } from "lucide-react";

export default function Layout({ profile }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="h-[100dvh] w-full bg-[#0F1117] text-slate-100 overflow-hidden">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="relative flex h-full w-full">
        <aside
          className={`
            fixed inset-y-0 left-0 z-50 w-64
            bg-[#0A0A0A] border-r border-white/10
            transform transition-transform duration-300 ease-out
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
            md:translate-x-0 md:static
          `}
        >
          <Sidebar
            profile={profile}
            onNavigate={() => setSidebarOpen(false)}
          />
        </aside>

        <div className="flex-1 h-full min-w-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden fixed top-4 left-4 z-30
              rounded-xl p-2
              bg-black/70 border border-white/10 backdrop-blur"
          >
            <Menu size={20} />
          </button>

          <main className="h-full overflow-y-auto px-4 py-6 md:px-6 pt-16 md:pt-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}