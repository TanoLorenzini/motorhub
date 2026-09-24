"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { CATEGORIAS } from "@/lib/foro";

const claseInput =
  "w-full bg-black border border-gray-700 rounded px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500";

export default function NuevoTema() {
  const router = useRouter();
  const [perfilId, setPerfilId] = useState<number | null>(null);
  const [categoria, setCategoria] = useState(CATEGORIAS[0]);
  const [titulo, setTitulo] = useState("");
  const [contenido, setContenido] = useState("");
  const [publicando, setPublicando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function cargar() {
      const { data: sesion } = await supabase.auth.getSession();
      if (!sesion.session) {
        router.push("/login");
        return;
      }
      const { data } = await supabase
        .from("perfiles")
        .select("id")
        .eq("user_id", sesion.session.user.id)
        .single();
      if (data) setPerfilId(data.id);
    }
    cargar();
  }, [router]);

  async function publicar(e: React.FormEvent) {
    e.preventDefault();
    if (!perfilId) return;

    setPublicando(true);
    setError("");

    const { data, error } = await supabase
      .from("temas")
      .insert({
        perfil_id: perfilId,
        categoria,
        titulo: titulo.trim(),
        contenido: contenido.trim(),
      })
      .select("id")
      .single();

    if (error) {
      setError(
        error.message.includes("check")
          ? "El título tiene que tener entre 5 y 120 caracteres."
          : "No se pudo publicar: " + error.message
      );
      setPublicando(false);
      return;
    }

    router.push(`/foro/${data.id}`);
  }

  return (
    <div className="bg-black text-white min-h-screen">
      <section className="max-w-2xl mx-auto px-4 py-16">
        <Link href="/foro" className="text-sm text-gray-400 hover:text-blue-400">
          ← Volver al foro
        </Link>

        <h1 className="text-3xl font-extrabold uppercase mt-6 mb-8">
          Nuevo <span className="text-blue-400">tema</span>
        </h1>

        <form
          onSubmit={publicar}
          className="bg-gray-900 border border-gray-800 rounded-lg p-6 space-y-4"
        >
          <label className="block text-sm text-gray-400">
            Categoría
            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className={claseInput + " mt-1"}
            >
              {CATEGORIAS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>

          <label className="block text-sm text-gray-400">
            Título
            <input
              type="text"
              required
              minLength={5}
              maxLength={120}
              placeholder="Ej: ¿Dónde consigo burletes para un Torino 380?"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className={claseInput + " mt-1"}
            />
          </label>

          <label className="block text-sm text-gray-400">
            Mensaje
            <textarea
              required
              rows={8}
              maxLength={5000}
              placeholder="Contá tu consulta o lo que quieras compartir..."
              value={contenido}
              onChange={(e) => setContenido(e.target.value)}
              className={claseInput + " mt-1"}
            />
          </label>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={publicando || !perfilId}
            className="w-full bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white font-bold uppercase py-3 rounded transition"
          >
            {publicando ? "Publicando..." : "Publicar tema"}
          </button>
        </form>
      </section>
    </div>
  );
}