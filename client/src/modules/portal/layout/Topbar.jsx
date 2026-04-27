import { Menu, Search, Bell } from "lucide-react";

export default function Topbar({ activeLabel, setMobileOpen }) {
  return (
    <header className="h-20 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <button
          onClick={() => setMobileOpen(true)}
          className="lg:hidden text-white bg-zinc-900 border border-zinc-800 rounded-xl p-2"
        >
          <Menu size={22} />
        </button>

        <div>
          <p className="text-xs text-lime-400 font-semibold uppercase tracking-widest">
            Marsh Monster CRM
          </p>

          <h2 className="text-white text-xl sm:text-2xl font-black">
            {activeLabel}
          </h2>
        </div>
      </div>

      <div className="hidden md:flex items-center gap-3">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-2 flex items-center gap-2 text-zinc-400">
          <Search size={18} />
          <span className="text-sm">Search CRM...</span>
        </div>

        <button className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3 text-zinc-300 hover:text-white">
          <Bell size={18} />
        </button>

        <div className="flex items-center gap-2 text-sm text-zinc-400">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          Online
        </div>
      </div>
    </header>
  );
}