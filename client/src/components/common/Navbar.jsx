import { Link, NavLink } from "react-router-dom";
import { useState, useEffect } from "react";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showLogo, setShowLogo] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [hideLogo, setHideLogo] = useState(false);

  /* ---------------- staged intro timing ---------------- */
  useEffect(() => {
    const logoTimer = setTimeout(() => setShowLogo(true), 1800);
    const menuTimer = setTimeout(() => setShowMenu(true), 1800);

    return () => {
      clearTimeout(logoTimer);
      clearTimeout(menuTimer);
    };
  }, []);

  /* ---------------- scroll hides logo ---------------- */
  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setHideLogo(window.scrollY > 60);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* ---------------- esc closes menu ---------------- */
  useEffect(() => {
    const esc = (e) => e.key === "Escape" && setMenuOpen(false);
    document.addEventListener("keydown", esc);
    return () => document.removeEventListener("keydown", esc);
  }, []);

  /* ---------------- lock scroll when open ---------------- */
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => (document.body.style.overflow = "");
  }, [menuOpen]);

  const navItems = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "Portfolio", path: "/portfolio" },
    { name: "Pricing", path: "/pricing" },
    { name: "Contact", path: "/contact" },
  ];

  return (
    <>
      {/* FLOATING NAV */}
      <nav className="fixed top-0 left-0 w-full z-50 pointer-events-none">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between pointer-events-auto">
          {/* LOGO */}
          <Link
            to="/"
            className={`
              transition-all duration-700 ease-out
              ${showLogo && !hideLogo ? "opacity-100 scale-100" : "opacity-0 scale-90"}
            `}
          >
            <img
              src="/MM-Header2.svg"
              alt="Marsh Monster"
              className="h-16 w-auto"
            />
          </Link>

          {/* HAMBURGER */}
          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
            className={`
              relative z-50 p-3 rounded-full border backdrop-blur-md
              transition-all duration-500 ease-out
              ${showMenu ? "opacity-100 scale-100" : "opacity-0 scale-75 pointer-events-none"}
              ${
                menuOpen
                  ? "border-lime-400 bg-lime-400/20 rotate-90"
                  : "border-lime-500/40 bg-black/40 hover:bg-black/60"
              }
            `}
          >
            {menuOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-lime-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-lime-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </nav>

      {/* RADIAL MENU OVERLAY */}
      <div
        className={`fixed inset-0 z-40 transition-[clip-path,background] duration-700 ease-[cubic-bezier(.2,.9,.2,1)]
          ${menuOpen ? "pointer-events-auto" : "pointer-events-none"}
        `}
        style={{
          clipPath: menuOpen
            ? "circle(140% at 92% 7%)"
            : "circle(0% at 92% 7%)",

          /* 🔒 DARK, NON-BLEEDING RADIAL */
          background:
            "radial-gradient(circle at top right, rgba(182,242,74,0.14) 0%, rgba(0,0,0,0.995) 42%)",
        }}
      >
        <div className="h-full flex flex-col items-center justify-center">
          <ul className="space-y-8">
            {navItems.map(({ name, path }, i) => (
              <li
                key={name}
                style={{ transitionDelay: menuOpen ? `${i * 80}ms` : "0ms" }}
                className={`transition-all duration-500 ${
                  menuOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
                }`}
              >
                <NavLink
                  to={path}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    `
                      block text-4xl md:text-6xl font-bold tracking-tight
                      transition-all duration-300
                      ${
                        isActive
                          ? "text-lime-400 scale-105"
                          : "text-gray-300 hover:text-lime-400 hover:scale-105 hover:-skew-x-2"
                      }
                    `
                  }
                >
                  {name}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}