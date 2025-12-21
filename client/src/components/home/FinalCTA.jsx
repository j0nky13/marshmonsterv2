import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function FinalCTA() {
  return (
    <section className="bg-black text-white py-24 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          className="rounded-3xl border border-white/10 bg-black/70 backdrop-blur-xl px-8 py-14 text-center shadow-xl"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <motion.h2
            className="text-3xl md:text-4xl font-extrabold mb-6 text-lime-400"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.6 }}
          >
            Ready to Build Something Monster-Level?
          </motion.h2>

          <motion.p
            className="text-lg text-gray-400 mb-10"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            Let’s turn your vision into a beast of a website.
          </motion.p>

          <Link to="/contact">
            <button
              className="px-8 py-3 rounded-2xl font-semibold text-black transition-all
                         bg-lime-400 hover:bg-lime-300
                         shadow-[0_0_30px_rgba(163,230,53,0.35)]"
            >
              Contact Us
            </button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}