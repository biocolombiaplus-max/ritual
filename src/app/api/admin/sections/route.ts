import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const KEYS = ["logo", "hero", "banner_promo", "brand_story", "newsletter"];

export async function GET() {
  const sections = await prisma.siteSection.findMany();
  const map: Record<string, unknown> = {};
  for (const key of KEYS) {
    map[key] = sections.find((s) => s.key === key) ?? { key, title: "", subtitle: "", imageUrl: "", linkUrl: "", linkText: "" };
  }
  return NextResponse.json({ sections: map });
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const { key, title, subtitle, imageUrl, linkUrl, linkText } = body;

  if (!key || !KEYS.includes(key)) {
    return NextResponse.json({ error: "Sección inválida" }, { status: 400 });
  }

  const section = await prisma.siteSection.upsert({
    where: { key },
    update: {
      title: title || null,
      subtitle: subtitle || null,
      imageUrl: imageUrl || null,
      linkUrl: linkUrl || null,
      linkText: linkText || null,
    },
    create: {
      key,
      title: title || null,
      subtitle: subtitle || null,
      imageUrl: imageUrl || null,
      linkUrl: linkUrl || null,
      linkText: linkText || null,
    },
  });

  return NextResponse.json({ section });
}
