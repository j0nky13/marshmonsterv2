import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  CheckCircle2,
  Circle,
  Clock,
  FileText,
  Upload,
  Download,
} from "lucide-react";

import { subscribeToProject, updateProject } from "../lib/projectsApi";

// ✅ Firebase Storage
import { storage } from "../../../lib/firebase";
import { ref, uploadBytes, listAll, getDownloadURL } from "firebase/storage";

const GREEN = "#B6F24A";

const PHASES = [
  { key: "discovery", label: "Discovery" },
  { key: "design", label: "Design" },
  { key: "build", label: "Build" },
  { key: "review", label: "Review" },
  { key: "launch", label: "Launch" },
];

function phaseIndex(phase) {
  const idx = PHASES.findIndex((p) => p.key === phase);
  return idx === -1 ? 0 : idx;
}

function percentFromPhase(phase) {
  const idx = phaseIndex(phase);
  const denom = Math.max(1, PHASES.length - 1);
  return Math.round((idx / denom) * 100);
}

export default function ProjectDetail({ profile }) {
  const { id } = useParams();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [saleAmount, setSaleAmount] = useState("");
  const [saleDate, setSaleDate] = useState("");
  useEffect(() => {
    if (!project) return;

    setSaleAmount(project.saleAmount || "");
    setSaleDate(project.saleDate || "");
  }, [project]);

  // ✅ Files state
  const [files, setFiles] = useState([]);
  const [filesLoading, setFilesLoading] = useState(false);

  const isAdmin = (profile?.role || "") === "admin";

  useEffect(() => {
    if (!id) return;

    setLoading(true);
    setErr("");

    let unsubscribe = null;

    try {
      unsubscribe = subscribeToProject(id, (data) => {
        setProject(data);
        setLoading(false);
      });
    } catch (e) {
      console.error("ProjectDetail subscribe failed:", e);
      setErr(e?.message || "Failed to load project.");
      setLoading(false);
    }

    return () => {
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, [id]);

  // ✅ Load files from Storage (projectFiles/{projectId}/...)
  useEffect(() => {
    if (!id) return;

    let alive = true;
    setFilesLoading(true);

    const folderRef = ref(storage, `projectFiles/${id}`);

    listAll(folderRef)
      .then(async (res) => {
        const fileData = await Promise.all(
          res.items.map(async (itemRef) => {
            const url = await getDownloadURL(itemRef);
            return { name: itemRef.name, url };
          })
        );

        if (alive) setFiles(fileData);
      })
      .catch((e) => {
        console.error("Failed to load files:", e);
        // don't hard error the whole page—just show message if needed
      })
      .finally(() => {
        if (alive) setFilesLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [id]);

  const progress = useMemo(() => {
    const phase = project?.phase || "discovery";
    return {
      phase,
      idx: phaseIndex(phase),
      pct: percentFromPhase(phase),
    };
  }, [project?.phase]);

  async function setPhase(nextPhase) {
    if (!id) return;
    setErr("");
    setSaving(true);
    try {
      await updateProject(id, { phase: nextPhase });
      // UI updates via subscribeToProject
    } catch (e) {
      console.error("Failed to update phase:", e);
      setErr(e?.message || "Failed to update phase.");
    } finally {
      setSaving(false);
    }
  }

  async function setStatus(nextStatus) {
    if (!id) return;
    setErr("");
    setSaving(true);
    try {
      await updateProject(id, { status: nextStatus });
    } catch (e) {
      console.error("Failed to update status:", e);
      setErr(e?.message || "Failed to update status.");
    } finally {
      setSaving(false);
    }
  }

  async function saveSaleData() {
    if (!id) return;

    setErr("");
    setSaving(true);

    try {
      await updateProject(id, {
        saleAmount: saleAmount ? Number(saleAmount) : 0,
        saleDate: saleDate || null,
      });
    } catch (e) {
      console.error("Failed to update sale data:", e);
      setErr(e?.message || "Failed to update sale data.");
    } finally {
      setSaving(false);
    }
  }

  // ✅ Upload handler
  async function handleUpload(e) {
    const file = e.target.files?.[0];
    if (!file || !id) return;

    // allow same file re-select later
    e.target.value = "";

    try {
      setErr("");

      const fileRef = ref(storage, `projectFiles/${id}/${file.name}`);
      await uploadBytes(fileRef, file);
      const url = await getDownloadURL(fileRef);

      setFiles((prev) => {
        // replace if same name already exists
        const filtered = prev.filter((f) => f.name !== file.name);
        return [{ name: file.name, url }, ...filtered];
      });
    } catch (err) {
      console.error("Upload failed:", err);
      setErr(err?.message || "Upload failed.");
    }
  }

  // ✅ Download handler
  function handleDownload(file) {
    if (!file?.url) return;
    window.open(file.url, "_blank", "noopener,noreferrer");
  }

  if (loading) {
    return <div className="text-slate-400">Loading project…</div>;
  }

  if (!project) {
    return (
      <div className="space-y-3">
        <div className="text-red-400">Project not found.</div>
        <Link to="/portal/projects" className="text-sm" style={{ color: GREEN }}>
          ← Back to projects
        </Link>
      </div>
    );
  }

  const status = project.status || "active";
  const statusTone =
    status === "active"
      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
      : status === "paused"
      ? "border-amber-500/30 bg-amber-500/10 text-amber-200"
      : "border-slate-500/30 bg-slate-500/10 text-slate-200";

  return (
    <div className="flex flex-col gap-6">
      {/* TOP */}
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <div className="text-xs text-slate-500">Project</div>
          <h1 className="text-2xl md:text-3xl font-semibold truncate">
            {project.title || "Untitled Project"}
          </h1>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center gap-2 text-xs px-2.5 py-1 rounded-full border ${statusTone}`}
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: GREEN, opacity: 0.9 }}
              />
              {status}
            </span>

            {project.updatedAt?.toDate && (
              <span className="text-xs text-slate-500">
                Updated {project.updatedAt.toDate().toLocaleString()}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/portal/projects"
            className="text-sm rounded-lg border border-white/10 px-3 py-2 hover:bg-white/5 transition"
          >
            Back
          </Link>

          {/* ADMIN CONTROLS */}
          {isAdmin && (
            <div className="flex items-center gap-2">
              <select
                value={status}
                disabled={saving}
                onChange={(e) => setStatus(e.target.value)}
                className="rounded-lg bg-black/50 border border-white/10 px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-1"
                style={{ outlineColor: GREEN }}
              >
                <option value="active">active</option>
                <option value="paused">paused</option>
                <option value="archived">archived</option>
              </select>

              <select
                value={progress.phase}
                disabled={saving}
                onChange={(e) => setPhase(e.target.value)}
                className="rounded-lg bg-black/50 border border-white/10 px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-1"
                style={{ outlineColor: GREEN }}
              >
                {PHASES.map((p) => (
                  <option key={p.key} value={p.key}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* PROGRESS */}
      <div className="rounded-xl border border-white/10 bg-black/40 p-4 md:p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-xs uppercase tracking-wide text-slate-500">
              Progress
            </div>
            <div className="text-sm text-slate-200 mt-1">
              Phase:{" "}
              <span className="font-semibold" style={{ color: GREEN }}>
                {PHASES[progress.idx]?.label || "Discovery"}
              </span>
            </div>
          </div>
          <div className="text-sm text-slate-300">{progress.pct}%</div>
        </div>

        {/* BAR */}
        <div className="mt-3 h-2.5 w-full rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full"
            style={{
              width: `${progress.pct}%`,
              backgroundColor: GREEN,
              boxShadow: "0 0 18px rgba(182,242,74,0.25)",
            }}
          />
        </div>

        {/* RAIL */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-5 gap-2">
          {PHASES.map((p, idx) => {
            const done = idx < progress.idx;
            const active = idx === progress.idx;

            return (
              <div
                key={p.key}
                className={`rounded-lg border px-3 py-2 flex items-center gap-2 ${
                  active
                    ? "border-white/15 bg-white/5"
                    : "border-white/10 bg-transparent"
                }`}
              >
                {done ? (
                  <CheckCircle2 size={16} color={GREEN} />
                ) : active ? (
                  <Clock size={16} color={GREEN} />
                ) : (
                  <Circle size={16} color="rgba(226,232,240,0.35)" />
                )}

                <div className="min-w-0">
                  <div className="text-xs text-slate-400 truncate">{p.label}</div>
                  <div className="text-[11px] text-slate-500 truncate">
                    {done ? "Complete" : active ? "In progress" : "Queued"}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {!isAdmin && (
          <div className="mt-3 text-xs text-slate-500">
            Progress is updated by your project manager.
          </div>
        )}
      </div>

      {/* CLIENT + OVERVIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="rounded-xl border border-white/10 bg-black/40 p-4 lg:col-span-1">
          <div className="text-xs uppercase tracking-wide text-slate-500 mb-2">
            Client
          </div>
          <div className="text-sm text-slate-200">{project.clientName || "—"}</div>
          <div className="text-xs text-slate-500 mt-1 break-all">
            {project.clientEmail || "—"}
          </div>
          {project.clientUid && (
            <div className="text-[11px] text-slate-600 mt-2 break-all">
              UID: {project.clientUid}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-white/10 bg-black/40 p-4 lg:col-span-2">
          <div className="flex items-center gap-2 mb-2">
            <FileText size={16} color={GREEN} />
            <div className="text-xs uppercase tracking-wide text-slate-500">
              Overview
            </div>
          </div>

          {project.description ? (
            <p className="text-sm text-slate-200 whitespace-pre-wrap leading-relaxed">
              {project.description}
            </p>
          ) : (
            <p className="text-sm text-slate-500">No description yet.</p>
          )}
        </div>
      </div>

      {/* SALE DATA (ADMIN ONLY) */}
      {isAdmin && (
        <div className="rounded-xl border border-white/10 bg-black/40 p-4">
          <div className="text-xs uppercase tracking-wide text-slate-500 mb-3">
            Sale / Revenue Data
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-slate-400 block mb-1">
                Sale Amount ($)
              </label>
              <input
                type="number"
                value={saleAmount}
                onChange={(e) => setSaleAmount(e.target.value)}
                className="w-full rounded-lg bg-black/50 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1"
                style={{ outlineColor: GREEN }}
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">
                Sale Date
              </label>
              <input
                type="date"
                value={saleDate || ""}
                onChange={(e) => setSaleDate(e.target.value)}
                className="w-full rounded-lg bg-black/50 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1"
                style={{ outlineColor: GREEN }}
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={saveSaleData}
                disabled={saving}
                className="w-full rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 px-4 py-2 text-sm hover:bg-emerald-500/30 transition"
              >
                {saving ? "Saving..." : "Save Sale Data"}
              </button>
            </div>
          </div>

          {project?.saleAmount > 0 && (
            <div className="mt-4 text-sm text-emerald-300">
              Recorded Revenue: ${Number(project.saleAmount).toLocaleString()}
            </div>
          )}
        </div>
      )}

      {/* FILES */}
      <div className="rounded-xl border border-white/10 bg-black/40 p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="text-xs uppercase tracking-wide text-slate-500">
            Files
          </div>

          {isAdmin && (
            <label className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-slate-300 hover:bg-white/5 transition cursor-pointer">
              <Upload size={16} />
              Upload
              <input type="file" hidden onChange={handleUpload} />
            </label>
          )}
        </div>

        <div className="mt-4 space-y-2">
          {filesLoading && (
            <div className="text-sm text-slate-500">Loading files…</div>
          )}

          {!filesLoading && files.length === 0 && (
            <div className="text-sm text-slate-500">No files uploaded yet.</div>
          )}

          {files.map((file) => (
            <div
              key={file.name}
              className="flex items-center justify-between border border-white/10 rounded-lg px-3 py-2 bg-black/60"
            >
              <div className="text-sm truncate">{file.name}</div>

              <button
                onClick={() => handleDownload(file)}
                className="text-xs flex items-center gap-1 hover:opacity-70"
                style={{ color: GREEN }}
              >
                <Download size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {err && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {err}
        </div>
      )}
    </div>
  );
}