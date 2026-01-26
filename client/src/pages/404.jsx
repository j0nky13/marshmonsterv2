

import React from "react";
import { Link, useLocation } from "react-router-dom";

/**
 * 404 Page – Marsh Monster style
 * TailwindCSS + React Router v6
 * Drop this component into a route like: <Route path="*" element={<NotFound404 />} />
 */
export default function NotFound404() {
  const location = useLocation();

  return (
    <main className="relative min-h-[calc(100vh-4rem)] w-full overflow-hidden bg-gradient-to-b from-black via-slate-950 to-black text-slate-100">
      {/* Subtle grid backdrop */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:24px_24px]"
      />

      {/* Glow accent */}
      <div aria-hidden className="absolute -inset-x-40 top-24 h-64 blur-3xl opacity-25 bg-gradient-to-r from-lime-400 via-emerald-400 to-teal-400" />

      <section className="relative mx-auto flex max-w-5xl flex-col items-center px-6 py-24 text-center sm:py-28">
        {/* Icon */}
        <div className="mb-8 inline-flex items-center justify-center rounded-2xl border border-slate-800/80 bg-slate-900/50 px-4 py-2 backdrop-blur">
          <span className="mr-2 inline-block h-2 w-2 animate-pulse rounded-full bg-lime-400" />
          <span className="text-xs tracking-wide text-slate-300">Navigator Warning</span>
        </div>

        <h1 className="text-6xl font-extrabold tracking-tight sm:text-7xl">
          <span className="bg-gradient-to-b from-white to-slate-400 bg-clip-text text-transparent">404</span>
        </h1>

        <p className="mt-4 max-w-2xl text-balance text-lg text-slate-300">
          The page
          <code className="mx-2 rounded bg-slate-900/70 px-2 py-1 text-slate-200">{location?.pathname}</code>
          couldn’t be found.
        </p>


        {/* CTA buttons */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/"
            className="group inline-flex items-center gap-2 rounded-xl border border-lime-500/30 bg-lime-500/10 px-5 py-3 font-semibold text-lime-300 transition hover:border-lime-400/60 hover:bg-lime-400/15 hover:text-lime-200"
          >
            <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5">
              <path fill="currentColor" d="M12 3 3 10h2v8a2 2 0 0 0 2 2h4v-6h2v6h4a2 2 0 0 0 2-2v-8h2L12 3z" />
            </svg>
            Back to Home
          </Link>

          <Link
            to="/contact"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/60 px-5 py-3 font-semibold text-slate-200 transition hover:border-slate-600 hover:bg-slate-800/80"
          >
            <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5">
              <path fill="currentColor" d="M12 12c2.21 0 4-1.79 4-4S14.21 4 12 4 8 5.79 8 8s1.79 4 4 4zm0 2c-3.33 0-10 1.67-10 5v1h20v-1c0-3.33-6.67-5-10-5z" />
            </svg>
            Contact Us
          </Link>
        </div>

        {/* Helpful links */}
        <div className="mt-10 text-sm text-slate-400">
          <p>
            Or explore our {" "}
            <Link to="/portfolio" className="font-medium text-lime-300 underline-offset-4 hover:text-lime-200 hover:underline">
              portfolio
            </Link>{" "}
            and {" "}
            <Link to="/pricing" className="font-medium text-lime-300 underline-offset-4 hover:text-lime-200 hover:underline">
              services
            </Link>
            .
          </p>
        </div>
      </section>

      {/* Bottom accent line */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-lime-400/50 to-transparent" />
    </main>
  );
}