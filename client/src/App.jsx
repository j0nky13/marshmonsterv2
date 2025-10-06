import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'

import Navbar from './components/common/Navbar'
import Footer from './components/common/Footer'
import Home from './pages/Home'
import About from './pages/About'
import Portfolio from './pages/Portfolio'
import Pricing from './pages/Pricing'
import Contact from './pages/Contact'
import Login from './pages/Login'
// import Dashboard from './pages/Dashboard' 
// import PrivateRoute from './components/common/PrivateRoute'
import FAQpage from './pages/FAQpage';
import NotFound404 from './pages/404'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

function AppWrapper() {
  const location = useLocation()
  const isDashboardRoute = location.pathname.startsWith('/dashboard')

  return (
    <div className="min-h-screen flex flex-col">
      <ScrollToTop />
      {!isDashboardRoute && <Navbar />}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/faq" element={<FAQpage />} />
          {/* <Route
            path="/dashboard/*"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          /> */}
          <Route path="*" element={<NotFound404 />} />
        </Routes>
      </main>
      {!isDashboardRoute && <Footer className="mt-auto" />}
    </div>
  )
}

function App() {
  return (
    <Router>
      <AppWrapper />
    </Router>
  )
}

export default App