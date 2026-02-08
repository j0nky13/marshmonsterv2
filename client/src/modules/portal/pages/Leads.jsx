import { useEffect, useMemo, useState } from "react";
import { Plus, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { listLeads, createLead } from "../lib/leadsApi";
import { convertLeadToProject } from "../lib/projectsApi";

const GREEN = "#B6F24A";

export default function Leads() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);

  const nav = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    notes: "",
  });

  /* ---------------- LOAD ---------------- */

  async function loadLeads() {
    try {
      const data = await listLeads();
      setLeads(data);
    } catch (err) {
      console.error("Failed to load leads", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLeads();
  }, []);

  /* ---------------- SEARCH ---------------- */

  const filtered = useMemo(() => {
    if (!search) return leads;

    const s = search.toLowerCase();

    return leads.filter((l) =>
      [
        l.name,
        l.email,
        l.company,
        l.phone,
      ]
        .join(" ")
        .toLowerCase()
        .includes(s)
    );
  }, [search, leads]);

  /* ---------------- CREATE ---------------- */

  async function handleCreate(e) {
    e.preventDefault();

    if (!form.name && !form.email) return;

    setCreating(true);

    try {
      await createLead(form);

      setForm({
        name: "",
        email: "",
        phone: "",
        company: "",
        notes: "",
      });

      setShowModal(false);
      await loadLeads();
    } catch (err) {
      console.error("Create lead failed:", err);
    } finally {
      setCreating(false);
    }
  }

  /* ---------------- CONVERT ---------------- */

  async function handleConvert(e, lead) {
    e.stopPropagation(); // VERY important

    if (!window.confirm("Convert this lead into a project?")) return;

    try {
      await convertLeadToProject(lead);
      await loadLeads();
    } catch (err) {
      console.error("Conversion failed:", err);
    }
  }

  /* ---------------- UI ---------------- */

  if (loading) {
    return <div className="text-slate-400">Loading leads…</div>;
  }

  return (
    <div className="flex flex-col gap-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Leads</h1>
          <div className="text-sm text-slate-500">
            Track and convert opportunities
          </div>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
          style={{
            backgroundColor: GREEN,
            color: "#0B0F1A",
          }}
        >
          <Plus size={16} />
          Add Lead
        </button>
      </div>

      {/* SEARCH */}
      <input
        placeholder="Search leads..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="
          w-full
          rounded-lg
          bg-black/40
          border border-white/10
          px-3 py-2
          text-sm
          text-slate-200
          focus:outline-none
        "
      />

      {/* TABLE */}
      <div className="rounded-xl border border-white/10 overflow-hidden">
        <div className="grid grid-cols-6 bg-black/50 text-xs uppercase tracking-wide text-slate-500 px-4 py-3">
          <div>Name</div>
          <div>Company</div>
          <div>Email</div>
          <div>Status</div>
          <div>Source</div>
          <div></div>
        </div>

        {filtered.length === 0 && (
          <div className="px-4 py-6 text-sm text-slate-500">
            No leads found.
          </div>
        )}

        {filtered.map((lead) => (
          <div
            key={lead.id}
            onClick={() => nav(`/portal/leads/${lead.id}`)}
            className="
              cursor-pointer
              grid grid-cols-6 items-center
              px-4 py-3
              border-t border-white/5
              hover:bg-white/5
              transition
            "
          >
            <div className="truncate">{lead.name || "—"}</div>
            <div className="truncate">{lead.company || "—"}</div>
            <div className="truncate text-slate-400">
              {lead.email || "—"}
            </div>

            <div className="text-xs">
              <span className="px-2 py-1 rounded bg-white/10">
                {lead.status || "new"}
              </span>
            </div>

            <div className="text-xs text-slate-500">
              {lead.source || "manual"}
            </div>

            <div className="flex justify-end">
              {lead.status !== "converted" && (
                <button
                  onClick={(e) => handleConvert(e, lead)}
                  className="inline-flex items-center gap-1 text-sm hover:opacity-80"
                  style={{ color: GREEN }}
                >
                  Convert
                  <ArrowRight size={14} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <form
            onSubmit={handleCreate}
            className="bg-[#0B0F1A] border border-white/10 rounded-xl p-6 w-full max-w-lg flex flex-col gap-3"
          >
            <div className="text-lg font-semibold mb-2">
              Add Lead
            </div>

            {["name", "email", "phone", "company"].map((field) => (
              <input
                key={field}
                placeholder={field}
                value={form[field]}
                onChange={(e) =>
                  setForm({ ...form, [field]: e.target.value })
                }
                className="rounded-lg bg-black/40 border border-white/10 px-3 py-2 text-sm"
              />
            ))}

            <textarea
              placeholder="notes"
              rows={4}
              value={form.notes}
              onChange={(e) =>
                setForm({ ...form, notes: e.target.value })
              }
              className="rounded-lg bg-black/40 border border-white/10 px-3 py-2 text-sm"
            />

            <div className="flex justify-end gap-2 mt-3">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-3 py-2 text-sm rounded border border-white/10 hover:bg-white/5"
              >
                Cancel
              </button>

              <button
                disabled={creating}
                className="px-4 py-2 rounded text-sm font-medium"
                style={{
                  backgroundColor: GREEN,
                  color: "#0B0F1A",
                }}
              >
                {creating ? "Creating…" : "Create Lead"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}