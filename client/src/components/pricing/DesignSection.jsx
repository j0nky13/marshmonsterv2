import { motion } from "framer-motion";

export default function DesignSection({ openForm }) {
  const services = [
    {
      title: "Brand Identity",
      desc: "Logo systems, color palettes, typography, and cohesive brand foundations built to scale.",
    },
    {
      title: "Visual Design",
      desc: "Custom layouts, art direction, and interface systems for web, product, and marketing.",
    },
    {
      title: "Creative Strategy",
      desc: "Creative direction and positioning to define tone, narrative, and visual consistency.",
    },
  ];

  return (
    <section className="max-w-6xl mx-auto px-6 py-24 border-t border-white/10">
      {/* Header */}
      <div className="text-center mb-16">
        <div className="text-xs tracking-[0.32em] uppercase text-gray-500 mb-4">
          Design & branding
        </div>

        <h2 className="text-3xl md:text-4xl font-extrabold text-white">
          Systems that look as good as they perform
        </h2>

        <p className="mt-6 text-gray-400 max-w-2xl mx-auto">
          When you’re ready to move beyond templates, we design brands and
          visuals with the same rigor as our software systems.
        </p>
      </div>

      {/* Services */}
      <div className="grid md:grid-cols-3 gap-10">
        {services.map((s, i) => (
          <motion.div
            key={s.title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
            viewport={{ once: true }}
            className="
              border border-white/15
              rounded-3xl
              p-8
              transition
              hover:border-lime-400/60
            "
          >
            <h3 className="text-xl md:text-2xl font-extrabold text-white mb-4">
              {s.title}
            </h3>

            <p className="text-gray-400 leading-relaxed">
              {s.desc}
            </p>
          </motion.div>
        ))}
      </div>

      {/* CTA */}
      <div className="text-center mt-16">
        <button
          onClick={() => openForm("Branding & Design")}
          className="
            inline-flex
            px-8 py-3
            rounded-2xl
            border border-white/20
            font-semibold
            text-white
            transition
            hover:border-lime-400
            hover:text-lime-400
          "
        >
          Discuss design work
        </button>

        <p className="text-xs text-gray-500 mt-3">
          Design engagements are custom-scoped based on goals and deliverables.
        </p>
      </div>
    </section>
  );
}