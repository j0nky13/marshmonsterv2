// import { X } from "lucide-react";
// import ProjectFilesPanel from "./ProjectFilesPanel";
// import ProjectMessagesPanel from "./ProjectMessagesPanel";

// export default function ProjectDetailsModal({
//   open,
//   project,
//   role,
//   onClose,
//   onUpdate
// }) {
//   if (!open || !project) return null;

//   const remaining = (project.budget || 0) - (project.paidAmount || 0);

//   return (
//     <div className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
//       <div className="w-full max-w-4xl max-h-[92vh] overflow-y-auto bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl">
//         <div className="sticky top-0 z-10 bg-zinc-950/95 backdrop-blur border-b border-zinc-800 p-5 flex items-center justify-between">
//           <div>
//             <p className="text-lime-400 text-sm font-semibold uppercase tracking-widest">
//               Project Details
//             </p>

//             <h2 className="text-2xl font-black text-white">
//               {project.clientName}
//             </h2>
//           </div>

//           <button onClick={onClose} className="text-zinc-400 hover:text-white">
//             <X size={24} />
//           </button>
//         </div>

//         <div className="p-5 space-y-5">
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//             <Mini label="Budget" value={money(project.budget)} />
//             <Mini label="Paid" value={money(project.paidAmount)} />
//             <Mini label="Remaining" value={money(remaining)} />
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <label>
//               <span className="block text-sm text-zinc-400 mb-2">Status</span>
//               <select
//                 disabled={role === "customer"}
//                 value={project.status}
//                 onChange={(e) =>
//                   onUpdate(project._id, { status: e.target.value })
//                 }
//                 className="w-full bg-black border border-zinc-800 rounded-2xl px-4 py-3 text-white outline-none focus:border-lime-400 disabled:opacity-60"
//               >
//                 {[
//                   "planning",
//                   "in_progress",
//                   "waiting_client",
//                   "completed",
//                   "on_hold"
//                 ].map((status) => (
//                   <option key={status} value={status}>
//                     {status.replace("_", " ")}
//                   </option>
//                 ))}
//               </select>
//             </label>

//             {role !== "customer" && (
//               <label>
//                 <span className="block text-sm text-zinc-400 mb-2">
//                   Paid Amount
//                 </span>
//                 <input
//                   type="number"
//                   defaultValue={project.paidAmount || 0}
//                   onBlur={(e) =>
//                     onUpdate(project._id, {
//                       paidAmount: Number(e.target.value)
//                     })
//                   }
//                   className="w-full bg-black border border-zinc-800 rounded-2xl px-4 py-3 text-white outline-none focus:border-lime-400"
//                 />
//               </label>
//             )}
//           </div>

//           {project.notes && (
//             <div className="bg-black border border-zinc-800 rounded-2xl p-4">
//               <p className="text-zinc-500 text-sm mb-1">Notes</p>
//               <p className="text-zinc-300">{project.notes}</p>
//             </div>
//           )}

//           <ProjectFilesPanel project={project} role={role} />

//           <ProjectMessagesPanel project={project} role={role} />
//         </div>
//       </div>
//     </div>
//   );
// }

// function Mini({ label, value }) {
//   return (
//     <div className="bg-black border border-zinc-800 rounded-2xl p-4">
//       <p className="text-zinc-500 text-xs">{label}</p>
//       <p className="font-black mt-1">{value}</p>
//     </div>
//   );
// }

// function money(value) {
//   return new Intl.NumberFormat("en-US", {
//     style: "currency",
//     currency: "USD"
//   }).format(value || 0);
// }

import { X } from "lucide-react";
import ProjectFilesPanel from "./ProjectFilesPanel";
import ProjectMessagesPanel from "./ProjectMessagesPanel";

const statusSteps = [
  { id: "planning", label: "Planning" },
  { id: "in_progress", label: "In Progress" },
  { id: "waiting_client", label: "Waiting Client" },
  { id: "completed", label: "Completed" }
];

