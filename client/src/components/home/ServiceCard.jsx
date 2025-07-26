import { Link } from 'react-router-dom'

function ServiceCard({ title, icon, description, label, price, link }) {
  return (
    <div className="bg-[#1f1f1f] text-white p-6 rounded-xl shadow hover:shadow-lg transition-transform hover:-translate-y-1 border border-gray-700">
      {label && (
        <span className="text-xs uppercase bg-green-700 text-white px-2 py-1 rounded-full mb-2 inline-block">
          {label}
        </span>
      )}
      <div className="text-4xl text-emerald-400 mb-4">{icon}</div>
      <h3 className="text-xl font-bold">{title}</h3>
      <p className="mt-2 text-gray-300">{description}</p>
      {price && <p className="mt-2 text-sm text-gray-500">Starting at {price}</p>}
      {link && (
        <Link
          to={link}
          className="mt-4 inline-block text-sm text-emerald-400 hover:underline"
        >
          Learn More →
        </Link>
      )}
    </div>
  )
}

export default ServiceCard