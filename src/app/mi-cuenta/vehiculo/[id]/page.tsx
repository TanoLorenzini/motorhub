"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { subirFoto } from "@/lib/imagenes";

const MAX_FOTOS = 6;

type Foto =
  | { tipo: "existente"; url: string }
  | { tipo: "nueva"; archivo: File; preview: string };

const claseInput =
  "w-full bg-black border border-gray-700 rounded px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500";

export default function EditarVehiculo() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [estado, setEstado] = useState<"cargando" | "sin-permiso" | "listo">("cargando");
  const [userId, setUserId] = useState<string | null>(null);
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [enVenta, setEnVenta] = useState(false);
  const [exposiciones, setExposiciones] = useState(false);
  const [fotos, setFotos] = useState<Foto[]>([]);
  const [originales, setOriginales] = useState<string[]>([]);
  const [guardando, setGuardando] = useState(false);
  const [progreso, setProgreso] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function cargar() {
      const { data: sesion } = await supabase.auth.getSession();
      if (!sesion.session) {
        router.push("/login");
        return;
      }
      const uid = sesion.session.user.id;
      setUserId(uid);

      const [{ data: perfil }, { data: auto }] = await Promise.all([
        supabase.from("perfiles").select("id").eq("user_id", uid).single(),
        supabase.from("autos").select("*").eq("id", id).single(),
      ]);

      if (!perfil || !auto || auto.perfil_id !== perfil.id) {
        setEstado("sin-permiso");
        return;
      }

      const actuales: string[] =
        Array.isArray(auto.fotos) && auto.fotos.length > 0
          ? auto.fotos
          : auto.foto_url
          ? [auto.foto_url]
          : [];

      setTitulo(auto.titulo ?? "");
      setDescripcion(auto.descripcion ?? "");
      setEnVenta(Boolean(auto.en_venta));
      setExposiciones(Boolean(auto.participa_exposiciones));
      setFotos(actuales.map((url) => ({ tipo: "existente", url })));
      setOriginales(actuales);
      setEstado("listo");
    }
    cargar();
  }, [id, router]);

  function agregarFotos(e: React.ChangeEvent<HTMLInputElement>) {
    const nuevas: Foto[] = Array.from(e.target.files ?? [])
      .filter((f) => f.type.startsWith("image/"))
      .map((archivo) => ({ tipo: "nueva", archivo, preview: URL.createObjectURL(archivo) }));
    setFotos((actuales) => [...actuales, ...nuevas].slice(0, MAX_FOTOS));
    e.target.value = "";
  }

  function quitarFoto(indice: number) {
    setFotos((actuales) => actuales.filter((_, i) => i !== indice));
  }

  function hacerPortada(indice: number) {
    setFotos((actuales) => {
      const copia = [...actuales];
      const [elegida] = copia.splice(indice, 1);
      return [elegida, ...copia];
    });
  }

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    if (!userId) return;

    setGuardando(true);
    setError("");

    try {
      const urls: string[] = [];
      const cantidadNuevas = fotos.filter((f) => f.tipo === "nueva").length;
      let subidas = 0;

      for (const foto of fotos) {
        if (foto.tipo === "existente") {
          urls.push(foto.url);
        } else {
          subidas++;
          setProgreso(`Subiendo foto nueva ${subidas} de ${cantidadNuevas}...`);
          urls.push(await subirFoto(userId, foto.archivo, "auto"));
        }
      }

      setProgreso("Guardando cambios...");

      const { data, error } = await supabase
        .from("autos")
        .update({
          titulo: titulo.trim(),
          descripcion: descripcion.trim() || null,
          en_venta: enVenta,
          participa_exposiciones: exposiciones,
          fotos: urls,
          foto_url: null,
        })
        .eq("id", id)
        .select("id");

      if (error || !data || data.length === 0) {
        throw new Error("No se pudieron guardar los cambios.");
      }

      const quitadas = originales
        .filter((url) => !urls.includes(url))
        .map((url) => url.split("/fotos-autos/")[1])
        .filter(Boolean);

      if (quitadas.length > 0) {
        await supabase.storage.from("fotos-autos").remove(quitadas);
      }

      router.push("/mi-cuenta");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocurrió un error inesperado.");
      setProgreso("");
      setGuardando(false);
    }
  }

  if (estado === "cargando") {
    return <div className="bg-black text-gray-400 min-h-screen p-16 text-center">Cargando...</div>;
  }

  if (estado === "sin-permiso") {
    return (
      <div className="bg-black text-gray-300 min-h-screen p-16 text-center space-y-4">
        <p>No encontramos este vehículo entre los tuyos.</p>
        <Link href="/mi-cuenta" className="text-blue-400 underline">
          Volver a Mi cuenta
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-black text-white min-h-screen">
      <section className="max-w-2xl mx-auto px-4 py-16">
        <Link href="/mi-cuenta" className="text-sm text-gray-400 hover:text-blue-400">
          ← Volver a Mi cuenta
        </Link>

        <h1 className="text-3xl font-extrabold uppercase mt-6 mb-8">
          Editar <span className="text-blue-400">vehículo</span>
        </h1>

        <form onSubmit={guardar} className="bg-gray-900 border border-gray-800 rounded-lg p-6 space-y-5">
          <label className="block text-sm text-gray-400">
            Título
            <input
              type="text"
              required
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className={claseInput + " mt-1"}
            />
          </label>

          <label className="block text-sm text-gray-400">
            Descripción
            <textarea
              rows={4}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className={claseInput + " mt-1"}
            />
          </label>

          <div className="flex flex-col gap-3 text-sm text-gray-300">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={enVenta}
                onChange={(e) => setEnVenta(e.target.checked)}
                className="accent-yellow-500 w-4 h-4"
              />
              Está a la venta
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={exposiciones}
                onChange={(e) => setExposiciones(e.target.checked)}
                className="accent-blue-500 w-4 h-4"
              />
              Me gustaría participar en exposiciones
            </label>
          </div>

          <div>
            <p className="text-sm text-gray-400 mb-2">
              Fotos ({fotos.length} de {MAX_FOTOS}). La primera es la portada.
            </p>

            {fotos.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mb-3">
                {fotos.map((foto, i) => {
                  const src = foto.tipo === "existente" ? foto.url : foto.preview;
                  return (
                    <div key={src} className="relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={src} alt={`Foto ${i + 1}`} className="w-full h-24 object-cover rounded" />
                      {i === 0 ? (
                        <span className="absolute bottom-1 left-1 bg-blue-600 text-white text-[10px] font-bold uppercase px-1 rounded">
                          Portada
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => hacerPortada(i)}
                          className="absolute bottom-1 left-1 bg-black/70 hover:bg-blue-600 text-white text-[10px] font-bold uppercase px-1 rounded"
                        >
                          Hacer portada
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => quitarFoto(i)}
                        className="absolute top-1 right-1 bg-black/70 hover:bg-red-600 text-white text-xs w-6 h-6 rounded-full"
                        aria-label="Quitar foto"
                      >
                        ✕
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {fotos.length < MAX_FOTOS && (
              <label className="inline-block cursor-pointer border border-dashed border-gray-600 hover:border-blue-500 text-gray-300 text-sm px-4 py-2 rounded">
                + Agregar fotos
                <input type="file" accept="image/*" multiple onChange={agregarFotos} className="hidden" />
              </label>
            )}
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}
          {progreso && <p className="text-blue-300 text-sm">{progreso}</p>}

          <button
            type="submit"
            disabled={guardando || titulo.trim() === ""}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold uppercase py-3 rounded transition"
          >
            {guardando ? "Guardando..." : "Guardar cambios"}
          </button>
        </form>
      </section>
    </div>
  );
}