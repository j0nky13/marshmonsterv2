// src/modules/portal/pages/Inbox.jsx
import { useEffect, useState } from "react";
import {
  listMessages,
  updateMessageStatus,
  markMessageRead,
  deleteMessage,
  markMessageConverted,
} from "../../../lib/messagesApi";
import { convertMessageToProject } from "../lib/projectsApi";

export default function Inbox() {
  const [messages, setMessages] = useState([]);
  const [active, setActive] = useState(null);
  const [loading, setLoading] = useState(true);

  const [showConvert, setShowConvert] = useState(false);
  const [converting, setConverting] = useState(false);

  const [form, setForm] = useState({
    title: "",
    goal: "",
    pages: "",
    domain: "",
    graphics: false,
    budget: "",
    timeline: "",
    notes: "",
  });

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    setMessages(await listMessages());
    setLoading(false);
  }

  async function openMessage(m) {
    setActive(m);
    if (!m.read) {
      await markMessageRead(m.id);
      await load();
    }
  }

  async function remove(id) {
    if (!confirm("Delete this message?")) return;
    await deleteMessage(id);
    setActive(null);
    await load();
  }

  const alreadyConverted = active?.convertedToProject === true;

  function openConvertModal() {
    if (!active) return;
    // prefill lightly from the message
    setForm((prev) => ({
      ...prev,
      title: prev.title || `${active.name || "Client"} Project`,
      pages: prev.pages || "1",
      goal: prev.goal || "",
      domain: prev.domain || "",
      budget: prev.budget || "",
      timeline: prev.timeline || "",
      notes: prev.notes || "",
    }));
    setShowConvert(true);
  }

  async function convertToProject() {
    if (!active || alreadyConverted) return;

    try {
      setConverting(true);

      const projectId = await convertMessageToProject(active, {
        title: form.title,
        goal: form.goal,
        pages: form.pages,
        domain: form.domain,
        graphics: form.graphics,
        budget: form.budget,
        timeline: form.timeline,
        notes: form.notes,
      });

      await markMessageConverted(active.id, projectId);
      await updateMessageStatus(active.id, "converted");

      setShowConvert(false);
      setActive(null);
      await load();
    } catch (err) {
      console.error("CONVERT FAILED:", err);
      alert("Failed to convert message");
    } finally {
      setConverting(false);
    }
  }

  if (loading) {
    return <div className="text-slate-400">Loading inbox…</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
      {/* MESSAGE LIST */}
      <div className="border border-slate-800 rounded-lg overflow-hidden">
        {messages.map((m) => (
          <button
            key={m.id}
            onClick={() => openMessage(m)}
            className={`w-full text-left px-4 py-3 border-b border-slate-800 hover:bg-slate-900 ${
              active?.id === m.id ? "bg-slate-900" : ""
            }`}
          >
            <div className="flex justify-between">
              <span className={m.read ? "text-slate-200" : "text-emerald-300"}>
                {m.name || "Anonymous"}
              </span>
              <span className="text-xs text-slate-500">
                {m.convertedToProject ? "converted" : m.status}
              </span>
            </div>
            <div className="text-xs text-slate-400 truncate">{m.message}</div>
          </button>
        ))}
      </div>

      {/* MESSAGE DETAIL */}
      <div className="md:col-span-2 border border-slate-800 rounded-lg p-4">
        {!active ? (
          <div className="text-slate-500">Select a message</div>
        ) : (
          <>
            <h2 className="text-lg font-semibold">{active.name}</h2>
            <div className="text-sm text-slate-400">{active.email}</div>

            <div className="mt-3 bg-slate-950 border border-slate-800 rounded p-3 text-sm">
              {active.message}
            </div>

            <div className="mt-4 flex gap-2">
              <button
                disabled={alreadyConverted}
                onClick={openConvertModal}
                className={`px-3 py-1 text-xs rounded border ${
                  alreadyConverted
                    ? "border-slate-700 text-slate-500 cursor-not-allowed"
                    : "border-emerald-700 text-emerald-400 hover:bg-emerald-900/20"
                }`}
              >
                {alreadyConverted ? "Already Converted" : "Convert → Project"}
              </button>

              <button
                onClick={() => remove(active.id)}
                className="ml-auto px-3 py-1 text-xs rounded border border-red-700 text-red-400"
              >
                Delete
              </button>
            </div>
          </>
        )}
      </div>

      {/* CONVERT MODAL */}
      {showConvert && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#0f141b] border border-white/10 rounded-xl w-full max-w-2xl shadow-2xl">
            {/* Header */}
            <div className="px-6 py-4 border-b border-white/10">
              <h3 className="text-lg font-semibold text-emerald-400">
                Convert Message → Project
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Add requirements so the project page isn’t empty later.
              </p>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4 text-sm">
              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  Project / Site Name
                </label>
                <input
                  value={form.title}
                  className="w-full rounded bg-black/40 border border-white/10 px-3 py-2 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 outline-none"
                  placeholder="Client Website Redesign"
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  Primary Goal
                </label>
                <input
                  value={form.goal}
                  className="w-full rounded bg-black/40 border border-white/10 px-3 py-2 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 outline-none"
                  placeholder="Generate leads / Improve performance"
                  onChange={(e) => setForm({ ...form, goal: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    Number of Pages
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={form.pages}
                    className="w-full rounded bg-black/40 border border-white/10 px-3 py-2 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 outline-none"
                    onChange={(e) => setForm({ ...form, pages: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    Current Domain
                  </label>
                  <input
                    value={form.domain}
                    className="w-full rounded bg-black/40 border border-white/10 px-3 py-2 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 outline-none"
                    placeholder="example.com"
                    onChange={(e) =>
                      setForm({ ...form, domain: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    Budget (USD)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    value={form.budget}
                    className="w-full rounded bg-black/40 border border-white/10 px-3 py-2 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 outline-none"
                    placeholder="8000"
                    onChange={(e) =>
                      setForm({ ...form, budget: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    Timeline Requirement
                  </label>
                  <input
                    value={form.timeline}
                    className="w-full rounded bg-black/40 border border-white/10 px-3 py-2 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 outline-none"
                    placeholder="4 weeks / ASAP / by Jan 15"
                    onChange={(e) =>
                      setForm({ ...form, timeline: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* Graphics toggle */}
              <div className="flex items-center justify-between rounded-lg border border-white/10 bg-black/40 px-4 py-3">
                <div>
                  <div className="text-sm text-slate-200">
                    Branding / Graphics Needed
                  </div>
                  <div className="text-xs text-slate-400">
                    Logo work, visual identity, or custom assets
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setForm((f) => ({ ...f, graphics: !f.graphics }))
                  }
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                    form.graphics ? "bg-emerald-500" : "bg-slate-700"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-black transition ${
                      form.graphics ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  More Notes
                </label>
                <textarea
                  rows={5}
                  value={form.notes}
                  className="w-full rounded bg-black/40 border border-white/10 px-3 py-2 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 outline-none resize-none"
                  placeholder="Add anything: features needed, inspiration links, deliverables, hosting, integrations, etc…"
                  onChange={(e) =>
                    setForm({ ...form, notes: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-white/10 flex justify-end gap-3">
              <button
                onClick={() => setShowConvert(false)}
                className="px-4 py-2 text-xs rounded border border-white/10 text-slate-300 hover:bg-white/5"
              >
                Cancel
              </button>

              <button
                disabled={converting}
                onClick={convertToProject}
                className="px-5 py-2 text-xs font-semibold rounded bg-emerald-500 text-black hover:bg-emerald-400 disabled:opacity-60"
              >
                {converting ? "Creating…" : "Create Project"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}