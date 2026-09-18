import Image from "next/image";
import Link from "next/link";

export default function Navbar() {
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
          <li>
            <Link href="/" className="hover:text-blue-400 transition">
              Inicio
            </Link>
          </li>
          <li>
            <Link href="/comunidad" className="hover:text-blue-400 transition">
              Comunidad
            </Link>
          </li>
          <li>
            <Link href="/comercios" className="hover:text-blue-400 transition">
              Comercios
            </Link>
          </li>
          <li>
            <Link href="/eventos" className="hover:text-blue-400 transition">
              Eventos
            </Link>
          </li>
        </ul>

        <Link
          href="/login"
          className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold uppercase px-4 py-2 rounded transition"
        >
          Iniciar sesión
        </Link>
      </nav>
    </header>
  );
}