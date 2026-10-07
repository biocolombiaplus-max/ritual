import { NextRequest, NextResponse } from "next/server";
import { getSetting, setSetting, SETTING_KEYS } from "@/lib/settings";

export async function GET() {
  const whatsappNumber = await getSetting(SETTING_KEYS.whatsappNumber);
  return NextResponse.json({ whatsappNumber });
}

interface SettingsInput {
  whatsappNumber?: string;
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

  const whatsappNumber = await getSetting(SETTING_KEYS.whatsappNumber);
  return NextResponse.json({ whatsappNumber });
}
