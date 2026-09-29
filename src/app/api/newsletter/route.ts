import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  const { email } = await req.json();

  if (typeof email !== "string" || !EMAIL_REGEX.test(email.trim())) {
    return NextResponse.json({ error: "Ingresa un correo válido" }, { status: 400 });
  }

  try {
    await prisma.subscriber.create({ data: { email: email.trim().toLowerCase() } });
  } catch {
    // Ya estaba suscrito: no es un error para quien lo intenta de nuevo.
  }

  return NextResponse.json({ ok: true });
}
