import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listProjects } from "../lib/projectsApi";

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await listProjects();
      setProjects(data);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return <div className="text-slate-400">Loading projects…</div>;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Projects</h1>

      {projects.length === 0 && (
        <div className="text-slate-500 text-sm">No projects yet.</div>
      )}

      <div className="space-y-2">
        {projects.map((p) => (
          <Link
            key={p.id}
            to={`/portal/projects/${p.id}`}
            className="block rounded-lg border border-white/10 bg-black/40 px-4 py-3 hover:bg-black/60 transition"
          >
            <div className="flex justify-between items-start gap-4">
              <div className="space-y-1">
                <div className="font-medium text-slate-200">
                  {p.title || "Untitled Project"}
                </div>

                <div className="text-xs text-slate-400">
                  {p.clientName || "Unknown Client"}
                </div>

                <div className="text-xs text-slate-500">
                  {p.goal
                    ? p.goal
                    : "No project goal defined yet"}
                </div>
              </div>

              <div className="text-right text-xs text-slate-500 shrink-0">
                {p.source === "message" && (
                  <div className="text-emerald-400">
                    Inbox Lead
                  </div>
                )}
                <div className="mt-1">
                  {p.status || "active"}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}