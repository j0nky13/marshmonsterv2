export default function LoadingScreen() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-zinc-700 border-t-lime-400 rounded-full animate-spin mx-auto mb-6" />

        <h1 className="text-2xl font-bold tracking-wide">
          Marsh Monster CRM 2.0
        </h1>

        <p className="text-zinc-400 mt-2">
          Loading secure workspace...
        </p>
      </div>
    </div>
  );
}