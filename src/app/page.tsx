import Link from "next/link";

export default function Home() {
  return (
    <div className="bg-black text-white">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-gray-900 via-black to-black py-24 px-4 text-center border-b-2 border-blue-500">
        <h1 className="text-4xl md:text-6xl font-extrabold uppercase tracking-tight">
          Todo para el{" "}
          <span className="text-blue-400">mundo de los fierros</span>
        </h1>
        <p className="mt-6 max-w-2xl mx-auto text-gray-300 text-lg">
          La comunidad de autos y motos clásicas de Argentina. Compartí tus
          fierros, encontrá comercios de confianza y enterate de los próximos
          encuentros.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/comunidad"
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold uppercase px-6 py-3 rounded transition"
          >
            Unite a la comunidad
          </Link>
          <Link
            href="/eventos"
            className="border-2 border-blue-500 hover:bg-blue-500/10 text-white font-bold uppercase px-6 py-3 rounded transition"
          >
            Ver eventos
          </Link>
        </div>
      </section>

      {/* Destacados */}
      <section className="max-w-6xl mx-auto py-16 px-4 grid gap-8 md:grid-cols-3">
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 text-center">
          <h3 className="text-xl font-bold uppercase text-blue-400 mb-2">
            Comunidad
          </h3>
          <p className="text-gray-400">
            Mostrá tu auto o moto clásica, sumá fotos y conectá con otros
            fanáticos de los fierros.
          </p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 text-center">
          <h3 className="text-xl font-bold uppercase text-blue-400 mb-2">
            Comercios
          </h3>
          <p className="text-gray-400">
            Encontrá casas de repuestos y talleres de confianza cerca tuyo.
          </p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 text-center">
          <h3 className="text-xl font-bold uppercase text-blue-400 mb-2">
            Eventos
          </h3>
          <p className="text-gray-400">
            Enterate de encuentros, exposiciones y juntadas cerca tuyo.
          </p>
        </div>
      </section>
    </div>
  );
}