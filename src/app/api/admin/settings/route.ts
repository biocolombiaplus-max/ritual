import { NextRequest, NextResponse } from "next/server";
import { deleteSetting, getSetting, setSetting, SETTING_KEYS } from "@/lib/settings";

export async function GET() {
  const [whatsappNumber, metaPixelId] = await Promise.all([
    getSetting(SETTING_KEYS.whatsappNumber),
    getSetting(SETTING_KEYS.metaPixelId),
  ]);
  return NextResponse.json({ whatsappNumber, metaPixelId });
}

interface SettingsInput {
  whatsappNumber?: string;
  metaPixelId?: string;
}

export async function PUT(req: NextRequest) {
  const body: SettingsInput = await req.json();

  if (body.whatsappNumber !== undefined) {
    const digits = body.whatsappNumber.replace(/\D/g, "");
    if (!digits) {
      return NextResponse.json({ error: "El número de WhatsApp no es válido" }, { status: 400 });
    }
    await setSetting(SETTING_KEYS.whatsappNumber, digits);
  }

  if (body.metaPixelId !== undefined) {
    const digits = body.metaPixelId.replace(/\D/g, "");
    if (digits) {
      await setSetting(SETTING_KEYS.metaPixelId, digits);
    } else {
      await deleteSetting(SETTING_KEYS.metaPixelId);
    }
  }

  const [whatsappNumber, metaPixelId] = await Promise.all([
    getSetting(SETTING_KEYS.whatsappNumber),
    getSetting(SETTING_KEYS.metaPixelId),
  ]);
  return NextResponse.json({ whatsappNumber, metaPixelId });
}
