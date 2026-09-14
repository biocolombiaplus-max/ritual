// Datos de referencia de departamentos, ciudades y tarifas de envío.
// Las tarifas son ESTIMADAS a partir de rangos publicados por transportadoras
// nacionales (tipo Interrapidísimo / Servientrega) para paquetes pequeños
// (hasta ~2kg). Úsalas como cotizador referencial; para tarifas exactas se
// recomienda integrar la API oficial de la transportadora escogida.

export type CityTier = 1 | 2 | 3 | 4 | 5;

export interface CityInfo {
  name: string;
  tier: CityTier;
}

export interface DepartmentInfo {
  name: string;
  defaultTier: CityTier;
  cities: CityInfo[];
}

// tier 1: Bogotá (envíos locales dentro de la ciudad)
// tier 2: capitales / ciudades principales con alta cobertura
// tier 3: ciudades intermedias y cabeceras municipales con buena cobertura
// tier 4: municipios apartados / cobertura estándar rural
// tier 5: zonas especiales (insular / selva profunda) con sobrecosto logístico

export const SHIPPING_RATES: Record<CityTier, number> = {
  1: 9900,
  2: 13900,
  3: 18900,
  4: 26900,
  5: 38900,
};

export const SHIPPING_ETA: Record<CityTier, string> = {
  1: "1 día hábil",
  2: "1 a 2 días hábiles",
  3: "2 a 4 días hábiles",
  4: "3 a 6 días hábiles",
  5: "5 a 8 días hábiles",
};

