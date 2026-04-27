import { useState } from "react";
import { X } from "lucide-react";
import MonsterInput from "../shared/MonsterInput";
import MonsterButton from "../shared/MonsterButton";

export default function AddLeadModal({ open, onClose, onCreated }) {
  const [form, setForm] = useState({
    businessName: "",
    website: "",
    email: "",
    phone: "",
    category: "",
    city: "",
    state: "",
    notes: ""
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

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
      if (!form.businessName.trim()) {
        throw new Error("Business name is required.");
      }

      await onCreated(form);

      setForm({
        businessName: "",
        website: "",
        email: "",
        phone: "",
        category: "",
        city: "",
        state: "",
        notes: ""
      });

      onClose();
    } catch (err) {
      setError(err.message || "Failed to create lead.");
    } finally {
      setSaving(false);
    }
  }
    
    function formatPhoneNumber(value) {

  const digits = value.replace(/\D/g, "").slice(0, 10);

  if (digits.length < 4) {

    return digits;

  }

  if (digits.length < 7) {

    return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;

  }

  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;

}

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden">
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-white">Add Lead</h2>
            <p className="text-zinc-400 text-sm mt-1">
              Create a new CRM prospect.
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white"
          >
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
            <MonsterInput
              label="Business Name"
              value={form.businessName}
              onChange={(e) => updateField("businessName", e.target.value)}
              placeholder="Example Roofing LLC"
            />

            <MonsterInput
              label="Website"
              value={form.website}
              onChange={(e) => updateField("website", e.target.value)}
              placeholder="https://example.com"
            />

            <MonsterInput
              label="Email"
              value={form.email}
              onChange={(e) => updateField("email", e.target.value)}
              placeholder="owner@example.com"
            />

           <MonsterInput
  label="Phone"
  value={form.phone}
  onChange={(e) =>
    updateField(
      "phone",
      formatPhoneNumber(e.target.value)
    )
  }
  placeholder="(843) 555-1234"
/>

            <MonsterInput
              label="Category"
              value={form.category}
              onChange={(e) => updateField("category", e.target.value)}
              placeholder="Roofing, HVAC, Restaurant..."
            />

            <div className="grid grid-cols-2 gap-3">
              <MonsterInput
                label="City"
                value={form.city}
                onChange={(e) => updateField("city", e.target.value)}
                placeholder="Charleston"
              />

              <MonsterInput
                label="State"
                value={form.state}
                onChange={(e) => updateField("state", e.target.value)}
                placeholder="SC"
              />
            </div>
          </div>

          <label className="block">
            <span className="block text-sm text-zinc-400 mb-2">Notes</span>
            <textarea
              value={form.notes}
              onChange={(e) => updateField("notes", e.target.value)}
              placeholder="Initial notes..."
              className="w-full min-h-28 bg-black border border-zinc-800 rounded-2xl px-4 py-3 text-white outline-none focus:border-lime-400"
            />
          </label>

          <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
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
              {saving ? "Saving..." : "Create Lead"}
            </MonsterButton>
          </div>
        </form>
      </div>
    </div>
  );
}