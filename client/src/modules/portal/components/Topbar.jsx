import { logout } from "../lib/auth";

const GREEN = "#B6F24A";

export default function Topbar({ user }) {
  async function handleLogout() {
    await logout();
    window.location.href = "/login";
  }

  return (
    <header
      className="h-16 px-6 flex items-center justify-between bg-[#0c1118] border-b"
      style={{ borderColor: "rgba(182,242,74,0.15)" }}
    >
      <div className="text-lg font-semibold tracking-wide text-slate-200">
        {/* Marsh Monster
        <span className="ml-2 text-xs font-medium" style={{ color: GREEN }}>
          Portal
        </span> */}
      </div>

      <div className="flex items-center gap-4 text-sm">
        {user && <span className="text-slate-400">{user.email}</span>}

        {user && (
          <button
            onClick={handleLogout}
            className="px-3 py-1 rounded border transition"
            style={{
              color: GREEN,
              borderColor: "rgba(182,242,74,0.35)",
              backgroundColor: "rgba(182,242,74,0.12)",
            }}
          >
            Logout
          </button>
        )}
      </div>
    </header>
  );
}