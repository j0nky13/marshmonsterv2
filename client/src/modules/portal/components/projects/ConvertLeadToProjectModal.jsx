import { useState } from "react";
import { X } from "lucide-react";
import { apiFetch } from "../../api/api";

export default function ConvertLeadToProjectModal({
  open,
  lead,
  onClose,
  onConverted
}) {
  const [form, setForm] = useState({
    projectName: "",
    projectType: "",
    budget: "",
    paidAmount: 0,
    dueDate: "",
    notes: "",
    createCommission: true,
    commissionRate: 0.5
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  if (!open || !lead) return null;

  function updateField(field, value) {
    setForm((prev) => ({
      ...prev,
      [field]: value
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      if (!form.budget || Number(form.budget) <= 0) {
        throw new Error("Deal amount is required.");
      }

      const data = await apiFetch(`/projects/from-lead/${lead._id}`, {
        method: "POST",
        body: JSON.stringify({
          ...form,
          budget: Number(form.budget),
          paidAmount: Number(form.paidAmount || 0),
          commissionRate: Number(form.commissionRate || 0.5)
        })
      });

      onConverted?.(data);
      onClose();
    } catch (err) {
      setError(err.message || "Failed to convert lead.");
    } finally {
      setSaving(false);
    }
  }

  const estimatedCommission =
    Number(form.budget || 0) * Number(form.commissionRate || 0.5);

  return (
    <div className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden">
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
          <div>
            <p className="text-lime-400 text-sm font-semibold uppercase tracking-widest">
              Convert Lead
            </p>

            <h2 className="text-2xl font-black text-white">
              {lead.businessName}
            </h2>
          </div>

          <button onClick={onClose} className="text-zinc-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {error && (
            <div className="rounded-2xl border border-red-500/30 bg-red-500/10 text-red-300 px-4 py-3">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Project Name"
              value={form.projectName}
              onChange={(value) => updateField("projectName", value)}
              placeholder="Website rebuild, SEO package..."
            />

            <Input
              label="Project Type"
              value={form.projectType}
              onChange={(value) => updateField("projectType", value)}
              placeholder="Website, SEO, Branding..."
            />

            <Input
              label="Deal Amount"
              type="number"
              value={form.budget}
              onChange={(value) => updateField("budget", value)}
              placeholder="2500"
            />

            <Input
              label="Amount Already Paid"
              type="number"
              value={form.paidAmount}
              onChange={(value) => updateField("paidAmount", value)}
              placeholder="0"
            />

            <Input
              label="Due Date"
              type="date"
              value={form.dueDate}
              onChange={(value) => updateField("dueDate", value)}
            />

            <Input
              label="Commission Rate"
              type="number"
              step="0.01"
              value={form.commissionRate}
              onChange={(value) => updateField("commissionRate", value)}
            />
          </div>

          <label className="flex items-center gap-3 bg-black border border-zinc-800 rounded-2xl px-4 py-3">
            <input
              type="checkbox"
              checked={form.createCommission}
              onChange={(e) =>
                updateField("createCommission", e.target.checked)
              }
            />

            <span className="text-zinc-300">
              Auto-create commission record
            </span>
          </label>

          <div className="bg-black border border-zinc-800 rounded-2xl p-4">
            <p className="text-zinc-500 text-sm">Estimated Commission</p>
            <p className="text-3xl font-black text-lime-400 mt-1">
              {money(estimatedCommission)}
            </p>
          </div>

          <label className="block">
            <span className="block text-sm text-zinc-400 mb-2">Notes</span>

            <textarea
              value={form.notes}
              onChange={(e) => updateField("notes", e.target.value)}
              placeholder="Project details..."
              className="w-full min-h-24 bg-black border border-zinc-800 rounded-2xl px-4 py-3 text-white outline-none focus:border-lime-400"
            />
          </label>

          <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl bg-zinc-900 border border-zinc-800 text-white px-5 py-3 font-bold hover:bg-zinc-800"
            >
              Cancel
            </button>

            <button
              disabled={saving}
              className="rounded-2xl bg-lime-400 text-black px-5 py-3 font-bold hover:bg-lime-300 disabled:opacity-50"
            >
              {saving ? "Converting..." : "Convert to Project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Input({ label, value, onChange, type = "text", step, placeholder }) {
  return (
    <label className="block">
      <span className="block text-sm text-zinc-400 mb-2">{label}</span>

      <input
        type={type}
        step={step}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-black border border-zinc-800 rounded-2xl px-4 py-3 text-white outline-none focus:border-lime-400"
      />
    </label>
  );
}

function money(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(value || 0);
}