// animations
const portalAnimations = `
@keyframes checkPop {
  0% { transform: scale(0.4) rotate(-20deg); opacity: 0; }
  60% { transform: scale(1.15) rotate(4deg); opacity: 1; }
  100% { transform: scale(1); rotate(0); }
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-checkPop { animation: checkPop 0.6s ease-out both; }
.animate-fadeIn { animation: fadeIn 0.5s ease-out both; }
@keyframes labPulse {
  0% { filter: brightness(0.9); }
  50% { filter: brightness(1.3); }
  100% { filter: brightness(0.9); }
}
.animate-labPulse { animation: labPulse 1.6s ease-in-out infinite; }
@keyframes sectionFloat {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-sectionFloat { animation: sectionFloat 0.5s ease-out both; }
`;

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getOrderByPublicId } from "../lib/ordersApi";
import StatusBadge from "../components/StatusBadge.jsx";

export default function CustomerPortal() {
  const { publicId } = useParams();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getOrderByPublicId(publicId)
      .then((o) => {
        if (!o) setError("Order not found");
        else setOrder(o);
      })
      .catch(() => setError("Order not found"));
  }, [publicId]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#02040b] px-4">
        <div className="w-full max-w-md rounded-2xl border border-red-800/70 bg-gradient-to-br from-red-950/80 via-slate-950 to-black px-6 py-6 text-sm text-center">
          <div className="text-base font-semibold text-red-100 mb-2">
            We couldn&apos;t find your order
          </div>
          <div className="text-slate-300 text-xs">
            Double-check the tracking link or contact your optical shop for help.
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#02040b] px-4">
        <div className="text-sm text-slate-300 bg-slate-950/80 border border-slate-800/80 rounded-2xl px-5 py-4">
          Loading your order…
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#02040b] px-4 py-8">
      <div className="w-full max-w-xl rounded-2xl border border-slate-800/80 bg-gradient-to-br from-slate-950 via-slate-950/95 to-black px-5 py-6 md:px-7 md:py-7 text-sm shadow-xl shadow-black/40">
        {/* Shop logo */}
        {order.shopLogo && (
          <div className="flex justify-center mb-5">
            <img
              src={order.shopLogo}
              alt="Shop logo"
              className="h-10 w-auto opacity-80"
            />
          </div>
        )}
        {/* Header */}
        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-sky-300/80 mb-1">
              Order status
            </p>
            <h1 className="text-xl md:text-2xl font-semibold text-white">
              {order.customerName || "Your glasses"}
            </h1>
            <p className="mt-1 text-[11px] text-slate-400">
              Tracking ID:{" "}
              <span className="font-mono text-slate-200">{order.publicId}</span>
            </p>
          </div>
          <div className="self-start md:self-auto">
            <StatusBadge status={order.status} />
          </div>
        </div>

        {/* Progress section */}
        <div className="mb-6 rounded-xl border border-slate-800/80 bg-slate-950/80 px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-[11px] text-slate-400 uppercase tracking-[0.18em]">
                Progress
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Follow your glasses from order received to pickup.
              </p>
            </div>
          </div>
          <Progress status={order.status} />
        </div>

        {/* Details grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs md:text-sm">
          <div className="rounded-xl border border-slate-800/80 bg-slate-950/80 px-4 py-3 animate-sectionFloat">
            <div className="text-[11px] text-slate-400 uppercase mb-1.5 tracking-[0.16em]">
              Frame
            </div>
            <div className="text-slate-100">
              {order.frame?.brand || "Frame"}{" "}
              {order.frame?.model ? order.frame.model : ""}
            </div>
            <div className="text-slate-400 text-[11px] mt-1">
              {[order.frame?.color, order.frame?.size]
                .filter(Boolean)
                .join(" · ")}
            </div>
          </div>

          <div className="rounded-xl border border-slate-800/80 bg-slate-950/80 px-4 py-3 animate-sectionFloat">
            <div className="text-[11px] text-slate-400 uppercase mb-1.5 tracking-[0.16em]">
              Lenses
            </div>
            <div className="text-slate-100">
              {order.lens?.type || "Lens type"}{" "}
              {order.lens?.material ? `· ${order.lens.material}` : ""}
            </div>
            <div className="text-slate-400 text-[11px] mt-1">
              {order.lens?.coating || "Anti-reflective / coatings"}
            </div>
          </div>
        </div>

        {/* Remake info (optional) */}
        {order.isRemake && (
          <div className="mt-4 rounded-xl border border-amber-500/50 bg-amber-950/30 px-4 py-3 text-xs md:text-sm animate-sectionFloat">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="h-6 w-6 rounded-full bg-amber-500/20 border border-amber-400/70 flex items-center justify-center">
                <span className="text-[13px] text-amber-200 font-semibold">
                  R
                </span>
              </div>
              <div>
                <div className="text-[11px] text-amber-200/90 uppercase tracking-[0.16em]">
                  Remake in progress
                </div>
                <div className="text-[11px] text-amber-100/80">
                  This pair is being processed as a remake of your original order.
                </div>
              </div>
            </div>

            {order.remakeReason && (
              <div className="mt-2 text-amber-50/90 text-xs leading-snug border-t border-amber-400/40 pt-2">
                <span className="font-semibold">Reason: </span>
                <span>{order.remakeReason}</span>
              </div>
            )}
          </div>
        )}

        {/* Last updated */}
        {order.updatedAt && (
          <div className="mt-5 text-center text-[11px] text-slate-500">
            Last updated:{" "}
            {order.updatedAt.toDate
              ? order.updatedAt.toDate().toLocaleString()
              : ""}
          </div>
        )}

        {/* What happens next? */}
        <div className="mt-6 rounded-xl border border-slate-800/80 bg-slate-950/80 px-4 py-3 animate-sectionFloat">
          <div className="text-[11px] text-slate-400 uppercase tracking-[0.16em] mb-1.5">
            What happens next?
          </div>
          <div className="text-slate-300 text-xs">
            {order.status === "received" &&
              "Your order has been submitted to the lab. Processing usually begins within 24 hours."}
            {order.status === "lab" &&
              "Your lenses are being manufactured. Most labs complete this step in 3–7 business days."}
            {order.status === "edging" &&
              "Your lenses are being cut to fit your frame precisely."}
            {order.status === "qc" &&
              "Your glasses are undergoing final inspection to ensure accuracy and quality."}
            {order.status === "ready" &&
              "Your glasses are ready for pickup! Your shop may contact you soon."}
            {order.status === "shipped" &&
              "Your glasses are on their way back to the shop. They’ll notify you when they arrive."}
            {order.status === "pickedup" &&
              "Enjoy your new eyewear! Thank you for choosing this optical shop."}
          </div>
        </div>

        {/* Footer help text */}
        <div className="mt-6 text-[11px] text-slate-500 text-center">
          For any questions or changes to your order, please contact your optical
          shop directly. They can provide exact timing for completion and pickup.
        </div>

        <style>{portalAnimations}</style>
      </div>
    </div>
  );
}

