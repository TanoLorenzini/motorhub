"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

function traducirError(mensaje: string) {
  if (mensaje.includes("already registered")) return "Ya existe una cuenta con ese email.";
  if (mensaje.includes("Password should be")) return "La contraseña debe tener al menos 6 caracteres.";
  if (mensaje.toLowerCase().includes("email")) return "Revisá que el email esté bien escrito.";
  return mensaje;
}

const claseInput =
  "w-full bg-black border border-gray-700 rounded px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500";

export default function Registro() {
  const router = useRouter();
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [aviso, setAviso] = useState("");
  const [cargando, setCargando] = useState(false);

  async function registrarse(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setAviso("");
    setCargando(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { nombre } },
    });

    setCargando(false);

    if (error) {
      setError(traducirError(error.message));
      return;
    }

    if (data.session) {
      router.push("/");
    } else {
      setAviso("Te enviamos un mail para confirmar tu cuenta. Revisá tu bandeja de entrada.");
    }
  }

  return (
    <div className="bg-black text-white min-h-screen flex items-center justify-center px-4 py-16">
      <form
        onSubmit={registrarse}
        className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-lg p-8 space-y-4"
      >
        <h1 className="text-2xl font-extrabold uppercase">
          Crear <span className="text-blue-400">cuenta</span>
        </h1>
        <p className="text-gray-400 text-sm">
          Sumate a la comunidad de los fierros.
        </p>

        <input
          type="text"
          required
          placeholder="Tu nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className={claseInput}
        />
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
          minLength={6}
          placeholder="Contraseña (mínimo 6 caracteres)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={claseInput}
        />

        {error && <p className="text-red-400 text-sm">{error}</p>}
        {aviso && <p className="text-green-400 text-sm">{aviso}</p>}

        <button
          type="submit"
          disabled={cargando}
          className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold uppercase py-2 rounded transition"
        >
          {cargando ? "Creando cuenta..." : "Registrarme"}
        </button>

        <p className="text-sm text-gray-400 text-center">
          ¿Ya tenés cuenta?{" "}
          <Link href="/login" className="text-blue-400 underline">
            Iniciá sesión
          </Link>
        </p>
      </form>
    </div>
  );
}