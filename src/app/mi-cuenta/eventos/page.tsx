"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { subirFoto } from "@/lib/imagenes";

type Evento = {
  id: number;
  nombre: string;
  fecha: string;
  lugar: string | null;
};

const eventoVacio = {
  nombre: "",
  fecha: "",
  lugar: "",
  descripcion: "",
  instagram: "",
  facebook: "",
};

const claseInput =
  "w-full bg-black border border-gray-700 rounded px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500";

export default function MisEventos() {
  const router = useRouter();
  const [cargando, setCargando] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [perfilId, setPerfilId] = useState<number | null>(null);
  const [esOrganizador, setEsOrganizador] = useState(false);

  const [eventos, setEventos] = useState<Evento[]>([]);
  const [nuevo, setNuevo] = useState(eventoVacio);
  const [foto, setFoto] = useState<File | null>(null);
  const [claveArchivo, setClaveArchivo] = useState(0);
  const [publicando, setPublicando] = useState(false);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  const hoy = new Date().toLocaleDateString("en-CA");

  useEffect(() => {
    async function cargar() {
      const { data: sesion } = await supabase.auth.getSession();
      if (!sesion.session) {
        router.push("/login");
        return;
      }
      const uid = sesion.session.user.id;
      setUserId(uid);

      const { data: perfil } = await supabase
        .from("perfiles")
        .select("id, es_organizador")
        .eq("user_id", uid)
        .single();

      if (!perfil) {
        setCargando(false);
        return;
      }
      setPerfilId(perfil.id);
      setEsOrganizador(perfil.es_organizador);

      const { data } = await supabase
        .from("eventos")
        .select("id, nombre, fecha, lugar")
        .eq("perfil_id", perfil.id)
        .order("fecha", { ascending: true });

      setEventos(data ?? []);
      setCargando(false);
    }
    cargar();
  }, [router]);

  const previewFoto = useMemo(() => (foto ? URL.createObjectURL(foto) : null), [foto]);

  function cambiar(campo: keyof typeof eventoVacio, valor: string) {
    setNuevo((n) => ({ ...n, [campo]: valor }));
  }

  async function publicarEvento(e: React.FormEvent) {
    e.preventDefault();
    if (!perfilId || !userId) return;

    setPublicando(true);
    setError("");
    setMensaje("");

    try {
      const fotos: string[] = [];
      if (foto) {
        fotos.push(await subirFoto(userId, foto, "evento"));
      }

      const { data, error } = await supabase
        .from("eventos")
        .insert({
          perfil_id: perfilId,
          nombre: nuevo.nombre.trim(),
          fecha: nuevo.fecha,
          lugar: nuevo.lugar.trim() || null,
          descripcion: nuevo.descripcion.trim() || null,
          instagram: nuevo.instagram.replace("@", "").trim() || null,
          facebook: nuevo.facebook.trim() || null,
          fotos,
        })
        .select("id, nombre, fecha, lugar")
        .single();

      if (error) throw new Error(error.message);

      setEventos((lista) =>
        [...lista, data].sort((a, b) => a.fecha.localeCompare(b.fecha))
      );
      setNuevo(eventoVacio);
      setFoto(null);
      setClaveArchivo((k) => k + 1);
      setMensaje("Evento publicado.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocurrió un error inesperado.");
    } finally {
      setPublicando(false);
    }
  }

  async function borrarEvento(id: number) {
    if (!confirm("¿Borrar este evento? No se puede deshacer.")) return;
    const { error } = await supabase.from("eventos").delete().eq("id", id);
    if (error) {
      alert("No se pudo borrar: " + error.message);
      return;
    }
    setEventos((lista) => lista.filter((ev) => ev.id !== id));
  }

  if (cargando) {
    return <div className="bg-black text-gray-400 min-h-screen p-16 text-center">Cargando...</div>;
  }

  if (!esOrganizador) {
    return (
      <div className="bg-black text-gray-300 min-h-screen p-16 text-center space-y-4">
        <p>Primero tenés que activar tu perfil de organizador de eventos.</p>
        <Link href="/mi-cuenta" className="text-blue-400 underline">
          Ir a Mi cuenta
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-black text-white min-h-screen">
      <section className="max-w-3xl mx-auto px-4 py-16 space-y-10">
        <div>
          <Link href="/mi-cuenta" className="text-sm text-gray-400 hover:text-blue-400">
            ← Volver a Mi cuenta
          </Link>
          <h1 className="text-3xl font-extrabold uppercase mt-6">
            Mis <span className="text-blue-400">eventos</span>
          </h1>
        </div>

        <form
          onSubmit={publicarEvento}
          className="bg-gray-900 border border-gray-800 rounded-lg p-6 space-y-4"
        >
          <h2 className="text-lg font-bold uppercase text-gray-300">Publicar evento</h2>

          <label className="block text-sm text-gray-400">
            Nombre del evento
            <input
              type="text"
              required
              placeholder="Ej: 5° Encuentro de Clásicos del Chaco"
              value={nuevo.nombre}
              onChange={(e) => cambiar("nombre", e.target.value)}
              className={claseInput + " mt-1"}
            />
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="block text-sm text-gray-400">
              Fecha
              <input
                type="date"
                required
                min={hoy}
                value={nuevo.fecha}
                onChange={(e) => cambiar("fecha", e.target.value)}
                className={claseInput + " mt-1"}
              />
            </label>
            <label className="block text-sm text-gray-400">
              Lugar
              <input
                type="text"
                required
                placeholder="Ej: Parque 2 de Febrero, Resistencia"
                value={nuevo.lugar}
                onChange={(e) => cambiar("lugar", e.target.value)}
                className={claseInput + " mt-1"}
              />
            </label>
          </div>

          <label className="block text-sm text-gray-400">
            Descripción
            <textarea
              rows={3}
              placeholder="Horarios, categorías, premios, entrada, comida..."
              value={nuevo.descripcion}
              onChange={(e) => cambiar("descripcion", e.target.value)}
              className={claseInput + " mt-1"}
            />
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="block text-sm text-gray-400">
              Instagram del evento (usuario)
              <input
                type="text"
                value={nuevo.instagram}
                onChange={(e) => cambiar("instagram", e.target.value)}
                className={claseInput + " mt-1"}
              />
            </label>
            <label className="block text-sm text-gray-400">
              Facebook del evento (usuario)
              <input
                type="text"
                value={nuevo.facebook}
                onChange={(e) => cambiar("facebook", e.target.value)}
                className={claseInput + " mt-1"}
              />
            </label>
          </div>

          <div>
            <p className="text-sm text-gray-400 mb-2">Flyer o foto del evento</p>
            {previewFoto && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={previewFoto} alt="Vista previa" className="w-full h-48 object-cover rounded mb-2" />
            )}
            <input
              key={claveArchivo}
              type="file"
              accept="image/*"
              onChange={(e) => setFoto(e.target.files?.[0] ?? null)}
              className="text-sm text-gray-400 file:mr-3 file:bg-gray-800 file:text-gray-200 file:border-0 file:px-3 file:py-2 file:rounded"
            />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}
          {mensaje && <p className="text-green-400 text-sm">{mensaje}</p>}

          <button
            type="submit"
            disabled={publicando}
            className="bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white font-bold uppercase text-sm px-6 py-2 rounded transition"
          >
            {publicando ? "Publicando..." : "Publicar evento"}
          </button>
        </form>

        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <h2 className="text-lg font-bold uppercase text-gray-300 mb-4">
            Mis eventos ({eventos.length})
          </h2>

          {eventos.length === 0 && (
            <p className="text-sm text-gray-500">Todavía no publicaste ningún evento.</p>
          )}

          <ul className="divide-y divide-gray-800">
            {eventos.map((ev) => {
              const yaPaso = ev.fecha < hoy;
              const fecha = new Date(ev.fecha + "T00:00:00").toLocaleDateString("es-AR", {
                day: "numeric",
                month: "long",
                year: "numeric",
              });

              return (
                <li key={ev.id} className="flex items-center justify-between gap-4 py-3">
                  <div>
                    <p className="font-semibold">{ev.nombre}</p>
                    <p className="text-sm text-gray-400">
                      {fecha}
                      {ev.lugar && <> · {ev.lugar}</>}
                      {yaPaso && <span className="text-gray-500"> · Finalizado</span>}
                    </p>
                    <Link
                      href={`/eventos?q=${encodeURIComponent(ev.nombre)}&pasados=1`}
                      className="text-xs text-blue-400 underline"
                    >
                      Ver en Eventos
                    </Link>
                  </div>
                  <button
                    onClick={() => borrarEvento(ev.id)}
                    className="text-red-400 hover:text-red-300 text-xs font-bold uppercase"
                  >
                    Borrar
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </section>
    </div>
  );
}