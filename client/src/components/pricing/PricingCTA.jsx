export default function PricingCTA({ openForm }) {
  return (
    <div className="max-w-6xl mx-auto px-6 mt-24 pb-28">
      <div
        className="
          border border-white/10
          rounded-3xl
          px-8 py-12
          text-center
          bg-black
        "
      >
        <div className="text-xs tracking-[0.32em] uppercase text-gray-500 mb-4">
          Next step
        </div>

        {/* HEADER COLOR CHANGED HERE */}
        <h3 className="text-2xl md:text-3xl font-extrabold text-lime-400">
          Ready to move fast?
        </h3>

        <p className="text-gray-400 mt-4 max-w-xl mx-auto">
          Start with a focused launch or scope a larger product build.
          We’ll help you choose the right path.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
          <button
            onClick={() => openForm("Launch Build")}
            className="
              px-6 py-3
              rounded-2xl
              font-semibold
              text-black
              bg-lime-400
              hover:bg-lime-300
              transition
            "
          >
            Start a launch build
          </button>

          <button
            onClick={() => openForm("Platform Build")}
            className="
              px-6 py-3
              rounded-2xl
              font-semibold
              text-lime-400
              border border-white/20
              hover:border-lime-400/60
              hover:text-white
              transition
            "
          >
            Talk architecture
          </button>
        </div>
      </div>
    </div>
  );
}