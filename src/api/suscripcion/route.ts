import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { PLANES, type TipoPlan } from "@/lib/planes";

export async function POST(request: Request) {
  const token = request.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) {
    return NextResponse.json({ error: "Tenés que iniciar sesión." }, { status: 401 });
  }

  const {
    data: { user },
  } = await supabaseAdmin.auth.getUser(token);
  if (!user) {
    return NextResponse.json({ error: "Tu sesión venció. Volvé a iniciar sesión." }, { status: 401 });
  }

  const { tipo } = (await request.json()) as { tipo: TipoPlan };
  const plan = PLANES[tipo];
  if (!plan) {
    return NextResponse.json({ error: "Plan inválido." }, { status: 400 });
  }

  const { data: perfil } = await supabaseAdmin
    .from("perfiles")
    .select("id, es_comerciante, es_organizador")
    .eq("user_id", user.id)
    .single();

  if (!perfil) {
    return NextResponse.json({ error: "No encontramos tu perfil." }, { status: 404 });
  }

  const habilitado = tipo === "comercio" ? perfil.es_comerciante : perfil.es_organizador;
  if (!habilitado) {
    return NextResponse.json({ error: "Primero activá ese tipo de cuenta." }, { status: 403 });
  }

  const sitio = process.env.NEXT_PUBLIC_SITE_URL;
  const volver = `${sitio}/mi-cuenta/pago?tipo=${tipo}`;

  const respuesta = await fetch("https://api.mercadopago.com/checkout/preferences", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      items: [
        {
          id: tipo,
          title: plan.titulo,
          quantity: 1,
          unit_price: plan.precio,
          currency_id: "ARS",
        },
      ],
      external_reference: `${perfil.id}|${tipo}`,
      back_urls: {
        success: `${volver}&estado=aprobado`,
        pending: `${volver}&estado=pendiente`,
        failure: `${volver}&estado=rechazado`,
      },
      auto_return: "approved",
      notification_url: `${sitio}/api/mercadopago/webhook`,
      statement_descriptor: "MOTORHUB",
    }),
  });

  const preferencia = await respuesta.json();

  if (!respuesta.ok || !preferencia.init_point) {
    console.error("Error creando preferencia de Mercado Pago:", preferencia);
    return NextResponse.json({ error: "No se pudo iniciar el pago. Probá de nuevo." }, { status: 502 });
  }

  return NextResponse.json({ url: preferencia.init_point });
}