"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { subirFoto } from "@/lib/imagenes";

const claseInput =
  "w-full bg-black border border-gray-700 rounded px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500";

export default function EditarProducto() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [estado, setEstado] = useState<"cargando" | "sin-permiso" | "listo">("cargando");
  const [userId, setUserId] = useState<string | null>(null);
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [precio, setPrecio] = useState("");
  const [fotoOriginal, setFotoOriginal] = useState<string | null>(null);
  const [fotoActual, setFotoActual] = useState<string | null>(null);
  const [fotoNueva, setFotoNueva] = useState<File | null>(null);
  const [guardando, setGuardando] = useState(false);
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

      const [{ data: perfil }, { data: producto }] = await Promise.all([
        supabase.from("perfiles").select("id").eq("user_id", uid).single(),
        supabase.from("productos").select("*, comercios(perfil_id)").eq("id", id).single(),
      ]);

      const dueno = (producto as any)?.comercios?.perfil_id;
      if (!perfil || !producto || dueno !== perfil.id) {
        setEstado("sin-permiso");
        return;
      }

      setNombre(producto.nombre ?? "");
      setDescripcion(producto.descripcion ?? "");
      setPrecio(producto.precio !== null ? String(producto.precio) : "");
      setFotoOriginal(producto.foto_url);
      setFotoActual(producto.foto_url);
      setEstado("listo");
    }
    cargar();
  }, [id, router]);

  const preview = useMemo(
    () => (fotoNueva ? URL.createObjectURL(fotoNueva) : fotoActual),
    [fotoNueva, fotoActual]
  );

  function quitarFoto() {
    setFotoNueva(null);
    setFotoActual(null);
  }

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    if (!userId) return;

    setGuardando(true);
    setError("");

    try {
      let foto_url = fotoActual;
      if (fotoNueva) {
        foto_url = await subirFoto(userId, fotoNueva, "producto");
      }

      const { data, error } = await supabase
        .from("productos")
        .update({
          nombre: nombre.trim(),
          descripcion: descripcion.trim() || null,
          precio: precio ? Number(precio) : null,
          foto_url,
        })
        .eq("id", id)
        .select("id");

      if (error || !data || data.length === 0) {
        throw new Error("No se pudieron guardar los cambios.");
      }

      if (fotoOriginal && fotoOriginal !== foto_url) {
        const ruta = fotoOriginal.split("/fotos-autos/")[1];
        if (ruta) await supabase.storage.from("fotos-autos").remove([ruta]);
      }

      router.push("/mi-cuenta/comercio");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocurrió un error inesperado.");
      setGuardando(false);
    }
  }

  if (estado === "cargando") {
    return <div className="bg-black text-gray-400 min-h-screen p-16 text-center">Cargando...</div>;
  }

  if (estado === "sin-permiso") {
    return (
      <div className="bg-black text-gray-300 min-h-screen p-16 text-center space-y-4">
        <p>No encontramos este producto entre los tuyos.</p>
        <Link href="/mi-cuenta/comercio" className="text-blue-400 underline">
          Volver a Mi comercio
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-black text-white min-h-screen">
      <section className="max-w-2xl mx-auto px-4 py-16">
        <Link href="/mi-cuenta/comercio" className="text-sm text-gray-400 hover:text-blue-400">
          ← Volver a Mi comercio
        </Link>

        <h1 className="text-3xl font-extrabold uppercase mt-6 mb-8">
          Editar <span className="text-blue-400">producto</span>
        </h1>

        <form onSubmit={guardar} className="bg-gray-900 border border-gray-800 rounded-lg p-6 space-y-5">
          <label className="block text-sm text-gray-400">
            Nombre del producto
            <input
              type="text"
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className={claseInput + " mt-1"}
            />
          </label>

          <label className="block text-sm text-gray-400">
            Descripción
            <textarea
              rows={3}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className={claseInput + " mt-1"}
            />
          </label>

          <label className="block text-sm text-gray-400">
            Precio en pesos (opcional)
            <input
              type="number"
              min="0"
              step="0.01"
              value={precio}
              onChange={(e) => setPrecio(e.target.value)}
              className={claseInput + " mt-1"}
            />
          </label>

          <div>
            <p className="text-sm text-gray-400 mb-2">Foto</p>
            {preview && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="Foto del producto" className="w-40 h-40 object-cover rounded mb-2" />
            )}
            <div className="flex flex-wrap gap-3">
              <label className="inline-block cursor-pointer border border-dashed border-gray-600 hover:border-blue-500 text-gray-300 text-sm px-4 py-2 rounded">
                {preview ? "Cambiar foto" : "+ Agregar foto"}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFotoNueva(e.target.files?.[0] ?? null)}
                  className="hidden"
                />
              </label>
              {preview && (
                <button type="button" onClick={quitarFoto} className="text-red-400 hover:text-red-300 text-sm">
                  Quitar foto
                </button>
              )}
            </div>
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={guardando || nombre.trim() === ""}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold uppercase py-3 rounded transition"
          >
            {guardando ? "Guardando..." : "Guardar cambios"}
          </button>
        </form>
      </section>
    </div>
  );
}