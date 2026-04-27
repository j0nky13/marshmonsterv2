export default function BlockedScreen() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-zinc-900 border border-red-500/30 rounded-3xl p-8 text-center">
        <h1 className="text-3xl font-bold mb-4">
          Access Restricted
        </h1>

        <p className="text-zinc-400 mb-8">
          Your account is not authorized for this CRM.
        </p>

        <button
          onClick={() => window.history.back()}
          className="bg-white text-black px-6 py-3 rounded-xl font-semibold hover:opacity-80 transition"
        >
          Go Back
        </button>
      </div>
    </div>
  );
}