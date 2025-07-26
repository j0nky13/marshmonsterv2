import HeroSection from '../components/home/HeroSection'
import WhyUs from '../components/home/WhyUs'
import ServicePreview from '../components/home/ServicePreview'
import PortfolioPreview from '../components/home/PortfolioPreview'
import FinalCTA from '../components/home/FinalCTA'

function Home() {
  return (
    <>
      <HeroSection />
      <WhyUs />
      <ServicePreview />
      {/* <PortfolioPreview /> */}
      <FinalCTA />
    </>
  )
}

export default Home