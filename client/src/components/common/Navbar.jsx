import { Link, NavLink } from 'react-router-dom'
import { useState, useEffect } from 'react'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [])

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Portfolio', path: '/portfolio' },
    { name: 'Pricing', path: '/pricing' },
    { name: 'Contact', path: '/contact' },
  ]

  return (
    <nav className="bg-[#0f0f0f] text-white shadow-sm relative z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center w-full justify-center md:justify-start">
          <img src="/MM-Header2.svg" alt="Marsh Monster" className="h-16 w-auto" />
        </Link>

        {/* Desktop nav */}
        <div className="space-x-6 hidden md:flex">
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
          className={`md:hidden text-white focus:outline-none transition-opacity duration-300 ${menuOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
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
        className={`fixed inset-0 bg-black bg-opacity-50 z-10 md:hidden transition-opacity duration-300 ${menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setMenuOpen(false)}
        aria-hidden="true"
      />
      {/* Mobile nav panel with spring-style transition */}
      <div
        className={`fixed top-0 left-0 h-full w-72 z-30 md:hidden transform-gpu transition-transform duration-700 ease-out ${menuOpen ? 'translate-x-0' : '-translate-x-full'}`}
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