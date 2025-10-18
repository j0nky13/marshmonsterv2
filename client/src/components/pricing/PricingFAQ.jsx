export default function PricingFAQ({ faqs }) {
  return (
    <div className="max-w-5xl mx-auto px-6 mt-16">
      <h3 className="text-2xl md:text-3xl font-bold text-center mb-6 text-lime-400">FAQs</h3>
      <div className="divide-y divide-white/10 bg-[#1f1f1f] border border-lime-700 rounded-2xl overflow-hidden">
        {faqs.map((item, idx) => (
          <details key={idx} className="group">
            <summary className="flex justify-between items-center cursor-pointer list-none p-5 hover:bg-white/5">
              <span className="font-medium">{item.q}</span>
              <span className="transition-transform group-open:rotate-45 text-lime-400 text-2xl leading-none">+</span>
            </summary>
            <div className="p-5 pt-0 text-gray-300">{item.a}</div>
          </details>
        ))}
      </div>
    </div>
  );
}