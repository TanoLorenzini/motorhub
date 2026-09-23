type EventoBasico = { id: number; fecha: string };

export function eventoVisibleSinPremium<T extends EventoBasico>(
  eventos: T[],
  hoy: string
): T | null {
  if (eventos.length === 0) return null;

  const proximos = eventos
    .filter((e) => e.fecha >= hoy)
    .sort((a, b) => a.fecha.localeCompare(b.fecha) || a.id - b.id);

  if (proximos.length > 0) return proximos[0];

  const pasados = [...eventos].sort(
    (a, b) => b.fecha.localeCompare(a.fecha) || b.id - a.id
  );
  return pasados[0];
}