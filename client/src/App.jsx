import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { useEffect } from "react";

import Navbar from "./components/common/Navbar";
import Footer from "./components/common/Footer";
// import IntroSplash from "./components/common/IntroSplash"; // intentionally disabled

import Home from "./pages/Home";
import About from "./pages/About";
import Portfolio from "./pages/Portfolio";
import Pricing from "./pages/Pricing";
import Contact from "./pages/Contact";
import FAQpage from "./pages/FAQpage";
import NotFound404 from "./pages/404";

import PortalApp from "./modules/portal/PortalApp";

/* ---------------- scroll reset ---------------- */

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

/* ---------------- app wrapper ---------------- */

function AppWrapper() {
  const location = useLocation();
  const isPortalRoute = location.pathname.startsWith("/portal");

  // Intro is DISABLED for now — keep this simple and deterministic
  const showIntro = false;

  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <ScrollToTop />

      {/* NAVBAR (site only) */}
      {!isPortalRoute && <Navbar introActive={showIntro} />}

      {/* INTRO SPLASH — intentionally disabled */}
      {/*
      {!isPortalRoute && showIntro && (
        <IntroSplash onFinish={handleIntroFinish} />
      )}
      */}

      {/* MAIN CONTENT */}
      <main className="flex-1 bg-black">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/faq" element={<FAQpage />} />
          <Route path="/portal/*" element={<PortalApp />} />
          <Route path="*" element={<NotFound404 />} />
        </Routes>
      </main>

      {/* FOOTER (site only, ALWAYS visible) */}
      {!isPortalRoute && <Footer />}
    </div>
  );
}

/* ---------------- root ---------------- */

export default function App() {
  return (
    <Router>
      <AppWrapper />
    </Router>
  );
}