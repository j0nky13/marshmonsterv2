import { useState } from "react";
import { motion } from "framer-motion";
import { createMessage } from "../lib/messagesApi";

const FORMSPREE_ENDPOINT =
  import.meta.env.VITE_FORMSPREE_ENDPOINT ||
  "https://formspree.io/f/mnngdpny";

const GREEN = "#B6F24A";

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const formData = new FormData(e.target);

    const payload = {
      name: formData.get("name"),
      email: formData.get("email"),
      message: formData.get("message"),
      source: "contact",
      page:
        typeof window !== "undefined"
          ? window.location.pathname
          : "/contact",
    };

    try {
      await createMessage(payload);

      await fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...payload,
          _subject: "Marsh Monster — Contact",
          _gotcha: formData.get("company") || "",
        }),
      });

      setSubmitted(true);
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <section className="relative min-h-screen bg-black overflow-hidden px-6 py-32">
      {/* Ambient engine glow */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(700px 420px at 50% 45%, rgba(182,242,74,0.12), rgba(0,0,0,0.96) 70%)",
        }}
      />

      <div className="relative max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: false, amount: 0.3 }}
          className="text-center mb-20 mt-6"
        >
          <div className="text-xs tracking-[0.28em] uppercase text-gray-500 mb-4">
            Contact
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold text-white">
            Let’s <span style={{ color: GREEN }}>Build Something</span>
          </h1>

          <p className="mt-6 text-gray-400 max-w-xl mx-auto">
            Tell us what you’re working on. We’ll respond within 24 hours.
          </p>
        </motion.div>

        {/* Console */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: false, amount: 0.35 }}
          className="mx-auto max-w-2xl rounded-3xl border border-white/10 bg-black/70 backdrop-blur-xl p-8 md:p-10"
        >
          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <Field id="name" label="Name" />
              <Field id="email" label="Email" type="email" />
              <Field id="message" label="Message" textarea />

              {/* Honeypot */}
              <input
                type="text"
                name="company"
                tabIndex={-1}
                autoComplete="off"
                className="hidden"
              />

              {error && (
                <div className="text-sm text-red-400 text-center">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="mt-4 w-full rounded-2xl px-6 py-3 font-semibold text-black flex items-center justify-center"
                style={{
                  backgroundColor: GREEN,
                  boxShadow: "0 0 34px rgba(182,242,74,0.25)",
                }}
              >
                Send message
              </button>
            </form>
          ) : (
            <div className="text-center py-10">
              <div
                className="mx-auto mb-4 h-12 w-12 rounded-full"
                style={{
                  backgroundColor: GREEN,
                  boxShadow: "0 0 28px rgba(182,242,74,0.45)",
                }}
              />
              <div className="text-2xl font-extrabold text-white">
                Message sent
              </div>
              <p className="mt-3 text-gray-400">
                We’ll be in touch shortly.
              </p>
            </div>
          )}
        </motion.div>

        {/* Trust footer */}
        <div className="mt-12 text-center text-xs text-gray-500 tracking-wide">
          Secure delivery • No spam • Real humans only
        </div>
      </div>
    </section>
  );
}

/* ---------------- reusable field ---------------- */

function Field({ id, label, type = "text", textarea }) {
  return (
    <div className="relative">
      {textarea ? (
        <textarea
          id={id}
          name={id}
          rows={5}
          required
          placeholder=" "
          className="peer w-full resize-none rounded-2xl bg-black/60 text-white border border-white/15 px-4 py-3.5 focus:outline-none focus:border-lime-400 focus:ring-4 focus:ring-lime-400/10 transition placeholder-transparent"
        />
      ) : (
        <input
          id={id}
          name={id}
          type={type}
          required
          placeholder=" "
          className="peer w-full rounded-2xl bg-black/60 text-white border border-white/15 px-4 py-3.5 focus:outline-none focus:border-lime-400 focus:ring-4 focus:ring-lime-400/10 transition placeholder-transparent"
        />
      )}

      <label
        htmlFor={id}
        className="absolute left-4 top-3.5 text-gray-400 text-sm transition-all
          peer-placeholder-shown:top-3.5
          peer-placeholder-shown:text-sm
          peer-focus:-top-2
          peer-focus:text-xs
          peer-focus:text-lime-300
          peer-focus:bg-black
          peer-focus:px-1
          peer-[&:not(:placeholder-shown)]:-top-2
          peer-[&:not(:placeholder-shown)]:text-xs
          peer-[&:not(:placeholder-shown)]:bg-black
          peer-[&:not(:placeholder-shown)]:px-1
        "
      >
        {label}
      </label>
    </div>
  );
}