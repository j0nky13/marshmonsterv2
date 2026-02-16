import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { subscribeToProjects } from "../lib/projectsApi";

export default function Projects({ profile }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const role = profile?.role || "user";
  const isAdmin = role === "admin" || role === "staff";

  /* ================================
        REALTIME PROJECT SUB
  ================================ */

  useEffect(() => {
    if (!profile) return;

    const unsubscribe = subscribeToProjects(profile, (data) => {
      setProjects(data);
      setLoading(false);
    });

    return () => unsubscribe?.();
  }, [profile]);

  /* ================================
        ROLE FILTER
  ================================ */

  const visibleProjects = isAdmin
    ? projects
    : projects.filter(
        (p) =>
          p.clientUid === profile.uid ||
          p.clientEmail === profile.email
      );

  if (loading) {
    return <div className="text-slate-400">Loading projects…</div>;
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-semibold">Projects</h1>
        <p className="text-sm text-slate-400 mt-1">
          {isAdmin
            ? "All active and archived client projects"
            : "Your project status and updates"}
        </p>
      </div>

      {visibleProjects.length === 0 && (
        <div className="text-slate-500 text-sm">
          No projects available.
        </div>
      )}

      {/* PROJECT LIST */}
      <div className="divide-y divide-white/10 rounded-xl border border-white/10 bg-black/30">
        {visibleProjects.map((p) => (
          <Link
            key={p.id}
            to={`/portal/projects/${p.id}`}
            className="block px-5 py-4 hover:bg-white/5 transition"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              {/* LEFT */}
              <div className="space-y-1">
                <div className="text-sm font-medium text-slate-200">
                  {p.title || "Untitled Project"}
                </div>

                <div className="text-xs text-slate-400">
                  {isAdmin
                    ? p.clientName || "Unknown Client"
                    : "Project with Marsh Monster"}
                </div>

                {p.goal && (
                  <div className="text-xs text-slate-500 line-clamp-1">
                    {p.goal}
                  </div>
                )}
              </div>

              {/* RIGHT */}
              <div className="flex items-center gap-4 shrink-0">
                <StatusPill status={p.status} />

                {isAdmin && p.source === "message" && (
                  <span className="text-xs text-emerald-400">
                    Inbox Lead
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

/* ---------------- helpers ---------------- */

function StatusPill({ status }) {
  const map = {
    active: "bg-emerald-500/15 text-emerald-400",
    paused: "bg-yellow-500/15 text-yellow-400",
    completed: "bg-blue-500/15 text-blue-400",
    archived: "bg-slate-500/15 text-slate-400",
  };

  const cls = map[status] || "bg-slate-500/15 text-slate-400";

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-medium ${cls}`}
    >
      {status || "active"}
    </span>
  );
}