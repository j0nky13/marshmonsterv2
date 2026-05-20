import { useEffect, useMemo, useState } from "react";
import {
  Archive,
  CheckCircle2,
  MailPlus,
  RefreshCw,
  Search
} from "lucide-react";
import { apiFetch } from "../api/api";

const statuses = ["all", "new", "reviewed", "converted", "archived"];

export default function RequestsTab() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState("");
  const [activeStatus, setActiveStatus] = useState("all");
  const [search, setSearch] = useState("");

  async function loadRequests() {
    try {
      setLoading(true);
      const data = await apiFetch("/contact");
      setRequests(data.requests || []);
    } catch (error) {
      console.error("Failed to load contact requests:", error);
      alert(error.message || "Failed to load contact requests.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRequests();
  }, []);

  async function updateRequest(id, updates) {
    setSavingId(id);

    try {
      const data = await apiFetch(`/contact/${id}`, {
        method: "PATCH",
        body: JSON.stringify(updates)
      });

      setRequests((prev) =>
        prev.map((item) => (item._id === id ? data.request : item))
      );
    } catch (error) {
      console.error("Failed to update contact request:", error);
      alert(error.message || "Failed to update request.");
    } finally {
      setSavingId("");
    }
  }

  async function convertToLead(id) {
    setSavingId(id);

    try {
      const data = await apiFetch(`/contact/${id}/convert`, {
        method: "POST"
      });

      setRequests((prev) =>
        prev.map((item) => (item._id === id ? data.request : item))
      );

      alert("Contact request converted to lead.");
    } catch (error) {
      console.error("Failed to convert contact request:", error);
      alert(error.message || "Failed to convert request.");
    } finally {
      setSavingId("");
    }
  }

  const counts = useMemo(() => {
    return {
      all: requests.length,
      new: requests.filter((item) => item.status === "new").length,
      reviewed: requests.filter((item) => item.status === "reviewed").length,
      converted: requests.filter((item) => item.status === "converted").length,
      archived: requests.filter((item) => item.status === "archived").length
    };
  }, [requests]);

  const filteredRequests = useMemo(() => {
    let result = [...requests];

    if (activeStatus !== "all") {
      result = result.filter((item) => item.status === activeStatus);
    }

    if (search.trim()) {
      const term = search.toLowerCase();

      result = result.filter((item) =>
        [
          item.name,
          item.email,
          item.phone,
          item.businessName,
          item.website,
          item.message,
          item.source,
          item.status
        ]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(term))
      );
    }

    return result;
  }, [requests, activeStatus, search]);

  if (loading) {
    return <div className="text-zinc-400">Loading contact requests...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-gradient-to-br from-zinc-900 to-black border border-zinc-800 p-6">
        <p className="text-lime-400 text-sm font-semibold uppercase tracking-widest">
          Website Inbox
        </p>

        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mt-2">
          <div>
            <h1 className="text-3xl sm:text-5xl font-black">
              Contact Requests
            </h1>

            <p className="text-zinc-400 mt-4 max-w-3xl">
              Review incoming website form submissions and convert qualified
              requests into CRM leads.
            </p>
          </div>

          <button
            onClick={loadRequests}
            className="rounded-2xl bg-zinc-900 border border-zinc-800 text-white font-bold px-5 py-3 hover:bg-zinc-800 flex items-center justify-center gap-2"
          >
            <RefreshCw size={18} />
            Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {statuses.map((status) => (
          <button
            key={status}
            onClick={() => setActiveStatus(status)}
            className={`rounded-2xl border px-4 py-4 text-left transition ${
              activeStatus === status
                ? "bg-lime-400 border-lime-400 text-black"
                : "bg-zinc-950 border-zinc-800 text-zinc-300 hover:bg-zinc-900"
            }`}
          >
            <p className="text-xs font-bold uppercase tracking-widest">
              {status}
            </p>
            <p className="text-3xl font-black mt-1">{counts[status]}</p>
          </button>
        ))}
      </div>

      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden">
        <div className="p-5 border-b border-zinc-800 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <p className="font-black text-xl">Requests</p>
            <p className="text-sm text-zinc-500 mt-1">
              {filteredRequests.length} showing · {counts.new} new
            </p>
          </div>

          <div className="relative w-full lg:max-w-sm">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
            />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search requests..."
              className="w-full bg-black border border-zinc-800 rounded-2xl pl-11 pr-4 py-3 text-white outline-none focus:border-lime-400"
            />
          </div>
        </div>

        <div className="divide-y divide-zinc-800">
          {filteredRequests.length === 0 ? (
            <div className="p-8 text-zinc-500">
              No contact requests found for this view.
            </div>
          ) : (
            filteredRequests.map((request) => (
              <RequestCard
                key={request._id}
                request={request}
                saving={savingId === request._id}
                onConvert={() => convertToLead(request._id)}
                onReviewed={() =>
                  updateRequest(request._id, { status: "reviewed" })
                }
                onArchive={() =>
                  updateRequest(request._id, { status: "archived" })
                }
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function RequestCard({ request, saving, onConvert, onReviewed, onArchive }) {
  const created = request.createdAt ? new Date(request.createdAt) : null;

  return (
    <div className="p-5 space-y-4 hover:bg-zinc-900/40 transition">
      <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <StatusPill status={request.status} />

            {created && (
              <span className="text-xs text-zinc-500">
                {created.toLocaleString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "numeric",
                  minute: "2-digit"
                })}
              </span>
            )}
          </div>

          <h2 className="text-2xl font-black mt-3">
            {request.businessName || request.name || "Contact Request"}
          </h2>

          <div className="text-zinc-500 mt-2 text-sm space-y-1">
            <p>
              {request.name ? `${request.name} · ` : ""}
              {request.email || "No email"}
              {request.phone ? ` · ${request.phone}` : ""}
            </p>

            {request.website && (
              <p className="text-zinc-400">{request.website}</p>
            )}

            {(request.timeframe || request.budget || request.source) && (
              <p>
                {request.timeframe ? `Timeframe: ${request.timeframe}` : ""}
                {request.timeframe && request.budget ? " · " : ""}
                {request.budget ? `Budget: ${request.budget}` : ""}
                {(request.timeframe || request.budget) && request.source
                  ? " · "
                  : ""}
                {request.source ? `Source: ${request.source}` : ""}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 xl:justify-end">
          {request.status !== "converted" && (
            <button
              disabled={saving}
              onClick={onConvert}
              className="rounded-xl bg-lime-400 text-black font-bold px-4 py-2 hover:bg-lime-300 disabled:opacity-50 flex items-center gap-2"
            >
              <MailPlus size={16} />
              Convert to Lead
            </button>
          )}

          {request.status !== "reviewed" && request.status !== "converted" && (
            <button
              disabled={saving}
              onClick={onReviewed}
              className="rounded-xl bg-zinc-900 border border-zinc-800 text-white font-bold px-4 py-2 hover:bg-zinc-800 disabled:opacity-50 flex items-center gap-2"
            >
              <CheckCircle2 size={16} />
              Reviewed
            </button>
          )}

          {request.status !== "archived" && (
            <button
              disabled={saving}
              onClick={onArchive}
              className="rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 font-bold px-4 py-2 hover:bg-red-500/20 disabled:opacity-50 flex items-center gap-2"
            >
              <Archive size={16} />
              Archive
            </button>
          )}
        </div>
      </div>

      {request.message && (
        <div className="bg-black border border-zinc-800 rounded-2xl p-4">
          <p className="text-zinc-500 text-sm mb-1">Message</p>
          <p className="text-zinc-300 whitespace-pre-wrap">
            {request.message}
          </p>
        </div>
      )}

      {request.convertedLeadId && (
        <div className="rounded-2xl bg-lime-400/10 border border-lime-400/30 p-4 text-lime-300 text-sm">
          Converted to lead:{" "}
          <span className="font-bold">
            {request.convertedLeadId.businessName ||
              request.convertedLeadId.email ||
              "Lead"}
          </span>
        </div>
      )}
    </div>
  );
}

function StatusPill({ status }) {
  const styles = {
    new: "bg-lime-400/10 border-lime-400/30 text-lime-300",
    reviewed: "bg-blue-400/10 border-blue-400/30 text-blue-300",
    converted: "bg-emerald-400/10 border-emerald-400/30 text-emerald-300",
    archived: "bg-zinc-800 border-zinc-700 text-zinc-400"
  };

  return (
    <span
      className={`rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-widest ${
        styles[status] || styles.new
      }`}
    >
      {status || "new"}
    </span>
  );
}