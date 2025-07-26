import { motion } from 'framer-motion'
import { useState } from 'react'

export default function Pricing() {
  const plans = [
    {
      name: 'Basic',
      price: '$499',
      features: ['1 Page', 'Mobile Responsive', 'Deployed & Hosted', '1 Round of Revisions'],
    },
    {
      name: 'Pro',
      price: '$999',
      features: ['Up to 5 Pages', 'Custom Design', 'Fast Performance', '3 Rounds of Revisions'],
    },
    {
      name: 'Monster',
      price: '$1499+',
      features: ['Unlimited Pages', 'Custom Features & Integrations', 'E-Commerce Ready', 'Priority Support'],
    },
  ]
  const [selectedPlan, setSelectedPlan] = useState(null)

  const openForm = (planName) => {
    setSelectedPlan(planName)
  }
  const closeForm = () => {
    setSelectedPlan(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      message: formData.get('message'),
    }
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
      if (response.ok) {
        alert('Message sent successfully!')
        closeForm()
      } else {
        alert('Failed to send message.')
      }
    } catch (error) {
      alert('An error occurred. Please try again.')
    }
  }

  return (
    <section className="bg-gradient-to-b from-[#121212] to-[#1a1a1a] text-white py-20 px-6">
      <div className="max-w-6xl mx-auto text-center">
        <h1 className="text-5xl font-extrabold text-lime-400 mb-8 tracking-tight">Pricing</h1>
        <p className="text-gray-400 mb-12">Custom work. Transparent pricing. No surprise costs.</p>
        <div className="grid gap-8 md:grid-cols-3">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              layout
              className={`w-full max-w-xs bg-[#1f1f1f] border border-lime-700 rounded-xl p-8 shadow-lg hover:shadow-2xl hover:shadow-lime-500/40 transition-transform hover:scale-[1.15] hover:border-lime-400 relative overflow-hidden group before:absolute before:inset-0 before:rounded-xl before:border before:border-lime-500 before:opacity-0 group-hover:before:opacity-30 before:animate-pulse transition-all duration-300 ease-out mx-auto flex flex-col h-full justify-between ${index === 1 ? 'md:-my-4' : ''}`}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                type: 'spring',
                stiffness: 500,
                damping: 30,
                delay: index * 0.1
              }}
            >
              <h2 className="text-3xl font-bold text-lime-400 mb-2 drop-shadow">{plan.name}</h2>
              <p className="text-3xl font-extrabold mb-4">{plan.price}</p>
              <ul className="pl-6 pr-6 space-y-3 text-gray-300 mb-6 text-left leading-relaxed">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center justify-start gap-2">
                    <span className="text-lime-400">✔</span> <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-auto flex justify-center">
                <button
                  onClick={() => openForm(plan.name)}
                  className="relative overflow-hidden bg-lime-400 hover:bg-lime-300 text-black font-bold py-2.5 px-6 rounded shadow-md hover:shadow-xl transition-all duration-300 ease-in-out group"
                >
                  <span className="z-10 relative">Start This Plan</span>
                  <span className="absolute inset-0 bg-lime-200 opacity-0 group-hover:opacity-20 transition duration-300 rounded-full blur-lg animate-pulse" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
        {selectedPlan && (
          <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-[#1f1f1f] p-6 rounded-xl shadow-xl max-w-md w-full relative">
              <button
                className="absolute top-2 right-2 text-white text-xl"
                onClick={closeForm}
              >
                ×
              </button>
              <h2 className="text-2xl font-bold text-lime-400 mb-4">Start {selectedPlan} Plan</h2>
              <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                <input name="name" type="text" placeholder="Your Name" className="px-4 py-2 rounded bg-[#2a2a2a] text-white" />
                <input name="email" type="email" placeholder="Your Email" className="px-4 py-2 rounded bg-[#2a2a2a] text-white" />
                <textarea name="message" placeholder="Project Details" rows="4" className="px-4 py-2 rounded bg-[#2a2a2a] text-white"></textarea>
                <button type="submit" className="bg-lime-400 hover:bg-lime-300 text-black font-bold py-2 rounded transition-all duration-300">
                  Submit
                </button>
              </form>
            </div>
          </div>
        )}
        <p className="text-sm text-gray-400 mt-6 italic">
          Need more? Add-on services like SEO, extra revisions, and animations are available.
        </p>
      </div>
    </section>
  )
}