import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

function normalizar(texto: string) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function generarLinkIcs(evento: {
  nombre: string;
  fecha: string;
  lugar: string;
  descripcion: string;
}) {
  const fechaSinGuiones = evento.fecha.replace(/-/g, "");

  const escapar = (texto: string) =>
    (texto ?? "").replace(/,/g, "\\,").replace(/;/g, "\\;");

  const contenido = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "BEGIN:VEVENT",
    "DTSTART;VALUE=DATE:" + fechaSinGuiones,
    "SUMMARY:" + escapar(evento.nombre),
    "LOCATION:" + escapar(evento.lugar),
    "DESCRIPTION:" + escapar(evento.descripcion),
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  return "data:text/calendar;charset=utf8," + encodeURIComponent(contenido);
}

export default async function Eventos({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; pasados?: string }>;
}) {
  const { q = "", pasados = "" } = await searchParams;
  const incluirPasados = pasados === "1";

  const { data, error } = await supabase
    .from("eventos")
    .select("*")
    .order("fecha", { ascending: true });

  const hoy = new Date().toISOString().slice(0, 10);
  const busqueda = normalizar(q.trim());

  const eventos = (data ?? []).filter((e) => {
    const esFuturo = e.fecha >= hoy;
    if (!incluirPasados && !esFuturo) return false;
    if (!busqueda) return true;
    const texto = normalizar([e.nombre, e.lugar, e.descripcion].join(" "));
    return texto.includes(busqueda);
  });

  const hayFiltros = q !== "" || incluirPasados;

  return (
    <div className="bg-black text-white min-h-screen">
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h1 className="text-3xl md:text-4xl font-extrabold uppercase mb-2">
          Eventos <span className="text-blue-400">MotorHub</span>
        </h1>
        <p className="text-gray-400 mb-8">
          Encuentros y juntadas cerca tuyo.
        </p>

        <form method="get" className="flex flex-col md:flex-row md:items-center gap-3 mb-4">
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Buscar por nombre, ciudad o tipo de evento..."
            className="flex-1 bg-gray-900 border border-gray-700 rounded px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
          <label className="flex items-center gap-2 text-sm text-gray-400">
            <input
              type="checkbox"
              name="pasados"
              value="1"
              defaultChecked={incluirPasados}
              className="accent-blue-500"
            />
            Incluir eventos pasados
          </label>
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold uppercase text-sm px-6 py-2 rounded transition"
          >
            Buscar
          </button>
        </form>

        {hayFiltros && (
          <p className="text-sm text-gray-400 mb-8">
            {eventos.length} resultado(s).{" "}
            <Link href="/eventos" className="text-blue-400 underline">
              Limpiar busqueda
            </Link>
          </p>
        )}

        {error && (
          <p className="text-red-400">
            Hubo un problema cargando los eventos: {error.message}
          </p>
        )}

        {!error && eventos.length === 0 && (
          <p className="text-gray-500">
            {hayFiltros
              ? "No encontramos eventos con esa busqueda."
              : "No hay eventos proximos por ahora."}
          </p>
        )}

        <div className="grid gap-6 md:grid-cols-3">
          {eventos.map((evento) => {
            const fechaFormateada = new Date(
              evento.fecha + "T00:00:00"
            ).toLocaleDateString("es-AR", {
              day: "numeric",
              month: "long",
              year: "numeric",
            });
            const yaPaso = evento.fecha < hoy;

            return (
              <div
                key={evento.id}
                className={`bg-gray-900 border border-gray-800 rounded-lg overflow-hidden hover:border-blue-500 transition ${yaPaso ? "opacity-60" : ""}`}
              >
                {evento.fotos && evento.fotos.length > 0 && (
                  <div className="relative w-full h-40 bg-gray-800">
                    <Image
                      src={evento.fotos[0]}
                      alt={evento.nombre}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}

                <div className="p-6">
                  {yaPaso && (
                    <span className="inline-block bg-gray-700 text-gray-300 text-xs font-bold uppercase px-2 py-1 rounded mb-2">
                      Finalizado
                    </span>
                  )}
                  <h3 className="text-lg font-bold text-blue-400 mb-1">
                    {evento.nombre}
                  </h3>
                  <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">
                    {fechaFormateada}
                  </p>
                  <p className="text-sm text-gray-500 mb-3">{evento.lugar}</p>
                  <p className="text-gray-300 text-sm mb-4">
                    {evento.descripcion}
                  </p>

                  {!yaPaso && <a href={generarLinkIcs(evento)} download={evento.nombre + ".ics"} className="inline-block bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase px-4 py-2 rounded transition">Agendar</a>}

                  <div className="flex gap-3 mt-3">
                    {evento.instagram && <a href={`https://instagram.com/${evento.instagram}`} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-400 text-xs underline">Instagram</a>}
                    {evento.facebook && <a href={`https://facebook.com/${evento.facebook}`} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-400 text-xs underline">Facebook</a>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}