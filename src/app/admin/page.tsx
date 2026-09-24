"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { obtenerUsuarioForo } from "@/lib/usuarioForo";

const ZONA = "America/Argentina/Buenos_Aires";
const DIA = 24 * 60 * 60 * 1000;

function formatearFecha(valor: string | null) {
  if (!valor) return "—";
  return new Date(valor).toLocaleString("es-AR", {
    timeZone: ZONA,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function pesos(valor: number) {
  return "$" + Number(valor).toLocaleString("es-AR");
}

function diasRestantes(vence: string | null) {
  if (!vence) return null;
  return Math.ceil((new Date(vence).getTime() - Date.now()) / DIA);
}

function EstadoPlan({ vence }: { vence: string | null }) {
  const dias = diasRestantes(vence);
  if (dias === null) return <span className="text-gray-600">—</span>;
  if (dias <= 0) return <span className="text-red-400">Vencido</span>;
  return (
    <span className={dias < 5 ? "text-yellow-400" : "text-green-400"}>
      {dias} {dias === 1 ? "día" : "días"}
    </span>
  );
}

type Conteo = { etiqueta: string; valor: string | number };

export default function Admin() {
  const [estado, setEstado] = useState<"cargando" | "sin-acceso" | "listo">("cargando");
  const [conteos, setConteos] = useState<Conteo[]>([]);
  const [solicitudes, setSolicitudes] = useState<any[]>([]);
  const [pagos, setPagos] = useState<any[]>([]);
  const [suscripciones, setSuscripciones] = useState<any[]>([]);
  const [verAtendidas, setVerAtendidas] = useState(false);

  useEffect(() => {
    async function cargar() {
      const usuario = await obtenerUsuarioForo();
      if (!usuario.esAdmin) {
        setEstado("sin-acceso");
        return;
      }

      const contar = (tabla: string) =>
        supabase.from(tabla).select("*", { count: "exact", head: true });

      const [cPerfiles, cAutos, cComercios, cEventos, cTemas, rSolicitudes, rPagos, rSuscripciones] =
        await Promise.all([
          contar("perfiles"),
          contar("autos"),
          contar("comercios"),
          contar("eventos"),
          contar("temas"),
          supabase
            .from("solicitudes_arrepentimiento")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(100),
          supabase
            .from("pagos")
            .select("*, perfiles(id, nombre)")
            .order("created_at", { ascending: false })
            .limit(100),
          supabase.from("suscripciones").select("*, perfiles(id, nombre)"),
        ]);

      const listaPagos = rPagos.data ?? [];
      const listaSuscripciones = rSuscripciones.data ?? [];

      const ahora = new Date();
      const recaudadoMes = listaPagos
        .filter((p) => {
          const f = new Date(p.created_at);
          return f.getMonth() === ahora.getMonth() && f.getFullYear() === ahora.getFullYear();
        })
        .reduce((total, p) => total + Number(p.monto ?? 0), 0);

      const premiumActivos = listaSuscripciones.filter(
        (s) =>
          (s.comercio_vence && new Date(s.comercio_vence) > ahora) ||
          (s.eventos_vence && new Date(s.eventos_vence) > ahora)
      ).length;

      setConteos([
        { etiqueta: "Usuarios", valor: cPerfiles.count ?? 0 },
        { etiqueta: "Vehículos", valor: cAutos.count ?? 0 },
        { etiqueta: "Comercios", valor: cComercios.count ?? 0 },
        { etiqueta: "Eventos", valor: cEventos.count ?? 0 },
        { etiqueta: "Temas del foro", valor: cTemas.count ?? 0 },
        { etiqueta: "Premium activos", valor: premiumActivos },
        { etiqueta: "Recaudado este mes", valor: pesos(recaudadoMes) },
      ]);

      setSolicitudes(rSolicitudes.data ?? []);
      setPagos(listaPagos);
      setSuscripciones(
        listaSuscripciones
          .filter((s) => s.comercio_vence || s.eventos_vence)
          .sort((a, b) => {
            const menor = (s: any) =>
              Math.min(
                ...[s.comercio_vence, s.eventos_vence]
                  .filter(Boolean)
                  .map((v: string) => new Date(v).getTime())
              );
            return menor(a) - menor(b);
          })
      );
      setEstado("listo");
    }
    cargar();
  }, []);

  async function marcarAtendida(id: number) {
    const { data, error } = await supabase
      .from("solicitudes_arrepentimiento")
      .update({ atendida: true })
      .eq("id", id)
      .select("id");

    if (error || !data || data.length === 0) {
      alert("No se pudo actualizar la solicitud.");
      return;
    }
    setSolicitudes((lista) => lista.map((s) => (s.id === id ? { ...s, atendida: true } : s)));
  }

  if (estado === "cargando") {
    return <div className="bg-black text-gray-400 min-h-screen p-16 text-center">Cargando...</div>;
  }

  if (estado === "sin-acceso") {
    return (
      <div className="bg-black text-gray-300 min-h-screen p-16 text-center space-y-4">
        <p>No tenés acceso a esta sección.</p>
        <Link href="/" className="text-blue-400 underline">
          Volver al inicio
        </Link>
      </div>
    );
  }

  const pendientes = solicitudes.filter((s) => !s.atendida);
  const solicitudesVisibles = verAtendidas ? solicitudes : pendientes;

  return (
    <div className="bg-black text-white min-h-screen">
      <section className="max-w-6xl mx-auto px-4 py-16 space-y-12">
        <h1 className="text-3xl md:text-4xl font-extrabold uppercase">
          Panel de <span className="text-blue-400">administración</span>
        </h1>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {conteos.map((c) => (
            <div key={c.etiqueta} className="bg-gray-900 border border-gray-800 rounded-lg p-4">
              <p className="text-2xl font-extrabold text-white">{c.valor}</p>
              <p className="text-xs uppercase text-gray-500 mt-1">{c.etiqueta}</p>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-bold uppercase">
              Solicitudes de arrepentimiento{" "}
              {pendientes.length > 0 && (
                <span className="bg-red-600 text-white text-sm px-2 py-0.5 rounded ml-2">
                  {pendientes.length} pendiente{pendientes.length === 1 ? "" : "s"}
                </span>
              )}
            </h2>
            <label className="flex items-center gap-2 text-sm text-gray-400">
              <input
                type="checkbox"
                checked={verAtendidas}
                onChange={(e) => setVerAtendidas(e.target.checked)}
                className="accent-blue-500"
              />
              Mostrar también las atendidas
            </label>
          </div>

          {solicitudesVisibles.length === 0 && (
            <p className="text-gray-500 text-sm">No hay solicitudes pendientes.</p>
          )}

          <div className="space-y-3">
            {solicitudesVisibles.map((s) => {
              const dias = Math.floor((Date.now() - new Date(s.created_at).getTime()) / DIA);
              return (
                <div
                  key={s.id}
                  className={`bg-gray-900 border rounded-lg p-5 ${
                    s.atendida ? "border-gray-800 opacity-60" : "border-red-600"
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="space-y-1 text-sm">
                      <p className="font-mono text-lg font-bold text-white">{s.codigo}</p>
                      <p className="text-gray-400">
                        Recibida el {formatearFecha(s.created_at)} (hace {dias}{" "}
                        {dias === 1 ? "día" : "días"})
                      </p>
                      <p>
                        <span className="text-gray-500">Nombre:</span> {s.nombre}
                      </p>
                      <p>
                        <span className="text-gray-500">Email:</span>{" "}
                        <a href={`mailto:${s.email}?subject=${encodeURIComponent("Tu solicitud " + s.codigo + " - MotorHub")}`} className="text-blue-400 underline">{s.email}</a>
                      </p>
                      {s.operacion && (
                        <p>
                          <span className="text-gray-500">Operación Mercado Pago:</span> {s.operacion}
                        </p>
                      )}
                      {s.detalle && (
                        <p>
                          <span className="text-gray-500">Comentario:</span> {s.detalle}
                        </p>
                      )}
                    </div>
                    {s.atendida ? (
                      <span className="text-green-400 text-xs font-bold uppercase">Atendida</span>
                    ) : (
                      <button
                        onClick={() => marcarAtendida(s.id)}
                        className="bg-green-600 hover:bg-green-500 text-white text-xs font-bold uppercase px-4 py-2 rounded transition"
                      >
                        Marcar atendida
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold uppercase">Suscripciones</h2>
          {suscripciones.length === 0 ? (
            <p className="text-gray-500 text-sm">Todavía no hay suscripciones.</p>
          ) : (
            <div className="overflow-x-auto bg-gray-900 border border-gray-800 rounded-lg">
              <table className="w-full text-sm">
                <thead className="text-left text-xs uppercase text-gray-500 border-b border-gray-800">
                  <tr>
                    <th className="p-3">Usuario</th>
                    <th className="p-3">Premium comercio</th>
                    <th className="p-3">Premium eventos</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {suscripciones.map((s) => (
                    <tr key={s.perfil_id}>
                      <td className="p-3">
                        <Link href={`/comunidad/perfil/${s.perfil_id}`} className="hover:text-blue-400 underline">
                          {s.perfiles?.nombre ?? `Perfil ${s.perfil_id}`}
                        </Link>
                      </td>
                      <td className="p-3">
                        <EstadoPlan vence={s.comercio_vence} />
                        {s.comercio_vence && (
                          <span className="block text-xs text-gray-500">{formatearFecha(s.comercio_vence)}</span>
                        )}
                      </td>
                      <td className="p-3">
                        <EstadoPlan vence={s.eventos_vence} />
                        {s.eventos_vence && (
                          <span className="block text-xs text-gray-500">{formatearFecha(s.eventos_vence)}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold uppercase">Pagos recibidos</h2>
          {pagos.length === 0 ? (
            <p className="text-gray-500 text-sm">Todavía no hay pagos.</p>
          ) : (
            <div className="overflow-x-auto bg-gray-900 border border-gray-800 rounded-lg">
              <table className="w-full text-sm">
                <thead className="text-left text-xs uppercase text-gray-500 border-b border-gray-800">
                  <tr>
                    <th className="p-3">Fecha</th>
                    <th className="p-3">Usuario</th>
                    <th className="p-3">Plan</th>
                    <th className="p-3">Monto</th>
                    <th className="p-3">Quedó hasta</th>
                    <th className="p-3">Operación MP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {pagos.map((p) => (
                    <tr key={p.id}>
                      <td className="p-3 whitespace-nowrap">{formatearFecha(p.created_at)}</td>
                      <td className="p-3">{p.perfiles?.nombre ?? "—"}</td>
                      <td className="p-3">{p.es_comercio ? "Comercio" : "Eventos"}</td>
                      <td className="p-3 text-blue-400 font-semibold">{pesos(p.monto)}</td>
                      <td className="p-3 whitespace-nowrap">{formatearFecha(p.vence_nuevo)}</td>
                      <td className="p-3 font-mono text-xs text-gray-400">{p.mp_pago_id}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}