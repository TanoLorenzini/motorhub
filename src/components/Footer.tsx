import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-950 border-t-2 border-blue-500 text-gray-400 mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-10 grid gap-8 md:grid-cols-3">
        <div>
          <h3 className="text-white font-bold uppercase text-lg mb-2">
            MotorHub<span className="text-blue-400">.com.ar</span>
          </h3>
          <p className="text-sm">Todo para el mundo de los fierros.</p>
        </div>

        <div>
          <h4 className="text-white font-semibold uppercase text-sm mb-3">
            Explorar
          </h4>
          <ul className="space-y-2 text-sm">
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
        </div>

        <div>
          <h4 className="text-white font-semibold uppercase text-sm mb-3">
            Contacto
          </h4>
          <p className="text-sm">Chaco, Argentina</p>
        </div>
      </div>

      <div className="border-t border-gray-800 py-4 text-center text-xs">
        © {new Date().getFullYear()} MotorHub.com.ar — Todos los derechos reservados.
      </div>
    </footer>
  );
}