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
    <div className="min-h-screen flex flex-col bg-[#121212]">
      <section className="flex-1 text-white py-20 px-6 flex items-center">
      <div className="max-w-6xl mx-auto w-full flex justify-center gap-12 items-center">
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
              <div className="relative group">
                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder=" "
                  required
                  className="peer w-full rounded-xl bg-[#181818]/95 text-white border border-gray-700/80 px-4 py-3.5
                             shadow-inner focus:outline-none focus:border-lime-400 focus:ring-4 focus:ring-lime-400/10
                             transition-colors placeholder-transparent"
                />
                <label
                  htmlFor="name"
                  className="absolute left-3 top-3 text-gray-400 px-1 rounded
                             transition-all duration-200 ease-out origin-left
                             peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-placeholder-shown:bg-transparent
                             peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:text-xs peer-focus:text-lime-300 peer-focus:bg-[#1f1f1f]
                             peer-[&:not(:placeholder-shown)]:top-0 peer-[&:not(:placeholder-shown)]:-translate-y-1/2 peer-[&:not(:placeholder-shown)]:text-xs peer-[&:not(:placeholder-shown)]:text-gray-300 peer-[&:not(:placeholder-shown)]:bg-[#1f1f1f]"
                >
                  Name
                </label>
              </div>
              <div className="relative group">
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder=" "
                  required
                  className="peer w-full rounded-xl bg-[#181818]/95 text-white border border-gray-700/80 px-4 py-3.5
                             shadow-inner focus:outline-none focus:border-lime-400 focus:ring-4 focus:ring-lime-400/10
                             transition-colors placeholder-transparent"
                />
                <label
                  htmlFor="email"
                  className="absolute left-3 top-3 text-gray-400 px-1 rounded
                             transition-all duration-200 ease-out origin-left
                             peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-placeholder-shown:bg-transparent
                             peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:text-xs peer-focus:text-lime-300 peer-focus:bg-[#1f1f1f]
                             peer-[&:not(:placeholder-shown)]:top-0 peer-[&:not(:placeholder-shown)]:-translate-y-1/2 peer-[&:not(:placeholder-shown)]:text-xs peer-[&:not(:placeholder-shown)]:text-gray-300 peer-[&:not(:placeholder-shown)]:bg-[#1f1f1f]"
                >
                  Email
                </label>
              </div>
              <div className="relative group">
                <textarea
                  id="message"
                  name="message"
                  rows="5"
                  placeholder=" "
                  required
                  className="peer w-full rounded-xl bg-[#181818]/95 text-white border border-gray-700/80 px-4 py-3.5
                             shadow-inner focus:outline-none focus:border-lime-400 focus:ring-4 focus:ring-lime-400/10
                             transition-colors placeholder-transparent resize-none"
                />
                <label
                  htmlFor="message"
                  className="absolute left-3 top-3 text-gray-400 px-1 rounded
                             transition-all duration-200 ease-out origin-left
                             peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-placeholder-shown:bg-transparent
                             peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:text-xs peer-focus:text-lime-300 peer-focus:bg-[#1f1f1f]
                             peer-[&:not(:placeholder-shown)]:top-0 peer-[&:not(:placeholder-shown)]:-translate-y-1/2 peer-[&:not(:placeholder-shown)]:text-xs peer-[&:not(:placeholder-shown)]:text-gray-300 peer-[&:not(:placeholder-shown)]:bg-[#1f1f1f]"
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
    </div>
  )
}