"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const MAX_FOTOS = 6;

const claseInput =
  "w-full bg-black border border-gray-700 rounded px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500";

async function achicarImagen(archivo: File): Promise<Blob> {
  try {
    const imagen = await createImageBitmap(archivo);
    const maximo = 1600;
    const escala = Math.min(1, maximo / Math.max(imagen.width, imagen.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(imagen.width * escala);
    canvas.height = Math.round(imagen.height * escala);
    canvas.getContext("2d")!.drawImage(imagen, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", 0.85)
    );
    return blob ?? archivo;
  } catch {
    return archivo;
  }
}

export default function PublicarVehiculo() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [perfilId, setPerfilId] = useState<number | null>(null);
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [enVenta, setEnVenta] = useState(false);
  const [exposiciones, setExposiciones] = useState(false);
  const [fotos, setFotos] = useState<File[]>([]);
  const [estado, setEstado] = useState("");
  const [error, setError] = useState("");
  const [publicando, setPublicando] = useState(false);

  useEffect(() => {
    async function cargar() {
      const { data: sesion } = await supabase.auth.getSession();
      if (!sesion.session) {
        router.push("/login");
        return;
      }
      setUserId(sesion.session.user.id);

      const { data } = await supabase
        .from("perfiles")
        .select("id")
        .eq("user_id", sesion.session.user.id)
        .single();

      if (data) setPerfilId(data.id);
    }
    cargar();
  }, [router]);

  const previews = useMemo(() => fotos.map((f) => URL.createObjectURL(f)), [fotos]);

  useEffect(() => {
    return () => previews.forEach((url) => URL.revokeObjectURL(url));
  }, [previews]);

  function agregarFotos(e: React.ChangeEvent<HTMLInputElement>) {
    const nuevas = Array.from(e.target.files ?? []).filter((f) =>
      f.type.startsWith("image/")
    );
    setFotos((actuales) => [...actuales, ...nuevas].slice(0, MAX_FOTOS));
    e.target.value = "";
  }

  function quitarFoto(indice: number) {
    setFotos((actuales) => actuales.filter((_, i) => i !== indice));
  }

  async function publicar(e: React.FormEvent) {
    e.preventDefault();
    if (!userId || !perfilId) return;

    setError("");
    setPublicando(true);

    try {
      const urls: string[] = [];

      for (let i = 0; i < fotos.length; i++) {
        setEstado(`Subiendo foto ${i + 1} de ${fotos.length}...`);

        const archivo = await achicarImagen(fotos[i]);
        const extension =
          archivo.type === "image/jpeg" ? "jpg" : fotos[i].name.split(".").pop() ?? "jpg";
        const ruta = `${userId}/${Date.now()}-${i}.${extension}`;

        const { error: errorSubida } = await supabase.storage
          .from("fotos-autos")
          .upload(ruta, archivo, { contentType: archivo.type });

        if (errorSubida) {
          throw new Error(`No se pudo subir la foto ${i + 1}: ${errorSubida.message}`);
        }

        const { data } = supabase.storage.from("fotos-autos").getPublicUrl(ruta);
        urls.push(data.publicUrl);
      }

      setEstado("Guardando vehículo...");

      const { error: errorAuto } = await supabase.from("autos").insert({
        perfil_id: perfilId,
        titulo: titulo.trim(),
        descripcion: descripcion.trim() || null,
        en_venta: enVenta,
        participa_exposiciones: exposiciones,
        fotos: urls,
      });

      if (errorAuto) {
        throw new Error("No se pudo guardar el vehículo: " + errorAuto.message);
      }

      router.push("/mi-cuenta");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocurrió un error inesperado.");
      setEstado("");
      setPublicando(false);
    }
  }

  return (
    <div className="bg-black text-white min-h-screen">
      <section className="max-w-2xl mx-auto px-4 py-16">
        <Link href="/mi-cuenta" className="text-sm text-gray-400 hover:text-blue-400">
          ← Volver a Mi cuenta
        </Link>

        <h1 className="text-3xl font-extrabold uppercase mt-6 mb-8">
          Publicar <span className="text-blue-400">vehículo</span>
        </h1>

        <form
          onSubmit={publicar}
          className="bg-gray-900 border border-gray-800 rounded-lg p-6 space-y-5"
        >
          <label className="block text-sm text-gray-400">
            Título
            <input
              type="text"
              required
              placeholder="Ej: Ford Falcon Sprint 1978"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className={claseInput + " mt-1"}
            />
          </label>

          <label className="block text-sm text-gray-400">
            Descripción
            <textarea
              rows={4}
              placeholder="Contá la historia del fierro: motor, restauración, detalles..."
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

            {previews.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mb-3">
                {previews.map((url, i) => (
                  <div key={url} className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt={`Foto ${i + 1}`} className="w-full h-24 object-cover rounded" />
                    {i === 0 && (
                      <span className="absolute bottom-1 left-1 bg-blue-600 text-white text-[10px] font-bold uppercase px-1 rounded">
                        Portada
                      </span>
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
                ))}
              </div>
            )}

            {fotos.length < MAX_FOTOS && (
              <label className="inline-block cursor-pointer border border-dashed border-gray-600 hover:border-blue-500 text-gray-300 text-sm px-4 py-2 rounded">
                + Agregar fotos
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={agregarFotos}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}
          {estado && <p className="text-blue-300 text-sm">{estado}</p>}

          <button
            type="submit"
            disabled={publicando || !perfilId || titulo.trim() === ""}
            className="w-full bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white font-bold uppercase py-3 rounded transition"
          >
            {publicando ? "Publicando..." : "Publicar"}
          </button>
        </form>
      </section>
    </div>
  );
}