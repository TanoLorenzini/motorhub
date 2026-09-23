import Image from "next/image";
import { supabase } from "@/lib/supabase";

export default async function Comercios() {
  const { data: comercios, error } = await supabase
    .from("comercios")
    .select("*, productos(*)")
    .order("created_at", { ascending: false });

  return (
    <div className="bg-black text-white min-h-screen">
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h1 className="text-3xl md:text-4xl font-extrabold uppercase mb-2">
          Comercios <span className="text-blue-400">MotorHub</span>
        </h1>
        <p className="text-gray-400 mb-10">
          Talleres y casas de repuestos de confianza.
        </p>

        {error && (
          <p className="text-red-400">
            Hubo un problema cargando los comercios: {error.message}
          </p>
        )}

        {!error && comercios?.length === 0 && (
          <p className="text-gray-500">Todavia no hay comercios cargados.</p>
        )}

        <div className="grid gap-8 md:grid-cols-2">
          {comercios?.map((comercio) => (
            <div
              key={comercio.id}
              className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden hover:border-blue-500 transition"
            >
              {comercio.fotos && comercio.fotos.length > 0 && (
                <div className="relative w-full h-48 bg-gray-800">
                  <Image
                    src={comercio.fotos[0]}
                    alt={comercio.nombre}
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              <div className="p-6">
                <div className="flex flex-wrap gap-2 mb-3">
                  {comercio.rubros?.map((rubro: string) => (
                    <span
                      key={rubro}
                      className="bg-blue-600/20 border border-blue-500 text-blue-300 text-xs font-semibold uppercase px-2 py-1 rounded"
                    >
                      {rubro}
                    </span>
                  ))}
                </div>

                <h3 className="text-xl font-bold text-blue-400 mb-1">
                  {comercio.nombre}
                </h3>
                <p className="text-gray-300 text-sm mb-4">
                  {comercio.descripcion}
                </p>

                <div className="text-sm text-gray-400 space-y-1 mb-4">
                  {comercio.direccion && (
                    <p>
                      Direccion: <MapLink direccion={comercio.direccion} />
                    </p>
                  )}
                  {comercio.telefono && <p>Tel: {comercio.telefono}</p>}
                  {comercio.email && <p>Email: {comercio.email}</p>}
                </div>

                {comercio.whatsapp && <WhatsappButton numero={comercio.whatsapp} />}

                {comercio.productos && comercio.productos.length > 0 && (
                  <div className="border-t border-gray-800 pt-4 mt-4">
                    <h4 className="text-sm font-bold uppercase text-gray-500 mb-3">
                      Productos
                    </h4>
                    <div className="space-y-3">
                      {comercio.productos.map((producto: any) => (
                        <div
                          key={producto.id}
                          className="flex justify-between items-start bg-black/40 rounded p-3"
                        >
                          <div>
                            <p className="font-semibold text-white text-sm">
                              {producto.nombre}
                            </p>
                            <p className="text-gray-400 text-xs">
                              {producto.descripcion}
                            </p>
                          </div>
                          {producto.precio && (
                            <p className="text-blue-400 font-bold text-sm whitespace-nowrap ml-4">
                              ${Number(producto.precio).toLocaleString("es-AR")}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function MapLink({ direccion }: { direccion: string }) {
  const url =
    "https://www.google.com/maps/search/?api=1&query=" +
    encodeURIComponent(direccion);
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 underline">
      {direccion}
    </a>
  );
}

function WhatsappButton({ numero }: { numero: string }) {
  const url = "https://wa.me/" + numero;
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="inline-block bg-green-600 hover:bg-green-500 text-white text-xs font-bold uppercase px-4 py-2 rounded transition mb-4">
      Contactar por WhatsApp
    </a>
  );
}