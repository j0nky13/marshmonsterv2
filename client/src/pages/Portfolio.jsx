import { useEffect, useState } from "react";

// ---------- UI helpers ----------
function cn(...c){return c.filter(Boolean).join(" ");}

function Badge({children}) {
  return (
    <span className="px-2 py-0.5 text-[11px] rounded bg-[#1a1a1a] border border-gray-800 text-gray-300">
      {children}
    </span>
  );
}

// ---------- Circular Gauge ----------
function Gauge({ label, value, active }) {
  const r = 11;               // radius
  const c = 2 * Math.PI * r;  // circumference
  const pct = Math.max(0, Math.min(100, Number(value || 0)));

  const [progress, setProgress] = useState(0); // animated value 0..100
  const [pop, setPop] = useState(false);       // brief bounce-on-enter

  useEffect(() => {
    if (!active) {
      setProgress(0);
      setPop(false);
      return;
    }
    // entrance pop + delayed fill
    setProgress(0);
    setPop(true);
    const t1 = setTimeout(() => {
      setProgress(pct);
      setPop(false);
    }, 120);
    return () => {
      clearTimeout(t1);
    };
  }, [active, pct]);

  const dash = (progress / 100) * c;
  const hue = (progress / 100) * 120; // 0=red -> 120=green as it fills
  const stroke = `hsl(${hue} 85% 60%)`;

  return (
    <div className={cn(
      "flex flex-col items-center gap-1 transform transition duration-500",
      active ? (pop ? "opacity-100 scale-110" : "opacity-100 scale-100") : "opacity-0 scale-90"
    )}>
      <svg viewBox="0 0 48 48" className="h-10 w-10">
        <circle cx="24" cy="24" r={r} fill="none" stroke="#262626" strokeWidth="5" />
        <circle
          cx="24"
          cy="24"
          r={r}
          fill="none"
          stroke={stroke}
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={`${c} ${c}`}
          strokeDashoffset={`${c - dash}`}
          style={{ transition: "stroke-dashoffset 1100ms ease, stroke 300ms ease" }}
          transform="rotate(-90 24 24)"
        />
      </svg>
      <div className="text-[10px] uppercase tracking-wide text-gray-300">{label}</div>
      <div className="text-xs font-semibold text-gray-100">{Math.round(progress)}</div>
    </div>
  );
}

