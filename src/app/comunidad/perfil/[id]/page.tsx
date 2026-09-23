import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";

function fotosDe(auto: any): string[] {
  if (Array.isArray(auto.fotos) && auto.fotos.length > 0) return auto.fotos;
  if (auto.foto_url) return [auto.foto_url];
  return [];
}

export default async function PerfilUsuario({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data: perfil } = await supabase
    .from("perfiles")
    .select("*, autos(*)")
    .eq("id", id)
    .single();

  if (!perfil) notFound();

  const autos = [...(perfil.autos ?? [])].sort(
    (a: any, b: any) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
  const cantidadEnVenta = autos.filter((a: any) => a.en_venta).length;

  return (
    <div className="bg-black text-white min-h-screen">
      <section className="max-w-6xl mx-auto px-4 py-16">
        <Link href="/comunidad" className="text-sm text-gray-400 hover:text-blue-400">
          ← Volver a la comunidad
        </Link>

        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mt-6 mb-10">
          <h1 className="text-3xl font-extrabold uppercase text-blue-400">
            {perfil.nombre}
          </h1>
          {perfil.ubicacion && (
            <p className="text-gray-400 mt-1">{perfil.ubicacion}</p>
          )}
          <p className="text-gray-300 mt-3">
            {autos.length} {autos.length === 1 ? "vehículo" : "vehículos"}
            {cantidadEnVenta > 0 && (
              <span className="text-yellow-400"> · {cantidadEnVenta} en venta</span>
            )}
          </p>

          <div className="flex flex-wrap items-center gap-4 mt-4">
            {perfil.whatsapp && <a href={`https://wa.me/${perfil.whatsapp}`} target="_blank" rel="noopener noreferrer" className="bg-green-600 hover:bg-green-500 text-white text-xs font-bold uppercase px-4 py-2 rounded transition">Contactar por WhatsApp</a>}
            {perfil.instagram && <a href={`https://instagram.com/${perfil.instagram}`} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-400 text-sm underline">Instagram</a>}
            {perfil.facebook && <a href={`https://facebook.com/${perfil.facebook}`} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-400 text-sm underline">Facebook</a>}
          </div>
        </div>

        <h2 className="text-xl font-bold uppercase mb-6">
          Sus <span className="text-blue-400">fierros</span>
        </h2>

        <div className="grid gap-6 md:grid-cols-3">
          {autos.map((auto: any) => {
            const fotos = fotosDe(auto);
            const mensaje = encodeURIComponent(
              "Hola! Vi tu " + auto.titulo + " en MotorHub, ¿sigue disponible?"
            );

            return (
              <div
                key={auto.id}
                className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden"
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
                  <h3 className="text-lg font-bold text-blue-400 mb-2">
                    {auto.titulo}
                  </h3>
                  <p className="text-gray-300 text-sm">{auto.descripcion}</p>

                  {auto.en_venta && perfil.whatsapp && <a href={`https://wa.me/${perfil.whatsapp}?text=${mensaje}`} target="_blank" rel="noopener noreferrer" className="mt-4 inline-block bg-yellow-500 hover:bg-yellow-400 text-black text-xs font-bold uppercase px-4 py-2 rounded transition">Consultar por este vehículo</a>}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}