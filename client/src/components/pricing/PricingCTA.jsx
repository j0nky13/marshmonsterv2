export default function PricingCTA({ openForm }) {
  return (
    <div className="max-w-6xl mx-auto px-6 mt-16 pb-24">
      <div className="bg-gradient-to-r from-lime-500/20 to-lime-400/10 border border-lime-500/40 rounded-2xl p-8 text-center">
        <h3 className="text-2xl md:text-3xl font-extrabold text-lime-300">
          Ready to move fast?
        </h3>
        <p className="text-gray-300 mt-2">
          Kick off with Starter today or book a quick call for a custom Monster build.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
          <button
            onClick={() => openForm("Starter")}
            className="bg-lime-400 hover:bg-lime-300 text-black font-bold py-3 px-6 rounded shadow-md hover:shadow-xl transition-all"
          >
            Start Starter
          </button>
          <button
            onClick={() => openForm("Monster")}
            className="border border-lime-500/70 hover:border-lime-300 text-lime-300 hover:text-black hover:bg-lime-300 font-semibold py-3 px-6 rounded transition-all"
          >
            Talk Monster
          </button>
        </div>
      </div>
    </div>
  );
}