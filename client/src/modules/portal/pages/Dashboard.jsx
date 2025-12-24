import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { listProjects } from "../lib/projectsApi";
import { listMessages } from "../../../lib/messagesApi";

const GREEN = "#B6F24A";

/**
 * Dashboard (role-based)
 * - admin/staff: AdminDashboard
 * - user: CustomerDashboard
 */
export default function Dashboard({ profile }) {
  const role = (profile?.role || "").toLowerCase();
  const isAdminLike = role === "admin" || role === "staff";

  return isAdminLike ? (
    <AdminDashboard />
  ) : (
    <CustomerDashboard profile={profile} />
  );
}

/* -------------------------------------------------------------------------- */
/*                                  ADMIN UI                                  */
/* -------------------------------------------------------------------------- */

function AdminDashboard() {
  const [projects, setProjects] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const nav = useNavigate();

  useEffect(() => {
    let alive = true;

    async function fetchData() {
      try {
        const [projectsData, messagesData] = await Promise.all([
          listProjects(),
          listMessages(),
        ]);
        if (!alive) return;
        setProjects(Array.isArray(projectsData) ? projectsData : []);
        setMessages(Array.isArray(messagesData) ? messagesData : []);
      } catch (err) {
        console.error("Failed to load admin dashboard:", err);
      } finally {
        if (alive) setLoading(false);
      }
    }

    fetchData();
    return () => {
      alive = false;
    };
  }, []);

  const activeProjects = useMemo(
    () => projects.filter((p) => p?.status === "active"),
    [projects]
  );

  const unreadMessages = useMemo(
    () => messages.filter((m) => m?.status === "new"),
    [messages]
  );

  if (loading) {
    return <div className="text-slate-500 text-sm">Loading dashboard…</div>;
  }

  return (
    <main className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-8">
      {/* HEADER */}
      <header className="mb-8 md:mb-12">
        <h1 className="text-2xl md:text-3xl font-semibold text-white">
          Admin Overview
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Live project and communication status
        </p>
      </header>

      {/* STATUS STRIP */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-10 md:mb-14">
        <StatusBlock label="Active Projects" value={activeProjects.length} />
        <StatusBlock label="Total Projects" value={projects.length} />
        <StatusBlock
          label="Unread Messages"
          value={unreadMessages.length}
          highlight={unreadMessages.length > 0}
        />
      </section>

      {/* CONTENT GRID */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
        {/* PROJECTS */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-white">Active Projects</h2>
            <Link
              to="/portal/projects"
              className="text-sm hover:underline"
              style={{ color: GREEN }}
            >
              View all
            </Link>
          </div>

          {activeProjects.length === 0 ? (
            <p className="text-sm text-slate-400">No active projects.</p>
          ) : (
            <ul className="space-y-3">
              {activeProjects.slice(0, 6).map((project) => (
                <li
                  key={project.id}
                  className="flex items-center justify-between rounded-xl px-4 py-3 bg-white/5 hover:bg-white/10 transition"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-white truncate">
                      {project.title || "Untitled Project"}
                    </div>
                    <div className="text-xs text-slate-400">
                      Phase: {project.phase || "Discovery"}
                    </div>
                  </div>

                  <button
                    onClick={() => nav(`/portal/projects/${project.id}`)}
                    className="text-xs hover:underline shrink-0"
                    style={{ color: GREEN }}
                  >
                    Open
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* MESSAGES */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-white">Recent Messages</h2>
            <button
              onClick={() => nav("/portal/inbox")}
              className="text-sm hover:underline"
              style={{ color: GREEN }}
            >
              Open inbox
            </button>
          </div>

          {messages.length === 0 ? (
            <p className="text-sm text-slate-400">No messages yet.</p>
          ) : (
            <ul className="space-y-3">
              {messages.slice(0, 6).map((msg) => (
                <li
                  key={msg.id}
                  onClick={() => nav("/portal/inbox")}
                  className={`cursor-pointer rounded-xl px-4 py-3 transition border
                    ${
                      msg.status === "new"
                        ? "bg-emerald-500/10 border-emerald-500/30"
                        : "bg-white/5 border-white/10 hover:bg-white/10"
                    }`}
                >
                  <div className="flex justify-between items-center mb-1 gap-3">
                    <span className="text-sm font-medium text-white truncate">
                      {msg.name || "Message"}
                    </span>
                    <span className="text-xs text-slate-400 shrink-0">
                      {msg.status}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 truncate">
                    {msg.message}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </main>
  );
}

function StatusBlock({ label, value, highlight }) {
  return (
    <div
      className={`rounded-2xl px-6 py-5 border
        ${highlight ? "bg-emerald-500/10" : "bg-white/5"}
      `}
      style={{
        borderColor: highlight
          ? "rgba(16,185,129,0.35)"
          : "rgba(255,255,255,0.10)",
      }}
    >
      <div className="text-xs uppercase tracking-wide text-slate-400">
        {label}
      </div>
      <div className="mt-2 text-3xl font-semibold text-white">{value}</div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                CUSTOMER UI                                 */
/* -------------------------------------------------------------------------- */

function CustomerDashboard({ profile }) {
  const nav = useNavigate();
  const [loading, setLoading] = useState(true);
  const [myProjects, setMyProjects] = useState([]);
  const [myMessages, setMyMessages] = useState([]);

  useEffect(() => {
    let alive = true;

    async function fetchData() {
      try {
        // Fetch all, then filter by clientUid or email (relaxed filter, legacy support)
        const [projectsData, messagesData] = await Promise.all([
          listProjects(),
          listMessages(),
        ]);

        if (!alive) return;
        // Defensive filter: show if clientUid matches OR email matches
        const safeProjects = Array.isArray(projectsData)
          ? projectsData.filter(
              (p) =>
                (p.clientUid === profile.uid) ||
                (p.clientEmail === profile.email)
            )
          : [];

        const safeMessages = Array.isArray(messagesData)
          ? messagesData.filter(
              (m) =>
                (m.clientUid === profile.uid) ||
                (m.email === profile.email)
            )
          : [];

        setMyProjects(safeProjects);
        setMyMessages(safeMessages);
      } catch (err) {
        console.error("Failed to load customer dashboard:", err);
      } finally {
        if (alive) setLoading(false);
      }
    }

    fetchData();
    return () => {
      alive = false;
    };
  }, [profile?.uid]);

  const activeProject = useMemo(() => {
    const active = myProjects.find((p) => p?.status === "active");
    return active || myProjects[0] || null;
  }, [myProjects]);

  const unreadCount = useMemo(
    () => myMessages.filter((m) => m?.status === "new").length,
    [myMessages]
  );

  if (loading) {
    return <div className="text-slate-500 text-sm">Loading dashboard…</div>;
  }

  return (
    <main className="max-w-5xl mx-auto px-4 md:px-6 py-6 md:py-8">
      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-semibold text-white">
          Your Project
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Updates, next steps, and messages.
        </p>
      </header>

      {/* TOP STRIP */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div
          className="rounded-2xl border bg-white/5 px-5 py-4"
          style={{ borderColor: "rgba(255,255,255,0.10)" }}
        >
          <div className="text-xs uppercase tracking-wide text-slate-400">
            Status
          </div>
          <div className="mt-2 text-lg font-semibold text-white">
            {activeProject?.status || "—"}
          </div>
        </div>

        <div
          className="rounded-2xl border bg-white/5 px-5 py-4"
          style={{ borderColor: "rgba(255,255,255,0.10)" }}
        >
          <div className="text-xs uppercase tracking-wide text-slate-400">
            Project
          </div>
          <div className="mt-2 text-lg font-semibold text-white truncate">
            {activeProject?.title || "No project assigned"}
          </div>
        </div>

        <div
          className={`rounded-2xl border px-5 py-4 ${
            unreadCount > 0 ? "bg-emerald-500/10" : "bg-white/5"
          }`}
          style={{
            borderColor:
              unreadCount > 0
                ? "rgba(16,185,129,0.35)"
                : "rgba(255,255,255,0.10)",
          }}
        >
          <div className="text-xs uppercase tracking-wide text-slate-400">
            Unread messages
          </div>
          <div className="mt-2 text-lg font-semibold text-white">
            {unreadCount}
          </div>
        </div>
      </section>

      {/* MAIN */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div
          className="rounded-2xl border bg-black/30 p-5"
          style={{ borderColor: "rgba(255,255,255,0.10)" }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-white">Latest Update</h2>
            <button
              onClick={() => nav("/portal/projects")}
              className="text-sm hover:underline"
              style={{ color: GREEN }}
            >
              View project
            </button>
          </div>

          {activeProject ? (
            <div className="space-y-2">
              <div className="text-sm text-slate-300">
                <span className="text-slate-400">Phase:</span> {activeProject.phase || "Discovery"}
              </div>
              <div className="text-sm text-slate-300">
                <span className="text-slate-400">Next step:</span> {activeProject.nextStep || "We’ll message you with next steps."}
              </div>
              {activeProject.updatedAt && (
                <div className="text-xs text-slate-500">Last updated: {String(activeProject.updatedAt)}</div>
              )}
            </div>
          ) : (
            <p className="text-sm text-slate-400">No project assigned yet.</p>
          )}
        </div>

        <div
          className="rounded-2xl border bg-black/30 p-5"
          style={{ borderColor: "rgba(255,255,255,0.10)" }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-white">Messages</h2>
            <button
              onClick={() => nav("/portal/inbox")}
              className="text-sm hover:underline"
              style={{ color: GREEN }}
            >
              Open inbox
            </button>
          </div>

          {myMessages.length === 0 ? (
            <p className="text-sm text-slate-400">No messages yet.</p>
          ) : (
            <div className="space-y-2">
              {myMessages.slice(0, 4).map((m) => (
                <div
                  key={m.id}
                  onClick={() => nav("/portal/inbox")}
                  className="cursor-pointer rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition px-4 py-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-medium text-white truncate">
                      {m.subject || "Message"}
                    </div>
                    <div className="text-xs text-slate-500 shrink-0">
                      {m.status}
                    </div>
                  </div>
                  <div className="text-xs text-slate-400 truncate mt-1">
                    {m.message}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}