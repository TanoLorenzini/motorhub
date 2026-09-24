"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const claseInput =
  "w-full bg-black border border-gray-700 rounded px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  async function iniciarSesion(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setCargando(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    setCargando(false);

    if (error) {
      setError(
        error.message.includes("Invalid login credentials")
          ? "Email o contraseña incorrectos."
          : error.message
      );
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <div className="bg-black text-white min-h-screen flex items-center justify-center px-4 py-16">
      <form
        onSubmit={iniciarSesion}
        className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-lg p-8 space-y-4"
      >
        <h1 className="text-2xl font-extrabold uppercase">
          Iniciar <span className="text-blue-400">sesión</span>
        </h1>

        <input
          type="email"
          required
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={claseInput}
        />
        <input
          type="password"
          required
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={claseInput}
        />
                <div className="text-right">
          <Link href="/recuperar" className="text-xs text-gray-400 hover:text-blue-400 underline">
            ¿Olvidaste tu contraseña?
          </Link>
        </div>
        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={cargando}
          className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold uppercase py-2 rounded transition"
        >
          {cargando ? "Ingresando..." : "Ingresar"}
        </button>

        <p className="text-sm text-gray-400 text-center">
          ¿No tenés cuenta?{" "}
          <Link href="/registro" className="text-blue-400 underline">
            Registrate
          </Link>
        </p>
      </form>
    </div>
  );
}