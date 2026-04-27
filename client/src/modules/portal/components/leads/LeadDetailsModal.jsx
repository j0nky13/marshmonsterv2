import { useEffect, useState } from "react";
import { BriefcaseBusiness, Trash2, X } from "lucide-react";
import MonsterInput from "../shared/MonsterInput";
import MonsterButton from "../shared/MonsterButton";
import ConvertLeadToProjectModal from "../projects/ConvertLeadToProjectModal";

const statusOptions = [
  "new",
  "contacted",
  "follow_up",
  "won",
  "lost",
  "archived"
];

function formatPhoneNumber(value) {
  const digits = value.replace(/\D/g, "").slice(0, 10);

  if (digits.length < 4) return digits;
  if (digits.length < 7) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;

  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

function toDateInputValue(value) {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 10);
}

export default function LeadDetailsModal({
  open,
  lead,
  role,
  onClose,
  onSave,
  onDelete
}) {
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [convertOpen, setConvertOpen] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!lead) return;

    setForm({
      businessName: lead.businessName || "",
      website: lead.website || "",
      email: lead.email || "",
      phone: lead.phone || "",
      category: lead.category || "",
      city: lead.city || "",
      state: lead.state || "",
      status: lead.status || "new",
      ratingScore: lead.ratingScore ?? "",
      notes: lead.notes || "",
      nextFollowUpAt: toDateInputValue(lead.nextFollowUpAt)
    });

    setError("");
    setConvertOpen(false);
  }, [lead]);

  if (!open || !lead || !form) return null;

  function updateField(field, value) {
    setForm((prev) => ({
      ...prev,
      [field]: value
    }));
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      if (!form.businessName.trim()) {
        throw new Error("Business name is required.");
      }

      const payload = {
        ...form,
        ratingScore:
          form.ratingScore === "" || form.ratingScore === null
            ? null
            : Number(form.ratingScore),
        nextFollowUpAt: form.nextFollowUpAt || null
      };

      await onSave(lead._id, payload);
      onClose();
    } catch (err) {
      setError(err.message || "Failed to update lead.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    const confirmed = window.confirm(
      `Delete ${lead.businessName}? This cannot be undone.`
    );

    if (!confirmed) return;

    setDeleting(true);
    setError("");

    try {
      await onDelete(lead._id);
      onClose();
    } catch (err) {
      setError(err.message || "Failed to delete lead.");
    } finally {
      setDeleting(false);
    }
  }

  async function handleConverted() {
    await onSave(lead._id, {
      status: "won",
      nextFollowUpAt: null
    });

    onClose();
  }

  return (
    <>
      <ConvertLeadToProjectModal
        open={convertOpen}
        lead={lead}
        onClose={() => setConvertOpen(false)}
        onConverted={handleConverted}
      />

      <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="w-full max-w-4xl max-h-[92vh] overflow-y-auto bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl">
          <div className="sticky top-0 bg-zinc-950/95 backdrop-blur p-5 border-b border-zinc-800 flex items-center justify-between z-10">
            <div>
              <p className="text-lime-400 text-sm font-semibold uppercase tracking-widest">
                Lead Details
              </p>

              <h2 className="text-2xl font-black text-white">
                {lead.businessName}
              </h2>
            </div>

            <button
              onClick={onClose}
              className="text-zinc-400 hover:text-white"
            >
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSave} className="p-5 space-y-5">
            {error && (
              <div className="rounded-2xl border border-red-500/30 bg-red-500/10 text-red-300 px-4 py-3">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <MonsterInput
                label="Business Name"
                value={form.businessName}
                onChange={(e) => updateField("businessName", e.target.value)}
              />

              <MonsterInput
                label="Website"
                value={form.website}
                onChange={(e) => updateField("website", e.target.value)}
              />

              <MonsterInput
                label="Email"
                value={form.email}
                onChange={(e) => updateField("email", e.target.value)}
              />

              <MonsterInput
                label="Phone"
                value={form.phone}
                onChange={(e) =>
                  updateField("phone", formatPhoneNumber(e.target.value))
                }
              />

              <MonsterInput
                label="Category"
                value={form.category}
                onChange={(e) => updateField("category", e.target.value)}
              />

              <MonsterInput
                label="Rating Score"
                type="number"
                min="0"
                max="100"
                value={form.ratingScore}
                onChange={(e) => updateField("ratingScore", e.target.value)}
              />

              <MonsterInput
                label="City"
                value={form.city}
                onChange={(e) => updateField("city", e.target.value)}
              />

              <MonsterInput
                label="State"
                value={form.state}
                onChange={(e) => updateField("state", e.target.value)}
              />

              <label className="block">
                <span className="block text-sm text-zinc-400 mb-2">
                  Status
                </span>

                <select
                  value={form.status}
                  onChange={(e) => updateField("status", e.target.value)}
                  className="w-full bg-black border border-zinc-800 rounded-2xl px-4 py-3 text-white outline-none focus:border-lime-400"
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status.replace("_", " ")}
                    </option>
                  ))}
                </select>
              </label>

              <MonsterInput
                label="Next Follow-Up"
                type="date"
                value={form.nextFollowUpAt}
                onChange={(e) => updateField("nextFollowUpAt", e.target.value)}
              />
            </div>

            <label className="block">
              <span className="block text-sm text-zinc-400 mb-2">Notes</span>

              <textarea
                value={form.notes}
                onChange={(e) => updateField("notes", e.target.value)}
                className="w-full min-h-36 bg-black border border-zinc-800 rounded-2xl px-4 py-3 text-white outline-none focus:border-lime-400"
              />
            </label>

            <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between pt-2">
              <div className="flex flex-col sm:flex-row gap-3">
                <MonsterButton
                  type="button"
                  onClick={() => setConvertOpen(true)}
                  className="bg-lime-400 text-black hover:bg-lime-300 flex items-center justify-center gap-2"
                >
                  <BriefcaseBusiness size={18} />
                  Convert to Project
                </MonsterButton>

                {role === "admin" && (
                  <MonsterButton
                    type="button"
                    onClick={handleDelete}
                    disabled={deleting}
                    className="bg-red-500/10 text-red-300 border border-red-500/30 hover:bg-red-500/20 flex items-center justify-center gap-2"
                  >
                    <Trash2 size={18} />
                    {deleting ? "Deleting..." : "Delete Lead"}
                  </MonsterButton>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <MonsterButton
                  type="button"
                  onClick={onClose}
                  className="bg-zinc-900 text-white border border-zinc-800 hover:bg-zinc-800"
                >
                  Cancel
                </MonsterButton>

                <MonsterButton
                  type="submit"
                  disabled={saving}
                  className="bg-lime-400 text-black hover:bg-lime-300"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </MonsterButton>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}