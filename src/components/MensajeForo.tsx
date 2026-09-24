"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { obtenerUsuarioForo, type UsuarioForo } from "@/lib/usuarioForo";

type Props = {
  tabla: "temas" | "respuestas";
  id: number;
  autorPerfilId: number;
  titulo?: string;
  contenido: string;
  editado: boolean;
};

const claseInput =
  "w-full bg-black border border-gray-700 rounded px-4 py-2 text-white focus:outline-none focus:border-blue-500";

export default function MensajeForo({ tabla, id, autorPerfilId, titulo, contenido, editado }: Props) {
  const router = useRouter();
  const [usuario, setUsuario] = useState<UsuarioForo | null>(null);
  const [editando, setEditando] = useState(false);
  const [nuevoTitulo, setNuevoTitulo] = useState(titulo ?? "");
  const [nuevoContenido, setNuevoContenido] = useState(contenido);
  const [trabajando, setTrabajando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    obtenerUsuarioForo().then(setUsuario);
  }, []);

  const esTema = tabla === "temas";
  const esAutor = usuario?.perfilId === autorPerfilId;
  const puedeBorrar = esAutor || usuario?.esAdmin === true;

  function empezarEdicion() {
    setNuevoTitulo(titulo ?? "");
    setNuevoContenido(contenido);
    setError("");
    setEditando(true);
  }

  async function guardar() {
    setTrabajando(true);
    setError("");

    const cambios: Record<string, string> = {
      contenido: nuevoContenido.trim(),
      editado_at: new Date().toISOString(),
    };
    if (esTema) cambios.titulo = nuevoTitulo.trim();

    const { data, error } = await supabase.from(tabla).update(cambios).eq("id", id).select("id");

    setTrabajando(false);

    if (error || !data || data.length === 0) {
      setError(
        error?.message.includes("check")
          ? "El título tiene que tener entre 5 y 120 caracteres, y el mensaje no puede quedar vacío."
          : "No se pudieron guardar los cambios."
      );
      return;
    }

    setEditando(false);
    router.refresh();
  }

  async function borrar() {
    const aviso = esTema
      ? "¿Borrar este tema? También se van a borrar todas sus respuestas. No se puede deshacer."
      : "¿Borrar esta respuesta? No se puede deshacer.";
    if (!confirm(aviso)) return;

    setTrabajando(true);
    setError("");

    const { data, error } = await supabase.from(tabla).delete().eq("id", id).select("id");

    if (error || !data || data.length === 0) {
      setError("No se pudo borrar.");
      setTrabajando(false);
      return;
    }

    if (esTema) {
      router.push("/foro");
    }
    router.refresh();
  }

  if (editando) {
    return (
      <div className="space-y-3">
        {esTema && (
          <input
            type="text"
            minLength={5}
            maxLength={120}
            value={nuevoTitulo}
            onChange={(e) => setNuevoTitulo(e.target.value)}
            className={claseInput + " text-lg font-bold"}
          />
        )}
        <textarea
          rows={esTema ? 8 : 4}
          maxLength={5000}
          value={nuevoContenido}
          onChange={(e) => setNuevoContenido(e.target.value)}
          className={claseInput}
        />
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={guardar}
            disabled={trabajando}
            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold uppercase px-4 py-2 rounded transition"
          >
            {trabajando ? "Guardando..." : "Guardar"}
          </button>
          <button
            type="button"
            onClick={() => setEditando(false)}
            disabled={trabajando}
            className="text-gray-400 hover:text-white text-xs font-bold uppercase px-4 py-2"
          >
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {esTema && (
        <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-4">{titulo}</h1>
      )}
      <p className="text-gray-200 whitespace-pre-line leading-relaxed">{contenido}</p>
      {editado && <p className="text-xs text-gray-500 mt-2">(editado)</p>}

      {(esAutor || puedeBorrar) && (
        <div className="flex gap-4 mt-4">
          {esAutor && (
            <button
              type="button"
              onClick={empezarEdicion}
              className="text-gray-400 hover:text-blue-400 text-xs font-bold uppercase"
            >
              Editar
            </button>
          )}
          {puedeBorrar && (
            <button
              type="button"
              onClick={borrar}
              disabled={trabajando}
              className="text-red-400 hover:text-red-300 text-xs font-bold uppercase"
            >
              {esAutor ? "Borrar" : "Borrar (moderador)"}
            </button>
          )}
        </div>
      )}

      {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
    </div>
  );
}