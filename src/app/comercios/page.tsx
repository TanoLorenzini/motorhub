import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import CompartirBoton from "@/components/CompartirBoton";

const LIMITE_GRATIS = 3;

function normalizar(texto: string) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export default async function Comercios({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; rubro?: string }>;
}) {
  const { q = "", rubro = "" } = await searchParams;

  const [{ data, error }, { data: suscripciones }] = await Promise.all([
    supabase
      .from("comercios")
      .select("*, productos(*)")
      .order("created_at", { ascending: false }),
    supabase.from("suscripciones").select("perfil_id, comercio_vence"),
  ]);

  const ahora = new Date();
  const perfilesPremium = new Set(
    (suscripciones ?? [])
      .filter((s) => s.comercio_vence && new Date(s.comercio_vence) > ahora)
      .map((s) => s.perfil_id)
  );

  const todos = (data ?? []).map((c) => {
    const ordenados = [...(c.productos ?? [])].sort((a: any, b: any) => a.id - b.id);
    const sinLimite = !c.perfil_id || perfilesPremium.has(c.perfil_id);
    return { ...c, productos: sinLimite ? ordenados : ordenados.slice(0, LIMITE_GRATIS) };
  });

  const rubrosDisponibles: string[] = Array.from(
    new Set(todos.flatMap((c) => c.rubros ?? []))
  );

  const busqueda = normalizar(q.trim());

  const comercios = todos.filter((c) => {
    const coincideRubro = !rubro || (c.rubros ?? []).includes(rubro);
    if (!busqueda) return coincideRubro;

    const textoProductos = c.productos
      .map((p: any) => (p.nombre ?? "") + " " + (p.descripcion ?? ""))
      .join(" ");

    const texto = normalizar(
      [c.nombre, c.descripcion, c.direccion, ...(c.rubros ?? []), textoProductos].join(" ")
    );

    return coincideRubro && texto.includes(busqueda);
  });

  const hayFiltros = q !== "" || rubro !== "";

  return (
    <div className="bg-black text-white min-h-screen">
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h1 className="text-3xl md:text-4xl font-extrabold uppercase mb-2">
          Comercios <span className="text-blue-400">MotorHub</span>
        </h1>
        <p className="text-gray-400 mb-8">
          Talleres, repuestos y servicios de confianza.
        </p>

        <form method="get" className="flex flex-col md:flex-row gap-3 mb-4">
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Buscar comercio, producto o servicio..."
            className="flex-1 bg-gray-900 border border-gray-700 rounded px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
          <select
            name="rubro"
            defaultValue={rubro}
            className="bg-gray-900 border border-gray-700 rounded px-4 py-2 text-white focus:outline-none focus:border-blue-500"
          >
            <option value="">Todos los rubros</option>
            {rubrosDisponibles.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold uppercase text-sm px-6 py-2 rounded transition"
          >
            Buscar
          </button>
        </form>

        {hayFiltros && (
          <p className="text-sm text-gray-400 mb-8">
            {comercios.length} resultado(s).{" "}
            <Link href="/comercios" className="text-blue-400 underline">
              Limpiar busqueda
            </Link>
          </p>
        )}

        {error && (
          <p className="text-red-400">
            Hubo un problema cargando los comercios: {error.message}
          </p>
        )}

        {!error && comercios.length === 0 && (
          <p className="text-gray-500">
            {hayFiltros
              ? "No encontramos comercios con esa busqueda."
              : "Todavia no hay comercios cargados."}
          </p>
        )}

        <div className="grid gap-8 md:grid-cols-2">
          {comercios.map((comercio) => (
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
                  {comercio.rubros?.map((r: string) => (
                    <span
                      key={r}
                      className="bg-blue-600/20 border border-blue-500 text-blue-300 text-xs font-semibold uppercase px-2 py-1 rounded"
                    >
                      {r}
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

                <div className="flex gap-3 mt-3">
                  {comercio.instagram && <a href={`https://instagram.com/${comercio.instagram}`} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-400 text-xs underline">Instagram</a>}
                  {comercio.facebook && <a href={`https://facebook.com/${comercio.facebook}`} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-400 text-xs underline">Facebook</a>}
                </div>

                {comercio.productos.length > 0 && (
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
                            {producto.foto_url && (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={producto.foto_url} alt={producto.nombre} className="w-20 h-20 object-cover rounded mb-2" />
                            )}
                            <p className="font-semibold text-white text-sm">
                              {producto.nombre}
                            </p>
                            <p className="text-gray-400 text-xs">
                              {producto.descripcion}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-2 ml-4">
                            {producto.precio && (
                              <p className="text-blue-400 font-bold text-sm whitespace-nowrap">
                                ${Number(producto.precio).toLocaleString("es-AR")}
                              </p>
                            )}
                            <CompartirBoton
                              chico
                              titulo={producto.nombre}
                              texto={`Mirá ${producto.nombre} en ${comercio.nombre}${producto.precio ? " a $" + Number(producto.precio).toLocaleString("es-AR") : ""}, en MotorHub`}
                              ruta={`/comercios?q=${encodeURIComponent(producto.nombre)}`}
                            />
                          </div>
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
    <a href={url} target="_blank" rel="noopener noreferrer" className="inline-block bg-green-600 hover:bg-green-500 text-white text-xs font-bold uppercase px-4 py-2 rounded transition">
      Contactar por WhatsApp
    </a>
  );
}