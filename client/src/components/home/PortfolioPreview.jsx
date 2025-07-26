import { motion } from "framer-motion";

export default function PortfolioPreview() {
  return (
    <section className="bg-[#1a1a1a] text-white py-20 px-6">
      <div className="max-w-6xl mx-auto text-center">
        <motion.h2
          className="text-3xl font-bold text-lime-400 mb-4"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 0.6 }}
        >
          Our Work
        </motion.h2>
        <motion.p
          className="text-gray-400 mb-8"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Real sites. Real results.
        </motion.p>
        <div className="grid md:grid-cols-3 gap-6">
          <a href="#" className="block bg-[#2a2a2a] rounded-lg overflow-hidden transform hover:scale-105 transition duration-300">
            <img src="/images/project-a.jpg" alt="Project A" className="w-full h-48 object-cover" />
            <div className="p-4 text-left">
              <h3 className="text-xl font-semibold text-white">Project A</h3>
            </div>
          </a>
          <a href="#" className="block bg-[#2a2a2a] rounded-lg overflow-hidden transform hover:scale-105 transition duration-300">
            <img src="/images/project-b.jpg" alt="Project B" className="w-full h-48 object-cover" />
            <div className="p-4 text-left">
              <h3 className="text-xl font-semibold text-white">Project B</h3>
            </div>
          </a>
          <a href="#" className="block bg-[#2a2a2a] rounded-lg overflow-hidden transform hover:scale-105 transition duration-300">
            <img src="/images/project-c.jpg" alt="Project C" className="w-full h-48 object-cover" />
            <div className="p-4 text-left">
              <h3 className="text-xl font-semibold text-white">Project C</h3>
            </div>
          </a>
        </div>
      </div>
    </section>
  )
}