export default function ProjectDetailsModal({
  open,
  project,
  role,
  onClose,
  onUpdate
}) {
  if (!open || !project) return null;

  const remaining = (project.budget || 0) - (project.paidAmount || 0);

  return (
    <div className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-4xl max-h-[92vh] overflow-y-auto bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl">
        <div className="sticky top-0 z-10 bg-zinc-950/95 backdrop-blur border-b border-zinc-800 p-5 flex items-center justify-between">
          <div>
            <p className="text-lime-400 text-sm font-semibold uppercase tracking-widest">
              Project Details
            </p>

            <h2 className="text-2xl font-black text-white">
              {project.clientName}
            </h2>
          </div>

          <button onClick={onClose} className="text-zinc-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <div className="p-5 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Mini label="Budget" value={money(project.budget)} />
            <Mini label="Paid" value={money(project.paidAmount)} />
            <Mini label="Remaining" value={money(remaining)} />
          </div>

          {role === "customer" ? (
            <CustomerStatusTracker status={project.status} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label>
                <span className="block text-sm text-zinc-400 mb-2">
                  Status
                </span>

                <select
                  value={project.status}
                  onChange={(e) =>
                    onUpdate(project._id, { status: e.target.value })
                  }
                  className="w-full bg-black border border-zinc-800 rounded-2xl px-4 py-3 text-white outline-none focus:border-lime-400"
                >
                  {[
                    "planning",
                    "in_progress",
                    "waiting_client",
                    "completed",
                    "on_hold"
                  ].map((status) => (
                    <option key={status} value={status}>
                      {status.replace("_", " ")}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <span className="block text-sm text-zinc-400 mb-2">
                  Paid Amount
                </span>

                <input
                  type="number"
                  defaultValue={project.paidAmount || 0}
                  onBlur={(e) =>
                    onUpdate(project._id, {
                      paidAmount: Number(e.target.value)
                    })
                  }
                  className="w-full bg-black border border-zinc-800 rounded-2xl px-4 py-3 text-white outline-none focus:border-lime-400"
                />
              </label>
            </div>
          )}

          {project.notes && (
            <div className="bg-black border border-zinc-800 rounded-2xl p-4">
              <p className="text-zinc-500 text-sm mb-1">Notes</p>
              <p className="text-zinc-300">{project.notes}</p>
            </div>
          )}

          <ProjectFilesPanel project={project} role={role} />

          <ProjectMessagesPanel project={project} role={role} />
        </div>
      </div>
    </div>
  );
}

function CustomerStatusTracker({ status }) {
  if (status === "on_hold") {
    return (
      <div className="rounded-3xl border border-yellow-500/30 bg-yellow-500/10 p-5">
        <p className="text-yellow-300 text-sm font-bold uppercase tracking-widest">
          Project Status
        </p>

        <h3 className="text-2xl font-black text-white mt-2">On Hold</h3>

        <p className="text-zinc-400 mt-2 text-sm">
          This project is temporarily paused. Marsh Monster will update this
          status when work resumes.
        </p>
      </div>
    );
  }

  const currentIndex = statusSteps.findIndex((step) => step.id === status);
  const safeIndex = currentIndex >= 0 ? currentIndex : 0;
  const progress = (safeIndex / (statusSteps.length - 1)) * 100;

  return (
    <div className="rounded-3xl border border-zinc-800 bg-black p-5 space-y-5">
      <div>
        <p className="text-lime-400 text-sm font-bold uppercase tracking-widest">
          Project Status
        </p>

        <h3 className="text-2xl font-black text-white mt-2">
          {statusSteps[safeIndex]?.label || "Planning"}
        </h3>

        <p className="text-zinc-500 text-sm mt-1">
          Follow your project from planning through completion.
        </p>
      </div>

      <div className="relative pt-2">
        <div className="absolute left-0 right-0 top-6 h-1 rounded-full bg-zinc-800" />

        <div
          className="absolute left-0 top-6 h-1 rounded-full bg-lime-400 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />

        <div className="relative grid grid-cols-4 gap-2">
          {statusSteps.map((step, index) => {
            const complete = index < safeIndex;
            const current = index === safeIndex;
            const active = index <= safeIndex;

            return (
              <div
                key={step.id}
                className="flex flex-col items-center text-center gap-2"
              >
                <div
                  className={`h-9 w-9 rounded-full border flex items-center justify-center font-black transition ${
                    active
                      ? "bg-lime-400 border-lime-400 text-black"
                      : "bg-zinc-950 border-zinc-700 text-zinc-500"
                  }`}
                >
                  {complete ? "✓" : index + 1}
                </div>

                <div>
                  <p
                    className={`text-xs font-bold ${
                      current
                        ? "text-lime-400"
                        : complete
                          ? "text-white"
                          : "text-zinc-500"
                    }`}
                  >
                    {step.label}
                  </p>

                  {current && (
                    <p className="text-[10px] text-zinc-500 mt-1">Current</p>
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

function Mini({ label, value }) {
  return (
    <div className="bg-black border border-zinc-800 rounded-2xl p-4">
      <p className="text-zinc-500 text-xs">{label}</p>
      <p className="font-black mt-1">{value}</p>
    </div>
  );
}

function money(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(value || 0);
}