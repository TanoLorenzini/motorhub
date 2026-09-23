"use client";

import { useState } from "react";

type Props = {
  titulo: string;
  texto: string;
  ruta: string;
  chico?: boolean;
};

export default function CompartirBoton({ titulo, texto, ruta, chico = false }: Props) {
  const [abierto, setAbierto] = useState(false);
  const [copiado, setCopiado] = useState(false);

  async function compartir() {
    const url = window.location.origin + ruta;
    const esCelular = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    if (esCelular && navigator.share) {
      try {
        await navigator.share({ title: titulo, text: texto, url });
      } catch {
        // la persona cerró el menú sin compartir
      }
      return;
    }

    setAbierto(!abierto);
  }

  async function copiarEnlace() {
    await navigator.clipboard.writeText(window.location.origin + ruta);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  const url = abierto ? window.location.origin + ruta : "";
  const t = encodeURIComponent(texto);
  const u = encodeURIComponent(url);
  const claseOpcion = "bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs px-2 py-1 rounded";

  return (
    <div className={chico ? "text-right" : ""}>
      <button
        type="button"
        onClick={compartir}
        className={
          chico
            ? "text-gray-400 hover:text-blue-400 text-xs underline"
            : "bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase px-4 py-2 rounded transition"
        }
      >
        Compartir
      </button>

      {abierto && (
        <div className={`flex flex-wrap gap-2 mt-2 ${chico ? "justify-end" : ""}`}>
          <a href={`https://wa.me/?text=${t}%20${u}`} target="_blank" rel="noopener noreferrer" className={claseOpcion}>WhatsApp</a>
          <a href={`https://www.facebook.com/sharer/sharer.php?u=${u}`} target="_blank" rel="noopener noreferrer" className={claseOpcion}>Facebook</a>
          <a href={`https://twitter.com/intent/tweet?text=${t}&url=${u}`} target="_blank" rel="noopener noreferrer" className={claseOpcion}>X</a>
          <a href={`https://t.me/share/url?url=${u}&text=${t}`} target="_blank" rel="noopener noreferrer" className={claseOpcion}>Telegram</a>
          <a href={`mailto:?subject=${encodeURIComponent(titulo)}&body=${t}%20${u}`} className={claseOpcion}>Email</a>
          <button type="button" onClick={copiarEnlace} className={claseOpcion}>
            {copiado ? "¡Copiado!" : "Copiar enlace"}
          </button>
        </div>
      )}
    </div>
  );
}