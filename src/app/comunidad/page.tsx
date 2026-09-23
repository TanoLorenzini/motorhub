import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

function fotosDe(auto: any): string[] {
  if (Array.isArray(auto.fotos) && auto.fotos.length > 0) return auto.fotos;
  if (auto.foto_url) return [auto.foto_url];
  return [];
}

export default async function Comunidad({
  searchParams,
}: {
  searchParams: Promise<{ venta?: string }>;
}) {
  const { venta = "" } = await searchParams;
  const soloEnVenta = venta === "1";

  const { data, error } = await supabase
    .from("autos")
    .select("*, perfiles(*)")
    .order("created_at", { ascending: false });

  const todos = data ?? [];

  const vehiculosPorPerfil: Record<number, number> = {};
  for (const a of todos) {
    if (a.perfil_id) {
      vehiculosPorPerfil[a.perfil_id] = (vehiculosPorPerfil[a.perfil_id] ?? 0) + 1;
    }
  }

  const autos = soloEnVenta ? todos.filter((a) => a.en_venta) : todos;

  const estiloFiltro = (activo: boolean) =>
    `text-sm font-bold uppercase px-4 py-2 rounded border transition ${
      activo
        ? "bg-blue-600 border-blue-600 text-white"
        : "border-gray-700 text-gray-300 hover:border-blue-500"
    }`;

  return (
    <div className="bg-black text-white min-h-screen">
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h1 className="text-3xl md:text-4xl font-extrabold uppercase mb-2">
          Comunidad <span className="text-blue-400">MotorHub</span>
        </h1>
        <p className="text-gray-400 mb-8">
          Fierros publicados por la comunidad.
        </p>

        <div className="flex gap-2 mb-8">
          <Link href="/comunidad" className={estiloFiltro(!soloEnVenta)}>
            Todos
          </Link>
          <Link href="/comunidad?venta=1" className={estiloFiltro(soloEnVenta)}>
            En venta
          </Link>
        </div>

        {error && (
          <p className="text-red-400">
            Hubo un problema cargando los autos: {error.message}
          </p>
        )}

        {!error && autos.length === 0 && (
          <p className="text-gray-500">
            {soloEnVenta
              ? "No hay vehículos en venta por ahora."
              : "Todavía no hay autos publicados."}
          </p>
        )}

        <div className="grid gap-6 md:grid-cols-3">
          {autos.map((auto) => {
            const fotos = fotosDe(auto);
            const perfil = auto.perfiles;
            const whatsapp = perfil?.whatsapp ?? auto.whatsapp;
            const ubicacion = perfil?.ubicacion ?? auto.ubicacion;
            const cantidad = auto.perfil_id ? vehiculosPorPerfil[auto.perfil_id] : 1;
            const mensaje = encodeURIComponent(
              "Hola! Vi tu " + auto.titulo + " en MotorHub."
            );

            return (
              <div
                key={auto.id}
                className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden hover:border-blue-500 transition"
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
                    {perfil ? (
                      <Link
                        href={`/comunidad/perfil/${perfil.id}`}
                        className="text-gray-300 hover:text-blue-400 underline"
                      >
                        {perfil.nombre}
                      </Link>
                    ) : (
                      auto.dueño
                    )}
                    {ubicacion && <> · {ubicacion}</>}
                  </p>

                  {cantidad > 1 && perfil && (
                    <Link
                      href={`/comunidad/perfil/${perfil.id}`}
                      className="inline-block bg-gray-800 border border-gray-600 text-gray-200 text-xs font-semibold px-2 py-1 rounded mb-3 hover:border-blue-500"
                    >
                      Tiene {cantidad} vehículos · Ver todos
                    </Link>
                  )}

                  <p className="text-gray-300 text-sm">{auto.descripcion}</p>

                  {whatsapp && <a href={`https://wa.me/${whatsapp}?text=${mensaje}`} target="_blank" rel="noopener noreferrer" className="mt-4 inline-block bg-green-600 hover:bg-green-500 text-white text-xs font-bold uppercase px-4 py-2 rounded transition">Contactar por WhatsApp</a>}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}