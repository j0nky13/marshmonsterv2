import { useEffect, useState } from "react";
import { Archive, CheckCircle2, MailPlus } from "lucide-react";
import { apiFetch } from "../api/api";

export default function ContactRequestsTab() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadRequests() {
    try {
      setLoading(true);
      const data = await apiFetch("/contact");
      setRequests(data.requests || []);
    } catch (error) {
      alert(error.message || "Failed to load contact requests.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRequests();
  }, []);

  async function updateRequest(id, updates) {
    const data = await apiFetch(`/contact/${id}`, {
      method: "PATCH",
      body: JSON.stringify(updates)
    });

    setRequests((prev) =>
      prev.map((item) => (item._id === id ? data.request : item))
    );
  }

  async function convertToLead(id) {
    const data = await apiFetch(`/contact/${id}/convert`, {
      method: "POST"
    });

    setRequests((prev) =>
      prev.map((item) => (item._id === id ? data.request : item))
    );

    alert("Contact request converted to lead.");
  }

  if (loading) {
    return <div className="text-zinc-400">Loading contact requests...</div>;
  }

  const newCount = requests.filter((item) => item.status === "new").length;

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-gradient-to-br from-zinc-900 to-black border border-zinc-800 p-6">
        <p className="text-lime-400 text-sm font-semibold uppercase tracking-widest">
          Website Inbox
        </p>

        <h1 className="text-3xl sm:text-5xl font-black mt-2">
          Contact Requests
        </h1>

        <p className="text-zinc-400 mt-4 max-w-3xl">
          Review incoming website contact form submissions and convert qualified
          requests into CRM leads.
        </p>
      </div>

      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-5">
        <p className="text-zinc-500 text-sm">New Requests</p>
        <p className="text-4xl font-black text-lime-400 mt-2">{newCount}</p>
      </div>

      <div className="space-y-4">
        {requests.length === 0 ? (
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-8 text-zinc-500">
            No contact requests yet.
          </div>
        ) : (
          requests.map((request) => (
            <div
              key={request._id}
              className="bg-zinc-950 border border-zinc-800 rounded-3xl p-5 space-y-4"
            >
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div>
                  <p className="text-lime-400 text-sm font-bold uppercase tracking-widest">
                    {request.status}
                  </p>

                  <h2 className="text-2xl font-black mt-1">
                    {request.businessName || request.name || "Contact Request"}
                  </h2>

                  <p className="text-zinc-500 mt-1">
                    {request.email} {request.phone ? `· ${request.phone}` : ""}
                  </p>

                  {request.website && (
                    <p className="text-zinc-400 mt-1">{request.website}</p>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  {request.status !== "converted" && (
                    <button
                      onClick={() => convertToLead(request._id)}
                      className="rounded-xl bg-lime-400 text-black font-bold px-4 py-2 hover:bg-lime-300 flex items-center gap-2"
                    >
                      <MailPlus size={16} />
                      Convert to Lead
                    </button>
                  )}

                  <button
                    onClick={() =>
                      updateRequest(request._id, { status: "reviewed" })
                    }
                    className="rounded-xl bg-zinc-900 border border-zinc-800 text-white font-bold px-4 py-2 hover:bg-zinc-800 flex items-center gap-2"
                  >
                    <CheckCircle2 size={16} />
                    Reviewed
                  </button>

                  <button
                    onClick={() =>
                      updateRequest(request._id, { status: "archived" })
                    }
                    className="rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 font-bold px-4 py-2 hover:bg-red-500/20 flex items-center gap-2"
                  >
                    <Archive size={16} />
                    Archive
                  </button>
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
            </div>
          ))
        )}
      </div>
    </div>
  );
}