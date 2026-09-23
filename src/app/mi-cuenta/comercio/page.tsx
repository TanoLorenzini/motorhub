"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { subirFoto } from "@/lib/imagenes";
import EstadoSuscripcion from "@/components/EstadoSuscripcion";

const LIMITE_GRATIS = 3;

const RUBROS = [
  "Venta de autos y motos",
  "Repuestos",
  "Lubricentro",
  "Lavadero",
  "Mantenimiento y service",
  "Restauración",
  "Chapa y pintura",
  "Gomería",
  "Accesorios",
  "Otros",
];

type Comercio = {
  id?: number;
  nombre: string;
  rubros: string[];
  descripcion: string;
  direccion: string;
  telefono: string;
  email: string;
  whatsapp: string;
  instagram: string;
  facebook: string;
  fotos: string[];
};

type Producto = {
  id: number;
  nombre: string;
  descripcion: string | null;
  precio: number | null;
  foto_url: string | null;
};

const comercioVacio: Comercio = {
  nombre: "",
  rubros: [],
  descripcion: "",
  direccion: "",
  telefono: "",
  email: "",
  whatsapp: "",
  instagram: "",
  facebook: "",
  fotos: [],
};

const claseInput =
  "w-full bg-black border border-gray-700 rounded px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500";

