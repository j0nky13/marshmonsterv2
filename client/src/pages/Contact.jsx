import { useState } from 'react'
// Formspree endpoint (set VITE_FORMSPREE_ENDPOINT in production)
const FORMSPREE_ENDPOINT = import.meta.env.VITE_FORMSPREE_ENDPOINT || 'https://formspree.io/f/mnngdpny'

export default function Contact() {
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)

    const payload = {
      name: formData.get('name'),
      email: formData.get('email'),
      message: formData.get('message'),
      _subject: 'Marsh Monster — Contact Page',
      _gotcha: formData.get('company') || '', // honeypot
      page: typeof window !== 'undefined' ? window.location.pathname : '/contact',
    }

    try {
      const response = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (response.ok) {
        setSubmitted(true)
      } else {
        const text = await response.text().catch(() => '')
        console.error(`Failed to send message (${response.status}):`, text)
      }
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  return (
    <section className="bg-[#121212] text-white py-20 px-6">
      <div className="max-w-6xl mx-auto flex justify-center gap-12 items-start">
        {/* Main Contact Form */}
        <div className="w-full max-w-2xl">
          <h1 className="text-4xl font-bold text-lime-400 text-center mb-6">Let’s Talk</h1>
          <p className="text-center text-gray-400 mb-10">
            We'll reach out within 24 hours. Your message is securely delivered to our team.
          </p>
          {!submitted ? (
            <form
              onSubmit={handleSubmit}
              className="space-y-6 max-w-2xl mx-auto"
            >
              <div className="relative">
                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder=" "
                  required
                  className="peer w-full bg-[#1e1e1e] border border-gray-700 rounded p-3 pt-5 text-white focus:outline-none focus:border-lime-400"
                />
                <label
                  htmlFor="name"
                  className="absolute left-3 top-3 text-sm text-gray-400 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-sm peer-focus:top-1 peer-focus:text-xs peer-focus:text-lime-400"
                >
                  Name
                </label>
              </div>
              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder=" "
                  required
                  className="peer w-full bg-[#1e1e1e] border border-gray-700 rounded p-3 pt-5 text-white focus:outline-none focus:border-lime-400"
                />
                <label
                  htmlFor="email"
                  className="absolute left-3 top-3 text-sm text-gray-400 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-sm peer-focus:top-1 peer-focus:text-xs peer-focus:text-lime-400"
                >
                  Email
                </label>
              </div>
              <div className="relative">
                <textarea
                  id="message"
                  name="message"
                  rows="5"
                  placeholder=" "
                  required
                  className="peer w-full bg-[#1e1e1e] border border-gray-700 rounded p-3 pt-5 text-white focus:outline-none focus:border-lime-400 resize-none"
                />
                <label
                  htmlFor="message"
                  className="absolute left-3 top-3 text-sm text-gray-400 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-sm peer-focus:top-1 peer-focus:text-xs peer-focus:text-lime-400"
                >
                  Message
                </label>
              </div>
              {/* Honeypot: bots often fill hidden fields; humans won't see this */}
              <input
                type="text"
                name="company"
                tabIndex={-1}
                autoComplete="off"
                className="hidden"
              />
              <button
                type="submit"
                className="bg-lime-400 hover:bg-lime-300 text-black font-semibold py-3 px-6 rounded transition duration-300 ease-in-out transform hover:scale-105 mx-auto block shadow-md hover:shadow-lg"
              >
                Send Message
              </button>
            </form>
          ) : (
            <div className="text-center text-lime-400 text-xl animate-pulse mt-10">
               Message Sent! We'll be in touch soon.
            </div>
          )}
        </div>
      </div>
    </section>
  )
}