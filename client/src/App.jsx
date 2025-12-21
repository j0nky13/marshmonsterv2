import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";

import Navbar from "./components/common/Navbar";
import Footer from "./components/common/Footer";

import Home from "./pages/Home";
import About from "./pages/About";
import Portfolio from "./pages/Portfolio";
import Pricing from "./pages/Pricing";
import Contact from "./pages/Contact";
// import Login from "./pages/Login";
import FAQpage from "./pages/FAQpage";
import NotFound404 from "./pages/404";

import PortalApp from "./modules/portal/PortalApp";

/* Scroll restoration */
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

  return (
    <div className="min-h-screen flex flex-col">
      <ScrollToTop />

      {!isPortalRoute && <Navbar />}

      <main className="flex-1">
        <Routes>
          {/* Public site */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/faq" element={<FAQpage />} />
          {/* <Route path="/login" element={<Login />} /> */}

          {/* Portal */}
          <Route path="/portal/*" element={<PortalApp />} />

          {/* Fallback */}
          <Route path="*" element={<NotFound404 />} />
        </Routes>
      </main>

      {!isPortalRoute && <Footer />}
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