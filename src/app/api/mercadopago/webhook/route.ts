import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { PLANES, type TipoPlan } from "@/lib/planes";

export async function POST(request: Request) {
  const url = new URL(request.url);

  let cuerpo: { type?: string; data?: { id?: string | number } } = {};
  try {
    cuerpo = await request.json();
  } catch {
    // algunos avisos llegan sin cuerpo, solo con datos en la dirección
  }

  const tipoAviso = cuerpo.type ?? url.searchParams.get("type") ?? url.searchParams.get("topic");
  const pagoId = cuerpo.data?.id ?? url.searchParams.get("data.id") ?? url.searchParams.get("id");

  if (tipoAviso !== "payment" || !pagoId) {
    return NextResponse.json({ ok: true });
  }

  const respuesta = await fetch(`https://api.mercadopago.com/v1/payments/${pagoId}`, {
    headers: { Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}` },
    cache: "no-store",
  });

  if (!respuesta.ok) {
    console.error("No se pudo consultar el pago", pagoId);
    return NextResponse.json({ error: "No se pudo consultar el pago" }, { status: 500 });
  }

  const pago = await respuesta.json();

  if (pago.status !== "approved") {
    return NextResponse.json({ ok: true });
  }

  const [perfilTexto, tipoTexto] = String(pago.external_reference ?? "").split("|");
  const perfilId = Number(perfilTexto);
  const plan = PLANES[tipoTexto as TipoPlan];

  if (!perfilId || !plan) {
    console.error("Pago con referencia desconocida:", pago.id, pago.external_reference);
    return NextResponse.json({ ok: true });
  }

  if (pago.currency_id !== "ARS" || Number(pago.transaction_amount) < plan.precio) {
    console.error("Pago con monto incorrecto:", pago.id, pago.transaction_amount);
    return NextResponse.json({ ok: true });
  }

  const { error } = await supabaseAdmin.rpc("registrar_pago", {
    p_perfil_id: perfilId,
    p_es_comercio: tipoTexto === "comercio",
    p_mp_pago_id: String(pago.id),
    p_monto: pago.transaction_amount,
  });

  if (error) {
    console.error("Error registrando el pago:", error.message);
    return NextResponse.json({ error: "No se pudo registrar" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}