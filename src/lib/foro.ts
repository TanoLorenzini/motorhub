export const CATEGORIAS = [
  "General",
  "Mecánica y restauración",
  "Compra y venta",
  "Eventos y encuentros",
  "Repuestos",
  "Presentaciones",
];

export function haceCuanto(fecha: string) {
  const segundos = Math.floor((Date.now() - new Date(fecha).getTime()) / 1000);
  if (segundos < 60) return "hace un momento";

  const minutos = Math.floor(segundos / 60);
  if (minutos < 60) return `hace ${minutos} min`;

  const horas = Math.floor(minutos / 60);
  if (horas < 24) return `hace ${horas} h`;

  const dias = Math.floor(horas / 24);
  if (dias < 30) return `hace ${dias} ${dias === 1 ? "día" : "días"}`;

  return new Date(fecha).toLocaleDateString("es-AR", {
    timeZone: "America/Argentina/Buenos_Aires",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}