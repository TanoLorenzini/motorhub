import { supabase } from "@/lib/supabase";

export type UsuarioForo = { perfilId: number | null; esAdmin: boolean };

let consulta: Promise<UsuarioForo> | null = null;

if (typeof window !== "undefined") {
  supabase.auth.onAuthStateChange(() => {
    consulta = null;
  });
}

export function obtenerUsuarioForo(): Promise<UsuarioForo> {
  if (!consulta) {
    consulta = (async () => {
      const { data: sesion } = await supabase.auth.getSession();
      if (!sesion.session) return { perfilId: null, esAdmin: false };

      const [{ data: perfil }, { data: esAdmin }] = await Promise.all([
        supabase.from("perfiles").select("id").eq("user_id", sesion.session.user.id).single(),
        supabase.rpc("es_admin"),
      ]);

      return { perfilId: perfil?.id ?? null, esAdmin: esAdmin === true };
    })();
  }
  return consulta;
}