import { useEffect, useMemo, useState } from "react";
import { CalendarCheck, Clock, CheckCircle2 } from "lucide-react";
import { apiFetch } from "../api/api";

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatDate(value) {
  if (!value) return "No date";

  return new Date(value).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric"
  });
}

function isSameDay(a, b) {
  return startOfDay(a).getTime() === startOfDay(b).getTime();
}

export default function FollowUpsTab({ role }) {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadLeads() {
    try {
      setLoading(true);
      const data = await apiFetch("/leads");
      setLeads(data.leads || []);
    } catch (error) {
      console.error("Failed to load follow-ups:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLeads();
  }, []);

  async function updateLead(leadId, updates) {
    const data = await apiFetch(`/leads/${leadId}`, {
      method: "PATCH",
      body: JSON.stringify(updates)
    });

    setLeads((prev) =>
      prev.map((lead) => (lead._id === leadId ? data.lead : lead))
    );
  }

  const groups = useMemo(() => {
    const now = startOfDay(new Date());
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const weekEnd = new Date(now);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const activeLeads = leads.filter(
      (lead) =>
        lead.nextFollowUpAt &&
        !["won", "lost", "archived"].includes(lead.status)
    );

    return {
      overdue: activeLeads.filter(
        (lead) => startOfDay(lead.nextFollowUpAt) < now
      ),
      today: activeLeads.filter((lead) =>
        isSameDay(lead.nextFollowUpAt, now)
      ),
      tomorrow: activeLeads.filter((lead) =>
        isSameDay(lead.nextFollowUpAt, tomorrow)
      ),
      thisWeek: activeLeads.filter((lead) => {
        const d = startOfDay(lead.nextFollowUpAt);
        return d > tomorrow && d <= weekEnd;
      })
    };
  }, [leads]);

  if (loading) {
    return <div className="text-zinc-400">Loading follow-ups...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-gradient-to-br from-zinc-900 to-black border border-zinc-800 p-6">
        <p className="text-lime-400 text-sm font-semibold uppercase tracking-widest">
          Sales Workflow
        </p>

        <h1 className="text-3xl sm:text-5xl font-black mt-2">
          Follow-Ups
        </h1>

        <p className="text-zinc-400 mt-4 max-w-3xl">
          Track overdue, today, tomorrow, and upcoming follow-ups from your lead
          pipeline.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
        <FollowUpColumn
          title="Overdue"
          icon={Clock}
          leads={groups.overdue}
          danger
          onUpdate={updateLead}
        />

        <FollowUpColumn
          title="Today"
          icon={CalendarCheck}
          leads={groups.today}
          onUpdate={updateLead}
        />

        <FollowUpColumn
          title="Tomorrow"
          icon={CalendarCheck}
          leads={groups.tomorrow}
          onUpdate={updateLead}
        />

        <FollowUpColumn
          title="This Week"
          icon={CheckCircle2}
          leads={groups.thisWeek}
          onUpdate={updateLead}
        />
      </div>
    </div>
  );
}

function FollowUpColumn({ title, icon: Icon, leads, danger, onUpdate }) {
  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden">
      <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon size={18} className={danger ? "text-red-300" : "text-lime-400"} />
          <p className="font-black">{title}</p>
        </div>

        <span className="text-sm text-zinc-500">{leads.length}</span>
      </div>

      <div className="p-4 space-y-3 max-h-[620px] overflow-y-auto">
        {leads.length === 0 ? (
          <p className="text-zinc-500 text-sm">Nothing here.</p>
        ) : (
          leads.map((lead) => (
            <FollowUpCard key={lead._id} lead={lead} onUpdate={onUpdate} />
          ))
        )}
      </div>
    </div>
  );
}

function FollowUpCard({ lead, onUpdate }) {
  const [newDate, setNewDate] = useState("");

  return (
    <div className="bg-black border border-zinc-800 rounded-2xl p-4 space-y-3">
      <div>
        <p className="font-bold text-white">{lead.businessName}</p>
        <p className="text-xs text-zinc-500">
          {lead.category || "Uncategorized"} · {lead.city || "No city"}
        </p>
      </div>

      <p className="text-sm text-zinc-400">
        Follow-up:{" "}
        <span className="text-lime-400 font-semibold">
          {formatDate(lead.nextFollowUpAt)}
        </span>
      </p>

      {lead.notes && (
        <p className="text-xs text-zinc-500 line-clamp-3">{lead.notes}</p>
      )}

      <div className="grid grid-cols-1 gap-2">
        <button
          onClick={() =>
            onUpdate(lead._id, {
              status: "contacted",
              lastContactedAt: new Date(),
              nextFollowUpAt: null
            })
          }
          className="rounded-xl bg-lime-400 text-black font-bold py-2 hover:bg-lime-300"
        >
          Mark Contacted
        </button>

        <button
          onClick={() =>
            onUpdate(lead._id, {
              status: "won",
              lastContactedAt: new Date(),
              nextFollowUpAt: null
            })
          }
          className="rounded-xl bg-zinc-900 border border-zinc-800 text-white font-bold py-2 hover:bg-zinc-800"
        >
          Mark Won
        </button>

        <div className="flex gap-2">
          <input
            type="date"
            value={newDate}
            onChange={(e) => setNewDate(e.target.value)}
            className="min-w-0 flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2 text-white outline-none focus:border-lime-400"
          />

          <button
            onClick={() => {
              if (!newDate) return;

              onUpdate(lead._id, {
                status: "follow_up",
                nextFollowUpAt: newDate
              });

              setNewDate("");
            }}
            className="rounded-xl bg-zinc-900 border border-zinc-800 px-3 text-white hover:bg-zinc-800"
          >
            Set
          </button>
        </div>
      </div>
    </div>
  );
}