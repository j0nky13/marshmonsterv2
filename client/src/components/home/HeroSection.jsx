import { useState } from "react";
import ParticleBackground from "../ParticleBackground";
import FloatingCode from "../FloatingCode";
import { createMessage } from "../../lib/messagesApi";

export default function HeroSection() {
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const formData = new FormData(e.target);

    const payload = {
      name: formData.get("name"),
      email: formData.get("email"),
      message: formData.get("message"),
      source: "hero-modal",
      page: "/",
    };

    try {
      await createMessage(payload);
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      setError("Failed to send message. Please try again.");
    }
  }

  return (
    <>
      {/* HERO */}
      <section className="relative bg-gradient-to-r from-black via-zinc-900 to-lime-900 bg-size-200 animate-gradient-x text-white min-h-[90vh] flex justify-center items-center overflow-hidden px-4 md:px-10">
        <FloatingCode />
        <div className="absolute inset-0 z-0">
          <ParticleBackground />
          <div className="absolute inset-0 bg-black bg-opacity-40" />
        </div>

        <div className="relative z-10 max-w-3xl w-full text-center flex flex-col items-center gap-6">
          <h1 className="text-5xl md:text-7xl font-extrabold leading-tight drop-shadow-lg text-white">
            Built for Performance. Designed to Impress.
          </h1>

          <p className="text-lg md:text-xl text-gray-300 leading-relaxed">
            Our sites are custom-coded from the ground up — no builders, no shortcuts.
            Just lean code, lightning speed, and performance your business deserves.
          </p>

          <button
            onClick={() => setOpen(true)}
            className="px-8 py-4 text-black font-semibold rounded-lg shadow-md bg-lime-400 hover:bg-lime-300 transition-all focus:outline-none focus:ring-4 focus:ring-lime-300 animate-pulse"
          >
            Let’s Talk
          </button>
        </div>
      </section>

      {/* MODAL */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4">
          <div className="bg-[#121212] w-full max-w-xl rounded-xl border border-slate-800 p-6 relative">
            <button
              onClick={() => {
                setOpen(false);
                setSubmitted(false);
                setError("");
              }}
              className="absolute top-3 right-3 text-slate-400 hover:text-white"
            >
              ✕
            </button>

            <h2 className="text-2xl font-semibold text-lime-400 mb-2">
              Let’s Talk
            </h2>
            <p className="text-sm text-slate-400 mb-6">
              We’ll reach out within 24 hours.
            </p>

            {!submitted ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  name="name"
                  required
                  placeholder="Name"
                  className="w-full rounded bg-[#181818] border border-slate-700 px-3 py-2 text-sm text-white"
                />

                <input
                  name="email"
                  type="email"
                  required
                  placeholder="Email"
                  className="w-full rounded bg-[#181818] border border-slate-700 px-3 py-2 text-sm text-white"
                />

                <textarea
                  name="message"
                  rows="4"
                  required
                  placeholder="How can we help?"
                  className="w-full rounded bg-[#181818] border border-slate-700 px-3 py-2 text-sm text-white resize-none"
                />

                {error && (
                  <div className="text-xs text-red-400">{error}</div>
                )}

                <button
                  type="submit"
                  className="w-full bg-lime-400 hover:bg-lime-300 text-black font-semibold py-2 rounded"
                >
                  Send Message
                </button>
              </form>
            ) : (
              <div className="text-center py-10 text-lime-400 text-lg animate-pulse">
                Message sent! We’ll be in touch.
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}