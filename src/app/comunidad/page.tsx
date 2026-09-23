import Image from "next/image";
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
          {autos?.map((auto) => {
            const fotos: string[] =
              auto.fotos && auto.fotos.length > 0
                ? auto.fotos
                : auto.foto_url
                ? [auto.foto_url]
                : [];

            return (
              <div
                key={auto.id}
                className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden hover:border-blue-500 border transition"
              >
                <div className="flex gap-1 overflow-x-auto">
                  {fotos.length > 0 ? (
                    fotos.map((url, i) => (
                      <div
                        key={i}
                        className="relative w-full h-48 min-w-full bg-gray-800 flex-shrink-0"
                      >
                        <Image
                          src={url}
                          alt={`${auto.titulo} - foto ${i + 1}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ))
                  ) : (
                    <div className="w-full h-48 flex items-center justify-center text-gray-600 text-sm bg-gray-800">
                      Sin foto
                    </div>
                  )}
                </div>

                <div className="p-6">
                  <div className="flex flex-wrap gap-2 mb-2">
                    {auto.en_venta && (
                      <span className="bg-yellow-500 text-black text-xs font-bold uppercase px-2 py-1 rounded">
                        En venta
                      </span>
                    )}
                    {auto.participa_exposiciones && (
                      <span className="bg-blue-600 text-white text-xs font-bold uppercase px-2 py-1 rounded">
                        Va a exposiciones
                      </span>
                    )}
                  </div>

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
                      className="mt-4 inline-block bg-green-600 hover:bg-green-500 text-white text-xs font-bold uppercase px-4 py-2 rounded transition">
                      Contactar por WhatsApp
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}