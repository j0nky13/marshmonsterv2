import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-black text-gray-400 py-10 px-4">
      <div className="max-w-6xl w-full mx-auto flex flex-col md:flex-row md:justify-between items-center gap-10">
        
        {/* Brand */}
        <div className="flex flex-col items-center md:items-start md:w-1/3 text-center md:text-left space-y-2">
          <img
            src="/MM-Header2.svg"
            alt="Marsh Monster"
            className="h-12 mb-2 mx-auto md:mx-0"
          />
          <p>Custom websites. Zero templates. Built in code, not clicks.</p>
        </div>

        {/* Links */}
        <div className="flex flex-col items-center md:w-1/3 text-center">
          <h4 className="text-white font-semibold mb-2 w-full">
            Quick Links
          </h4>
          <ul className="grid grid-cols-2 sm:grid-cols-3 gap-x-2 gap-y-3 justify-center">
            <li><Link to="/" className="hover:text-lime-400">Home</Link></li>
            <li><Link to="/about" className="hover:text-lime-400">About</Link></li>
            <li><Link to="/portfolio" className="hover:text-lime-400">Portfolio</Link></li>
            <li><Link to="/pricing" className="hover:text-lime-400">Pricing</Link></li>
            <li><Link to="/faq" className="hover:text-lime-400">FAQ&apos;s</Link></li>
            <li><Link to="/contact" className="hover:text-lime-400">Contact</Link></li>
          </ul>
        </div>
      </div>

      {/* Divider */}
      <div className="max-w-4xl mx-auto my-6">
        <div
          className="h-px w-full"
          style={{
            background:
              'linear-gradient(90deg, rgba(182,242,74,0), rgba(182,242,74,0.35), rgba(182,242,74,0))',
          }}
        />
      </div>

      {/* Copyright */}
      <div className="text-center text-xs mt-10 text-gray-500">
        © {new Date().getFullYear()} Marsh Monster. All rights reserved.
      </div>
    </footer>
  )
}