export const COLOMBIA_DEPARTMENTS: DepartmentInfo[] = [
  {
    name: "Bogotá D.C.",
    defaultTier: 1,
    cities: [{ name: "Bogotá", tier: 1 }],
  },
  {
    name: "Antioquia",
    defaultTier: 3,
    cities: [
      { name: "Medellín", tier: 2 },
      { name: "Envigado", tier: 2 },
      { name: "Itagüí", tier: 2 },
      { name: "Sabaneta", tier: 2 },
      { name: "Bello", tier: 2 },
      { name: "Rionegro", tier: 3 },
      { name: "Apartadó", tier: 3 },
      { name: "Turbo", tier: 4 },
      { name: "Otro municipio de Antioquia", tier: 3 },
    ],
  },
  {
    name: "Valle del Cauca",
    defaultTier: 3,
    cities: [
      { name: "Cali", tier: 2 },
      { name: "Palmira", tier: 2 },
      { name: "Buga", tier: 3 },
      { name: "Tuluá", tier: 3 },
      { name: "Buenaventura", tier: 4 },
      { name: "Otro municipio del Valle", tier: 3 },
    ],
  },
  {
    name: "Atlántico",
    defaultTier: 3,
    cities: [
      { name: "Barranquilla", tier: 2 },
      { name: "Soledad", tier: 2 },
      { name: "Malambo", tier: 3 },
      { name: "Otro municipio del Atlántico", tier: 3 },
    ],
  },
  {
    name: "Bolívar",
    defaultTier: 3,
    cities: [
      { name: "Cartagena", tier: 2 },
      { name: "Magangué", tier: 4 },
      { name: "Turbaco", tier: 3 },
      { name: "Otro municipio de Bolívar", tier: 4 },
    ],
  },
  {
    name: "Santander",
    defaultTier: 3,
    cities: [
      { name: "Bucaramanga", tier: 2 },
      { name: "Floridablanca", tier: 2 },
      { name: "Girón", tier: 3 },
      { name: "Piedecuesta", tier: 3 },
      { name: "Barrancabermeja", tier: 3 },
      { name: "Otro municipio de Santander", tier: 3 },
    ],
  },
  {
    name: "Norte de Santander",
    defaultTier: 3,
    cities: [
      { name: "Cúcuta", tier: 2 },
      { name: "Villa del Rosario", tier: 3 },
      { name: "Ocaña", tier: 4 },
      { name: "Otro municipio de Norte de Santander", tier: 4 },
    ],
  },
  {
    name: "Risaralda",
    defaultTier: 3,
    cities: [
      { name: "Pereira", tier: 2 },
      { name: "Dosquebradas", tier: 2 },
      { name: "Santa Rosa de Cabal", tier: 3 },
      { name: "Otro municipio de Risaralda", tier: 3 },
    ],
  },
  {
    name: "Caldas",
    defaultTier: 3,
    cities: [
      { name: "Manizales", tier: 2 },
      { name: "Villamaría", tier: 3 },
      { name: "La Dorada", tier: 3 },
      { name: "Otro municipio de Caldas", tier: 3 },
    ],
  },
  {
    name: "Quindío",
    defaultTier: 3,
    cities: [
      { name: "Armenia", tier: 2 },
      { name: "Calarcá", tier: 3 },
      { name: "Otro municipio del Quindío", tier: 3 },
    ],
  },
  {
    name: "Tolima",
    defaultTier: 3,
    cities: [
      { name: "Ibagué", tier: 2 },
      { name: "Espinal", tier: 3 },
      { name: "Melgar", tier: 3 },
      { name: "Otro municipio del Tolima", tier: 3 },
    ],
  },
  {
    name: "Huila",
    defaultTier: 3,
    cities: [
      { name: "Neiva", tier: 2 },
      { name: "Pitalito", tier: 4 },
      { name: "Garzón", tier: 4 },
      { name: "Otro municipio del Huila", tier: 4 },
    ],
  },
  {
    name: "Meta",
    defaultTier: 3,
    cities: [
      { name: "Villavicencio", tier: 2 },
      { name: "Acacías", tier: 3 },
      { name: "Granada", tier: 4 },
      { name: "Otro municipio del Meta", tier: 4 },
    ],
  },
  {
    name: "Cundinamarca",
    defaultTier: 2,
    cities: [
      { name: "Soacha", tier: 2 },
      { name: "Chía", tier: 2 },
      { name: "Zipaquirá", tier: 2 },
      { name: "Facatativá", tier: 2 },
      { name: "Girardot", tier: 3 },
      { name: "Otro municipio de Cundinamarca", tier: 3 },
    ],
  },
  {
    name: "Boyacá",
    defaultTier: 3,
    cities: [
      { name: "Tunja", tier: 3 },
      { name: "Duitama", tier: 3 },
      { name: "Sogamoso", tier: 3 },
      { name: "Otro municipio de Boyacá", tier: 4 },
    ],
  },
  {
    name: "Cauca",
    defaultTier: 4,
    cities: [
      { name: "Popayán", tier: 3 },
      { name: "Santander de Quilichao", tier: 4 },
      { name: "Otro municipio del Cauca", tier: 4 },
    ],
  },
  {
    name: "Nariño",
    defaultTier: 4,
    cities: [
      { name: "Pasto", tier: 3 },
      { name: "Ipiales", tier: 4 },
      { name: "Tumaco", tier: 5 },
      { name: "Otro municipio de Nariño", tier: 4 },
    ],
  },
  {
    name: "Córdoba",
    defaultTier: 4,
    cities: [
      { name: "Montería", tier: 3 },
      { name: "Cereté", tier: 4 },
      { name: "Lorica", tier: 4 },
      { name: "Otro municipio de Córdoba", tier: 4 },
    ],
  },
  {
    name: "Sucre",
    defaultTier: 4,
    cities: [
      { name: "Sincelejo", tier: 3 },
      { name: "Corozal", tier: 4 },
      { name: "Otro municipio de Sucre", tier: 4 },
    ],
  },
  {
    name: "Cesar",
    defaultTier: 4,
    cities: [
      { name: "Valledupar", tier: 3 },
      { name: "Aguachica", tier: 4 },
      { name: "Otro municipio del Cesar", tier: 4 },
    ],
  },
  {
    name: "Magdalena",
    defaultTier: 3,
    cities: [
      { name: "Santa Marta", tier: 2 },
      { name: "Ciénaga", tier: 4 },
      { name: "Otro municipio del Magdalena", tier: 4 },
    ],
  },
  {
    name: "La Guajira",
    defaultTier: 4,
    cities: [
      { name: "Riohacha", tier: 3 },
      { name: "Maicao", tier: 4 },
      { name: "Uribia", tier: 5 },
      { name: "Otro municipio de La Guajira", tier: 4 },
    ],
  },
  {
    name: "Caquetá",
    defaultTier: 4,
    cities: [
      { name: "Florencia", tier: 4 },
      { name: "Otro municipio del Caquetá", tier: 5 },
    ],
  },
  {
    name: "Putumayo",
    defaultTier: 4,
    cities: [
      { name: "Mocoa", tier: 4 },
      { name: "Puerto Asís", tier: 5 },
      { name: "Otro municipio del Putumayo", tier: 5 },
    ],
  },
  {
    name: "Casanare",
    defaultTier: 4,
    cities: [
      { name: "Yopal", tier: 4 },
      { name: "Otro municipio de Casanare", tier: 4 },
    ],
  },
  {
    name: "Arauca",
    defaultTier: 4,
    cities: [
      { name: "Arauca", tier: 4 },
      { name: "Otro municipio de Arauca", tier: 5 },
    ],
  },
  {
    name: "Chocó",
    defaultTier: 5,
    cities: [
      { name: "Quibdó", tier: 4 },
      { name: "Otro municipio del Chocó", tier: 5 },
    ],
  },
  {
    name: "Amazonas",
    defaultTier: 5,
    cities: [
      { name: "Leticia", tier: 5 },
      { name: "Otro municipio del Amazonas", tier: 5 },
    ],
  },
  {
    name: "Guainía",
    defaultTier: 5,
    cities: [
      { name: "Inírida", tier: 5 },
      { name: "Otro municipio de Guainía", tier: 5 },
    ],
  },
  {
    name: "Guaviare",
    defaultTier: 5,
    cities: [
      { name: "San José del Guaviare", tier: 5 },
      { name: "Otro municipio de Guaviare", tier: 5 },
    ],
  },
  {
    name: "Vaupés",
    defaultTier: 5,
    cities: [
      { name: "Mitú", tier: 5 },
      { name: "Otro municipio de Vaupés", tier: 5 },
    ],
  },
  {
    name: "Vichada",
    defaultTier: 5,
    cities: [
      { name: "Puerto Carreño", tier: 5 },
      { name: "Otro municipio de Vichada", tier: 5 },
    ],
  },
  {
    name: "San Andrés y Providencia",
    defaultTier: 5,
    cities: [
      { name: "San Andrés", tier: 5 },
      { name: "Providencia", tier: 5 },
    ],
  },
];

export function getCitiesByDepartment(departmentName: string): CityInfo[] {
  const dept = COLOMBIA_DEPARTMENTS.find((d) => d.name === departmentName);
  return dept?.cities ?? [];
}

export function getCityTier(departmentName: string, cityName: string): CityTier {
  const dept = COLOMBIA_DEPARTMENTS.find((d) => d.name === departmentName);
  if (!dept) return 3;
  const city = dept.cities.find((c) => c.name === cityName);
  return city?.tier ?? dept.defaultTier;
}

export function quoteShipping(
  departmentName: string,
  cityName: string,
  subtotal: number,
  freeShippingThreshold: number
): { cost: number; tier: CityTier; eta: string; free: boolean } {
  const tier = getCityTier(departmentName, cityName);
  const free = subtotal >= freeShippingThreshold;
  return {
    cost: free ? 0 : SHIPPING_RATES[tier],
    tier,
    eta: SHIPPING_ETA[tier],
    free,
  };
}
