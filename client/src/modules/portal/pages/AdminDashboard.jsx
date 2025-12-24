import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "@/lib/firebase";
import { getCurrentUser, logout as logoutFn } from "../lib/auth";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  where,
} from "firebase/firestore";

export default function AdminDashboard() {
  const user = getCurrentUser();
  const nav = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [shops, setShops] = useState([]);
  const [users, setUsers] = useState([]);

  const [activeView, setActiveView] = useState("overview");
  const [selectedShopId, setSelectedShopId] = useState(null);

  // ─────────────────────────────────────────
  // Load admin data
  // ─────────────────────────────────────────
  useEffect(() => {
    if (!user) {
      setError("You are not signed in.");
      setLoading(false);
      return;
    }

    if (user.role !== "admin") {
      setError("You are not authorized to view this page.");
      setLoading(false);
      return;
    }

    async function load() {
      try {
        setLoading(true);

        const shopsSnap = await getDocs(
          query(collection(db, "shops"), orderBy("createdAt", "desc"))
        );

        const usersSnap = await getDocs(
          query(collection(db, "users"), orderBy("createdAt", "desc"))
        );

        setShops(shopsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        setUsers(usersSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error(err);
        setError("Failed to load admin data.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [user]);

  const handleLogout = async () => {
    await logoutFn();
    nav("/portal", { replace: true });
  };

  // ─────────────────────────────────────────
  // Derived data
  // ─────────────────────────────────────────
  const totalShops = shops.length;
  const totalUsers = users.length;

  const tierCounts = useMemo(() => {
    const out = { none: 0, basic: 0, plus: 0, pro: 0, other: 0 };
    shops.forEach(s => {
      const tier = (s.billingTier || "none").toLowerCase();
      out[tier] !== undefined ? out[tier]++ : out.other++;
    });
    return out;
  }, [shops]);

  const usersByShop = useMemo(() => {
    const map = {};
    users.forEach(u => {
      const key = u.shopId || "unassigned";
      if (!map[key]) map[key] = [];
      map[key].push(u);
    });
    return map;
  }, [users]);

  // ─────────────────────────────────────────
  // Guards
  // ─────────────────────────────────────────
  if (!user) {
    return <div className="text-red-400">Not signed in.</div>;
  }

  if (user.role !== "admin") {
    return (
      <div className="flex items-center justify-between">
        <div className="text-red-400">Unauthorized</div>
        <button
          onClick={handleLogout}
          className="px-3 py-1.5 rounded-full border border-slate-700 text-slate-200"
        >
          Logout
        </button>
      </div>
    );
  }

  // ─────────────────────────────────────────
  // Layout
  // ─────────────────────────────────────────
  return (
    <div className="flex justify-center">
      <div className="w-full max-w-6xl flex gap-6">
        {/* Local admin nav */}
        <aside className="w-56 shrink-0 space-y-4">
          <div className="rounded-xl border border-white/10 bg-[#0B0F1A] px-4 py-3">
            <div className="text-xs uppercase tracking-widest text-slate-500">
              Marsh Monster
            </div>
            <div className="text-sm font-medium text-slate-200">
              Admin Control
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {user.email}
            </div>
          </div>

          <nav className="rounded-xl border border-white/10 bg-[#0B0F1A] p-2 space-y-1">
            {["overview", "shops", "users", "analytics"].map(view => (
              <button
                key={view}
                onClick={() => setActiveView(view)}
                className={`w-full px-3 py-2 rounded-lg text-left text-sm transition
                  ${
                    activeView === view
                      ? "bg-green-500/15 border border-green-400/40 text-green-200"
                      : "text-slate-300 hover:bg-white/5"
                  }`}
              >
                {view.charAt(0).toUpperCase() + view.slice(1)}
              </button>
            ))}
          </nav>

          <button
            onClick={handleLogout}
            className="w-full px-3 py-2 rounded-full border border-slate-700 text-slate-200"
          >
            Logout
          </button>
        </aside>

        {/* Main */}
        <div className="flex-1 space-y-5">
          <header>
            <h1 className="text-2xl font-semibold text-slate-100">
              Admin Dashboard
            </h1>
            <p className="text-sm text-slate-400">
              Internal system overview
            </p>
          </header>

          {loading && <div className="text-slate-400">Loading…</div>}
          {error && <div className="text-red-400">{error}</div>}

          {!loading && !error && (
            <>
              {activeView === "overview" && (
                <OverviewSection
                  totalShops={totalShops}
                  totalUsers={totalUsers}
                  tierCounts={tierCounts}
                />
              )}
              {activeView === "shops" && (
                <ShopsSection
                  shops={shops}
                  usersByShop={usersByShop}
                  onOpenShop={setSelectedShopId}
                />
              )}
              {activeView === "users" && (
                <UsersSection users={users} />
              )}
              {activeView === "analytics" && (
                <AnalyticsSection tierCounts={tierCounts} />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}