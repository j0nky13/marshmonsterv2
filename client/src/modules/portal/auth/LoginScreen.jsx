import { useEffect, useState } from "react";
import {
  auth,
  isSignInWithEmailLink,
  sendSignInLinkToEmail,
  signInWithEmailLink
} from "../firebase/firebase";

export default function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [checkingLink, setCheckingLink] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function completeEmailLinkLogin() {
      try {
        if (!isSignInWithEmailLink(auth, window.location.href)) {
          setCheckingLink(false);
          return;
        }

        const savedEmail = window.localStorage.getItem("emailForSignIn");
        const finalEmail = savedEmail || window.prompt("Confirm your email");

        if (!finalEmail) {
          throw new Error("Email is required to complete login.");
        }

        await signInWithEmailLink(auth, finalEmail, window.location.href);

        window.localStorage.removeItem("emailForSignIn");

        window.history.replaceState({}, document.title, window.location.pathname);

        await onLogin();
      } catch (err) {
        setError(err.message || "Failed to complete login.");
      } finally {
        setCheckingLink(false);
      }
    }

    completeEmailLinkLogin();
  }, [onLogin]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    try {
      if (!email.trim()) {
        throw new Error("Email is required.");
      }

      const actionCodeSettings = {
        url: `${window.location.origin}/portal`,
        handleCodeInApp: true
      };

      await sendSignInLinkToEmail(auth, email.trim().toLowerCase(), actionCodeSettings);

      window.localStorage.setItem("emailForSignIn", email.trim().toLowerCase());

      setSent(true);
    } catch (err) {
      setError(err.message || "Failed to send login link.");
    }
  }

  if (checkingLink) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-zinc-400">Checking secure login link...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-3xl p-8 shadow-2xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-black">Marsh Monster</h1>
          <p className="text-lime-400 mt-2">CRM 2.0 Secure Portal</p>
        </div>

        {sent ? (
          <div className="rounded-2xl bg-lime-400/10 border border-lime-400/30 p-4 text-lime-300">
            Login link sent. Check your email and click the link to continue.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded-2xl border border-red-500/30 bg-red-500/10 text-red-300 px-4 py-3">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm text-zinc-400 mb-2">
                Email address
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@marshmonster.com"
                className="w-full bg-black border border-zinc-700 rounded-xl px-4 py-3 outline-none focus:border-lime-400"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-lime-400 text-black font-bold rounded-xl py-3 hover:bg-lime-300 transition"
            >
              Send Secure Login Link
            </button>
          </form>
        )}
      </div>
    </div>
  );
}