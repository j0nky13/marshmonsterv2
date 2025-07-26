import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/common/Navbar'
import Footer from './components/common/Footer'
import Home from './pages/Home'
import About from './pages/About'
import Portfolio from './pages/Portfolio'
import Pricing from './pages/Pricing'
import Contact from './pages/Contact'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard' 
import PrivateRoute from './components/common/PrivateRoute'
import FAQpage from './pages/FAQpage';

function AppWrapper() {
  const location = useLocation()
  const isDashboardRoute = location.pathname.startsWith('/dashboard')

  return (
    <>
      {!isDashboardRoute && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/portfolio" element={<Portfolio />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/faq" element={<FAQpage />} />
        <Route
          path="/dashboard/*"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
      </Routes>
      {!isDashboardRoute && <Footer />}
    </>
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