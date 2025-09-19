import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-[#0d0d0d] text-gray-400 py-10 px-4">
      <div className="max-w-6xl w-full mx-auto flex flex-col md:flex-row md:justify-between items-center md:items-center gap-10">
        <div className="flex flex-col items-center md:items-start md:w-1/3 text-center md:text-left space-y-2">
          <img src="/MM-Header2.svg" alt="Marsh Monster" className="h-12 mb-2 mx-auto" />
          <p>Custom websites. Zero templates. Built in code, not clicks.</p>
        </div>

        <div className="flex flex-col items-center md:items-center md:w-1/3 text-center">
          <h4 className="text-white font-semibold mb-2 text-center w-full">Quick Links</h4>
          <ul className="grid grid-cols-2 sm:grid-cols-3 gap-x-2 gap-y-3 justify-center">
            <li className="flex items-center gap-1">
              {/* <ChevronRight size={14} /> */}
              <Link to="/" className="hover:text-lime-400">Home</Link>
            </li>
            <li className="flex items-center gap-1">
              {/* <ChevronRight size={14} /> */}
              <Link to="/about" className="hover:text-lime-400">About</Link>
            </li>
            <li className="flex items-center gap-1">
              {/* <ChevronRight size={14} /> */}
              <Link to="/portfolio" className="hover:text-lime-400">Portfolio</Link>
            </li>
            <li className="flex items-center gap-1">
              {/* <ChevronRight size={14} /> */}
              <Link to="/pricing" className="hover:text-lime-400">Pricing</Link>
            </li>
             <li className="flex items-center gap-1">
              {/* <ChevronRight size={14} /> */}
              <Link to="/faq" className="hover:text-lime-400">FAQ's</Link>
            </li>
            <li className="flex items-center gap-1">
              {/* <ChevronRight size={14} /> */}
              <Link to="/contact" className="hover:text-lime-400">Contact</Link>
            </li>
          </ul>
        </div>

        {/* <div className="text-center md:text-left md:w-1/3 p-2 rounded-md space-y-1">
          <h4 className="text-white font-semibold mb-2">Contact</h4>
          <p>Email: <a href="mailto:hello@marsh.monster" className="hover:text-lime-400">hello@marsh.monster</a></p>
          <p className="mt-1">Based in: Earth’s Swampiest Server Room</p>
        </div> */}
      </div>

      <hr className="border-gray-700 my-6" />

      <div className="text-center text-xs mt-10 text-gray-500">
        © {new Date().getFullYear()} Marsh Monster. All rights reserved.
      </div>
    </footer>
  )
}