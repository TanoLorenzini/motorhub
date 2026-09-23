"use client";

import { useEffect, useState } from "react";

type Props = {
  tipo: "comercio" | "eventos";
  vence: string | null;
  cantidad: number;
  limite: number;
};

const ZONA = "America/Argentina/Buenos_Aires";
const DIA = 24 * 60 * 60 * 1000;
const DURACION_PLAN = 30 * DIA;

function plural(n: number, singular: string, plural: string) {
  return `${n} ${n === 1 ? singular : plural}`;
}

function formatearFecha(fecha: Date) {
  return fecha.toLocaleDateString("es-AR", {
    timeZone: ZONA,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatearHora(fecha: Date) {
  return (
    fecha.toLocaleTimeString("es-AR", {
      timeZone: ZONA,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }) + " hs"
  );
}

export default function EstadoSuscripcion({ tipo, vence, cantidad, limite }: Props) {
  const [ahora, setAhora] = useState<number | null>(null);

  useEffect(() => {
    setAhora(Date.now());
    const intervalo = setInterval(() => setAhora(Date.now()), 1000);
    return () => clearInterval(intervalo);
  }, []);

  if (ahora === null) return null;

  const singular = tipo === "comercio" ? "producto" : "evento";
  const pluralItems = tipo === "comercio" ? "productos" : "eventos";
  const fechaVence = vence ? new Date(vence) : null;
  const restante = fechaVence ? fechaVence.getTime() - ahora : 0;
  const activo = restante > 0;
  const ocultos = Math.max(0, cantidad - limite);

  const botonRenovar = (
    <button
      type="button"
      disabled
      className="bg-yellow-500 text-black text-xs font-bold uppercase px-4 py-2 rounded opacity-60 cursor-not-allowed"
      title="Próximamente con Mercado Pago"
    >
      {activo ? "Renovar 30 días" : "Suscribirme a Premium"} (próximamente)
    </button>
  );

  if (!fechaVence) {
    const usado = Math.min(100, (cantidad / limite) * 100);
    return (
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold uppercase text-gray-400">Tu plan</p>
          <span className="bg-gray-700 text-gray-200 text-xs font-bold uppercase px-2 py-1 rounded">
            Gratuito
          </span>
        </div>
        <div>
          <p className="text-sm text-gray-300 mb-2">
            Usaste {cantidad} de {plural(limite, singular, pluralItems)}
          </p>
          <div className="w-full h-2 bg-gray-800 rounded">
            <div className="h-2 bg-blue-500 rounded" style={{ width: `${usado}%` }} />
          </div>
        </div>
        <p className="text-sm text-gray-400">
          Con Premium cargás {pluralItems} sin límite durante 30 días.
        </p>
        {botonRenovar}
      </div>
    );
  }

  if (!activo) {
    const diasVencido = Math.floor(-restante / DIA);
    return (
      <div className="bg-gray-900 border border-red-600 rounded-lg p-6 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold uppercase text-gray-400">Tu plan</p>
          <span className="bg-red-600 text-white text-xs font-bold uppercase px-2 py-1 rounded">
            Premium vencido
          </span>
        </div>
        <p className="text-sm text-gray-300">
          Venció el <span className="text-white font-semibold">{formatearFecha(fechaVence)}</span> a
          las <span className="text-white font-semibold">{formatearHora(fechaVence)}</span>
          {diasVencido > 0 ? ` (hace ${plural(diasVencido, "día", "días")}).` : " (hoy)."}
        </p>
        {ocultos > 0 ? (
          <p className="text-sm text-red-300">
            Hay {plural(ocultos, `${singular} oculto`, `${pluralItems} ocultos`)} que no se ven en el
            sitio. Solo se muestran los primeros {plural(limite, singular, pluralItems)} que cargaste.
            Renová y vuelven a aparecer todos.
          </p>
        ) : (
          <p className="text-sm text-gray-400">
            Por ahora no tenés {pluralItems} ocultos, pero no podés cargar más de {limite}.
          </p>
        )}
        {botonRenovar}
      </div>
    );
  }

  const dias = Math.floor(restante / DIA);
  const horas = Math.floor((restante % DIA) / (60 * 60 * 1000));
  const minutos = Math.floor((restante % (60 * 60 * 1000)) / (60 * 1000));
  const segundos = Math.floor((restante % (60 * 1000)) / 1000);
  const porcentaje = Math.min(100, (restante / DURACION_PLAN) * 100);
  const venceProntoc = dias < 5;

  const bloques = [
    { valor: dias, etiqueta: dias === 1 ? "día" : "días" },
    { valor: horas, etiqueta: horas === 1 ? "hora" : "horas" },
    { valor: minutos, etiqueta: "min" },
    { valor: segundos, etiqueta: "seg" },
  ];

  return (
    <div
      className={`bg-gray-900 border rounded-lg p-6 space-y-5 ${
        venceProntoc ? "border-yellow-500" : "border-green-600"
      }`}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold uppercase text-gray-400">Tu plan</p>
        <span className="bg-green-600 text-white text-xs font-bold uppercase px-2 py-1 rounded">
          Premium activo
        </span>
      </div>

      <div>
        <p className="text-xs uppercase text-gray-500 mb-2">Tiempo restante</p>
        <div className="grid grid-cols-4 gap-2 text-center">
          {bloques.map((b) => (
            <div key={b.etiqueta} className="bg-black border border-gray-800 rounded p-3">
              <p className="text-2xl md:text-3xl font-extrabold text-white tabular-nums">
                {String(b.valor).padStart(2, "0")}
              </p>
              <p className="text-xs uppercase text-gray-500">{b.etiqueta}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="w-full h-2 bg-gray-800 rounded">
          <div
            className={`h-2 rounded ${venceProntoc ? "bg-yellow-500" : "bg-green-500"}`}
            style={{ width: `${porcentaje}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Te queda el {Math.round(porcentaje)}% de tu período de 30 días
        </p>
      </div>

      <div className="text-sm text-gray-300 space-y-1">
        <p>
          Vence el <span className="text-white font-semibold">{formatearFecha(fechaVence)}</span>
        </p>
        <p>
          a las <span className="text-white font-semibold">{formatearHora(fechaVence)}</span> (hora
          de Argentina)
        </p>
        <p className="text-gray-400">
          Tenés {plural(cantidad, `${singular} cargado`, `${pluralItems} cargados`)}, sin límite.
        </p>
      </div>

      {venceProntoc && (
        <p className="text-sm text-yellow-300 bg-yellow-500/10 border border-yellow-600 rounded p-3">
          Tu suscripción vence pronto.
          {ocultos > 0
            ? ` Si no renovás, se van a ocultar ${plural(ocultos, singular, pluralItems)} y solo quedarán visibles los primeros ${limite}.`
            : " Si no renovás, vas a volver al plan gratuito."}
        </p>
      )}

      <div className="space-y-1">
        {botonRenovar}
        <p className="text-xs text-gray-500">
          Al renovar, los 30 días se suman a partir del vencimiento actual: no perdés los días que te quedan.
        </p>
      </div>
    </div>
  );
}