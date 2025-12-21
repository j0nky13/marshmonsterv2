import {
  Rocket,
  Brain,
  ShieldCheck,
  TrendingUp,
  ChevronDown,
} from "lucide-react";
import {
  motion,
  useScroll,
  useTransform,
  useInView,
} from "framer-motion";
import { useRef } from "react";

const GREEN = "#B6F24A";

const features = [
  {
    icon: Rocket,
    title: "Raw, Purpose-Built Code",
    description:
      "No templates. No drag-and-drop. Every project is engineered from scratch using modern frameworks and deliberate architecture.",
  },
  {
    icon: Brain,
    title: "Monster Engine",
    description:
      "Our internal build system accelerates animation, performance, and responsiveness without sacrificing control or flexibility.",
  },
  {
    icon: ShieldCheck,
    title: "Security by Default",
    description:
      "Passwordless authentication, locked-down admin panels, and infrastructure designed with security-first thinking.",
  },
  {
    icon: TrendingUp,
    title: "Performance That Converts",
    description:
      "Fast load times, clean DOMs, and SEO-aware structure — because speed isn’t a feature, it’s the baseline.",
  },
];

export default function WhyUs() {
  const sectionRef = useRef(null);
  const endRef = useRef(null);

  /* Section presence (controls dots) */
  const sectionInView = useInView(sectionRef, {
    margin: "-25% 0px -25% 0px",
  });

  /* Scroll progress for dot emphasis */
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  return (
    <section
      ref={sectionRef}
      className="relative bg-black text-white overflow-hidden"
    >
      {/* FIXED SCROLL DOTS — ONLY WHILE SECTION IS ACTIVE */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: sectionInView ? 1 : 0 }}
        transition={{ duration: 0.4 }}
        className="hidden md:flex fixed right-6 top-1/2 -translate-y-1/2 z-30 flex-col gap-4 pointer-events-none"
      >
        {features.map((_, i) => {
          const start = i / features.length;
          const end = (i + 1) / features.length;

          const opacity = useTransform(
            scrollYProgress,
            [start - 0.08, start, end + 0.08],
            [0.25, 1, 0.25]
          );

          const scale = useTransform(
            scrollYProgress,
            [start, end],
            [1, 1.6]
          );

          return (
            <motion.span
              key={i}
              style={{
                opacity,
                scale,
                backgroundColor: GREEN,
              }}
              className="h-2.5 w-2.5 rounded-full"
            />
          );
        })}
      </motion.div>

      {/* FEATURE SECTIONS */}
      {features.map((feature) => {
        const Icon = feature.icon;

        return (
          <motion.div
            key={feature.title}
            className="min-h-[70vh] flex items-center justify-center px-6 md:px-12"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, margin: "-120px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="max-w-4xl w-full">
              <div className="mb-4">
                <Icon size={36} color={GREEN} />
              </div>

              <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-[1.05] mb-4">
                {feature.title}
              </h2>

              <div
                className="h-px w-20 mb-6"
                style={{ backgroundColor: GREEN }}
              />

              <p className="text-lg md:text-xl text-slate-300 max-w-xl">
                {feature.description}
              </p>
            </div>
          </motion.div>
        );
      })}

      {/* ENGINE SUMMARY */}
      <motion.div
        ref={endRef}
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.4 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="mt-32 max-w-6xl mx-auto px-6 pb-20"
      >
        <div className="rounded-3xl bg-black/70 backdrop-blur-xl px-12 py-20 text-center">
          <h3 className="text-4xl md:text-5xl font-extrabold text-white mb-6">
            This isn’t a stack.{" "}
            <span style={{ color: GREEN }}>It’s an engine.</span>
          </h3>

          <p className="text-lg text-slate-300 max-w-2xl mx-auto mb-16">
            Every decision compounds. Performance, security, animation, and
            conversion are engineered together — not patched in later.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-14 text-base">
            <div className="flex flex-col items-center gap-3 text-slate-300">
              <Rocket size={22} color={GREEN} />
              Raw Code
            </div>
            <div className="flex flex-col items-center gap-3 text-slate-300">
              <Brain size={22} color={GREEN} />
              Monster Engine
            </div>
            <div className="flex flex-col items-center gap-3 text-slate-300">
              <ShieldCheck size={22} color={GREEN} />
              Secure by Default
            </div>
            <div className="flex flex-col items-center gap-3 text-slate-300">
              <TrendingUp size={22} color={GREEN} />
              Built to Convert
            </div>
          </div>
        </div>
      </motion.div>

      {/* DOWN ARROW — APPEARS ONLY AT SECTION END */}
      <motion.div
        initial={{ opacity: 0, y: 0 }}
        whileInView={{ opacity: 1, y: 16 }}
        viewport={{ once: true, margin: "-120px" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex justify-center pb-16"
      >
        <ChevronDown
          size={30}
          color={GREEN}
          className="animate-bounce"
        />
      </motion.div>
    </section>
  );
}