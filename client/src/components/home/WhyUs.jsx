import { Rocket, Brain, ShieldCheck, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import MotionWrapper from '../common/MotionWrapper';

const features = [
  {
    icon: Rocket,
    title: 'Raw, Purpose-Built Code',
    description: 'Every site is handcrafted using React + Vite + Tailwind. No bloated templates, just clean, scalable code.',
    x: -50,
    duration: 0.6,
  },
  {
    icon: Brain,
    title: 'Monster Engine',
    description: 'Our internal build engine optimizes animation, performance, and responsiveness by default.',
    x: 50,
    duration: 0.7,
  },
  {
    icon: ShieldCheck,
    title: 'Passwordless & Secure',
    description: 'Firebase Auth + IP-restricted panels. Built with security-first logic from day one.',
    x: -50,
    duration: 0.8,
  },
  {
    icon: TrendingUp,
    title: 'SEO & Optimization',
    description: 'Lightning-fast load speeds. Optimized for search engines and conversion from launch.',
    x: 50,
    duration: 0.9,
  },
];

export default function WhyUs() {
  return (
    <div className="overflow-x-hidden">
      <section className="bg-[#1a1a1a] text-gray-200 py-24 md:py-32 px-4 md:px-8">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-12 items-start">
          <div className="lg:col-span-3 text-center">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false }}
              transition={{ duration: 0.6 }}
              className="text-3xl font-bold text-lime-400 mb-4"
            >
              Why Our Tech Stacks Eat Builders Alive
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg max-w-3xl mx-auto"
            >
              Powered by the Monster Engine — built from raw code, not drag-and-drop templates. Designed for speed, scalability, and unmatched control, our stack demolishes the limitations of typical builders.
            </motion.p>
          </div>
          <div className="lg:col-span-3 grid md:grid-cols-2 gap-8 mt-10">
            {features.map((feature, index) => (
              <MotionWrapper key={index} x={feature.x} duration={feature.duration}>
                <div className="bg-[#222] p-6 rounded-xl border border-lime-700">
                  <h3 className="font-semibold text-lime-300 flex items-center gap-2 mb-2">
                    <feature.icon size={20} /> {feature.title}
                  </h3>
                  <p>{feature.description}</p>
                </div>
              </MotionWrapper>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}