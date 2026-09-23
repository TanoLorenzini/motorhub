const autosEjemplo = [
  {
    id: 1,
    titulo: "Ford Falcon 1978",
    dueño: "Carlos M.",
    ubicacion: "Resistencia, Chaco",
    descripcion: "Restaurado a nuevo, motor original 221.",
  },
  {
    id: 2,
    titulo: "Fiat 600 1965",
    dueño: "Marina G.",
    ubicacion: "Corrientes",
    descripcion: "Joya familiar, 3 generaciones en la misma familia.",
  },
  {
    id: 3,
    titulo: "Yamaha RD 350 1982",
    dueño: "Tano L.",
    ubicacion: "Resistencia, Chaco",
    descripcion: "Puesta a punto completa, cero km del alma.",
  },
];

export default function Comunidad() {
  return (
    <div className="bg-black text-white min-h-screen">
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h1 className="text-3xl md:text-4xl font-extrabold uppercase mb-2">
          Comunidad <span className="text-blue-400">MotorHub</span>
        </h1>
        <p className="text-gray-400 mb-10">
          Fierros publicados por la comunidad.
        </p>

        <div className="grid gap-6 md:grid-cols-3">
          {autosEjemplo.map((auto) => (
            <div
              key={auto.id}
              className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-blue-500 transition"
            >
              <h3 className="text-lg font-bold text-blue-400 mb-1">
                {auto.titulo}
              </h3>
              <p className="text-sm text-gray-500 mb-3">
                {auto.dueño} · {auto.ubicacion}
              </p>
              <p className="text-gray-300 text-sm">{auto.descripcion}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}