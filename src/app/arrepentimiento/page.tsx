"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

const claseInput =
  "w-full bg-black border border-gray-700 rounded px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500";

function generarCodigo() {
  const letras = crypto.randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase();
  return "ARR-" + letras;
}

export default function Arrepentimiento() {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [operacion, setOperacion] = useState("");
  const [detalle, setDetalle] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const [codigo, setCodigo] = useState<string | null>(null);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setEnviando(true);
    setError("");

    const nuevoCodigo = generarCodigo();

    const { error } = await supabase.from("solicitudes_arrepentimiento").insert({
      codigo: nuevoCodigo,
      nombre: nombre.trim(),
      email: email.trim(),
      operacion: operacion.trim() || null,
      detalle: detalle.trim() || null,
    });

    setEnviando(false);

    if (error) {
      setError("No se pudo enviar la solicitud. Probá de nuevo en unos minutos.");
      return;
    }

    setCodigo(nuevoCodigo);
  }

  if (codigo) {
    return (
      <div className="bg-black text-white min-h-screen flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full bg-gray-900 border border-green-600 rounded-lg p-8 text-center space-y-4">
          <h1 className="text-2xl font-extrabold uppercase text-green-400">Solicitud recibida</h1>
          <p className="text-gray-300">Tu código de trámite es:</p>
          <p className="text-3xl font-extrabold tracking-widest text-white bg-black border border-gray-700 rounded py-3">
            {codigo}
          </p>
          <p className="text-sm text-gray-400">
            Guardalo o sacale una captura. Te vamos a contactar a <strong>{email}</strong> para
            coordinar el reintegro, que se hace por el mismo medio con el que pagaste.
          </p>
          <Link href="/" className="inline-block text-blue-400 underline text-sm">
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black text-white min-h-screen">
      <section className="max-w-2xl mx-auto px-4 py-16 space-y-8">
        <header className="space-y-3">
          <h1 className="text-3xl md:text-4xl font-extrabold uppercase">
            Botón de <span className="text-blue-400">arrepentimiento</span>
          </h1>
          <p className="text-gray-300 leading-relaxed">
            Si contrataste un plan Premium, podés cancelarlo dentro de los{" "}
            <strong>10 días corridos</strong> desde que lo pagaste, sin costo y sin tener que explicar
            el motivo (artículo 34 de la Ley 24.240 y artículo 1110 del Código Civil y Comercial). No
            necesitás iniciar sesión.
          </p>
        </header>

        <form
          onSubmit={enviar}
          className="bg-gray-900 border border-gray-800 rounded-lg p-6 space-y-4"
        >
          <label className="block text-sm text-gray-400">
            Nombre y apellido
            <input
              type="text"
              required
              minLength={2}
              maxLength={120}
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className={claseInput + " mt-1"}
            />
          </label>

          <label className="block text-sm text-gray-400">
            Email de tu cuenta de MotorHub
            <input
              type="email"
              required
              maxLength={200}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={claseInput + " mt-1"}
            />
          </label>

          <label className="block text-sm text-gray-400">
            Número de operación de Mercado Pago (opcional)
            <input
              type="text"
              maxLength={60}
              placeholder="Figura en el comprobante que te mandó Mercado Pago"
              value={operacion}
              onChange={(e) => setOperacion(e.target.value)}
              className={claseInput + " mt-1"}
            />
          </label>

          <label className="block text-sm text-gray-400">
            Comentarios (opcional)
            <textarea
              rows={3}
              maxLength={1000}
              value={detalle}
              onChange={(e) => setDetalle(e.target.value)}
              className={claseInput + " mt-1"}
            />
          </label>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={enviando}
            className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold uppercase py-3 rounded transition"
          >
            {enviando ? "Enviando..." : "Solicitar cancelación"}
          </button>
        </form>
      </section>
    </div>
  );
}