

export default function Portfolio() {
  const projects = [
    {
      title: 'Efferent Labs',
      description: 'Medical device company, primarily frontend but wired for backend user auth.',
    },
    {
      title: 'BreezeShooters HVAC',
      description: 'HVAC website, backend has scheduling, account details, admin controls and payment system',
    },
    {
      title: 'Whisky Talks',
      description: 'A dark, whisky colored website for a couple whiskey bros, complete with a full backend member section.',
    },
    {
      title: 'Vinyl Wrapping',
      description: 'Guy who has just got started and wants something basic.',
    },
  ]

  return (
    <section className="bg-[#121212] text-white py-20 px-6">
      <div className="max-w-6xl mx-auto text-center">
        <h1 className="text-4xl font-bold text-lime-400 mb-6">Our Portfolio</h1>
        <p className="text-gray-400 mb-12">A few things we’ve cooked up in the swamp. Real code. Real results.</p>
        <div className="grid gap-8 md:grid-cols-2">
          {projects.map((project, index) => (
            <div key={index} className="bg-[#1f1f1f] border border-gray-700 rounded-lg p-6 text-left shadow hover:shadow-lg transition">
              <img
                src={`/portfolio-${index + 1}.png`}
                alt={project.title}
                className="w-full h-40 object-cover rounded-md mb-4"
              />
              <h2 className="text-xl font-semibold text-lime-400">{project.title}</h2>
              <p className="text-gray-300 mt-2">{project.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}