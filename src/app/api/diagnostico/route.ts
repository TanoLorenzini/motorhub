import { NextResponse } from "next/server";

function tipoDeClave(clave: string | undefined) {
  if (!clave) return "FALTA LA VARIABLE";
  const limpia = clave.trim();
  if (limpia !== clave) return "tiene espacios o saltos de linea de mas al principio o al final";
  if (limpia.startsWith("sb_publishable_")) return "INCORRECTA: es la clave publica (sb_publishable)";
  if (limpia.startsWith("sb_secret_")) return "correcta: clave secreta nueva (sb_secret)";
  try {
    const datos = JSON.parse(Buffer.from(limpia.split(".")[1], "base64url").toString());
    return datos.role === "service_role"
      ? "correcta: rol service_role"
      : `INCORRECTA: es una clave con rol ${datos.role}`;
  } catch {
    return "formato desconocido";
  }
}

export async function GET() {
  const mp = process.env.MP_ACCESS_TOKEN;
  return NextResponse.json({
    supabase_service_role_key: tipoDeClave(process.env.SUPABASE_SERVICE_ROLE_KEY),
    mp_access_token: mp ? `cargado, empieza con ${mp.slice(0, 8)}` : "FALTA LA VARIABLE",
    site_url: process.env.NEXT_PUBLIC_SITE_URL ?? "FALTA LA VARIABLE",
  });
}