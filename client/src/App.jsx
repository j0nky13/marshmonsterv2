import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { useEffect, useState } from "react";

import Navbar from "./components/common/Navbar";
import Footer from "./components/common/Footer";
import IntroSplash from "./components/common/IntroSplash";

import Home from "./pages/Home";
import About from "./pages/About";
import Portfolio from "./pages/Portfolio";
import Pricing from "./pages/Pricing";
import Contact from "./pages/Contact";
import FAQpage from "./pages/FAQpage";
import NotFound404 from "./pages/404";

import PortalApp from "./modules/portal/PortalApp";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function AppWrapper() {
  const location = useLocation();
  const isPortalRoute = location.pathname.startsWith("/portal");

  const [showIntro, setShowIntro] = useState(() => {
    if (typeof window === "undefined") return false;
    return !sessionStorage.getItem("mm_intro_seen");
  });

  function handleIntroFinish() {
    sessionStorage.setItem("mm_intro_seen", "true");
    setShowIntro(false);
  }

  return (
    <div className="min-h-screen flex flex-col bg-black">
      <ScrollToTop />

      {/* Navbar ALWAYS mounted */}
      {!isPortalRoute && (
        <Navbar introActive={showIntro} />
      )}

      {/* Intro Splash overlays everything
      {!isPortalRoute && showIntro && (
        <IntroSplash onFinish={handleIntroFinish} />
      )} */}

      <main className="flex-1">
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

      {!isPortalRoute && !showIntro && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppWrapper />
    </Router>
  );
}