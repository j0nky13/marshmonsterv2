import { Link, NavLink } from 'react-router-dom'
import { useState, useEffect } from 'react'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)

  const [condensed, setCondensed] = useState(() => typeof window !== 'undefined' ? window.scrollY > 80 : false)

  useEffect(() => {
    let ticking = false
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setCondensed(window.scrollY > 80)
          ticking = false
        })
        ticking = true
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [])


  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  useEffect(() => {
    // Ensure the page background is always dark so a transparent nav never shows white
    const root = document.getElementById('root')
    document.documentElement.style.backgroundColor = '#0f0f0f'
    document.body.style.backgroundColor = '#0f0f0f'
    if (root) root.style.backgroundColor = '#0f0f0f'
  }, [])

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Portfolio', path: '/portfolio' },
    { name: 'Pricing', path: '/pricing' },
    { name: 'Contact', path: '/contact' },
  ]

  return (
    <nav className={`${condensed ? 'bg-transparent shadow-none' : 'bg-[#0f0f0f] shadow-sm'} text-white sticky top-0 relative z-30 transition-colors duration-300`}>
      <div className={`max-w-7xl mx-auto px-4 py-4 flex items-center ${condensed ? 'justify-end' : 'justify-between'}`}>
        <Link to="/" className={`flex items-center ${condensed ? 'hidden' : 'w-full justify-center md:justify-start'}`}>
          <img src="/MM-Header2.svg" alt="Marsh Monster" className="h-16 w-auto" />
        </Link>

        {/* Desktop nav */}
        <div className={`space-x-6 ${condensed ? 'hidden' : 'hidden md:flex'}`}>
          {navItems.map(({ name, path }) => (
            <NavLink
              key={name}
              to={path}
              className={({ isActive }) =>
                `hover:text-lime-400 transition ${
                  isActive ? 'text-lime-400 font-semibold' : 'text-gray-300'
                }`
              }
            >
              {name}
            </NavLink>
          ))}
        </div>

        {/* Mobile menu toggle */}
        <button
          className={`${condensed ? 'bg-lime-600/40 backdrop-blur-sm p-2 rounded-md border border-lime-500/50' : 'md:hidden'} text-white focus:outline-none transition-all duration-300 ${menuOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-9 w-9" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Mobile nav panel (always in DOM, spring-style transition) */}
      {/* Backdrop overlay for mobile when menu is open */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 ${menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setMenuOpen(false)}
        aria-hidden="true"
      />
      {/* Mobile nav panel with spring-style transition */}
      <div
        role="dialog" aria-modal="true"
        className={`fixed top-0 left-0 h-full w-72 z-50 transform-gpu transition-transform duration-700 ease-out ${menuOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex flex-col items-center pt-20 space-y-6 bg-[#121212] h-full shadow-lg">
          {navItems.map(({ name, path }) => (
            <NavLink
              key={name}
              to={path}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `text-xl font-semibold ${
                  isActive ? 'text-lime-400' : 'text-gray-300'
                } hover:text-lime-400 hover:text-2xl transition`
              }
            >
              {name}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  )
}