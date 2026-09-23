import Link from "next/link";

const MENSAJES = {
  aprobado: {
    titulo: "¡Pago aprobado!",
    texto:
      "Gracias por suscribirte a MotorHub Premium. Tu plan se activa en unos segundos: si en tu panel todavía no lo ves, esperá un momento y refrescá la página.",
    color: "text-green-400",
    borde: "border-green-600",
  },
  pendiente: {
    titulo: "Pago pendiente",
    texto:
      "Tu pago está en proceso. Apenas Mercado Pago lo confirme, tu plan Premium se activa automáticamente. No hace falta que pagues de nuevo.",
    color: "text-yellow-400",
    borde: "border-yellow-500",
  },
  rechazado: {
    titulo: "El pago no se completó",
    texto:
      "No se realizó ningún cobro. Podés volver a intentarlo desde tu panel con otro medio de pago.",
    color: "text-red-400",
    borde: "border-red-600",
  },
};

export default async function ResultadoPago({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string; tipo?: string }>;
}) {
  const { estado = "", tipo = "" } = await searchParams;
  const mensaje = MENSAJES[estado as keyof typeof MENSAJES] ?? MENSAJES.rechazado;
  const panel = tipo === "eventos" ? "/mi-cuenta/eventos" : "/mi-cuenta/comercio";

  return (
    <div className="bg-black text-white min-h-screen flex items-center justify-center px-4 py-16">
      <div className={`max-w-md w-full bg-gray-900 border ${mensaje.borde} rounded-lg p-8 text-center space-y-4`}>
        <h1 className={`text-2xl font-extrabold uppercase ${mensaje.color}`}>{mensaje.titulo}</h1>
        <p className="text-gray-300">{mensaje.texto}</p>
        <Link
          href={panel}
          className="inline-block bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold uppercase px-6 py-2 rounded transition"
        >
          Ir a mi panel
        </Link>
      </div>
    </div>
  );
}