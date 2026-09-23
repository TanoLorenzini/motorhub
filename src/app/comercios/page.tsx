const comerciosEjemplo = [
  {
    id: 1,
    nombre: "Repuestos Torino",
    rubro: "Repuestos clásicos",
    ubicacion: "Resistencia, Chaco",
    descripcion: "Repuestos originales y alternativos para autos clásicos nacionales.",
  },
  {
    id: 2,
    nombre: "Taller Fierro Viejo",
    rubro: "Restauración y mecánica",
    ubicacion: "Corrientes",
    descripcion: "Restauración integral de autos y motos clásicas, motor y chapa.",
  },
  {
    id: 3,
    nombre: "Motos del Ayer",
    rubro: "Repuestos de motos clásicas",
    ubicacion: "Formosa",
    descripcion: "Especialistas en motos de los 70s y 80s, repuestos importados.",
  },
];

export default function Comercios() {
  return (
    <div className="bg-black text-white min-h-screen">
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h1 className="text-3xl md:text-4xl font-extrabold uppercase mb-2">
          Comercios <span className="text-blue-400">MotorHub</span>
        </h1>
        <p className="text-gray-400 mb-10">
          Talleres y casas de repuestos de confianza.
        </p>

        <div className="grid gap-6 md:grid-cols-3">
          {comerciosEjemplo.map((comercio) => (
            <div
              key={comercio.id}
              className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-blue-500 transition"
            >
              <h3 className="text-lg font-bold text-blue-400 mb-1">
                {comercio.nombre}
              </h3>
              <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">
                {comercio.rubro}
              </p>
              <p className="text-sm text-gray-500 mb-3">{comercio.ubicacion}</p>
              <p className="text-gray-300 text-sm">{comercio.descripcion}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}