"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function Recuperar() {
  const [email, setEmail] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState("");

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setEnviando(true);
    setError("");

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/nueva-contrasena`,
    });

    setEnviando(false);

    if (error && error.message.toLowerCase().includes("rate limit")) {
      setError("Se pidieron demasiados mails en poco tiempo. Esperá unos minutos y probá de nuevo.");
      return;
    }

    setEnviado(true);
  }

  return (
    <div className="bg-black text-white min-h-screen flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-lg p-8 space-y-4">
        <h1 className="text-2xl font-extrabold uppercase">
          Recuperar <span className="text-blue-400">contraseña</span>
        </h1>

        {enviado ? (
          <>
            <p className="text-green-400">
              Si <strong>{email}</strong> está registrado en MotorHub, te enviamos un mail con un link
              para elegir una contraseña nueva.
            </p>
            <p className="text-sm text-gray-400">
              Revisá también la carpeta de spam. El link vence en una hora.
            </p>
          </>
        ) : (
          <form onSubmit={enviar} className="space-y-4">
            <p className="text-gray-400 text-sm">
              Poné el email con el que te registraste y te mandamos un link para elegir una contraseña
              nueva.
            </p>
            <input
              type="email"
              required
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black border border-gray-700 rounded px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={enviando}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold uppercase py-2 rounded transition"
            >
              {enviando ? "Enviando..." : "Enviarme el link"}
            </button>
          </form>
        )}

        <p className="text-sm text-gray-400 text-center">
          <Link href="/login" className="text-blue-400 underline">
            Volver a iniciar sesión
          </Link>
        </p>
      </div>
    </div>
  );
}