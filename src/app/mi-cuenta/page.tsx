"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Perfil = {
  id: number;
  nombre: string;
  ubicacion: string | null;
  whatsapp: string | null;
  instagram: string | null;
  facebook: string | null;
  es_comerciante: boolean;
  es_organizador: boolean;
};

type Auto = {
  id: number;
  titulo: string;
  en_venta: boolean;
  participa_exposiciones: boolean;
};

const claseInput =
  "w-full bg-black border border-gray-700 rounded px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500";

export default function MiCuenta() {
  const router = useRouter();
  const [cargando, setCargando] = useState(true);
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [autos, setAutos] = useState<Auto[]>([]);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    async function cargar() {
      const { data: sesion } = await supabase.auth.getSession();
      if (!sesion.session) {
        router.push("/login");
        return;
      }

      const { data } = await supabase
        .from("perfiles")
        .select("id, nombre, ubicacion, whatsapp, instagram, facebook, es_comerciante, es_organizador, autos(id, titulo, en_venta, participa_exposiciones)")
        .eq("user_id", sesion.session.user.id)
        .single();

      if (data) {
        const { autos, ...datosPerfil } = data;
        setPerfil(datosPerfil);
        setAutos(autos ?? []);
      }
      setCargando(false);
    }
    cargar();
  }, [router]);

  function cambiar(campo: keyof Perfil, valor: string) {
    setPerfil((p) => (p ? { ...p, [campo]: valor } : p));
  }

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    if (!perfil) return;
    setGuardando(true);
    setMensaje("");

    const datos = {
      nombre: perfil.nombre.trim(),
      ubicacion: perfil.ubicacion?.trim() || null,
      whatsapp: perfil.whatsapp?.replace(/\D/g, "") || null,
      instagram: perfil.instagram?.replace("@", "").trim() || null,
      facebook: perfil.facebook?.trim() || null,
    };

    const { error } = await supabase
      .from("perfiles")
      .update(datos)
      .eq("id", perfil.id);

    if (!error) {
      await supabase.auth.updateUser({ data: { nombre: datos.nombre } });
    }

    setGuardando(false);
    setMensaje(error ? "No se pudieron guardar los cambios: " + error.message : "Datos guardados.");
  }

  async function activarRol(campo: "es_comerciante" | "es_organizador") {
    if (!perfil) return;

    const { error } = await supabase
      .from("perfiles")
      .update({ [campo]: true })
      .eq("id", perfil.id);

    if (error) {
      alert("No se pudo activar: " + error.message);
      return;
    }
    setPerfil({ ...perfil, [campo]: true });
  }

  async function borrarAuto(id: number) {
    if (!confirm("¿Seguro que querés borrar este vehículo? No se puede deshacer.")) return;

    const { error } = await supabase.from("autos").delete().eq("id", id);
    if (error) {
      alert("No se pudo borrar: " + error.message);
      return;
    }
    setAutos((lista) => lista.filter((a) => a.id !== id));
  }

  if (cargando) {
    return <div className="bg-black text-gray-400 min-h-screen p-16 text-center">Cargando...</div>;
  }

  if (!perfil) {
    return <div className="bg-black text-gray-400 min-h-screen p-16 text-center">No encontramos tu perfil.</div>;
  }

  return (
    <div className="bg-black text-white min-h-screen">
      <section className="max-w-3xl mx-auto px-4 py-16 space-y-10">
        <h1 className="text-3xl font-extrabold uppercase">
          Mi <span className="text-blue-400">cuenta</span>
        </h1>

        <form
          onSubmit={guardar}
          className="bg-gray-900 border border-gray-800 rounded-lg p-6 space-y-4"
        >
          <h2 className="text-lg font-bold uppercase text-gray-300">Mis datos</h2>

          <label className="block text-sm text-gray-400">
            Nombre
            <input
              type="text"
              required
              value={perfil.nombre}
              onChange={(e) => cambiar("nombre", e.target.value)}
              className={claseInput + " mt-1"}
            />
          </label>

          <label className="block text-sm text-gray-400">
            Ubicación
            <input
              type="text"
              placeholder="Ej: Resistencia, Chaco"
              value={perfil.ubicacion ?? ""}
              onChange={(e) => cambiar("ubicacion", e.target.value)}
              className={claseInput + " mt-1"}
            />
          </label>

          <label className="block text-sm text-gray-400">
            WhatsApp
            <input
              type="tel"
              placeholder="Ej: 5493624123456"
              value={perfil.whatsapp ?? ""}
              onChange={(e) => cambiar("whatsapp", e.target.value)}
              className={claseInput + " mt-1"}
            />
            <span className="text-xs text-gray-500">
              Con código de país (54) y 9, sin el 0 ni el 15.
            </span>
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="block text-sm text-gray-400">
              Instagram (usuario)
              <input
                type="text"
                placeholder="Ej: jeep_ika_tano"
                value={perfil.instagram ?? ""}
                onChange={(e) => cambiar("instagram", e.target.value)}
                className={claseInput + " mt-1"}
              />
            </label>
            <label className="block text-sm text-gray-400">
              Facebook (usuario)
              <input
                type="text"
                placeholder="Ej: JeepIkaTano"
                value={perfil.facebook ?? ""}
                onChange={(e) => cambiar("facebook", e.target.value)}
                className={claseInput + " mt-1"}
              />
            </label>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={guardando}
              className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold uppercase text-sm px-6 py-2 rounded transition"
            >
              {guardando ? "Guardando..." : "Guardar cambios"}
            </button>
            {mensaje && <p className="text-sm text-green-400">{mensaje}</p>}
          </div>
        </form>

        <div>
          <h2 className="text-lg font-bold uppercase text-gray-300 mb-4">Tipo de cuenta</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 flex flex-col">
              <h3 className="font-bold text-blue-400 uppercase mb-2">Comerciante</h3>
              <p className="text-sm text-gray-400 mb-4 flex-1">
                Para talleres, casas de repuestos, lubricentros, lavaderos y todo comercio del rubro. Cargá tu comercio y tus productos.
              </p>
              {perfil.es_comerciante ? (
                <Link
                  href="/mi-cuenta/comercio"
                  className="text-center bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase px-4 py-2 rounded transition"
                >
                  Administrar mi comercio
                </Link>
              ) : (
                <button
                  onClick={() => activarRol("es_comerciante")}
                  className="border border-blue-500 hover:bg-blue-500/10 text-white text-xs font-bold uppercase px-4 py-2 rounded transition"
                >
                  Activar perfil de comerciante
                </button>
              )}
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 flex flex-col">
              <h3 className="font-bold text-blue-400 uppercase mb-2">Organizador de eventos</h3>
              <p className="text-sm text-gray-400 mb-4 flex-1">
                Para clubes y organizadores de encuentros, exposiciones y juntadas. Publicá tus eventos.
              </p>
              {perfil.es_organizador ? (
                <Link
                  href="/mi-cuenta/eventos"
                  className="text-center bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase px-4 py-2 rounded transition"
                >
                  Administrar mis eventos
                </Link>
              ) : (
                <button
                  onClick={() => activarRol("es_organizador")}
                  className="border border-blue-500 hover:bg-blue-500/10 text-white text-xs font-bold uppercase px-4 py-2 rounded transition"
                >
                  Activar perfil de organizador
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold uppercase text-gray-300">
              Mis vehículos ({autos.length})
            </h2>
            <Link
              href="/mi-cuenta/publicar"
              className="bg-green-600 hover:bg-green-500 text-white text-xs font-bold uppercase px-4 py-2 rounded transition"
            >
              + Publicar vehículo
            </Link>
          </div>

          {autos.length === 0 && (
            <p className="text-gray-500 text-sm">Todavía no publicaste ningún vehículo.</p>
          )}

          <ul className="divide-y divide-gray-800">
            {autos.map((auto) => (
              <li key={auto.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="font-semibold">{auto.titulo}</p>
                  <div className="flex gap-2 mt-1">
                    {auto.en_venta && (
                      <span className="bg-yellow-500 text-black text-xs font-bold uppercase px-2 py-0.5 rounded">
                        En venta
                      </span>
                    )}
                    {auto.participa_exposiciones && (
                      <span className="bg-blue-600 text-white text-xs font-bold uppercase px-2 py-0.5 rounded">
                        Exposiciones
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Link
                    href={`/mi-cuenta/vehiculo/${auto.id}`}
                    className="text-blue-400 hover:text-blue-300 text-xs font-bold uppercase"
                  >
                    Editar
                  </Link>
                  <button
                    onClick={() => borrarAuto(auto.id)}
                    className="text-red-400 hover:text-red-300 text-xs font-bold uppercase"
                  >
                    Borrar
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <Link
            href={`/comunidad/perfil/${perfil.id}`}
            className="inline-block mt-4 text-sm text-blue-400 underline"
          >
            Ver mi ficha pública
          </Link>
        </div>
      </section>
    </div>
  );
}