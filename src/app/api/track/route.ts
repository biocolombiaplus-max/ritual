import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const ALLOWED_TYPES = new Set(["page_view", "add_to_cart", "begin_checkout", "purchase"]);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const type = String(body?.type ?? "");
    const sessionId = String(body?.sessionId ?? "");
    const path = body?.path ? String(body.path).slice(0, 300) : null;
    const productId = body?.productId ? String(body.productId).slice(0, 100) : null;

    if (!ALLOWED_TYPES.has(type) || !sessionId) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    await prisma.analyticsEvent.create({
      data: { type, sessionId: sessionId.slice(0, 100), path, productId },
    });
    return NextResponse.json({ ok: true });
  } catch {
    // La analítica nunca debe romper la experiencia de compra.
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