export default function MiComercio() {
  const router = useRouter();
  const [cargando, setCargando] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [perfilId, setPerfilId] = useState<number | null>(null);
  const [esComerciante, setEsComerciante] = useState(false);
  const [vence, setVence] = useState<string | null>(null);

  const [comercio, setComercio] = useState<Comercio>(comercioVacio);
  const [fotoNueva, setFotoNueva] = useState<File | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  const [productos, setProductos] = useState<Producto[]>([]);
  const [nuevoProducto, setNuevoProducto] = useState({ nombre: "", descripcion: "", precio: "" });
  const [fotoProducto, setFotoProducto] = useState<File | null>(null);
  const [claveArchivo, setClaveArchivo] = useState(0);
  const [agregando, setAgregando] = useState(false);

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
        .select("id, es_comerciante")
        .eq("user_id", uid)
        .single();

      if (!perfil) {
        setCargando(false);
        return;
      }
      setPerfilId(perfil.id);
      setEsComerciante(perfil.es_comerciante);

      const [{ data: c }, { data: suscripcion }] = await Promise.all([
        supabase
          .from("comercios")
          .select("*, productos(*)")
          .eq("perfil_id", perfil.id)
          .maybeSingle(),
        supabase
          .from("suscripciones")
          .select("comercio_vence")
          .eq("perfil_id", perfil.id)
          .maybeSingle(),
      ]);

      setVence(suscripcion?.comercio_vence ?? null);

      if (c) {
        setComercio({
          id: c.id,
          nombre: c.nombre ?? "",
          rubros: c.rubros ?? [],
          descripcion: c.descripcion ?? "",
          direccion: c.direccion ?? "",
          telefono: c.telefono ?? "",
          email: c.email ?? "",
          whatsapp: c.whatsapp ?? "",
          instagram: c.instagram ?? "",
          facebook: c.facebook ?? "",
          fotos: c.fotos ?? [],
        });
        setProductos(
          [...(c.productos ?? [])].sort((a: Producto, b: Producto) => b.id - a.id)
        );
      }
      setCargando(false);
    }
    cargar();
  }, [router]);

  const previewPortada = useMemo(
    () => (fotoNueva ? URL.createObjectURL(fotoNueva) : comercio.fotos[0] ?? null),
    [fotoNueva, comercio.fotos]
  );

  const premiumActivo = vence !== null && new Date(vence) > new Date();
  const llegoAlLimite = !premiumActivo && productos.length >= LIMITE_GRATIS;

  const idsVisibles = useMemo(() => {
    const primeros = [...productos].sort((a, b) => a.id - b.id).slice(0, LIMITE_GRATIS);
    return new Set(primeros.map((p) => p.id));
  }, [productos]);

  function cambiar(campo: keyof Comercio, valor: string) {
    setComercio((c) => ({ ...c, [campo]: valor }));
  }

  function alternarRubro(rubro: string) {
    setComercio((c) => ({
      ...c,
      rubros: c.rubros.includes(rubro)
        ? c.rubros.filter((r) => r !== rubro)
        : [...c.rubros, rubro],
    }));
  }

  async function guardarComercio(e: React.FormEvent) {
    e.preventDefault();
    if (!perfilId || !userId) return;
    if (comercio.rubros.length === 0) {
      setError("Elegí al menos un rubro.");
      return;
    }

    setGuardando(true);
    setError("");
    setMensaje("");

    try {
      let fotos = comercio.fotos;
      if (fotoNueva) {
        fotos = [await subirFoto(userId, fotoNueva, "comercio")];
      }

      const datos = {
        nombre: comercio.nombre.trim(),
        rubros: comercio.rubros,
        descripcion: comercio.descripcion.trim() || null,
        direccion: comercio.direccion.trim() || null,
        telefono: comercio.telefono.trim() || null,
        email: comercio.email.trim() || null,
        whatsapp: comercio.whatsapp.replace(/\D/g, "") || null,
        instagram: comercio.instagram.replace("@", "").trim() || null,
        facebook: comercio.facebook.trim() || null,
        fotos,
      };

      if (comercio.id) {
        const { error } = await supabase.from("comercios").update(datos).eq("id", comercio.id);
        if (error) throw new Error(error.message);
        setComercio((c) => ({ ...c, fotos }));
      } else {
        const { data, error } = await supabase
          .from("comercios")
          .insert({ ...datos, perfil_id: perfilId })
          .select("id")
          .single();
        if (error) throw new Error(error.message);
        setComercio((c) => ({ ...c, id: data.id, fotos }));
      }

      setFotoNueva(null);
      setMensaje("Comercio guardado.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocurrió un error inesperado.");
    } finally {
      setGuardando(false);
    }
  }

  async function agregarProducto(e: React.FormEvent) {
    e.preventDefault();
    if (!comercio.id || !userId) return;

    setAgregando(true);
    setError("");

    try {
      let foto_url: string | null = null;
      if (fotoProducto) {
        foto_url = await subirFoto(userId, fotoProducto, "producto");
      }

      const { data, error } = await supabase
        .from("productos")
        .insert({
          comercio_id: comercio.id,
          nombre: nuevoProducto.nombre.trim(),
          descripcion: nuevoProducto.descripcion.trim() || null,
          precio: nuevoProducto.precio ? Number(nuevoProducto.precio) : null,
          foto_url,
        })
        .select()
        .single();

      if (error) {
        if (error.message.includes("row-level security")) {
          throw new Error(
            `Llegaste al límite de ${LIMITE_GRATIS} productos del plan gratuito. Con Premium cargás sin límite.`
          );
        }
        throw new Error(error.message);
      }

      setProductos((lista) => [data, ...lista]);
      setNuevoProducto({ nombre: "", descripcion: "", precio: "" });
      setFotoProducto(null);
      setClaveArchivo((k) => k + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocurrió un error inesperado.");
    } finally {
      setAgregando(false);
    }
  }

  async function borrarProducto(id: number) {
    if (!confirm("¿Borrar este producto?")) return;
    const { error } = await supabase.from("productos").delete().eq("id", id);
    if (error) {
      alert("No se pudo borrar: " + error.message);
      return;
    }
    setProductos((lista) => lista.filter((p) => p.id !== id));
  }

  if (cargando) {
    return <div className="bg-black text-gray-400 min-h-screen p-16 text-center">Cargando...</div>;
  }

  if (!esComerciante) {
    return (
      <div className="bg-black text-gray-300 min-h-screen p-16 text-center space-y-4">
        <p>Primero tenés que activar tu perfil de comerciante.</p>
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
            Mi <span className="text-blue-400">comercio</span>
          </h1>
        </div>

        <EstadoSuscripcion
          tipo="comercio"
          vence={vence}
          cantidad={productos.length}
          limite={LIMITE_GRATIS}
        />

        <form
          onSubmit={guardarComercio}
          className="bg-gray-900 border border-gray-800 rounded-lg p-6 space-y-5"
        >
          <h2 className="text-lg font-bold uppercase text-gray-300">Datos del comercio</h2>

          <div>
            <p className="text-sm text-gray-400 mb-2">Foto de portada</p>
            {previewPortada && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={previewPortada} alt="Portada" className="w-full h-48 object-cover rounded mb-2" />
            )}
            <label className="inline-block cursor-pointer border border-dashed border-gray-600 hover:border-blue-500 text-gray-300 text-sm px-4 py-2 rounded">
              {previewPortada ? "Cambiar foto" : "+ Agregar foto"}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFotoNueva(e.target.files?.[0] ?? null)}
                className="hidden"
              />
            </label>
          </div>

          <label className="block text-sm text-gray-400">
            Nombre del comercio
            <input
              type="text"
              required
              value={comercio.nombre}
              onChange={(e) => cambiar("nombre", e.target.value)}
              className={claseInput + " mt-1"}
            />
          </label>

          <div>
            <p className="text-sm text-gray-400 mb-2">¿A qué se dedica? (podés elegir varios)</p>
            <div className="flex flex-wrap gap-2">
              {RUBROS.map((rubro) => {
                const elegido = comercio.rubros.includes(rubro);
                return (
                  <button
                    key={rubro}
                    type="button"
                    onClick={() => alternarRubro(rubro)}
                    className={`text-xs font-semibold uppercase px-3 py-1 rounded border transition ${
                      elegido
                        ? "bg-blue-600 border-blue-600 text-white"
                        : "border-gray-600 text-gray-300 hover:border-blue-500"
                    }`}
                  >
                    {rubro}
                  </button>
                );
              })}
            </div>
          </div>

          <label className="block text-sm text-gray-400">
            Descripción
            <textarea
              rows={3}
              placeholder="Qué ofrecen, especialidades, horarios..."
              value={comercio.descripcion}
              onChange={(e) => cambiar("descripcion", e.target.value)}
              className={claseInput + " mt-1"}
            />
          </label>

          <label className="block text-sm text-gray-400">
            Dirección
            <input
              type="text"
              placeholder="Ej: Av. 9 de Julio 1234, Resistencia, Chaco"
              value={comercio.direccion}
              onChange={(e) => cambiar("direccion", e.target.value)}
              className={claseInput + " mt-1"}
            />
            <span className="text-xs text-gray-500">
              Con calle, número y ciudad, así el link a Google Maps la encuentra bien.
            </span>
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="block text-sm text-gray-400">
              Teléfono
              <input
                type="tel"
                value={comercio.telefono}
                onChange={(e) => cambiar("telefono", e.target.value)}
                className={claseInput + " mt-1"}
              />
            </label>
            <label className="block text-sm text-gray-400">
              Email
              <input
                type="email"
                value={comercio.email}
                onChange={(e) => cambiar("email", e.target.value)}
                className={claseInput + " mt-1"}
              />
            </label>
            <label className="block text-sm text-gray-400">
              WhatsApp
              <input
                type="tel"
                placeholder="Ej: 5493624123456"
                value={comercio.whatsapp}
                onChange={(e) => cambiar("whatsapp", e.target.value)}
                className={claseInput + " mt-1"}
              />
            </label>
            <label className="block text-sm text-gray-400">
              Instagram (usuario)
              <input
                type="text"
                value={comercio.instagram}
                onChange={(e) => cambiar("instagram", e.target.value)}
                className={claseInput + " mt-1"}
              />
            </label>
            <label className="block text-sm text-gray-400">
              Facebook (usuario)
              <input
                type="text"
                value={comercio.facebook}
                onChange={(e) => cambiar("facebook", e.target.value)}
                className={claseInput + " mt-1"}
              />
            </label>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <button
              type="submit"
              disabled={guardando}
              className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold uppercase text-sm px-6 py-2 rounded transition"
            >
              {guardando ? "Guardando..." : comercio.id ? "Guardar cambios" : "Crear comercio"}
            </button>
            {mensaje && <p className="text-sm text-green-400">{mensaje}</p>}
            {comercio.id && (
              <Link
                href={`/comercios?q=${encodeURIComponent(comercio.nombre)}`}
                className="text-sm text-blue-400 underline"
              >
                Ver cómo se ve en Comercios
              </Link>
            )}
          </div>
        </form>

        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 space-y-5">
          <h2 className="text-lg font-bold uppercase text-gray-300">
            Productos ({productos.length})
          </h2>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          {!comercio.id ? (
            <p className="text-sm text-gray-500">
              Primero guardá los datos de tu comercio, y después vas a poder cargar productos.
            </p>
          ) : (
            <>
              {llegoAlLimite ? (
                <p className="text-sm text-yellow-300 bg-yellow-500/10 border border-yellow-600 rounded p-3">
                  Llegaste al límite de {LIMITE_GRATIS} productos del plan gratuito. Con Premium podés
                  cargar todos los que quieras.
                </p>
              ) : (
                <form onSubmit={agregarProducto} className="space-y-3 border border-gray-800 rounded p-4">
                  <p className="text-sm font-semibold text-gray-300">Agregar producto</p>
                  <input
                    type="text"
                    required
                    placeholder="Nombre del producto"
                    value={nuevoProducto.nombre}
                    onChange={(e) => setNuevoProducto({ ...nuevoProducto, nombre: e.target.value })}
                    className={claseInput}
                  />
                  <textarea
                    rows={2}
                    placeholder="Descripción: marca, compatibilidad, estado..."
                    value={nuevoProducto.descripcion}
                    onChange={(e) => setNuevoProducto({ ...nuevoProducto, descripcion: e.target.value })}
                    className={claseInput}
                  />
                  <div className="grid gap-3 md:grid-cols-2">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Precio en pesos (opcional)"
                      value={nuevoProducto.precio}
                      onChange={(e) => setNuevoProducto({ ...nuevoProducto, precio: e.target.value })}
                      className={claseInput}
                    />
                    <input
                      key={claveArchivo}
                      type="file"
                      accept="image/*"
                      onChange={(e) => setFotoProducto(e.target.files?.[0] ?? null)}
                      className="text-sm text-gray-400 file:mr-3 file:bg-gray-800 file:text-gray-200 file:border-0 file:px-3 file:py-2 file:rounded"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={agregando}
                    className="bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white text-xs font-bold uppercase px-4 py-2 rounded transition"
                  >
                    {agregando ? "Agregando..." : "+ Agregar producto"}
                  </button>
                </form>
              )}

              {productos.length === 0 && (
                <p className="text-sm text-gray-500">Todavía no cargaste productos.</p>
              )}

              <ul className="divide-y divide-gray-800">
                {productos.map((p) => {
                  const oculto = !premiumActivo && !idsVisibles.has(p.id);
                  return (
                    <li key={p.id} className={`flex items-center gap-3 py-3 ${oculto ? "opacity-50" : ""}`}>
                      {p.foto_url && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.foto_url} alt={p.nombre} className="w-14 h-14 object-cover rounded" />
                      )}
                      <div className="flex-1">
                        <p className="font-semibold text-sm">
                          {p.nombre}
                          {oculto && (
                            <span className="ml-2 bg-gray-700 text-gray-300 text-[10px] font-bold uppercase px-2 py-0.5 rounded">
                              Oculto
                            </span>
                          )}
                        </p>
                        {p.precio !== null && (
                          <p className="text-blue-400 text-sm">
                            ${Number(p.precio).toLocaleString("es-AR")}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => borrarProducto(p.id)}
                        className="text-red-400 hover:text-red-300 text-xs font-bold uppercase"
                      >
                        Borrar
                      </button>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </div>
      </section>
    </div>
  );
}