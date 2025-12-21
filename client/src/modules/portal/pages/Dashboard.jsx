// src/modules/portal/pages/Dashboard.jsx
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { listProjects } from "../lib/projectsApi";
import { listMessages } from "../../../lib/messagesApi";

export default function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const nav = useNavigate();

  useEffect(() => {
    async function load() {
      try {
        const [projectData, messageData] = await Promise.all([
          listProjects(),
          listMessages(),
        ]);
        setProjects(projectData);
        setMessages(messageData);
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return <div className="text-slate-400">Loading dashboard…</div>;
  }

  const activeCount = projects.filter(p => p.status === "active").length;
  const unreadCount = messages.filter(m => m.status === "new").length;

  return (
    <div className="h-full flex flex-col gap-6 overflow-hidden">
      {/* HEADER */}
      <h1 className="text-2xl font-semibold shrink-0">Dashboard</h1>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 shrink-0">
        <StatCard label="Total Projects" value={projects.length} />
        <StatCard label="Active Projects" value={activeCount} />
        <StatCard
          label="Archived Projects"
          value={projects.length - activeCount}
        />
        <StatCard
          label="Unread Messages"
          value={unreadCount}
          highlight={unreadCount > 0}
        />
      </div>

      {/* LOWER GRID (scroll-safe) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-0">
        {/* RECENT PROJECTS */}
        <div className="bg-black/40 border border-white/10 rounded-lg p-4 flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-3 shrink-0">
            <h2 className="font-medium">Recent Projects</h2>
            <Link
              to="/portal/projects"
              className="text-sm text-emerald-400 hover:underline"
            >
              View all
            </Link>
          </div>

          <div className="overflow-y-auto space-y-2 pr-1">
            {projects.length === 0 ? (
              <p className="text-slate-400 text-sm">No projects yet.</p>
            ) : (
              projects.slice(0, 10).map(project => (
                <div
                  key={project.id}
                  className="flex items-center justify-between text-sm rounded px-3 py-2 border border-white/10 hover:bg-white/5"
                >
                  <span className="truncate max-w-[70%]">
                    {project.title || "Untitled Project"}
                  </span>
                  <span className="text-xs text-slate-400 shrink-0">
                    {project.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* RECENT MESSAGES */}
        <div className="bg-black/40 border border-white/10 rounded-lg p-4 flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-3 shrink-0">
            <h2 className="font-medium">Recent Messages</h2>
            <Link
              to="/portal/inbox"
              className="text-sm text-emerald-400 hover:underline"
            >
              View inbox
            </Link>
          </div>

          <div className="overflow-y-auto space-y-2 pr-1">
            {messages.length === 0 ? (
              <p className="text-slate-400 text-sm">No messages yet.</p>
            ) : (
              messages.slice(0, 10).map(msg => (
                <div
                  key={msg.id}
                  onClick={() => nav("/portal/inbox")}
                  className={`cursor-pointer rounded px-3 py-2 border transition ${
                    msg.status === "new"
                      ? "border-emerald-500/40 bg-emerald-500/5"
                      : "border-white/10 hover:bg-white/5"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium truncate max-w-[70%]">
                      {msg.name || "Anonymous"}
                    </span>
                    <span className="text-xs text-slate-400 shrink-0">
                      {msg.status}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 truncate">
                    {msg.message}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, highlight }) {
  return (
    <div
      className={`bg-black/40 border rounded-lg p-4 ${
        highlight
          ? "border-emerald-500/40"
          : "border-white/10"
      }`}
    >
      <div className="text-sm text-slate-400">{label}</div>
      <div className="text-2xl font-semibold mt-1">{value}</div>
    </div>
  );
}