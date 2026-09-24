"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const claseInput =
  "w-full bg-black border border-gray-700 rounded px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500";

export default function NuevaContrasena() {
  const router = useRouter();
  const [estado, setEstado] = useState<"verificando" | "listo" | "invalido">("verificando");
  const [password, setPassword] = useState("");
  const [repetir, setRepetir] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState(false);

  useEffect(() => {
    if (window.location.hash.includes("error")) {
      setEstado("invalido");
      return;
    }

    const { data } = supabase.auth.onAuthStateChange((evento, session) => {
      if (evento === "PASSWORD_RECOVERY" || session) setEstado("listo");
    });

    supabase.auth.getSession().then(({ data: sesion }) => {
      if (sesion.session) setEstado("listo");
    });

    const espera = setTimeout(() => {
      setEstado((actual) => (actual === "verificando" ? "invalido" : actual));
    }, 5000);

    return () => {
      data.subscription.unsubscribe();
      clearTimeout(espera);
    };
  }, []);

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== repetir) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setGuardando(true);
    const { error } = await supabase.auth.updateUser({ password });
    setGuardando(false);

    if (error) {
      setError(
        error.message.includes("different")
          ? "La contraseña nueva tiene que ser distinta de la anterior."
          : "No se pudo cambiar la contraseña: " + error.message
      );
      return;
    }

    setExito(true);
    setTimeout(() => router.push("/mi-cuenta"), 2000);
  }

  return (
    <div className="bg-black text-white min-h-screen flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-lg p-8 space-y-4">
        <h1 className="text-2xl font-extrabold uppercase">
          Nueva <span className="text-blue-400">contraseña</span>
        </h1>

        {estado === "verificando" && <p className="text-gray-400">Verificando el link...</p>}

        {estado === "invalido" && (
          <>
            <p className="text-red-400">
              El link es inválido o ya venció. Los links de recuperación duran una hora y se pueden usar
              una sola vez.
            </p>
            <Link href="/recuperar" className="inline-block text-blue-400 underline">
              Pedir un link nuevo
            </Link>
          </>
        )}

        {estado === "listo" && exito && (
          <p className="text-green-400">¡Listo! Cambiaste tu contraseña. Te llevamos a tu cuenta...</p>
        )}

        {estado === "listo" && !exito && (
          <form onSubmit={guardar} className="space-y-4">
            <input
              type="password"
              required
              minLength={6}
              placeholder="Contraseña nueva (mínimo 6 caracteres)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={claseInput}
            />
            <input
              type="password"
              required
              minLength={6}
              placeholder="Repetí la contraseña nueva"
              value={repetir}
              onChange={(e) => setRepetir(e.target.value)}
              className={claseInput}
            />
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={guardando}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold uppercase py-2 rounded transition"
            >
              {guardando ? "Guardando..." : "Guardar contraseña"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}