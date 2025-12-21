export default function PricingFAQ({ faqs }) {
  return (
    <div className="max-w-5xl mx-auto px-6 mt-24">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="text-xs tracking-[0.32em] uppercase text-gray-500 mb-4">
          Common questions
        </div>
        <h3 className="text-2xl md:text-3xl font-extrabold text-white">
          Frequently asked questions
        </h3>
      </div>

      {/* FAQ container */}
      <div className="border border-white/10 rounded-3xl divide-y divide-white/10">
        {faqs.map((item, idx) => (
          <details
            key={idx}
            className="group px-6 py-6"
          >
            <summary
              className="
                flex items-center justify-between
                cursor-pointer list-none
                font-medium
                text-white
                transition-colors
                hover:text-lime-400
              "
            >
              <span className="pr-6">{item.q}</span>

              <span
                className="
                  text-gray-500
                  text-xl
                  transition-all duration-300
                  group-open:rotate-45
                  group-open:text-lime-400
                "
              >
                +
              </span>
            </summary>

            <div className="mt-4 text-gray-400 leading-relaxed max-w-3xl">
              {item.a}
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}