import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { CATEGORIAS, haceCuanto } from "@/lib/foro";

export default async function Foro({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string }>;
}) {
  const { categoria = "" } = await searchParams;

  let consulta = supabase
    .from("temas")
    .select("id, titulo, categoria, created_at, actividad_at, perfiles(id, nombre), respuestas(count)")
    .order("actividad_at", { ascending: false })
    .limit(50);

  if (categoria) consulta = consulta.eq("categoria", categoria);

  const { data, error } = await consulta;
  const temas = (data ?? []) as any[];

  const estiloFiltro = (activo: boolean) =>
    `text-xs font-semibold uppercase px-3 py-1 rounded border transition ${
      activo
        ? "bg-blue-600 border-blue-600 text-white"
        : "border-gray-700 text-gray-300 hover:border-blue-500"
    }`;

  return (
    <div className="bg-black text-white min-h-screen">
      <section className="max-w-4xl mx-auto px-4 py-16">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold uppercase mb-2">
              Foro <span className="text-blue-400">MotorHub</span>
            </h1>
            <p className="text-gray-400">Charlas, consultas y dato fierrero.</p>
          </div>
          <Link
            href="/foro/nuevo"
            className="bg-green-600 hover:bg-green-500 text-white text-xs font-bold uppercase px-4 py-2 rounded transition"
          >
            + Nuevo tema
          </Link>
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          <Link href="/foro" className={estiloFiltro(!categoria)}>
            Todos
          </Link>
          {CATEGORIAS.map((c) => (
            <Link
              key={c}
              href={`/foro?categoria=${encodeURIComponent(c)}`}
              className={estiloFiltro(categoria === c)}
            >
              {c}
            </Link>
          ))}
        </div>

        {error && (
          <p className="text-red-400">Hubo un problema cargando el foro: {error.message}</p>
        )}

        {!error && temas.length === 0 && (
          <p className="text-gray-500">
            Todavía no hay temas{categoria ? " en esta categoría" : ""}. ¡Arrancá el primero!
          </p>
        )}

        <ul className="space-y-3">
          {temas.map((tema) => {
            const cantidad = tema.respuestas?.[0]?.count ?? 0;
            return (
              <li key={tema.id}>
                <Link
                  href={`/foro/${tema.id}`}
                  className="block bg-gray-900 border border-gray-800 hover:border-blue-500 rounded-lg p-5 transition"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className="inline-block bg-blue-600/20 border border-blue-500 text-blue-300 text-[10px] font-semibold uppercase px-2 py-0.5 rounded mb-2">
                        {tema.categoria}
                      </span>
                      <h2 className="font-bold text-lg text-white">{tema.titulo}</h2>
                      <p className="text-sm text-gray-500 mt-1">
                        Por {tema.perfiles?.nombre ?? "Usuario"} · {haceCuanto(tema.created_at)}
                      </p>
                    </div>
                    <div className="text-center shrink-0">
                      <p className="text-2xl font-extrabold text-blue-400">{cantidad}</p>
                      <p className="text-[10px] uppercase text-gray-500">
                        {cantidad === 1 ? "respuesta" : "respuestas"}
                      </p>
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}