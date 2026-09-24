import type { Metadata } from "next";

const LOGO = "/images/logo.jpg";

function recortar(texto: string, maximo = 160) {
  const limpio = texto.replace(/\s+/g, " ").trim();
  return limpio.length > maximo ? limpio.slice(0, maximo - 1) + "…" : limpio;
}

export function metaCompartir({
  titulo,
  descripcion,
  imagen,
  ruta,
}: {
  titulo: string;
  descripcion?: string | null;
  imagen?: string | null;
  ruta: string;
}): Metadata {
  const desc = descripcion ? recortar(descripcion) : "Todo para el mundo de los fierros.";
  const imagenes = [imagen || LOGO];

  return {
    title: `${titulo} | MotorHub`,
    description: desc,
    openGraph: {
      title: titulo,
      description: desc,
      url: ruta,
      siteName: "MotorHub.com.ar",
      locale: "es_AR",
      type: "website",
      images: imagenes,
    },
    twitter: {
      card: imagen ? "summary_large_image" : "summary",
      title: titulo,
      description: desc,
      images: imagenes,
    },
  };
}