const STEPS = ["received", "lab", "edging", "qc", "shipped", "ready", "pickedup"];

// NEW: canonical stage helper – collapses lab/edging/qc into "lab"
function canonicalStage(step) {
  switch (step) {
    case "lab":
    case "edging":
    case "qc":
      return "lab";
    default:
      return step;
  }
}

function Progress({ status }) {
  const stage = canonicalStage(status);
  const currentIndex = STEPS.indexOf(stage);
  const totalSteps = STEPS.length;

  // If status is unknown, show 0% progress and treat as "received"
  const safeIndex = currentIndex === -1 ? 0 : currentIndex;
  const pct = ((safeIndex + 1) / totalSteps) * 100;

  const isComplete = stage === "pickedup";

  if (isComplete) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-4 animate-fadeIn">
        <div className="flex items-center justify-center h-14 w-14 rounded-full bg-emerald-500/20 border border-emerald-400/70 shadow-inner shadow-emerald-500/40 animate-checkPop">
          <span className="text-3xl leading-none text-emerald-300">✓</span>
        </div>
        <div className="text-center text-xs text-emerald-200 font-medium animate-fadeIn">
          Your glasses have been picked up
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {/* Single continuous bar with glass reflection */}
      <div className="relative w-full h-2.5 rounded-full bg-slate-900 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-transparent pointer-events-none" />
        <div
          className="relative h-2.5 rounded-full transition-all duration-300 bg-gradient-to-r from-sky-400 via-emerald-400 to-emerald-500 animate-labPulse"
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Current location label */}
      <div className="mt-1 text-center text-[11px] text-slate-400">
        Current status:{" "}
        <span className="text-emerald-300 font-medium">
          {labelForStep(stage)}
        </span>
      </div>

      {/* ETA */}
      {etaForStatus(stage) && (
        <div className="mt-0.5 text-center text-[11px] text-slate-500">
          Estimated timing:{" "}
          <span className="text-slate-300">{etaForStatus(stage)}</span>
        </div>
      )}
    </div>
  );
}

function labelForStep(step) {
  switch (step) {
    case "received":
      return "Received";
    case "lab":
      return "At lab";
    case "edging":
      return "At lab";
    case "qc":
      return "At lab";
    case "ready":
      return "Ready";
    case "shipped":
      return "Shipped";
    case "pickedup":
      return "Picked up";
    default:
      return step;
  }
}

function etaForStatus(step) {
  switch (step) {
    case "received":
      return "Processing usually begins within 1 business day.";
    case "lab":
      return "Most labs complete this step in about 3–7 business days.";
    case "ready":
      return "Ready now—pickup as soon as it’s convenient for you.";
    case "shipped":
      return "Usually 1–3 business days to arrive back at your shop.";
    case "pickedup":
      return "";
    default:
      return "";
  }
}