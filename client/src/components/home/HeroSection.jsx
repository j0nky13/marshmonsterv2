import { Link } from 'react-router-dom';
import ParticleBackground from "../ParticleBackground";
import FloatingCode from "../FloatingCode";

export default function HeroSection() {
  return (
    <section className="relative bg-gradient-to-r from-black via-zinc-900 to-lime-900 bg-size-200 animate-gradient-x text-white min-h-[90vh] flex justify-center items-center overflow-hidden px-4 md:px-10">
      <FloatingCode />
      <div className="absolute inset-0 z-0">
        <ParticleBackground />
        <div className="absolute inset-0 bg-black bg-opacity-40" />
      </div>
      <div className="relative z-10 max-w-3xl w-full text-center flex flex-col items-center gap-6">
        <h1 className="text-5xl md:text-7xl font-extrabold leading-tight drop-shadow-lg text-white">
          Built for Performance. Designed to Impress.
        </h1>
        <p className="text-lg md:text-xl text-gray-300 leading-relaxed">
          Our sites are custom-coded from the ground up — no builders, no shortcuts. Just lean code, lightning speed, and the performance your business deserves.
        </p>
        <div className="w-full flex justify-center">
          <Link to="/contact">
            <button className="px-8 py-4 text-black font-semibold rounded-lg shadow-md bg-lime-400 hover:bg-lime-300 transition-all focus:outline-none focus:ring-4 focus:ring-lime-300 animate-pulse">
              Let’s Talk
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}