import { motion, AnimatePresence } from 'framer-motion'
import { useRef, useState, useEffect } from 'react'

export default function Pricing() {
  // --------- PLAN DATA (hybrid pricing: starting-at + clear features)
  const plans = [
    {
      name: 'Starter',
      badge: 'Best for quick wins',
      price: 'Starting at $499',
      cta: 'Start Starter',
      highlight: false,
      features: [
        'Single-page site or landing page',
        'Mobile responsive + fast load',
        'Basic SEO + Google Analytics',
        'Deployed & hosted for 12 months',
        '1 round of revisions',
      ],
    },
    {
      name: 'Growth',
      badge: 'Most Popular',
      price: '$899–$1,499',
      cta: 'Start Growth',
      highlight: true,
      features: [
        '3–6 page site (Home, About, Services, Contact, etc.)',
        'Custom design + copy guidance',
        'SEO setup + analytics dashboard',
        'Booking, forms, or basic e‑commerce',
        '3 rounds of revisions',
        '14‑day launch guarantee*',
      ],
    },
    {
      name: 'Monster',
      badge: 'Custom & scalable',
      price: '$1,999+',
      cta: 'Talk Monster',
      highlight: false,
      features: [
        'Unlimited pages & custom components',
        'Stripe, memberships, or advanced e‑commerce',
        'Admin dashboard & role‑based access',
        'Integrations (HCP, Mail, CRM, automations)',
        'Priority support & ongoing optimization',
      ],
    },
  ]

  const addOns = [
    { title: 'Stripe Payments', desc: 'Checkout, subscriptions, invoices', price: '+$250–$600' },
    { title: 'SEO Sprint', desc: 'Keyword mapping, on‑page fixes, schema', price: '+$300' },
    { title: 'Local SEO', desc: 'GBP setup, citations, reviews engine', price: '+$350' },
    { title: 'CMS/Dashboard', desc: 'Client‑editable sections & media', price: '+$400–$900' },
    { title: 'Animations', desc: 'On‑scroll + micro‑interactions', price: '+$150–$500' },
    { title: 'Hosting + Care', desc: 'Monitoring, updates, backups', price: '$39/mo' },
  ]

  const faqs = [
    {
      q: 'How long does a project take?',
      a: 'Starter launches in 3–7 days. Growth typically lands in 7–14 days. Monster depends on scope but we work in weekly sprints so you see progress fast.',
    },
    {
      q: 'Do you offer hosting?',
      a: 'Yes — first 12 months are included on most builds. After that, Hosting + Care is $39/mo for updates, monitoring, and backups.',
    },
    {
      q: 'What if I need changes later?',
      a: 'Every plan includes revisions. After launch, you can book changes ad‑hoc or keep us on with a monthly care plan.',
    },
    {
      q: 'Can I upgrade later?',
      a: 'Absolutely. Many clients start on Starter or Growth and upgrade to Monster features as the business scales.',
    },
    {
      q: 'What do you need to start?',
      a: 'Your logo (if available), brand vibe, a few reference sites, and basic copy or bullet points. We guide you through everything else.',
    },
  ]

  // --------- UI STATE
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const plansRef = useRef(null)

  const openForm = (planName = null) => {
    setSelectedPlan(planName)
    setModalOpen(true)
  }
  const closeForm = () => {
    setModalOpen(false)
    setSelectedPlan(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    const formData = new FormData(e.target)
    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      message: formData.get('message'),
      plan: selectedPlan || formData.get('plan') || 'General',
    }
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (response.ok) {
        alert('Thanks! We’ll get back to you shortly.')
        closeForm()
      } else {
        alert('Failed to send. Please try again.')
      }
    } catch (error) {
      alert('An error occurred. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const scrollToPlans = () => {
    plansRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  // Prevent body scroll when modal open
  useEffect(() => {
    if (modalOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => (document.body.style.overflow = '')
  }, [modalOpen])

  // --------- ANIMATION HELPERS
  const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  }
  // Staggered reveal variants
  const gridVariants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.08, delayChildren: 0.05 }
    }
  }
  const cardVariants = {
    hidden: { opacity: 0, y: 28, rotateX: -6 },
    visible: {
      opacity: 1,
      y: 0,
      rotateX: 0,
      transition: { type: 'spring', stiffness: 240, damping: 26 }
    },
    hover: {
      y: -6,
      scale: 1.02,
      transition: { type: 'spring', stiffness: 260, damping: 18 }
    }
  }
  const listVariants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.04, delayChildren: 0.15 }
    }
  }
  const listItemVariants = {
    hidden: { opacity: 0, x: -8 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.25 } }
  }

  return (
    <section className="bg-gradient-to-b from-[#121212] to-[#1a1a1a] text-white">
      {/* HERO */}
      <div className="max-w-6xl mx-auto px-6 pt-20 pb-10 text-center">
        <motion.h1
          className="text-5xl md:text-6xl font-extrabold text-lime-400 tracking-tight"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
        >
          Simple, transparent pricing.
        </motion.h1>
        <motion.p
          className="text-gray-300 mt-4 max-w-2xl mx-auto"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.1 }}
        >
          Pick a plan now or book a quick call. No hidden fees. Cancel anytime.
        </motion.p>
        <motion.div
          className="flex flex-col sm:flex-row gap-3 justify-center mt-8"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.2 }}
        >
          <button
            onClick={() => openForm('General')}
            className="bg-lime-400 hover:bg-lime-300 text-black font-bold py-3 px-6 rounded shadow-md hover:shadow-xl transition-all"
          >
            Book a 10‑min Call
          </button>
          <button
            onClick={scrollToPlans}
            className="border border-lime-500/70 hover:border-lime-300 text-lime-300 hover:text-black hover:bg-lime-300 font-semibold py-3 px-6 rounded transition-all"
          >
            Compare Plans
          </button>
        </motion.div>
      </div>


      {/* PRICING TABLE */}
      <div ref={plansRef} className="max-w-6xl mx-auto px-6 pb-6">
        <motion.h2
          className="text-3xl md:text-4xl font-bold text-center mb-10"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          Choose your build
        </motion.h2>

        <motion.div
          className="grid gap-8 md:grid-cols-3"
          variants={gridVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              style={{ transformStyle: 'preserve-3d' }}
              className={`w-full max-w-[26rem] mx-auto bg-[#1f1f1f] border rounded-2xl p-6 md:p-8 shadow-lg md:hover:shadow-2xl transition-transform md:hover:scale-[1.03] overflow-hidden flex flex-col ${
                plan.highlight
                  ? 'border-lime-400 md:ring-1 md:ring-lime-400/40 md:relative md:-my-3'
                  : 'border-lime-700'
              }`}
              variants={cardVariants}
              whileHover="hover"
            >
              {/* Badge */}
              <div className="mb-2 md:mb-3 h-6">
                {plan.badge && (
                  <motion.span
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-lime-400 text-black"
                    initial={{ scale: 0.9, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ type: 'spring', stiffness: 300, damping: 18 }}
                  >
                    {plan.badge}
                  </motion.span>
                )}
              </div>

              <motion.h3
                className="text-2xl md:text-3xl font-extrabold text-lime-400"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.25 }}
              >
                {plan.name}
              </motion.h3>
              <motion.p
                className="text-xl md:text-2xl font-bold mt-1"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.25, delay: 0.05 }}
              >
                {plan.price}
              </motion.p>

              <motion.ul
                className="mt-5 space-y-2 md:space-y-3 text-gray-300 flex-1"
                variants={listVariants}
              >
                {plan.features.map((f, i) => (
                  <motion.li key={i} className="flex gap-2 items-start" variants={listItemVariants}>
                    <span className="text-lime-400">✔</span>
                    <span>{f}</span>
                  </motion.li>
                ))}
              </motion.ul>

              <motion.div className="mt-8" initial={{ opacity: 0, y: 6 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                <button
                  onClick={() => openForm(plan.name)}
                  className={`w-full relative overflow-hidden font-bold py-3 px-6 rounded transition-all ${
                    plan.highlight
                      ? 'bg-lime-400 hover:bg-lime-300 text-black shadow-md hover:shadow-xl'
                      : 'border border-lime-500/70 hover:border-lime-300 text-lime-300 hover:text-black hover:bg-lime-300'
                  }`}
                >
                  {plan.cta}
                </button>
              </motion.div>

              {plan.name === 'Growth' && (
                <p className="text-xs text-gray-400 mt-3 italic">
                  *14‑day launch guarantee assumes timely content delivery and approvals.
                </p>
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* ADD‑ONS */}
      <div className="max-w-6xl mx-auto px-6 mt-16">
        <motion.h3
          className="text-2xl md:text-3xl font-bold text-center mb-6"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          Add‑ons & upgrades
        </motion.h3>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
          {addOns.map((a, i) => (
            <motion.div
              key={a.title}
              className="bg-[#1f1f1f] border border-lime-700 rounded-xl p-5 hover:border-lime-400 transition-colors"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.03 }}
            >
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">{a.title}</h4>
                <span className="text-sm text-gray-400">{a.price}</span>
              </div>
              <p className="text-gray-300 mt-2">{a.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className="max-w-5xl mx-auto px-6 mt-16">
        <motion.h3
          className="text-2xl md:text-3xl font-bold text-center mb-6"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          FAQs
        </motion.h3>
        <div className="divide-y divide-white/10 bg-[#1f1f1f] border border-lime-700 rounded-2xl overflow-hidden">
          {faqs.map((item, idx) => (
            <details key={idx} className="group">
              <summary className="flex justify-between items-center cursor-pointer list-none p-5 hover:bg-white/5">
                <span className="font-medium">{item.q}</span>
                <span className="transition-transform group-open:rotate-45 text-lime-400 text-2xl leading-none">+</span>
              </summary>
              <div className="p-5 pt-0 text-gray-300">{item.a}</div>
            </details>
          ))}
        </div>
      </div>

      {/* FINAL CTA */}
      <div className="max-w-6xl mx-auto px-6 mt-16 pb-24">
        <div className="bg-gradient-to-r from-lime-500/20 to-lime-400/10 border border-lime-500/40 rounded-2xl p-8 text-center">
          <h3 className="text-2xl md:text-3xl font-extrabold text-lime-300">
            Ready to move fast?
          </h3>
          <p className="text-gray-300 mt-2">
            Kick off with Starter today or book a quick call for a custom Monster build.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
            <button
              onClick={() => openForm('Starter')}
              className="bg-lime-400 hover:bg-lime-300 text-black font-bold py-3 px-6 rounded shadow-md hover:shadow-xl transition-all"
            >
              Start Starter
            </button>
            <button
              onClick={() => openForm('Monster')}
              className="border border-lime-500/70 hover:border-lime-300 text-lime-300 hover:text-black hover:bg-lime-300 font-semibold py-3 px-6 rounded transition-all"
            >
              Talk Monster
            </button>
          </div>
        </div>
      </div>

      {/* MODAL */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-[#1f1f1f] p-6 rounded-2xl shadow-xl w-full max-w-md relative border border-lime-700"
              initial={{ scale: 0.96, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 26 }}
            >
              <button
                className="absolute top-3 right-3 text-white/80 text-2xl leading-none hover:text-white"
                onClick={closeForm}
                aria-label="Close"
              >
                ×
              </button>

              <h2 className="text-2xl font-bold text-lime-400 mb-1">
                {selectedPlan ? `Start ${selectedPlan}` : 'Let’s get started'}
              </h2>
              <p className="text-gray-400 mb-4">
                Tell us a bit about your project and we’ll reply quickly.
              </p>

              <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                {!selectedPlan && (
                  <select
                    name="plan"
                    className="px-4 py-2 rounded bg-[#2a2a2a] text-white border border-white/10"
                    defaultValue=""
                    required
                  >
                    <option value="" disabled>
                      Choose a plan
                    </option>
                    {plans.map((p) => (
                      <option key={p.name} value={p.name}>
                        {p.name}
                      </option>
                    ))}
                    <option value="General">Not sure yet</option>
                  </select>
                )}
                <input
                  name="name"
                  type="text"
                  placeholder="Your Name"
                  className="px-4 py-2 rounded bg-[#2a2a2a] text-white border border-white/10"
                  required
                />
                <input
                  name="email"
                  type="email"
                  placeholder="Your Email"
                  className="px-4 py-2 rounded bg-[#2a2a2a] text-white border border-white/10"
                  required
                />
                <textarea
                  name="message"
                  placeholder="Project details, goals, timeline"
                  rows="4"
                  className="px-4 py-2 rounded bg-[#2a2a2a] text-white border border-white/10"
                ></textarea>

                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-lime-400 hover:bg-lime-300 disabled:opacity-70 disabled:cursor-not-allowed text-black font-bold py-2.5 rounded transition-all"
                >
                  {submitting ? 'Sending…' : 'Submit'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}