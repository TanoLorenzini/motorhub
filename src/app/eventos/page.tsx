const eventosEjemplo = [
  {
    id: 1,
    nombre: "Encuentro de Clásicos del Chaco",
    fecha: "12 de octubre de 2026",
    lugar: "Resistencia, Chaco",
    descripcion: "Exhibición de autos y motos clásicas, con premios por categoría.",
  },
  {
    id: 2,
    nombre: "Juntada Nocturna Fierrera",
    fecha: "25 de octubre de 2026",
    lugar: "Corrientes Capital",
    descripcion: "Encuentro casual al aire libre, música y comida.",
  },
  {
    id: 3,
    nombre: "Expo Motor Nordeste",
    fecha: "8 de noviembre de 2026",
    lugar: "Formosa",
    descripcion: "La expo más grande de la región, con stands de comercios y clubes.",
  },
];

export default function Eventos() {
  return (
    <div className="bg-black text-white min-h-screen">
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h1 className="text-3xl md:text-4xl font-extrabold uppercase mb-2">
          Eventos <span className="text-blue-400">MotorHub</span>
        </h1>
        <p className="text-gray-400 mb-10">
          Encuentros y juntadas cerca tuyo.
        </p>

        <div className="grid gap-6 md:grid-cols-3">
          {eventosEjemplo.map((evento) => (
            <div
              key={evento.id}
              className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-blue-500 transition"
            >
              <h3 className="text-lg font-bold text-blue-400 mb-1">
                {evento.nombre}
              </h3>
              <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">
                {evento.fecha}
              </p>
              <p className="text-sm text-gray-500 mb-3">{evento.lugar}</p>
              <p className="text-gray-300 text-sm">{evento.descripcion}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}