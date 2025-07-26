export default function SectionWrapper({ children, bg = "white" }) {
  return (
    <section className={`py-12 px-4 bg-${bg}`}>
      <div className="max-w-6xl mx-auto">{children}</div>
    </section>
  )
}