// ---------- Modal ----------
function CaseStudyModal({ project, onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const [anim, setAnim] = useState(false);
  useEffect(() => {
    setAnim(true);
    return () => setAnim(false);
  }, [project?.id]);

  if (!project) return null;

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-lg max-h-[90vh] bg-[#0f0f0f] text-white rounded-2xl shadow-2xl overflow-hidden border border-gray-800 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Media */}
        <div className="relative shrink-0">
          {project.preview ? (
            <video
              className="w-full h-44 sm:h-56 md:h-64 object-cover"
              src={project.preview}
              muted
              loop
              playsInline
              autoPlay
            />
          ) : (
            <img src={project.cover} alt={project.title} className="w-full h-44 sm:h-56 md:h-64 object-cover" />
          )}
          <div className="absolute left-4 top-4 flex gap-2">
            {project.visibility !== "public" && <Badge>Private</Badge>}
            {project.showcase === "anonymized" && <Badge>Anonymized</Badge>}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 flex-1 overflow-y-auto">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-2xl font-semibold text-lime-400">{project.title}</h3>
              {project.client && <p className="text-sm text-gray-400 mt-0.5">for {project.client}</p>}
            </div>
          </div>

          {project.summary && <p className="text-gray-300">{project.summary}</p>}

          {(project.problem || project.approach || project.outcome) && (
            <div className="grid gap-3">
              {project.problem && (
                <p className="text-sm text-gray-300"><span className="font-semibold text-gray-100">Problem:</span> {project.problem}</p>
              )}
              {project.approach && (
                <p className="text-sm text-gray-300"><span className="font-semibold text-gray-100">Solution:</span> {project.approach}</p>
              )}
              {project.outcome && (
                <p className="text-sm text-gray-300"><span className="font-semibold text-gray-100">Outcome:</span> {project.outcome}</p>
              )}
            </div>
          )}

          {/* Highlights (kept concise) */}
          {project.highlights?.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-white mb-2">What we built</h4>
              <ul className="list-disc pl-5 text-gray-300 space-y-1">
                {project.highlights.map((h) => (<li key={h}>{h}</li>))}
              </ul>
            </div>
          )}

          {/* Animated metrics gauges */}
          {project.metrics && (
            <div>
              <h4 className="text-sm font-semibold text-white mb-2">Technical quality</h4>

              {/* Mobile: horizontal row with scroll; Desktop: 4-col grid */}
              <div className="sm:hidden -mx-2">
                <div className="flex gap-4 overflow-x-auto px-2">
                  <div className="shrink-0"><Gauge label="Perf" value={project.metrics.performance} active={anim} /></div>
                  <div className="shrink-0"><Gauge label="A11y" value={project.metrics.accessibility} active={anim} /></div>
                  <div className="shrink-0"><Gauge label="BP" value={project.metrics.bestPractices} active={anim} /></div>
                  <div className="shrink-0"><Gauge label="SEO" value={project.metrics.seo} active={anim} /></div>
                </div>
              </div>

              <div className="hidden sm:grid sm:grid-cols-4 sm:gap-4">
                <Gauge label="Perf" value={project.metrics.performance} active={anim} />
                <Gauge label="A11y" value={project.metrics.accessibility} active={anim} />
                <Gauge label="BP" value={project.metrics.bestPractices} active={anim} />
                <Gauge label="SEO" value={project.metrics.seo} active={anim} />
              </div>

              <p className="text-xs text-gray-500 mt-2">Scores are directional; device and network can affect results.</p>
            </div>
          )}

          {/* Stack & tags visible on mobile */}
          <div className="sm:hidden space-y-2">
            {project.stack?.length > 0 && (
              <div>
                <div className="text-xs uppercase tracking-wide text-gray-400 mb-1">Stack</div>
                <div className="flex flex-wrap gap-2">
                  {project.stack.map((s) => (<Badge key={s}>{s}</Badge>))}
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="pt-1 flex flex-wrap gap-2">
            {project.visibility === "public" && project.url && (
              <a
                href={project.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-lime-400 text-black hover:brightness-95 transition"
              >
                View Live Site
              </a>
            )}
            <button
              onClick={onClose}
              className="inline-flex items-center justify-center px-4 py-2 rounded-xl border border-gray-700 hover:bg-[#151515] transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- Card ----------
function ProjectCard({ p, onOpen, onRequestDemo }) {
  const [hover, setHover] = useState(false);
  const isPublic = p.visibility === "public";
  const isTextOnly = p.showcase === "text-only";

  return (
    <article
      className="group relative rounded-2xl border border-gray-800 bg-[#1a1a1a] shadow-sm hover:shadow-lg transition focus-within:ring-2 focus-within:ring-lime-400 min-h-[460px] flex flex-col"
      tabIndex={0}
      onFocus={() => setHover(true)}
      onBlur={() => setHover(false)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {!isTextOnly && (
        <div className="relative aspect-[16/10] rounded-t-2xl overflow-hidden">
          <img
            src={p.cover}
            alt={`${p.title} — homepage preview`}
            className={cn(
              "h-full w-full object-cover transition-opacity",
              hover && p.preview ? "opacity-0" : "opacity-100"
            )}
            loading="lazy"
          />
          {p.preview && (
            <video
              className={cn(
                "absolute inset-0 h-full w-full object-cover transition-opacity",
                hover ? "opacity-100" : "opacity-0"
              )}
              src={p.preview}
              muted
              loop
              playsInline
              preload="metadata"
              onCanPlay={(e) => hover && e.currentTarget.play()}
              onMouseEnter={(e) => e.currentTarget.play()}
              onMouseLeave={(e) => e.currentTarget.pause()}
            />
          )}
          <div className="absolute left-3 top-3 flex gap-2">
            {p.visibility !== "public" && <Badge>Private</Badge>}
            {p.showcase === "anonymized" && <Badge>Anonymized</Badge>}
          </div>
        </div>
      )}

      <div className="p-5 flex flex-col flex-1 gap-3">
        <div className="flex-1 space-y-3">
          {/* Title + client (no stack chips on cards) */}
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-lime-400">{p.title}</h3>
              <p className="text-sm text-gray-400">{p.client ?? "Client name withheld"}</p>
            </div>
          </div>

          {/* Compact summary for quick scan */}
          {p.summary && (
            <p className="text-sm text-gray-400 line-clamp-1">{p.summary}</p>
          )}

          {/* Single outcome line (details live in modal) */}
          {p.outcome && (
            <p className="text-xs text-gray-500 line-clamp-1"><span className="font-semibold text-gray-200">Result:</span> {p.outcome}</p>
          )}

          {/* Single KPI chip (Perf only) */}
          {p.metrics?.performance != null && (
            <div className="text-xs">
              <span className="px-2 py-0.5 rounded bg-[#141414] border border-gray-800 text-gray-300">
                Perf {p.metrics.performance}
              </span>
            </div>
          )}
        </div>

        {/* Actions aligned to bottom */}
        <div className="mt-auto flex items-center gap-2 pt-1 flex-wrap">
          {isPublic && p.url ? (
            <a
              href={p.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg text-sm bg-lime-400 text-black hover:brightness-95"
            >
              View
            </a>
          ) : (
            <button
              onClick={() => onRequestDemo(p)}
              className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg text-sm border border-gray-700 hover:bg-[#222]"
            >
              Request Demo
            </button>
          )}
          <button
            onClick={() => onOpen(p)}
            className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg text-sm border border-gray-700 hover:bg-[#222]"
          >
            Details
          </button>
        </div>

        {p.visibility !== "public" && p.notes && (
          <p className="text-xs text-gray-500">{p.notes}</p>
        )}
      </div>
    </article>
  );
}

// ---------- Page ----------
export default function Portfolio() {
  const PROJECTS = [
    {
      id: "efferent",
      title: "Efferent Labs",
      client: "Efferent Labs",
      visibility: "public",
      showcase: "full",
      url: "https://goliath-app-hz6rj.ondigitalocean.app",
      cover: "/portfolio-1.png",
      preview: null,
      tags: ["Medical", "SaaS"],
      stack: ["Vite", "React", "Tailwind"],
      summary: "Medical device site; primarily frontend, wired for backend auth.",
      problem: "Needed a clean, fast marketing site with auth-ready scaffolding.",
      approach: "Optimized hero, modular sections, OTP-ready routes.",
      outcome: "95+ Lighthouse on desktop; sub-2.0s LCP on mid-range devices.",
      metrics: { performance: 95, accessibility: 100, bestPractices: 100, seo: 98 }
    },
    {
      id: "breezeshooters",
      title: "BreezeShooters HVAC",
      client: "BreezeShooters",
      visibility: "public",
      showcase: "full",
      url: "https://breeze-shooters-app-nt9ww.ondigitalocean.app",
      cover: "/portfolio-2.png",
      preview: null,
      tags: ["HVAC", "Local Service", "Lead Gen"],
      stack: ["Vite", "React", "Tailwind"],
      summary: "HVAC brochure + lead funnel with admin-ready backend.",
      problem: "Mobile visitors weren’t calling or booking.",
      approach: "Sticky CTA bar + service-area pages + speed pass.",
      outcome: "Lead volume up after launch; Lighthouse 95+ mobile.",
      metrics: { performance: 96, accessibility: 100, bestPractices: 100, seo: 98 }
    },
    {
      id: "hittfitt",
      title: "HittFitt",
      client: "HittFitt",
      visibility: "public",
      showcase: "full",
      url: "https://hittfitt.com",
      cover: "/portfolio-3.png",
      preview: null,
      tags: ["Content", "Wellness"],
      stack: ["React", "Tailwind"],
      summary: "Health + wellness tips with future Stripe integration.",
      problem: "Needed a clear content structure with a future paywall.",
      approach: "Modular cards, SEO-friendly structure, clean typography.",
      outcome: "Lightweight pages; strong baseline scores across the board.",
      metrics: { performance: 92, accessibility: 100, bestPractices: 100, seo: 96 }
    },
    {
      id: "gathering",
      title: "The Gathering",
      client: "Camber Media",
      visibility: "public",
      showcase: "full",
      url: "https://thegatheringbook.com",
      cover: "/portfolio-4.png",
      preview: null,
      tags: ["Book", "E-commerce"],
      stack: ["React", "Tailwind"],
      summary: "Book promo with pre-orders and small store.",
      problem: "Needed a conversion-first landing with simple checkout.",
      approach: "Hero CTA + social proof + minimal friction to purchase.",
      outcome: "High-performance landing, clean checkout path.",
      metrics: { performance: 93, accessibility: 98, bestPractices: 100, seo: 95 }
    }
  ];

  const [modal, setModal] = useState(null);
  const [demoProject, setDemoProject] = useState(null);

  // Lock background scroll when any modal is open
  useEffect(() => {
    const html = document.documentElement;
    const prevHtml = html.style.overflow;
    const prevBody = document.body.style.overflow;

    if (modal || demoProject) {
      html.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
    } else {
      html.style.overflow = "";
      document.body.style.overflow = "";
    }

    return () => {
      html.style.overflow = prevHtml;
      document.body.style.overflow = prevBody;
    };
  }, [modal, demoProject]);

  return (
    <section className="bg-[#121212] text-white py-20 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-extrabold text-lime-400 mb-4">Our Portfolio</h1>
          <p className="text-gray-400 max-w-2xl mx-auto leading-relaxed">
            We build fast, creative sites that aren’t cookie-cutter. Some work is private; where links aren’t public, we share anonymized outcomes.
          </p>
        </div>

        {/* Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {PROJECTS.map((p) => (
            <ProjectCard
              key={p.id}
              p={p}
              onOpen={setModal}
              onRequestDemo={setDemoProject}
            />
          ))}
        </div>

        {/* Bottom panels: Tech + Ratings */}
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {/* Tech we use */}
          <div className="rounded-2xl border border-gray-800 bg-[#151515] p-5">
            <h2 className="text-lg font-semibold text-white mb-3">What we build with</h2>
            <div className="text-sm text-gray-300 space-y-2">
              <div>
                <span className="block text-gray-400 text-xs uppercase tracking-wide mb-1">Frontend</span>
                <div className="flex flex-wrap gap-2">
                  <Badge>React</Badge>
                  <Badge>Tailwind</Badge>
                  <Badge>Vite</Badge>
                </div>
              </div>
              <div>
                <span className="block text-gray-400 text-xs uppercase tracking-wide mb-1">Auth & Data</span>
                <div className="flex flex-wrap gap-2">
                  <Badge>Firebase (OTP)</Badge>
                  <Badge>MongoDB</Badge>
                  <Badge>Express / Node</Badge>
                </div>
              </div>
              <div>
                <span className="block text-gray-400 text-xs uppercase tracking-wide mb-1">Payments & More</span>
                <div className="flex flex-wrap gap-2">
                  <Badge>Stripe</Badge>
                  <Badge>Square</Badge>
                </div>
              </div>
            </div>
          </div>

          {/* How to decipher ratings */}
          <div className="rounded-2xl border border-gray-800 bg-[#151515] p-5">
            <h2 className="text-lg font-semibold text-white mb-3">How to decipher ratings</h2>
            <ul className="text-sm text-gray-300 space-y-2">
              <li><span className="font-medium text-gray-100">Perf</span> — Lighthouse performance score (load speed, LCP, etc.).</li>
              <li><span className="font-medium text-gray-100">A11y</span> — Accessibility checks (contrast, semantics, keyboard use).</li>
              <li><span className="font-medium text-gray-100">BP</span> — Best Practices (security, modern APIs, HTTPS, errors).</li>
              <li><span className="font-medium text-gray-100">SEO</span> — Basic technical SEO (meta, links, structure, indexability).</li>
            </ul>
            <p className="text-xs text-gray-500 mt-2">Scores are directional and vary by device/network. Private projects display anonymized metrics.</p>
          </div>
        </div>
      </div>

      {/* Modals */}
      <CaseStudyModal project={modal} onClose={() => setModal(null)} />

      {demoProject && (
        <div
          className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setDemoProject(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="w-full max-w-md bg-[#0f0f0f] text-white rounded-2xl shadow-2xl overflow-hidden border border-gray-800 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-semibold mb-2 text-lime-400">Request a Private Demo</h3>
            <p className="text-gray-300 mb-4">
              We’ll share a walkthrough for <span className="font-semibold">{demoProject.title}</span>.
              Send a quick note via the contact page and we’ll reply with a private link.
            </p>
            <div className="flex gap-2">
              <a
                href="/contact"
                className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-lime-400 text-black hover:brightness-95"
              >
                Go to Contact
              </a>
              <button
                onClick={() => setDemoProject(null)}
                className="inline-flex items-center justify-center px-4 py-2 rounded-xl border border-gray-700 hover:bg-[#151515]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}