import { useEffect, useMemo, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { apiFetch } from "../api/api";
import AddLeadModal from "../components/leads/AddLeadModal";
import LeadDetailsModal from "../components/leads/LeadDetailsModal";

const statusOptions = [
  "all",
  "new",
  "contacted",
  "follow_up",
  "won",
  "lost",
  "archived"
];

function formatDate(value) {
  if (!value) return "—";

  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

function isOverdue(value, status) {
  if (!value) return false;
  if (["won", "lost", "archived"].includes(status)) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const followUp = new Date(value);
  followUp.setHours(0, 0, 0, 0);

  return followUp <= today;
}

function StatusBadge({ status }) {
  const styles = {
    new: "bg-blue-500/10 text-blue-300 border-blue-500/30",
    contacted: "bg-purple-500/10 text-purple-300 border-purple-500/30",
    follow_up: "bg-yellow-500/10 text-yellow-300 border-yellow-500/30",
    won: "bg-lime-500/10 text-lime-300 border-lime-500/30",
    lost: "bg-red-500/10 text-red-300 border-red-500/30",
    archived: "bg-zinc-500/10 text-zinc-300 border-zinc-500/30"
  };

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold capitalize ${
        styles[status] || styles.new
      }`}
    >
      {status?.replace("_", " ")}
    </span>
  );
}

export default function LeadsTab({ role }) {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);

  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortMode, setSortMode] = useState("newest");

  async function loadLeads() {
    try {
      setLoading(true);
      setError("");

      const data = await apiFetch("/leads");
      setLeads(data.leads || []);
    } catch (err) {
      setError(err.message || "Failed to load leads.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLeads();
  }, []);

  const filteredLeads = useMemo(() => {
    let result = [...leads];

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();

      result = result.filter((lead) => {
        return [
          lead.businessName,
          lead.email,
          lead.phone,
          lead.website,
          lead.category,
          lead.city,
          lead.state,
          lead.notes
        ]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(term));
      });
    }

    if (statusFilter !== "all") {
      result = result.filter((lead) => lead.status === statusFilter);
    }

    if (sortMode === "newest") {
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    if (sortMode === "oldest") {
      result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    }

    if (sortMode === "follow_up") {
      result.sort((a, b) => {
        if (!a.nextFollowUpAt) return 1;
        if (!b.nextFollowUpAt) return -1;
        return new Date(a.nextFollowUpAt) - new Date(b.nextFollowUpAt);
      });
    }

    if (sortMode === "score_high") {
      result.sort((a, b) => (b.ratingScore || 0) - (a.ratingScore || 0));
    }

    if (sortMode === "score_low") {
      result.sort((a, b) => (a.ratingScore || 0) - (b.ratingScore || 0));
    }

    return result;
  }, [leads, searchTerm, statusFilter, sortMode]);

  async function createLead(form) {
    const data = await apiFetch("/leads", {
      method: "POST",
      body: JSON.stringify(form)
    });

    setLeads((prev) => [data.lead, ...prev]);
  }

  async function updateLead(leadId, updates) {
    const data = await apiFetch(`/leads/${leadId}`, {
      method: "PATCH",
      body: JSON.stringify(updates)
    });

    setLeads((prev) =>
      prev.map((lead) => (lead._id === leadId ? data.lead : lead))
    );
  }

  async function deleteLead(leadId) {
    await apiFetch(`/leads/${leadId}`, {
      method: "DELETE"
    });

    setLeads((prev) => prev.filter((lead) => lead._id !== leadId));
  }

  return (
    <div className="space-y-6">
      <AddLeadModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onCreated={createLead}
      />

      <LeadDetailsModal
        open={Boolean(selectedLead)}
        lead={selectedLead}
        role={role}
        onClose={() => setSelectedLead(null)}
        onSave={updateLead}
        onDelete={deleteLead}
      />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black">
            {role === "staff" ? "My Leads" : "Leads"}
          </h1>

          <p className="text-zinc-400 mt-1">
            Search, filter, manage follow-ups, and track lead progress.
          </p>
        </div>

        <button
          onClick={() => setAddModalOpen(true)}
          className="bg-lime-400 text-black font-bold rounded-2xl px-5 py-3 hover:bg-lime-300 transition"
        >
          Add Lead
        </button>
      </div>

      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-4">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_220px_220px] gap-3">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
            />

            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search leads by name, email, phone, category, city..."
              className="w-full bg-black border border-zinc-800 rounded-2xl pl-11 pr-4 py-3 text-white outline-none focus:border-lime-400"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-black border border-zinc-800 rounded-2xl px-4 py-3 text-white outline-none focus:border-lime-400 capitalize"
          >
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status.replace("_", " ")}
              </option>
            ))}
          </select>

          <select
            value={sortMode}
            onChange={(e) => setSortMode(e.target.value)}
            className="bg-black border border-zinc-800 rounded-2xl px-4 py-3 text-white outline-none focus:border-lime-400"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="follow_up">Follow-Up Date</option>
            <option value="score_high">Score High-Low</option>
            <option value="score_low">Score Low-High</option>
          </select>
        </div>

        <div className="flex items-center gap-2 text-zinc-500 text-sm mt-4">
          <SlidersHorizontal size={16} />
          Showing {filteredLeads.length} of {leads.length} leads
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 text-red-300 px-4 py-3">
          {error}
        </div>
      )}

      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden">
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
          <p className="font-bold">Lead Pipeline</p>
          <p className="text-sm text-zinc-500">{filteredLeads.length} visible</p>
        </div>

        {loading ? (
          <div className="p-8 text-zinc-400">Loading leads...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-sm">
              <thead className="bg-zinc-900 text-zinc-400">
                <tr>
                  <th className="text-left p-4">Business</th>
                  <th className="text-left p-4">Contact</th>
                  <th className="text-left p-4">Category</th>
                  <th className="text-left p-4">Location</th>
                  <th className="text-left p-4">Status</th>
                  <th className="text-left p-4">Score</th>
                  <th className="text-left p-4">Follow-Up</th>
                  <th className="text-left p-4">Assigned</th>
                </tr>
              </thead>

              <tbody>
                {filteredLeads.length === 0 ? (
                  <tr className="border-t border-zinc-800">
                    <td className="p-4 text-zinc-500" colSpan="8">
                      No leads match your current filters.
                    </td>
                  </tr>
                ) : (
                  filteredLeads.map((lead) => {
                    const overdue = isOverdue(
                      lead.nextFollowUpAt,
                      lead.status
                    );

                    return (
                      <tr
                        key={lead._id}
                        onClick={() => setSelectedLead(lead)}
                        className={`border-t border-zinc-800 cursor-pointer ${
                          overdue
                            ? "bg-yellow-500/5 hover:bg-yellow-500/10"
                            : "hover:bg-zinc-900/50"
                        }`}
                      >
                        <td className="p-4">
                          <div className="font-bold text-white">
                            {lead.businessName}
                          </div>

                          {lead.website && (
                            <a
                              href={
                                lead.website.startsWith("http")
                                  ? lead.website
                                  : `https://${lead.website}`
                              }
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="text-lime-400 text-xs hover:underline"
                            >
                              {lead.website}
                            </a>
                          )}
                        </td>

                        <td className="p-4 text-zinc-300">
                          <div>{lead.email || "—"}</div>
                          <div className="text-zinc-500 text-xs">
                            {lead.phone || "—"}
                          </div>
                        </td>

                        <td className="p-4 text-zinc-300">
                          {lead.category || "—"}
                        </td>

                        <td className="p-4 text-zinc-300">
                          {[lead.city, lead.state].filter(Boolean).join(", ") ||
                            "—"}
                        </td>

                        <td
                          className="p-4"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <select
                            value={lead.status}
                            onChange={(e) =>
                              updateLead(lead._id, {
                                status: e.target.value
                              })
                            }
                            className="bg-black border border-zinc-800 rounded-xl px-3 py-2 text-white outline-none focus:border-lime-400 capitalize"
                          >
                            {statusOptions
                              .filter((status) => status !== "all")
                              .map((status) => (
                                <option key={status} value={status}>
                                  {status.replace("_", " ")}
                                </option>
                              ))}
                          </select>
                        </td>

                        <td className="p-4 text-zinc-300">
                          {lead.ratingScore ?? "—"}
                        </td>

                        <td className="p-4">
                          <span
                            className={
                              overdue
                                ? "text-yellow-300 font-bold"
                                : "text-zinc-300"
                            }
                          >
                            {formatDate(lead.nextFollowUpAt)}
                          </span>
                        </td>

                        <td className="p-4 text-zinc-300">
                          {lead.assignedTo?.name ||
                            lead.assignedTo?.email ||
                            "Unassigned"}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        {statusOptions
          .filter((status) => status !== "all")
          .map((status) => (
            <div
              key={status}
              className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4"
            >
              <StatusBadge status={status} />
              <p className="text-3xl font-black mt-3">
                {leads.filter((lead) => lead.status === status).length}
              </p>
            </div>
          ))}
      </div>
    </div>
  );
}