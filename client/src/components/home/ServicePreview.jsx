import { motion } from 'framer-motion'
import { Code, Globe, Rocket } from 'lucide-react'
import ServiceCard from './ServiceCard'

export default function ServicePreview() {
  const services = [
    {
      title: 'Custom Websites',
      icon: <Code color="#97FF00" />,
      description: 'Tailored designs with performance-first code. Built in React/Vite — no bloat.',
    },
    {
      title: 'E-Commerce Setup',
      icon: <Globe color="#97FF00" />,
      description: 'Frontend and backend e-commerce builds. Fast, secure, and custom branded.',
    },
    {
      title: 'Site Optimization',
      icon: <Rocket color="#97FF00" />,
      description: 'Take your slow site and give it Marsh Monster speed — sub 1s load times.',
    },
    {
      title: 'SEO',
      icon: <Rocket color="#97FF00" />,
      description: 'Technical SEO, metadata structuring, and fast-loading builds to boost ranking.',
    },
  ]

  return (
    <section
      className="bg-[#121212] py-24 px-6 overflow-x-hidden"
      data-aos="fade-up"
      data-aos-duration="800"
    >
      <div className="max-w-6xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.6 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <p className="text-lg text-gray-300 mb-2">What We Do</p>
          <h2 className="text-4xl font-bold text-lime-400 mb-6">We Build Web Experiences, Not Templates</h2>
          <p className="text-gray-400 max-w-3xl mx-auto mb-10">
            Marsh Monster doesn’t just build websites — we engineer complete digital ecosystems.
            From lightning-fast custom builds to fully branded e-commerce systems and SEO that ranks,
            we make every line of code count. Whether you're scaling up or starting fresh, we're built
            for speed, style, and long-term success.
          </p>
        </motion.div>
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4 justify-center">
          {services.map((service, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: idx % 2 === 0 ? -60 : 60 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false, amount: 0.5 }}
              transition={{ duration: 0.6, ease: 'easeOut', delay: idx * 0.1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="rounded-xl shadow-lg h-full"
            >
              <div className="h-full min-h-[250px] flex items-stretch">
                <ServiceCard {...service} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}