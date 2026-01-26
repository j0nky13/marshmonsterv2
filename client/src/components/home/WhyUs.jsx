import {
  Brain,
  ShieldCheck,
  Rocket,
  Cpu,
  TrendingUp,
} from "lucide-react";
import { motion } from "framer-motion";

const GREEN = "#B6F24A";

const slides = [
  {
    icon: Brain,
    title: "Built With Intention",
    description:
      "We don’t start with templates or shortcuts. Every system is designed with a clear purpose and built to do exactly what it needs to do — nothing more, nothing less.",
  },
  {
    icon: Rocket,
    title: "Performance That Matters",
    description:
      "Fast load times and smooth interactions keep people engaged. When things feel instant, trust goes up and friction disappears.",
  },
  {
    icon: ShieldCheck,
    title: "Protection From the Start",
    description:
      "We think about safety early so you don’t have to fix it later. Clean access, sensible defaults, and fewer points of failure.",
  },
  {
    icon: Cpu,
    title: "An Engine Behind the Scenes",
    description:
      "We use an internal system that helps us move faster without locking you into rigid patterns or limiting future growth.",
  },
];

const sectionMotion = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      delay: 0.25,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

export default function WhyUs() {
  return (
    <section className="bg-black text-white snap-y snap-mandatory scroll-smooth">
      {slides.map((slide, i) => {
        const Icon = slide.icon;

        return (
          <section
            key={i}
            className="relative min-h-screen flex items-center justify-center px-6 snap-start snap-always"
          >
            {/* STATIC WATERMARK */}
            <motion.div
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              initial={{ opacity: 0, scale: 0.92 }}
              whileInView={{ opacity: 0.08, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
              viewport={{ once: false, margin: "-120px" }}
              style={{ transform: "translateX(-10%)" }}
            >
              <Icon
                size={620}
                strokeWidth={1}
                color={GREEN}
                style={{
                  filter: "drop-shadow(0 0 90px rgba(182,242,74,0.25))",
                }}
              />
            </motion.div>

            {/* CONTENT */}
            <motion.div
              className="relative z-10 max-w-3xl text-center"
              variants={sectionMotion}
              initial="hidden"
              whileInView="show"
              exit={{ opacity: 0, y: 12 }}
              viewport={{ once: false, margin: "-120px" }}
            >
              <h2 className="text-3xl md:text-5xl font-extrabold leading-tight mb-6">
                {slide.title}
              </h2>

              <div
                className="h-px w-16 mx-auto mb-8"
                style={{ backgroundColor: GREEN }}
              />

              <p className="text-lg text-slate-300 max-w-xl mx-auto">
                {slide.description}
              </p>
            </motion.div>
          </section>
        );
      })}

      {/* FINAL SUMMARY */}
      <section className="relative min-h-screen flex items-center justify-center px-6 snap-start snap-always">
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        </div>

        <motion.div
          className="relative z-10 max-w-4xl text-center"
          variants={sectionMotion}
          initial="hidden"
          whileInView="show"
          exit={{ opacity: 0, y: 12 }}
          viewport={{ once: false, margin: "-120px" }}
        >
          <h3 className="text-4xl md:text-5xl font-extrabold mb-6">
            This isn’t a stack. It’s an engine.
          </h3>

          <p className="text-lg text-slate-300 max-w-2xl mx-auto mb-12">
            Every decision compounds. Performance, safety, motion, and
            conversion are designed together — not patched in later.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 text-sm text-slate-300">
            <div className="flex flex-col items-center gap-2">
              <Brain size={20} color={GREEN} />
              Purpose-Built
            </div>
            <div className="flex flex-col items-center gap-2">
              <Cpu size={20} color={GREEN} />
              Engine-Driven
            </div>
            <div className="flex flex-col items-center gap-2">
              <ShieldCheck size={20} color={GREEN} />
              Secure by Default
            </div>
            <div className="flex flex-col items-center gap-2">
              <TrendingUp size={20} color={GREEN} />
              Built to Convert
            </div>
          </div>
        </motion.div>
      </section>
    </section>
  );
}