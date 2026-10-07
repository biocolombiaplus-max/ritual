import { prisma } from "./prisma";

// Configuración simple clave/valor editable desde /admin/configuracion.
// Si una clave no está en la base de datos, se usa su variable de entorno
// equivalente como respaldo (así el sitio sigue funcionando sin tocar el
// panel la primera vez).

export const SETTING_KEYS = {
  whatsappNumber: "whatsapp_number",
} as const;

const ENV_FALLBACKS: Record<string, string | undefined> = {
  [SETTING_KEYS.whatsappNumber]: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER,
};

export async function getSetting(key: string): Promise<string | null> {
  try {
    const row = await prisma.setting.findUnique({ where: { key } });
    if (row?.value) return row.value;
  } catch {
    // Si la tabla no existe todavía (DB no migrada) no tumbamos el sitio.
  }
  return ENV_FALLBACKS[key] ?? null;
}

export async function getWhatsappNumber(): Promise<string | null> {
  return getSetting(SETTING_KEYS.whatsappNumber);
}

export async function setSetting(key: string, value: string) {
  await prisma.setting.upsert({
    where: { key },
    create: { key, value },
    update: { value },
  });
}
