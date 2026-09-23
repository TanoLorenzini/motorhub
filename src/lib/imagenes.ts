import { supabase } from "@/lib/supabase";

export async function achicarImagen(archivo: File): Promise<Blob> {
  try {
    const imagen = await createImageBitmap(archivo);
    const maximo = 1600;
    const escala = Math.min(1, maximo / Math.max(imagen.width, imagen.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(imagen.width * escala);
    canvas.height = Math.round(imagen.height * escala);
    canvas.getContext("2d")!.drawImage(imagen, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", 0.85)
    );
    return blob ?? archivo;
  } catch {
    return archivo;
  }
}

export async function subirFoto(userId: string, archivo: File, prefijo: string): Promise<string> {
  const blob = await achicarImagen(archivo);
  const extension = blob.type === "image/jpeg" ? "jpg" : archivo.name.split(".").pop() ?? "jpg";
  const ruta = `${userId}/${prefijo}-${Date.now()}.${extension}`;

  const { error } = await supabase.storage
    .from("fotos-autos")
    .upload(ruta, blob, { contentType: blob.type });

  if (error) throw new Error("No se pudo subir la foto: " + error.message);

  return supabase.storage.from("fotos-autos").getPublicUrl(ruta).data.publicUrl;
}