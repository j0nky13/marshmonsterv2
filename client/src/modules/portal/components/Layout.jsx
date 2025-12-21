// src/modules/portal/components/Layout.jsx
import { Outlet } from "react-router-dom";
import Navbar from "./NavBar.jsx";
import Sidebar from "./Sidebar.jsx";

export default function Layout() {
  return (
    <div className="min-h-screen bg-[#0F1117] text-slate-100">
      <div className="flex h-screen">
        {/* LEFT: sidebar */}
        <aside className="hidden md:block h-screen sticky top-0
          bg-[#0B0F1A] border-r border-white/10">
          <Sidebar />
        </aside>

        {/* RIGHT: navbar + routed content */}
        <div className="flex-1 flex flex-col h-screen bg-[#0F1117]">
          <Navbar />

          {/* Routed page content */}
          <main className="flex-1 overflow-y-auto px-4 py-4 md:px-6 md:py-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}