export default function MonsterInput({ label, className = "", ...props }) {
  return (
    <label className="block">
      {label && (
        <span className="block text-sm text-zinc-400 mb-2">
          {label}
        </span>
      )}

      <input
        className={`w-full bg-black border border-zinc-800 rounded-2xl px-4 py-3 text-white outline-none focus:border-lime-400 ${className}`}
        {...props}
      />
    </label>
  );
}