import { X } from "lucide-react";
import { auth, signOut } from "../firebase/firebase";


export default function Sidebar({
  user,
  tabs,
  activeTab,
  setActiveTab,
  mobileOpen,
  setMobileOpen
}) {
  return (
    <>
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      <aside
        className={`
          fixed lg:sticky z-50 top-0 left-0 h-screen shrink-0 w-72
          bg-zinc-950 border-r border-zinc-800 p-5 flex flex-col
          transition-transform duration-300 overflow-hidden
          ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        <div className="flex items-start justify-between shrink-0">
          <div>
            <h1 className="text-2xl font-black text-white leading-tight">
              Marsh Monster
            </h1>

            <p className="text-lime-400 text-sm font-semibold mt-1">
              Monster CRM 2.0
            </p>
          </div>

          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden text-zinc-400 hover:text-white"
          >
            <X size={22} />
          </button>
        </div>

        <div className="mt-8 rounded-2xl bg-zinc-900 border border-zinc-800 p-4 shrink-0">
          <p className="text-xs text-zinc-500 mb-1">Logged in as</p>

          <p className="text-white font-semibold truncate">
            {user?.name || user?.email}
          </p>

          <p className="text-lime-400 capitalize text-sm mt-1">
            {user?.role}
          </p>
        </div>

        <nav className="mt-8 space-y-2 flex-1 overflow-y-auto pr-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setMobileOpen(false);
                }}
                className={`
                  w-full flex items-center gap-3 rounded-2xl px-4 py-3
                  text-left transition
                  ${
                    active
                      ? "bg-lime-400 text-black font-bold"
                      : "bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-white"
                  }
                `}
              >
                <Icon size={20} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        <button
          onClick={async () => {
  localStorage.removeItem("devEmail");
  await signOut(auth);
  window.location.reload();
}}
          className="mt-6 w-full rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-3 hover:bg-red-500/20 transition shrink-0"
        >
          Log Out
        </button>
      </aside>
    </>
  );
}