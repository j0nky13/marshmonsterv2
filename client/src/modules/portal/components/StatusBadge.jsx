const STATUS_STYLES = {
  draft: "bg-slate-700/40 text-slate-200 border-slate-600",
  active: "bg-emerald-600/20 text-emerald-200 border-emerald-500/50",
  blocked: "bg-amber-600/20 text-amber-200 border-amber-500/50",
  completed: "bg-indigo-600/20 text-indigo-200 border-indigo-500/50",
};

export default function StatusBadge({ status }) {
  const s = (status || "draft").toLowerCase();
  const style =
    STATUS_STYLES[s] || STATUS_STYLES.draft;

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] uppercase tracking-wide ${style}`}
    >
      {s}
    </span>
  );
}