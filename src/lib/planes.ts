export const PLANES = {
  comercio: {
    titulo: "MotorHub Premium Comercio - 30 días",
    precio: 15000,
  },
  eventos: {
    titulo: "MotorHub Premium Eventos - 30 días",
    precio: 10000,
  },
} as const;

export type TipoPlan = keyof typeof PLANES;