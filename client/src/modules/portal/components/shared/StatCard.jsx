export default function StatCard({ label, value, helper }) {
  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-xl">
      <p className="text-zinc-500 text-sm">
        {label}
      </p>

      <p className="text-4xl sm:text-5xl font-black text-white mt-3">
        {value}
      </p>

      {helper && (
        <p className="text-zinc-500 text-sm mt-3">
          {helper}
        </p>
      )}
    </div>
  );
}