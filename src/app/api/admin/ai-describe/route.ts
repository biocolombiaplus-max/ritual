import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { z } from "zod";

// Carga rápida del panel: mira la foto de un producto y sugiere nombre,
// categoría, descripción corta y descripción completa. La sesión de admin
// ya está validada por el middleware (protege /api/admin/*); aquí solo se
// valida que la IA esté configurada.

export const runtime = "nodejs";
export const maxDuration = 30;

const Suggestion = z.object({
  name: z
    .string()
    .describe("Nombre comercial corto y claro del producto, ej: 'Vibrador Silk Touch'. Sin emojis."),
  categoryName: z
    .string()
    .describe(
      "Categoría del producto en español, usando una de las categorías existentes si aplica (o una nueva corta y clara si ninguna encaja)."
    ),
  shortDescription: z
    .string()
    .describe("Una frase corta (máx 12 palabras) para la tarjeta del producto, profesional y discreta."),
  description: z
    .string()
    .describe(
      "2 a 3 frases de venta en español neutro, tono profesional y discreto propio de una tienda de bienestar íntimo premium. Menciona material, características y uso general. Nunca uses lenguaje explícito ni gráfico."
    ),
});

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }

  let image = "";
  let categories: string[] = [];
  try {
    const body = (await req.json()) as { image?: string; categories?: string[] };
    image = String(body.image ?? "");
    categories = Array.isArray(body.categories) ? body.categories.slice(0, 40).map(String) : [];
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
  if (!image || image.length > 6_000_000) {
    return NextResponse.json({ error: "bad_image" }, { status: 400 });
  }

  const client = new Anthropic();
  try {
    const response = await client.beta.messages.parse({
      model: "claude-opus-5",
      max_tokens: 1500,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: { effort: "low", format: betaZodOutputFormat(Suggestion) },
      messages: [
        {
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type: "image/jpeg", data: image } },
            {
              type: "text",
              text: `Eres el asistente de catálogo de Ritual.com, una tienda online premium de bienestar y placer para adultos en Colombia. Mira la foto del producto y sugiere una ficha de catálogo profesional, discreta y elegante — igual que la de cualquier tienda de bienestar íntimo seria (nunca lenguaje explícito o gráfico).
Categorías existentes en la tienda: ${categories.join(", ") || "ninguna todavía"}.
Si no reconoces el producto exacto, usa una descripción genérica corta acorde a lo que se ve en la foto (ej: "Vibrador de silicona", "Aceite de masaje").`,
            },
          ],
        },
      ],
    });

    if (response.stop_reason === "refusal" || !response.parsed_output) {
      return NextResponse.json({ error: "no_suggestion" }, { status: 422 });
    }
    return NextResponse.json({ suggestion: response.parsed_output });
  } catch (error) {
    if (error instanceof Anthropic.RateLimitError) {
      return NextResponse.json({ error: "busy" }, { status: 503 });
    }
    if (error instanceof Anthropic.APIError) {
      console.error("ai-describe: API error", error.status, error.message);
      return NextResponse.json({ error: "api_error" }, { status: 502 });
    }
    console.error("ai-describe:", error);
    return NextResponse.json({ error: "unknown" }, { status: 500 });
  }
}
