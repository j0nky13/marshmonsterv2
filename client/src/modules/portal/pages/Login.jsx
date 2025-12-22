import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { login, completeEmailLogin } from "../lib/auth";
import { motion } from "framer-motion";

/* ---------------- floating input ---------------- */

function FloatingInput({ id, type = "email", label, value, onChange }) {
  return (
    <div className="relative">
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder=" "
        required
        className="peer w-full rounded-2xl bg-black text-white border border-white/15 px-4 py-3.5
                   focus:outline-none focus:border-lime-400 focus:ring-4 focus:ring-lime-400/10
                   transition placeholder-transparent"
      />
      <label
        htmlFor={id}
        className="absolute left-4 top-3.5 text-gray-400 text-sm transition-all
                   peer-placeholder-shown:top-3.5
                   peer-focus:-top-2 peer-focus:text-xs peer-focus:text-lime-300 peer-focus:bg-black peer-focus:px-1
                   peer-[&:not(:placeholder-shown)]:-top-2 peer-[&:not(:placeholder-shown)]:text-xs peer-[&:not(:placeholder-shown)]:bg-black peer-[&:not(:placeholder-shown)]:px-1"
      >
        {label}
      </label>
    </div>
  );
}

/* ---------------- page ---------------- */

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState("");
  const navigate = useNavigate();

  /* complete email-link login */
  useEffect(() => {
    completeEmailLogin()
      .then((user) => {
        if (user) navigate("/portal");
      })
      .catch((e) =>
        setErr(e?.message || "Failed to complete login")
      );
  }, [navigate]);

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    try {
      await login(email);
      setSent(true);
    } catch (e) {
      setErr(e?.message || "Failed to send login link");
    }
  }

  return (
    <div className="relative min-h-screen bg-black text-white flex items-center justify-center px-6 overflow-hidden">

      {/* ---------- ambient engine background ---------- */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(900px 500px at 50% 30%, rgba(182,242,74,0.06), rgba(0,0,0,0.96) 70%),
            radial-gradient(600px 380px at 80% 70%, rgba(255,255,255,0.04), transparent 70%)
          `,
        }}
      />

      {/* ---------- subtle animated grid/noise ---------- */}
      <motion.div
        aria-hidden
        className="absolute inset-0 opacity-[0.04]"
        initial={{ opacity: 0.02 }}
        animate={{ opacity: 0.05 }}
        transition={{ duration: 6, repeat: Infinity, repeatType: "mirror" }}
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      {/* ---------- content ---------- */}
      <div className="relative z-10 w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="rounded-3xl border border-white/15 bg-black/80 backdrop-blur-xl p-8 shadow-2xl"
        >
          <div className="mb-6 text-center">
            <div className="text-xs tracking-[0.32em] uppercase text-gray-500 mb-3">
              Secure Portal
            </div>
            <h1 className="text-2xl font-extrabold">
              Sign in
            </h1>
            <p className="mt-2 text-sm text-gray-400">
              Passwordless access via email link.
            </p>
          </div>

          {err && (
            <div className="mb-4 text-xs text-red-300 border border-red-500/40 rounded-xl px-4 py-3 bg-red-950/30">
              {err}
            </div>
          )}

          {sent ? (
            <div className="text-center text-sm text-gray-300 py-6">
              Check your inbox.
              <br />
              <span className="text-gray-500">
                The login link expires shortly.
              </span>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-5">
              <FloatingInput
                id="portal-email"
                label="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <button
                type="submit"
                className="w-full rounded-2xl px-6 py-3 font-semibold text-black
                           bg-lime-400 hover:bg-lime-300 transition"
                style={{
                  boxShadow: "0 0 26px rgba(182,242,74,0.25)",
                }}
              >
                Send login link
              </button>
            </form>
          )}
        </motion.div>

        <p className="mt-6 text-center text-xs text-gray-500">
          Authorized access only.
        </p>
      </div>
    </div>
  );
}