"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function FormularioRespuesta({ temaId }: { temaId: number }) {
  const router = useRouter();
  const [cargando, setCargando] = useState(true);
  const [perfilId, setPerfilId] = useState<number | null>(null);
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function cargar() {
      const { data: sesion } = await supabase.auth.getSession();
      if (sesion.session) {
        const { data } = await supabase
          .from("perfiles")
          .select("id")
          .eq("user_id", sesion.session.user.id)
          .single();
        if (data) setPerfilId(data.id);
      }
      setCargando(false);
    }
    cargar();
  }, []);

  async function responder(e: React.FormEvent) {
    e.preventDefault();
    if (!perfilId || texto.trim() === "") return;

    setEnviando(true);
    setError("");

    const { error } = await supabase.from("respuestas").insert({
      tema_id: temaId,
      perfil_id: perfilId,
      contenido: texto.trim(),
    });

    setEnviando(false);

    if (error) {
      setError("No se pudo enviar la respuesta: " + error.message);
      return;
    }

    setTexto("");
    router.refresh();
  }

  if (cargando) return null;

  if (!perfilId) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 text-center text-gray-300">
        <Link href="/login" className="text-blue-400 underline">
          Iniciá sesión
        </Link>{" "}
        o{" "}
        <Link href="/registro" className="text-blue-400 underline">
          registrate
        </Link>{" "}
        para responder.
      </div>
    );
  }

  return (
    <form
      onSubmit={responder}
      className="bg-gray-900 border border-gray-800 rounded-lg p-6 space-y-3"
    >
      <p className="text-sm font-semibold text-gray-300">Tu respuesta</p>
      <textarea
        required
        rows={4}
        maxLength={5000}
        placeholder="Escribí tu respuesta..."
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        className="w-full bg-black border border-gray-700 rounded px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
      />
      {error && <p className="text-red-400 text-sm">{error}</p>}
      <button
        type="submit"
        disabled={enviando}
        className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold uppercase px-6 py-2 rounded transition"
      >
        {enviando ? "Enviando..." : "Responder"}
      </button>
    </form>
  );
}