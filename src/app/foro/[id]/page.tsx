import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { haceCuanto } from "@/lib/foro";
import FormularioRespuesta from "@/components/FormularioRespuesta";
import MensajeForo from "@/components/MensajeForo";

export default async function TemaForo({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data } = await supabase
    .from("temas")
    .select("*, perfiles(id, nombre), respuestas(*, perfiles(id, nombre))")
    .eq("id", id)
    .single();

  if (!data) notFound();

  const tema = data as any;
  const respuestas = [...(tema.respuestas ?? [])].sort((a: any, b: any) => a.id - b.id);

  return (
    <div className="bg-black text-white min-h-screen">
      <section className="max-w-3xl mx-auto px-4 py-16 space-y-6">
        <Link href="/foro" className="text-sm text-gray-400 hover:text-blue-400">
          ← Volver al foro
        </Link>

        <article className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <span className="inline-block bg-blue-600/20 border border-blue-500 text-blue-300 text-[10px] font-semibold uppercase px-2 py-0.5 rounded mb-3">
            {tema.categoria}
          </span>
          <p className="text-sm text-gray-500 mb-4">
            Por{" "}
            <Link
              href={`/comunidad/perfil/${tema.perfiles?.id}`}
              className="text-gray-300 hover:text-blue-400 underline"
            >
              {tema.perfiles?.nombre ?? "Usuario"}
            </Link>{" "}
            · {haceCuanto(tema.created_at)}
          </p>
          <MensajeForo
            tabla="temas"
            id={tema.id}
            autorPerfilId={tema.perfil_id}
            titulo={tema.titulo}
            contenido={tema.contenido}
            editado={tema.editado_at !== null}
          />
        </article>

        <h2 className="text-lg font-bold uppercase text-gray-300 pt-4">
          {respuestas.length} {respuestas.length === 1 ? "respuesta" : "respuestas"}
        </h2>

        <div className="space-y-3">
          {respuestas.map((r: any) => (
            <div key={r.id} className="bg-gray-900/60 border border-gray-800 rounded-lg p-5">
              <p className="text-sm text-gray-500 mb-2">
                <Link
                  href={`/comunidad/perfil/${r.perfiles?.id}`}
                  className="text-gray-300 font-semibold hover:text-blue-400"
                >
                  {r.perfiles?.nombre ?? "Usuario"}
                </Link>{" "}
                · {haceCuanto(r.created_at)}
              </p>
              <MensajeForo
                tabla="respuestas"
                id={r.id}
                autorPerfilId={r.perfil_id}
                contenido={r.contenido}
                editado={r.editado_at !== null}
              />
            </div>
          ))}
        </div>

        <FormularioRespuesta temaId={Number(id)} />
      </section>
    </div>
  );
}