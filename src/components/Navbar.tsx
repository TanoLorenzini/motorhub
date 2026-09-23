"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function Navbar() {
  const [menuAbierto, setMenuAbierto] = useState(false);

  const links = [
    { href: "/", label: "Inicio" },
    { href: "/comunidad", label: "Comunidad" },
    { href: "/comercios", label: "Comercios" },
    { href: "/eventos", label: "Eventos" },
  ];

  return (
    <header className="bg-black border-b-2 border-blue-500 sticky top-0 z-50">
      <nav className="max-w-6xl mx-auto flex items-center justify-between px-4 py-2">
        <Link href="/" className="flex items-center">
          <Image
            src="/images/logo.jpg"
            alt="MotorHub"
            width={140}
            height={60}
            className="object-contain"
          />
        </Link>

        <ul className="hidden md:flex items-center gap-6 text-gray-200 font-semibold uppercase text-sm tracking-wide">
          {links.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className="hover:text-blue-400 transition">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <Link
          href="/login"
          className="hidden md:inline-block bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold uppercase px-4 py-2 rounded transition"
        >
          Iniciar sesion
        </Link>

        <button
          onClick={() => setMenuAbierto(!menuAbierto)}
          className="md:hidden text-white p-2"
          aria-label="Abrir menu"
        >
          {menuAbierto ? (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          )}
        </button>
      </nav>

      {menuAbierto && (
        <div className="md:hidden border-t border-gray-800 bg-black px-4 py-4">
          <ul className="flex flex-col gap-4 text-gray-200 font-semibold uppercase text-sm tracking-wide">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setMenuAbierto(false)}
                  className="block hover:text-blue-400 transition"
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/login"
                onClick={() => setMenuAbierto(false)}
                className="block bg-blue-600 hover:bg-blue-500 text-white text-center font-bold uppercase px-4 py-2 rounded transition"
              >
                Iniciar sesion
              </Link>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}