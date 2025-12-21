// src/modules/portal/pages/ProjectDetail.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getProject, updateProject } from "../lib/projectsApi";

export default function ProjectDetail() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      const data = await getProject(id);
      setProject(data);
    }
    load();
  }, [id]);

  if (!project) {
    return <div className="text-slate-400">Loading project…</div>;
  }

  async function save() {
    setSaving(true);
    await updateProject(project.id, {
      title: project.title,
      goal: project.goal,
      domain: project.domain,
      pages: project.pages,
      graphics: project.graphics,
    });
    setSaving(false);
  }

  return (
    <div className="space-y-8 max-w-4xl">

      {/* ================= HEADER ================= */}
      <div>
        <h1 className="text-2xl font-semibold">
          {project.title}
        </h1>

        <div className="mt-1 text-sm text-slate-400">
          {project.clientName} • {project.clientEmail}
        </div>

        <div className="mt-2 flex gap-2 text-xs">
          <span className="px-2 py-1 rounded bg-white/5 border border-white/10">
            Status: {project.status || "active"}
          </span>

          {project.source === "message" && (
            <span className="px-2 py-1 rounded bg-emerald-900/20 border border-emerald-500/30 text-emerald-300">
              Created from Inbox Message
            </span>
          )}
        </div>
      </div>

      {/* ================= OVERVIEW ================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <OverviewCard
          label="Pages"
          value={project.pages || "Not defined"}
        />
        <OverviewCard
          label="Domain"
          value={project.domain || "Not defined"}
        />
        <OverviewCard
          label="Created"
          value={
            project.createdAt?.toDate
              ? project.createdAt.toDate().toLocaleDateString()
              : "—"
          }
        />
      </div>

      {/* ================= ORIGINAL MESSAGE ================= */}
      {project.description && (
        <div className="rounded-lg border border-white/10 bg-black/40 p-4">
          <div className="text-xs text-slate-400 mb-2">
            Original Inquiry
          </div>

          <div className="text-sm whitespace-pre-wrap text-slate-200">
            {project.description}
          </div>
        </div>
      )}

      {/* ================= PROJECT SETUP ================= */}
      <div className="rounded-lg border border-white/10 bg-black/40 p-5 space-y-4">
        <div className="text-sm font-medium text-slate-200">
          Project Setup
        </div>

        <Input
          label="Project Goal"
          value={project.goal || ""}
          placeholder="What is the primary objective?"
          onChange={v => setProject({ ...project, goal: v })}
        />

        <Input
          label="Domain"
          value={project.domain || ""}
          placeholder="example.com"
          onChange={v => setProject({ ...project, domain: v })}
        />

        <Input
          label="Pages"
          type="number"
          value={project.pages || 1}
          onChange={v =>
            setProject({ ...project, pages: Number(v) })
          }
        />

        <div className="pt-2">
          <button
            onClick={save}
            disabled={saving}
            className="px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ================= SUB COMPONENTS ================= */

function OverviewCard({ label, value }) {
  return (
    <div className="rounded-lg border border-white/10 bg-black/40 p-4">
      <div className="text-xs text-slate-400">{label}</div>
      <div className="mt-1 text-sm text-slate-200">
        {value}
      </div>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}) {
  return (
    <div>
      <div className="text-xs text-slate-400 mb-1">{label}</div>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
        className="w-full rounded bg-black/40 border border-white/10 px-3 py-2 text-sm focus:outline-none focus:border-emerald-500/50"
      />
    </div>
  );
}