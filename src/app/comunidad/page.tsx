import { supabase } from "@/lib/supabase";

export default async function Comunidad() {
  const { data: autos, error } = await supabase
    .from("autos")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="bg-black text-white min-h-screen">
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h1 className="text-3xl md:text-4xl font-extrabold uppercase mb-2">
          Comunidad <span className="text-blue-400">MotorHub</span>
        </h1>
        <p className="text-gray-400 mb-10">
          Fierros publicados por la comunidad.
        </p>

        {error && (
          <p className="text-red-400">
            Hubo un problema cargando los autos: {error.message}
          </p>
        )}

        {!error && autos?.length === 0 && (
          <p className="text-gray-500">Todavía no hay autos publicados.</p>
        )}

        <div className="grid gap-6 md:grid-cols-3">
          {autos?.map((auto) => (
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

              {auto.whatsapp && (
                <a
                  href={`https://wa.me/${auto.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-block bg-green-600 hover:bg-green-500 text-white text-xs font-bold uppercase px-4 py-2 rounded transition"
                >
                  Contactar por WhatsApp
                </a>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}