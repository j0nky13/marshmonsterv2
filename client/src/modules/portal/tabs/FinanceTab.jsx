import { useEffect, useMemo, useState } from "react";
import { DollarSign, Receipt, Trash2 } from "lucide-react";
import { apiFetch } from "../api/api";

export default function FinanceTab({ role }) {
  const [invoices, setInvoices] = useState([]);
  const [projects, setProjects] = useState([]);

  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    projectId: "",
    title: "",
    description: "",
    amount: "",
    dueDate: ""
  });

  async function loadData() {
    try {
      setLoading(true);

      const [invoiceData, projectData] = await Promise.all([
        apiFetch("/invoices"),
        apiFetch("/projects")
      ]);

      setInvoices(invoiceData.invoices || []);
      setProjects(projectData.projects || []);
    } catch (error) {
      console.error(error);
      alert("Failed to load finance data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function createInvoice(e) {
    e.preventDefault();

    try {
      const data = await apiFetch("/invoices", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          amount: Number(form.amount || 0)
        })
      });

      setInvoices((prev) => [data.invoice, ...prev]);

      setForm({
        projectId: "",
        title: "",
        description: "",
        amount: "",
        dueDate: ""
      });
    } catch (error) {
      alert(error.message || "Failed to create invoice.");
    }
  }

  async function updateInvoice(id, updates) {
    try {
      const data = await apiFetch(`/invoices/${id}`, {
        method: "PATCH",
        body: JSON.stringify(updates)
      });

      setInvoices((prev) =>
        prev.map((invoice) =>
          invoice._id === id ? data.invoice : invoice
        )
      );
    } catch (error) {
      alert(error.message || "Failed to update invoice.");
    }
  }

  async function deleteInvoice(id) {
    const confirmed = window.confirm(
      "Delete this invoice?"
    );

    if (!confirmed) return;

    try {
      await apiFetch(`/invoices/${id}`, {
        method: "DELETE"
      });

      setInvoices((prev) =>
        prev.filter((invoice) => invoice._id !== id)
      );
    } catch (error) {
      alert(error.message || "Failed to delete invoice.");
    }
  }

  const stats = useMemo(() => {
    return invoices.reduce(
      (acc, invoice) => {
        acc.total += Number(invoice.amount || 0);
        acc.paid += Number(invoice.paidAmount || 0);

        return acc;
      },
      {
        total: 0,
        paid: 0
      }
    );
  }, [invoices]);

  const outstanding = Math.max(
    stats.total - stats.paid,
    0
  );

  if (loading) {
    return (
      <div className="text-zinc-400">
        Loading finance data...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-gradient-to-br from-zinc-900 to-black border border-zinc-800 p-6">
        <p className="text-lime-400 text-sm font-semibold uppercase tracking-widest">
          Finance
        </p>

        <h1 className="text-3xl sm:text-5xl font-black mt-2">
          Invoices & Revenue
        </h1>

        <p className="text-zinc-400 mt-4 max-w-3xl">
          Manage invoices, payments, outstanding balances,
          and client billing.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FinanceStat
          label="Invoice Revenue"
          value={money(stats.total)}
        />

        <FinanceStat
          label="Paid"
          value={money(stats.paid)}
          highlight
        />

        <FinanceStat
          label="Outstanding"
          value={money(outstanding)}
        />
      </div>

      {role === "admin" && (
        <form
          onSubmit={createInvoice}
          className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 space-y-4"
        >
          <div>
            <h2 className="text-2xl font-black">
              Create Invoice
            </h2>

            <p className="text-zinc-500 mt-1">
              Generate billing for a project.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label>
              <span className="block text-sm text-zinc-400 mb-2">
                Project
              </span>

              <select
                value={form.projectId}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    projectId: e.target.value
                  }))
                }
                className="w-full bg-black border border-zinc-800 rounded-2xl px-4 py-3 text-white"
              >
                <option value="">
                  Select Project
                </option>

                {projects.map((project) => (
                  <option
                    key={project._id}
                    value={project._id}
                  >
                    {project.clientName}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span className="block text-sm text-zinc-400 mb-2">
                Invoice Title
              </span>

              <input
                value={form.title}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    title: e.target.value
                  }))
                }
                placeholder="Website Build"
                className="w-full bg-black border border-zinc-800 rounded-2xl px-4 py-3 text-white"
              />
            </label>

            <label>
              <span className="block text-sm text-zinc-400 mb-2">
                Amount
              </span>

              <input
                type="number"
                value={form.amount}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    amount: e.target.value
                  }))
                }
                placeholder="5000"
                className="w-full bg-black border border-zinc-800 rounded-2xl px-4 py-3 text-white"
              />
            </label>

            <label>
              <span className="block text-sm text-zinc-400 mb-2">
                Due Date
              </span>

              <input
                type="date"
                value={form.dueDate}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    dueDate: e.target.value
                  }))
                }
                className="w-full bg-black border border-zinc-800 rounded-2xl px-4 py-3 text-white"
              />
            </label>
          </div>

          <label>
            <span className="block text-sm text-zinc-400 mb-2">
              Description
            </span>

            <textarea
              value={form.description}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  description: e.target.value
                }))
              }
              placeholder="Invoice details..."
              className="w-full min-h-24 bg-black border border-zinc-800 rounded-2xl px-4 py-3 text-white"
            />
          </label>

          <button className="bg-lime-400 text-black rounded-2xl px-6 py-3 font-black hover:bg-lime-300">
            Create Invoice
          </button>
        </form>
      )}

      <div className="space-y-4">
        {invoices.length === 0 ? (
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-8 text-zinc-500">
            No invoices found.
          </div>
        ) : (
          invoices.map((invoice) => (
            <InvoiceCard
              key={invoice._id}
              invoice={invoice}
              role={role}
              onUpdate={updateInvoice}
              onDelete={deleteInvoice}
            />
          ))
        )}
      </div>
    </div>
  );
}

