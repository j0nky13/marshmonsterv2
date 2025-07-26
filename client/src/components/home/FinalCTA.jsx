import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function FinalCTA() {
  return (
    <section className="bg-neutral-900 text-white py-20 px-6 text-center">
      <motion.h2
        className="text-3xl font-bold mb-6 text-lime-400"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.3 }}
        transition={{ duration: 0.6 }}
      >
        Ready to Build Something Monster-Level?
      </motion.h2>
      <motion.p
        className="text-lg text-gray-400 mb-8"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.3 }}
        transition={{ duration: 0.7, delay: 0.1 }}
      >
        Let's turn your vision into a beast of a website.
      </motion.p>
      <Link to="/contact">
        <button className="px-6 py-3 bg-lime-400 text-black font-semibold rounded hover:bg-lime-300 transition-all shadow-lg shadow-lime-400/50 animate-pulse">
          Contact Us
        </button>
      </Link>
    </section>
  );
}