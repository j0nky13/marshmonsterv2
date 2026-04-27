import { useEffect, useMemo, useState } from "react";
import { DollarSign, Plus, Trash2 } from "lucide-react";
import { apiFetch } from "../api/api";

export default function CommissionsTab({ role }) {
  const [commissions, setCommissions] = useState([]);
  const [users, setUsers] = useState([]);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  async function loadData() {
    try {
      setLoading(true);

      const [commissionData, leadData] = await Promise.all([
        apiFetch("/commissions"),
        apiFetch("/leads")
      ]);

      setCommissions(commissionData.commissions || []);
      setLeads(leadData.leads || []);

      if (role === "admin") {
        const userData = await apiFetch("/users");
        setUsers(
          (userData.users || []).filter(
            (user) => user.role === "staff" || user.role === "admin"
          )
        );
      }
    } catch (error) {
      alert(error.message || "Failed to load commissions.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const totals = useMemo(() => {
    return commissions.reduce(
      (acc, item) => {
        acc.dealAmount += item.dealAmount || 0;
        acc.totalCommission += item.totalCommission || 0;
        acc.paidCommission += item.paidCommission || 0;
        acc.outstandingCommission += item.outstandingCommission || 0;
        return acc;
      },
      {
        dealAmount: 0,
        totalCommission: 0,
        paidCommission: 0,
        outstandingCommission: 0
      }
    );
  }, [commissions]);

  async function createCommission(form) {
    const data = await apiFetch("/commissions", {
      method: "POST",
      body: JSON.stringify(form)
    });

    setCommissions((prev) => [data.commission, ...prev]);
  }

  async function updatePaidAmount(commissionId, paidCommission) {
    const data = await apiFetch(`/commissions/${commissionId}`, {
      method: "PATCH",
      body: JSON.stringify({ paidCommission: Number(paidCommission) })
    });

    setCommissions((prev) =>
      prev.map((item) =>
        item._id === commissionId ? data.commission : item
      )
    );
  }

  async function deleteCommission(commissionId) {
    const confirmed = window.confirm("Delete this commission record?");
    if (!confirmed) return;

    await apiFetch(`/commissions/${commissionId}`, {
      method: "DELETE"
    });

    setCommissions((prev) =>
      prev.filter((item) => item._id !== commissionId)
    );
  }

  if (loading) {
    return <div className="text-zinc-400">Loading commissions...</div>;
  }

  return (
    <div className="space-y-6">
      <AddCommissionModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={createCommission}
        users={users}
        leads={leads}
      />

      <div className="rounded-3xl bg-gradient-to-br from-zinc-900 to-black border border-zinc-800 p-6">
        <p className="text-lime-400 text-sm font-semibold uppercase tracking-widest">
          Sales Payouts
        </p>

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mt-2">
          <div>
            <h1 className="text-3xl sm:text-5xl font-black">
              Commissions
            </h1>

            <p className="text-zinc-400 mt-4 max-w-3xl">
              Track 50% staff commission, paid commission, and outstanding
              balances.
            </p>
          </div>

          {role === "admin" && (
            <button
              onClick={() => setModalOpen(true)}
              className="bg-lime-400 text-black font-bold rounded-2xl px-5 py-3 hover:bg-lime-300 flex items-center justify-center gap-2"
            >
              <Plus size={18} />
              Add Commission
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Stat label="Deals" value={money(totals.dealAmount)} />
        <Stat label="Total Commission" value={money(totals.totalCommission)} />
        <Stat label="Paid" value={money(totals.paidCommission)} />
        <Stat
          label="Outstanding"
          value={money(totals.outstandingCommission)}
          highlight
        />
      </div>

      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden">
        <div className="p-5 border-b border-zinc-800">
          <p className="font-black">Commission Records</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-sm">
            <thead className="bg-zinc-900 text-zinc-400">
              <tr>
                <th className="text-left p-4">Client / Project</th>
                <th className="text-left p-4">Staff</th>
                <th className="text-left p-4">Deal</th>
                <th className="text-left p-4">Rate</th>
                <th className="text-left p-4">Total Commission</th>
                <th className="text-left p-4">Paid</th>
                <th className="text-left p-4">Outstanding</th>
                <th className="text-left p-4">Status</th>
                {role === "admin" && <th className="text-left p-4">Actions</th>}
              </tr>
            </thead>

            <tbody>
              {commissions.length === 0 ? (
                <tr className="border-t border-zinc-800">
                  <td
                    className="p-4 text-zinc-500"
                    colSpan={role === "admin" ? 9 : 8}
                  >
                    No commission records yet.
                  </td>
                </tr>
              ) : (
                commissions.map((item) => (
                  <tr
                    key={item._id}
                    className="border-t border-zinc-800 hover:bg-zinc-900/50"
                  >
                    <td className="p-4">
                      <p className="font-bold text-white">{item.clientName}</p>
                      <p className="text-zinc-500 text-xs">
                        {item.projectName || "No project name"}
                      </p>
                    </td>

                    <td className="p-4 text-zinc-300">
                      {item.userId?.name || item.userId?.email || "—"}
                    </td>

                    <td className="p-4 text-zinc-300">
                      {money(item.dealAmount)}
                    </td>

                    <td className="p-4 text-zinc-300">
                      {Math.round((item.commissionRate || 0) * 100)}%
                    </td>

                    <td className="p-4 text-zinc-300">
                      {money(item.totalCommission)}
                    </td>

                    <td className="p-4">
                      {role === "admin" ? (
                        <input
                          type="number"
                          defaultValue={item.paidCommission}
                          onBlur={(e) =>
                            updatePaidAmount(item._id, e.target.value)
                          }
                          className="w-28 bg-black border border-zinc-800 rounded-xl px-3 py-2 text-white outline-none focus:border-lime-400"
                        />
                      ) : (
                        <span className="text-zinc-300">
                          {money(item.paidCommission)}
                        </span>
                      )}
                    </td>

                    <td className="p-4 font-bold text-lime-400">
                      {money(item.outstandingCommission)}
                    </td>

                    <td className="p-4">
                      <span className="rounded-full border border-zinc-700 px-3 py-1 text-xs capitalize text-zinc-300">
                        {item.status?.replace("_", " ")}
                      </span>
                    </td>

                    {role === "admin" && (
                      <td className="p-4">
                        <button
                          onClick={() => deleteCommission(item._id)}
                          className="rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 p-2 hover:bg-red-500/20"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function AddCommissionModal({ open, onClose, onCreated, users, leads }) {
  const [form, setForm] = useState({
    userId: "",
    leadId: "",
    clientName: "",
    projectName: "",
    dealAmount: "",
    commissionRate: 0.5,
    paidCommission: 0,
    notes: ""
  });

  const [saving, setSaving] = useState(false);

  if (!open) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);

    try {
      if (!form.userId) throw new Error("Staff member is required.");
      if (!form.clientName.trim()) throw new Error("Client name is required.");

      await onCreated({
        ...form,
        dealAmount: Number(form.dealAmount),
        commissionRate: Number(form.commissionRate),
        paidCommission: Number(form.paidCommission)
      });

      setForm({
        userId: "",
        leadId: "",
        clientName: "",
        projectName: "",
        dealAmount: "",
        commissionRate: 0.5,
        paidCommission: 0,
        notes: ""
      });

      onClose();
    } catch (error) {
      alert(error.message || "Failed to create commission.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden">
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
          <h2 className="text-2xl font-black">Add Commission</h2>

          <button onClick={onClose} className="text-zinc-400 hover:text-white">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Staff Member">
              <select
                value={form.userId}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, userId: e.target.value }))
                }
                className="input"
              >
                <option value="">Select staff</option>
                {users.map((user) => (
                  <option key={user._id} value={user._id}>
                    {user.name || user.email}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Related Lead">
              <select
                value={form.leadId}
                onChange={(e) => {
                  const lead = leads.find((item) => item._id === e.target.value);

                  setForm((prev) => ({
                    ...prev,
                    leadId: e.target.value,
                    clientName: lead?.businessName || prev.clientName
                  }));
                }}
                className="input"
              >
                <option value="">Optional</option>
                {leads.map((lead) => (
                  <option key={lead._id} value={lead._id}>
                    {lead.businessName}
                  </option>
                ))}
              </select>
            </Field>

            <Input
              label="Client Name"
              value={form.clientName}
              onChange={(value) =>
                setForm((prev) => ({ ...prev, clientName: value }))
              }
            />

            <Input
              label="Project Name"
              value={form.projectName}
              onChange={(value) =>
                setForm((prev) => ({ ...prev, projectName: value }))
              }
            />

            <Input
              label="Deal Amount"
              type="number"
              value={form.dealAmount}
              onChange={(value) =>
                setForm((prev) => ({ ...prev, dealAmount: value }))
              }
            />

            <Input
              label="Commission Rate"
              type="number"
              step="0.01"
              value={form.commissionRate}
              onChange={(value) =>
                setForm((prev) => ({ ...prev, commissionRate: value }))
              }
            />

            <Input
              label="Already Paid"
              type="number"
              value={form.paidCommission}
              onChange={(value) =>
                setForm((prev) => ({ ...prev, paidCommission: value }))
              }
            />
          </div>

          <textarea
            value={form.notes}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, notes: e.target.value }))
            }
            placeholder="Notes"
            className="w-full min-h-24 bg-black border border-zinc-800 rounded-2xl px-4 py-3 text-white outline-none focus:border-lime-400"
          />

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl bg-zinc-900 border border-zinc-800 px-5 py-3 font-bold"
            >
              Cancel
            </button>

            <button
              disabled={saving}
              className="rounded-2xl bg-lime-400 text-black px-5 py-3 font-bold disabled:opacity-50"
            >
              {saving ? "Saving..." : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Stat({ label, value, highlight }) {
  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-5">
      <p className="text-zinc-500 text-sm">{label}</p>
      <p className={`text-3xl font-black mt-2 ${highlight ? "text-lime-400" : ""}`}>
        {value}
      </p>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="block text-sm text-zinc-400 mb-2">{label}</span>
      {children}
    </label>
  );
}

function Input({ label, value, onChange, type = "text", step }) {
  return (
    <Field label={label}>
      <input
        type={type}
        step={step}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input"
      />
    </Field>
  );
}

function money(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(value || 0);
}