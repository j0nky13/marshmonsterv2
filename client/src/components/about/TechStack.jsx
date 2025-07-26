import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

export default function TechStack() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, margin: '-50px' });

  return (
    <section className="relative py-20 px-6 bg-[#111] overflow-hidden">
      {/* Full-width colorful background code */}
      <div className="absolute inset-0 flex justify-center items-center opacity-10 text-sl md:text-base lg:text-lg font-mono pointer-events-none select-none px-4">
        <pre className="whitespace-pre text-center leading-snug w-full">
          <span className="text-green-400">{`const stack = { frontend: ['React', 'Vite'], styling: ['Tailwind CSS'],`}</span>{'\n'}
          <span className="text-purple-400">{`backend: ['Firebase Functions', 'Express.js'], database: ['MongoDB Atlas'],`}</span>{'\n'}
          <span className="text-blue-400">{`auth: 'OTP with Firebase', engine: 'Monster Engine' };`}</span>{'\n'}
          <span className="text-green-400">{`const stack = { frontend: ['React', 'Vite'], styling: ['Tailwind CSS'],`}</span>{'\n'}
          <span className="text-purple-400">{`backend: ['Firebase Functions', 'Express.js'], database: ['MongoDB Atlas'],`}</span>{'\n'}
          <span className="text-blue-400">{`auth: 'OTP with Firebase', engine: 'Monster Engine' };`}</span>{'\n'}
          <span className="text-green-400">{`const stack = { frontend: ['React', 'Vite'], styling: ['Tailwind CSS'],`}</span>{'\n'}
          <span className="text-purple-400">{`backend: ['Firebase Functions', 'Express.js'], database: ['MongoDB Atlas'],`}</span>{'\n'}
          <span className="text-blue-400">{`auth: 'OTP with Firebase', engine: 'Monster Engine' };`}</span>{'\n'}
        </pre>
      </div>

      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="relative z-10 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center"
      >
        {/* Left Column */}
        <div className="text-center md:text-left">
          <h2 className="text-3xl font-semibold text-lime-400 mb-4">Our Tech Stack</h2>
          <p className="text-lg text-gray-300 leading-relaxed">
            We don’t just build — we engineer for speed and scale. With our custom “Monster Engine,” we skip the page builders and deliver clean, optimized code with unmatched performance.
          </p>
        </div>

        {/* Right Column - Simplified Core Stack */}
        <div className="flex flex-col items-center space-y-4 text-white w-full">
          <h3 className="text-lime-400 text-lg font-semibold mb-4">Monster Engine Core Stack</h3>
          <div className="flex flex-wrap justify-center gap-4">
            <motion.div whileHover={{ scale: 1.1 }} className="bg-lime-600/30 border border-lime-500 rounded-full px-6 py-4 text-xl shadow-md">React</motion.div>
            <motion.div whileHover={{ scale: 1.1 }} className="bg-lime-600/30 border border-lime-500 rounded-full px-6 py-4 text-xl shadow-md">Vite</motion.div>
            <motion.div whileHover={{ scale: 1.1 }} className="bg-lime-600/30 border border-lime-500 rounded-full px-6 py-4 text-xl shadow-md">Tailwind CSS</motion.div>
            <motion.div whileHover={{ scale: 1.1 }} className="bg-lime-600/30 border border-lime-500 rounded-full px-6 py-4 text-xl shadow-md">Firebase Auth</motion.div>
            <motion.div whileHover={{ scale: 1.1 }} className="bg-lime-600/30 border border-lime-500 rounded-full px-6 py-4 text-xl shadow-md">MongoDB Atlas</motion.div>
            <motion.div whileHover={{ scale: 1.1 }} className="bg-lime-600/30 border border-lime-500 rounded-full px-6 py-4 text-xl shadow-md">Firebase Functions</motion.div>
            <motion.div whileHover={{ scale: 1.1 }} className="bg-lime-600/30 border border-lime-500 rounded-full px-6 py-4 text-xl shadow-md">Express.js</motion.div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
