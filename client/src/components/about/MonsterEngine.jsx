import { motion } from "framer-motion";
import { Sparkles, Cpu, Server, Cloud, Lock } from "lucide-react";

const GREEN = "#B6F24A";

const systems = [
  {
    title: "Frontend Unit",
    desc: "React, Vite, and Tailwind powering fast, accessible interfaces.",
    icon: Sparkles,
    specs: ["Component-driven UI", "Zero-runtime CSS", "Instant rebuilds"],
  },
  {
    title: "Logic Core",
    desc: "Serverless and API logic built for control and scalability.",
    icon: Cpu,
    specs: ["Isolated functions", "Predictable execution", "Low latency"],
  },
  {
    title: "Data Node",
    desc: "Cloud-hosted MongoDB for flexible, real-time data.",
    icon: Server,
    specs: ["Schema-flexible", "Horizontal scaling", "Fast reads"],
  },
  {
    title: "Auth Gateway",
    desc: "Passwordless authentication with secure OTP flows.",
    icon: Lock,
    specs: ["No passwords stored", "Session isolation", "Role-ready"],
  },
  {
    title: "Deployment Stack",
    desc: "CI/CD pipelines and containerized hosting on DigitalOcean.",
    icon: Cloud,
    specs: ["Atomic deploys", "Rollback-safe", "Edge-ready"],
  },
];

export default function MonsterEngine() {
  return (
    <section className="relative bg-black px-6 py-36 overflow-hidden">
      {/* ambient system glow */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(700px 420px at 50% 48%, rgba(182,242,74,0.10), rgba(0,0,0,0.95) 72%)",
        }}
      />

      <div className="relative max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-28"
        >
          <h2 className="text-4xl md:text-5xl font-extrabold text-white">
            The <span style={{ color: GREEN }}>Monster Engine</span>
          </h2>
          <p className="mt-6 text-gray-400 text-lg max-w-2xl mx-auto">
            A unified system designed to move fast today — and still make sense
            a year from now.
          </p>
        </motion.div>

        {/* Core + Modules */}
        <div className="relative flex flex-col items-center">
          {/* Core */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="relative z-10 rounded-full border border-white/10 bg-black/70 backdrop-blur-xl px-12 py-9 text-center"
          >
            <div
              className="text-xs tracking-[0.32em] uppercase mb-2"
              style={{ color: GREEN }}
            >
              Core System
            </div>
            <div className="text-2xl md:text-3xl font-extrabold text-white">
              Monster Engine
            </div>
          </motion.div>

          {/* Modules */}
          <div className="mt-24 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 w-full">
            {systems.map((s, i) => {
              const Icon = s.icon;
              return (
                <motion.div
                  key={s.title}
                  initial={{ opacity: 0, y: 28 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.06 }}
                  viewport={{ once: false, amount: 0.3 }}
                  className="text-center px-4"
                >
                  <div
                    className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border"
                    style={{
                      borderColor: "rgba(182,242,74,0.28)",
                      background:
                        "radial-gradient(circle at 30% 30%, rgba(182,242,74,0.22), rgba(0,0,0,0.75))",
                    }}
                  >
                    <Icon size={22} color={GREEN} />
                  </div>

                  <div className="text-sm font-semibold text-white">
                    {s.title}
                  </div>

                  <p className="mt-2 text-xs text-gray-400 leading-relaxed">
                    {s.desc}
                  </p>

                  {/* Spec line */}
                  <div className="mt-4 space-y-1">
                    {s.specs.map((spec) => (
                      <div
                        key={spec}
                        className="text-[11px] tracking-wide text-gray-500"
                      >
                        {spec}
                      </div>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Philosophy strip */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.4 }}
          transition={{ duration: 0.6 }}
          className="mt-32 max-w-4xl mx-auto"
        >
          <div className="border-t border-white/10 pt-10 text-center">
            <div className="text-xs tracking-[0.28em] uppercase text-gray-500">
              Design principle
            </div>
            <div className="mt-4 text-2xl md:text-3xl font-extrabold text-white">
              Built once.{" "}
              <span style={{ color: GREEN }}>Evolved forever.</span>
            </div>
            <p className="mt-4 text-gray-400 leading-relaxed max-w-2xl mx-auto">
              Every component is isolated, intentional, and replaceable —
              so your product can grow without collapsing under its own weight.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}