import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom"; // ✅ ADDED

const GREEN = "#B6F24A";

const STAGES = [
  { key: "new", label: "New" },
  { key: "contacted", label: "Contacted" },
  { key: "proposal", label: "Proposal" },
  { key: "closed", label: "Closed" },
];

export default function Pipeline() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [movingId, setMovingId] = useState(null);

  const navigate = useNavigate(); // ✅ ADDED

  useEffect(() => {
    const q = query(collection(db, "leads"), orderBy("createdAt", "desc"));

    const unsub = onSnapshot(q, (snap) => {
      setLeads(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });

    return () => unsub();
  }, []);

  /* ---------- MOVE ---------- */

  async function moveLead(leadId, nextStage) {
    if (!leadId || !nextStage) return;

    try {
      setMovingId(leadId);

      const ref = doc(db, "leads", leadId);

      await updateDoc(ref, {
        pipelineStage: nextStage,
      });
    } catch (err) {
      console.error("Failed to move lead:", err);
    } finally {
      setMovingId(null);
    }
  }

  if (loading) {
    return <div className="text-slate-400">Loading pipeline…</div>;
  }

  return (
    <div className="flex flex-col gap-6">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-semibold">Sales Pipeline</h1>
        <div className="text-sm text-slate-500">
          Track deals from lead → client
        </div>
      </div>

      {/* MOBILE HORIZONTAL SCROLL */}
      <div className="overflow-x-auto pb-2">
        <div className="flex md:grid md:grid-cols-4 gap-4 min-w-[900px] md:min-w-0">
          {STAGES.map((stage) => {
            const stageLeads = leads.filter(
              (l) => (l.pipelineStage || "new") === stage.key
            );

            const total = stageLeads.reduce(
              (sum, l) => sum + Number(l.value || 0),
              0
            );

            return (
              <div
                key={stage.key}
                className="
                  w-[280px] md:w-auto
                  rounded-xl
                  border border-white/10
                  bg-black/40
                  p-3
                  flex flex-col gap-3
                  min-h-[420px]
                "
              >
                {/* COLUMN HEADER */}
                <div className="flex items-center justify-between">
                  <div className="font-medium">{stage.label}</div>

                  <div
                    className="text-xs px-2 py-1 rounded"
                    style={{
                      backgroundColor: "rgba(182,242,74,0.15)",
                      color: GREEN,
                    }}
                  >
                    ${total.toLocaleString()}
                  </div>
                </div>

                {/* CARDS */}
                <div className="flex flex-col gap-2">
                  {stageLeads.map((lead) => {
                    const idx = STAGES.findIndex(
                      (s) => s.key === stage.key
                    );

                    const canMoveBack = idx > 0;
                    const canMoveForward = idx < STAGES.length - 1;

                    return (
                      <div
                        key={lead.id}
                        onClick={() =>
                          navigate(`/portal/leads/${lead.id}`)
                        }
                        className="
                          rounded-lg
                          border border-white/10
                          bg-black/60
                          p-3
                          hover:bg-white/5
                          transition
                          cursor-pointer
                        "
                      >
                        <div className="text-sm font-medium">
                          {lead.name || "Unnamed"}
                        </div>

                        <div className="text-xs text-slate-400 truncate">
                          {lead.company || lead.email}
                        </div>

                        {lead.value && (
                          <div
                            className="text-xs mt-1"
                            style={{ color: GREEN }}
                          >
                            ${Number(lead.value).toLocaleString()}
                          </div>
                        )}

                        {/* MOVE BUTTONS */}
                        <div className="flex justify-between mt-3">
                          {canMoveBack ? (
                            <button
                              disabled={movingId === lead.id}
                              onClick={(e) => {
                                e.stopPropagation(); // ✅ prevents card click
                                moveLead(
                                  lead.id,
                                  STAGES[idx - 1].key
                                );
                              }}
                              className="text-xs flex items-center gap-1 hover:opacity-70"
                            >
                              <ArrowLeft size={12} />
                            </button>
                          ) : (
                            <div />
                          )}

                          {canMoveForward && (
                            <button
                              disabled={movingId === lead.id}
                              onClick={(e) => {
                                e.stopPropagation(); // ✅ prevents card click
                                moveLead(
                                  lead.id,
                                  STAGES[idx + 1].key
                                );
                              }}
                              className="text-xs flex items-center gap-1 hover:opacity-70"
                              style={{ color: GREEN }}
                            >
                              Move
                              <ArrowRight size={12} />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {stageLeads.length === 0 && (
                    <div className="text-xs text-slate-500">
                      No deals
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}