function InvoiceCard({
  invoice,
  role,
  onUpdate,
  onDelete
}) {
  const outstanding = Math.max(
    (invoice.amount || 0) -
      (invoice.paidAmount || 0),
    0
  );

  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 space-y-4">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Receipt
              size={18}
              className="text-lime-400"
            />

            <h2 className="text-2xl font-black">
              {invoice.title}
            </h2>
          </div>

          <p className="text-zinc-500 mt-2">
            {invoice.projectId?.clientName ||
              "Unknown Client"}
          </p>

          {invoice.description && (
            <p className="text-zinc-400 mt-3">
              {invoice.description}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <StatusBadge status={invoice.status} />

          {role === "admin" && (
            <button
              onClick={() =>
                onDelete(invoice._id)
              }
              className="rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 p-3 hover:bg-red-500/20"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FinanceMini
          label="Invoice Amount"
          value={money(invoice.amount)}
        />

        <FinanceMini
          label="Paid"
          value={money(invoice.paidAmount)}
        />

        <FinanceMini
          label="Outstanding"
          value={money(outstanding)}
        />
      </div>

      {role === "admin" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label>
            <span className="block text-sm text-zinc-400 mb-2">
              Paid Amount
            </span>

            <input
              type="number"
              defaultValue={
                invoice.paidAmount || 0
              }
              onBlur={(e) =>
                onUpdate(invoice._id, {
                  paidAmount: Number(
                    e.target.value
                  )
                })
              }
              className="w-full bg-black border border-zinc-800 rounded-2xl px-4 py-3 text-white"
            />
          </label>

          <label>
            <span className="block text-sm text-zinc-400 mb-2">
              Status
            </span>

            <select
              value={invoice.status}
              onChange={(e) =>
                onUpdate(invoice._id, {
                  status: e.target.value
                })
              }
              className="w-full bg-black border border-zinc-800 rounded-2xl px-4 py-3 text-white"
            >
              <option value="draft">
                Draft
              </option>

              <option value="sent">
                Sent
              </option>

              <option value="partial">
                Partial
              </option>

              <option value="paid">
                Paid
              </option>

              <option value="overdue">
                Overdue
              </option>
            </select>
          </label>
        </div>
      )}
    </div>
  );
}

function FinanceStat({
  label,
  value,
  highlight
}) {
  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-5">
      <div className="flex items-center gap-2">
        <DollarSign
          size={18}
          className="text-lime-400"
        />

        <p className="text-zinc-500 text-sm">
          {label}
        </p>
      </div>

      <p
        className={`text-3xl font-black mt-3 ${
          highlight
            ? "text-lime-400"
            : "text-white"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function FinanceMini({
  label,
  value
}) {
  return (
    <div className="bg-black border border-zinc-800 rounded-2xl p-4">
      <p className="text-zinc-500 text-xs">
        {label}
      </p>

      <p className="font-black mt-1">
        {value}
      </p>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    draft:
      "bg-zinc-700 text-white",
    sent:
      "bg-blue-500/20 text-blue-300",
    partial:
      "bg-yellow-500/20 text-yellow-300",
    paid:
      "bg-lime-500/20 text-lime-300",
    overdue:
      "bg-red-500/20 text-red-300"
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
        styles[status] ||
        "bg-zinc-700 text-white"
      }`}
    >
      {status}
    </span>
  );
}

function money(value) {
  return new Intl.NumberFormat(
    "en-US",
    {
      style: "currency",
      currency: "USD"
    }
  ).format(value || 0);
}