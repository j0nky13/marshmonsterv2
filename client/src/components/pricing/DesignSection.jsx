import { motion } from "framer-motion";

export default function DesignSection({ openForm }) {
  const services = [
    {
      title: "Brand Identity",
      desc: "Logo systems, color palettes, typography, and complete brand kits.",
    },
    {
      title: "Visual Design",
      desc: "Custom layouts, art direction, and design systems for web & print.",
    },
    {
      title: "Creative Strategy",
      desc: "Workshops and creative direction to define your tone and style.",
    },
  ];

  return (
    <section className="max-w-6xl mx-auto px-6 py-20 border-t border-lime-700/30">
      <h2 className="text-3xl md:text-4xl font-bold text-lime-400 text-center mb-4">
        Design & Branding
      </h2>
      <p className="text-gray-300 text-center max-w-2xl mx-auto mb-12">
        When you’re ready to elevate beyond templates — our creative team builds brands and visuals that stand out and last.
      </p>

      <div className="grid md:grid-cols-3 gap-8">
        {services.map((s, i) => (
          <motion.div
            key={s.title}
            className="bg-[#1f1f1f] border border-lime-700 rounded-2xl p-8 hover:border-lime-400 transition-all shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h3 className="text-2xl font-bold text-lime-400 mb-3">{s.title}</h3>
            <p className="text-gray-300 mb-4">{s.desc}</p>
          </motion.div>
        ))}
      </div>

      <div className="text-center mt-12">
        <button
          onClick={() => openForm("Branding & Identity")}
          className="bg-lime-400 hover:bg-lime-300 text-black font-bold py-3 px-8 rounded shadow-md hover:shadow-xl transition-all"
        >
          Request Custom Quote
        </button>
        <p className="text-xs text-gray-400 mt-2">
          All design services are custom-quoted based on scope and deliverables.
        </p>
      </div>
    </section>
  );
}