import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import {
  subscribeToLead,
  updateLead,
} from "../lib/leadsApi";

const GREEN = "#B6F24A";

export default function LeadDetail({ profile }) {
  const { id } = useParams();

  const [lead, setLead] = useState(null);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const isAdmin = profile?.role === "admin";

  useEffect(() => {
    if (!id) return;

    const unsub = subscribeToLead(id, (data) => {
      setLead(data);
      setForm(data || {});
      setLoading(false);
    });

    return unsub;
  }, [id]);

  function updateField(field, value) {
    setForm((f) => ({
      ...f,
      [field]: value,
    }));
  }

  async function save() {
    try {
      setSaving(true);
      await updateLead(id, form);
    } catch (e) {
      console.error(e);
      setErr("Failed to save lead.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="text-slate-400">Loading lead…</div>;
  }

  if (!lead) {
    return <div className="text-red-400">Lead not found.</div>;
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">
          {lead.name || "Unnamed Lead"}
        </h1>

        <Link
          to="/portal/leads"
          className="text-sm border border-white/10 px-3 py-2 rounded-lg hover:bg-white/5"
        >
          Back
        </Link>
      </div>

      {/* INFO */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        <Input
          label="Name"
          value={form.name || ""}
          disabled={!isAdmin}
          onChange={(v) => updateField("name", v)}
        />

        <Input
          label="Company"
          value={form.company || ""}
          disabled={!isAdmin}
          onChange={(v) => updateField("company", v)}
        />

        <Input
          label="Email"
          value={form.email || ""}
          disabled={!isAdmin}
          onChange={(v) => updateField("email", v)}
        />

        <Input
          label="Phone"
          value={form.phone || ""}
          disabled={!isAdmin}
          onChange={(v) => updateField("phone", v)}
        />
      </div>

      {/* NOTES */}
      <div className="rounded-xl border border-white/10 bg-black/40 p-4">
        <div className="text-xs text-slate-500 mb-2 uppercase">
          Notes
        </div>

        <textarea
          value={form.notes || ""}
          disabled={!isAdmin}
          onChange={(e) => updateField("notes", e.target.value)}
          rows={6}
          className="w-full rounded-lg bg-black/50 border border-white/10 p-3 text-sm text-slate-200 focus:outline-none"
        />
      </div>

      {/* STATUS */}
      <div className="flex gap-3 items-center">
        <select
          value={form.status || "new"}
          disabled={!isAdmin}
          onChange={(e) => updateField("status", e.target.value)}
          className="rounded-lg bg-black/50 border border-white/10 px-3 py-2"
        >
          <option value="new">new</option>
          <option value="contacted">contacted</option>
          <option value="qualified">qualified</option>
          <option value="won">won</option>
          <option value="lost">lost</option>
        </select>

        {isAdmin && (
          <button
            onClick={save}
            disabled={saving}
            className="px-4 py-2 rounded-lg font-medium"
            style={{
              background: GREEN,
              color: "#020617",
            }}
          >
            {saving ? "Saving…" : "Save Changes"}
          </button>
        )}
      </div>

      {err && (
        <div className="text-red-400 text-sm">
          {err}
        </div>
      )}
    </div>
  );
}

function Input({ label, value, onChange, disabled }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="text-xs text-slate-500 uppercase">
        {label}
      </div>

      <input
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg bg-black/50 border border-white/10 px-3 py-2 text-sm text-slate-200 focus:outline-none"
      />
    </div>
  );
}