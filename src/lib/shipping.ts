import { prisma } from "./prisma";
import { getCityTier, SHIPPING_RATES, SHIPPING_ETA } from "./colombia";
import { FREE_SHIPPING_THRESHOLD } from "./format";

const MEDELLIN_CUTOFF_HOUR = 15; // 3:00 p.m. hora Bogotá

function isMedellinLocal(department: string, city: string): boolean {
  return department === "Antioquia" && city === "Medellín";
}

// La tienda opera desde Medellín: los pedidos de la propia ciudad pagados
// antes de las 3:00 p.m. (hora Colombia) se entregan el mismo día. Se
// calcula con la hora real de Bogotá, sin depender de la zona horaria del
// navegador o el servidor.
function medellinSameDayMessage(): string {
  const hour = Number(
    new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Bogota",
      hour: "numeric",
      hour12: false,
    }).format(new Date())
  );
  return hour < MEDELLIN_CUTOFF_HOUR
    ? "Hoy mismo si pagas antes de las 3:00 p.m."
    : "Mañana antes del mediodía";
}

export interface ShippingQuote {
  cost: number;
  etaLabel: string;
  free: boolean;
  discreet: true;
}

// Cotizador único usado por el checkout, la calculadora pública y el
// pedido manual del admin. Resuelve, en orden: tarifa personalizada exacta
// (departamento + municipio) → tarifa personalizada del departamento
// completo (city = "") → tarifa de referencia por nivel de cobertura.
export async function computeShipping(
  department: string,
  city: string,
  subtotal: number
): Promise<ShippingQuote> {
  const free = subtotal >= FREE_SHIPPING_THRESHOLD;

  const [exact, departmentDefault] = await Promise.all([
    prisma.shippingRate.findUnique({ where: { department_city: { department, city } } }),
    prisma.shippingRate.findUnique({ where: { department_city: { department, city: "" } } }),
  ]);

  const override = exact?.active ? exact : departmentDefault?.active ? departmentDefault : null;

  const tier = getCityTier(department, city);
  const cost = override ? override.cost : SHIPPING_RATES[tier];
  let etaLabel = override?.etaLabel?.trim() || SHIPPING_ETA[tier];

  if (isMedellinLocal(department, city)) {
    etaLabel = medellinSameDayMessage();
  }

  return { cost: free ? 0 : cost, etaLabel, free, discreet: true };
}
