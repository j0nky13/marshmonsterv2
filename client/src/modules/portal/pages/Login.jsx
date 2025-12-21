import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { login, completeEmailLogin } from "../lib/auth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState("");
  const navigate = useNavigate();

  // If user came from email link, complete sign-in automatically
  useEffect(() => {
    completeEmailLogin()
      .then((user) => {
        if (user) navigate("/portal");
      })
      .catch((e) => setErr(e?.message || "Failed to complete login"));
  }, [navigate]);

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    try {
      await login(email); // sends email link
      setSent(true);
    } catch (e) {
      setErr(e?.message || "Failed to send login link");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#02040b] text-slate-100 p-6">
      <div className="w-full max-w-sm bg-slate-950 border border-slate-800 rounded-xl p-6">
        <h1 className="text-xl font-semibold">Portal Login</h1>
        <p className="text-sm text-slate-400 mt-1">
          Passwordless email sign-in.
        </p>

        {err && (
          <div className="mt-4 text-xs text-red-300 bg-red-950/30 border border-red-800 rounded px-3 py-2">
            {err}
          </div>
        )}

        {sent ? (
          <div className="mt-4 text-sm text-slate-300">
            Check your email for the sign-in link.
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-4 space-y-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="w-full rounded bg-slate-950 border border-slate-700 px-3 py-2 text-sm"
              required
            />
            <button
              type="submit"
              className="w-full rounded bg-emerald-600 hover:bg-emerald-500 px-3 py-2 text-sm font-medium"
            >
              Send Login Link
            </button>
          </form>
        )}
      </div>
    </div>
  );
}