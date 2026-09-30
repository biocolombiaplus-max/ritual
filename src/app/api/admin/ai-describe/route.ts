import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { z } from "zod";

// Carga rápida / alta de producto: mira la foto de un producto y sugiere
// nombre, categoría, descripción corta y descripción completa. Usa Gemini
// (gratis, GEMINI_API_KEY) si está configurado; si no, cae a Claude
// (ANTHROPIC_API_KEY, de pago). La sesión de admin ya está validada por el
// middleware (protege /api/admin/*); aquí solo se valida que la IA esté
// configurada.

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

type SuggestionData = z.infer<typeof Suggestion>;
type AnthropicMediaType = "image/jpeg" | "image/png" | "image/gif" | "image/webp";

function buildPrompt(categories: string[]) {
  return `Eres el asistente de catálogo de Ritual.com, una tienda online premium de bienestar y placer para adultos en Colombia. Mira la foto del producto y sugiere una ficha de catálogo profesional, discreta y elegante — igual que la de cualquier tienda de bienestar íntimo seria (nunca lenguaje explícito o gráfico).
Categorías existentes en la tienda: ${categories.join(", ") || "ninguna todavía"}.
Si no reconoces el producto exacto, usa una descripción genérica corta acorde a lo que se ve en la foto (ej: "Vibrador de silicona", "Aceite de masaje").`;
}

function normalizeMediaType(mime: string): AnthropicMediaType {
  const base = mime.split(";")[0].trim().toLowerCase();
  if (base === "image/jpeg" || base === "image/png" || base === "image/gif" || base === "image/webp") return base;
  return "image/jpeg";
}

class AiBusyError extends Error {}

const GEMINI_SCHEMA = {
  type: "OBJECT",
  properties: {
    name: { type: "STRING", description: "Nombre comercial corto y claro, ej: 'Vibrador Silk Touch'. Sin emojis." },
    categoryName: { type: "STRING", description: "Categoría en español, reutilizando una existente si aplica." },
    shortDescription: { type: "STRING", description: "Frase corta (máx 12 palabras), profesional y discreta." },
    description: {
      type: "STRING",
      description: "2 a 3 frases de venta, tono profesional y discreto, sin lenguaje explícito.",
    },
  },
  required: ["name", "categoryName", "shortDescription", "description"],
};

async function suggestWithGemini(data: string, mimeType: string, categories: string[]): Promise<SuggestionData> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { inline_data: { mime_type: mimeType.split(";")[0].trim(), data } },
              { text: buildPrompt(categories) },
            ],
          },
        ],
        generationConfig: { responseMimeType: "application/json", responseSchema: GEMINI_SCHEMA },
      }),
    }
  );
  if (res.status === 429) throw new AiBusyError();
  if (!res.ok) {
    console.error("ai-describe: gemini error", res.status, await res.text().catch(() => ""));
    throw new Error(`gemini_${res.status}`);
  }
  const json = await res.json();
  const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("gemini_empty");
  return Suggestion.parse(JSON.parse(text));
}

async function suggestWithClaude(data: string, mimeType: string, categories: string[]): Promise<SuggestionData> {
  const client = new Anthropic();
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
          { type: "image", source: { type: "base64", media_type: normalizeMediaType(mimeType), data } },
          { type: "text", text: buildPrompt(categories) },
        ],
      },
    ],
  });
  if (response.stop_reason === "refusal" || !response.parsed_output) {
    throw new Error("no_suggestion");
  }
  return response.parsed_output;
}

async function loadImage(image: string, imageUrl: string): Promise<{ data: string; mimeType: string } | null> {
  if (image) return { data: image, mimeType: "image/jpeg" };
  if (imageUrl && /^https?:\/\//.test(imageUrl)) {
    const res = await fetch(imageUrl);
    if (!res.ok) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.byteLength > 8_000_000) return null;
    return { data: buf.toString("base64"), mimeType: res.headers.get("content-type") || "image/jpeg" };
  }
  return null;
}

export async function POST(req: NextRequest) {
  const hasGemini = !!process.env.GEMINI_API_KEY;
  const hasClaude = !!process.env.ANTHROPIC_API_KEY;
  if (!hasGemini && !hasClaude) {
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }

  let image = "";
  let imageUrl = "";
  let categories: string[] = [];
  try {
    const body = (await req.json()) as { image?: string; imageUrl?: string; categories?: string[] };
    image = String(body.image ?? "");
    imageUrl = String(body.imageUrl ?? "");
    categories = Array.isArray(body.categories) ? body.categories.slice(0, 40).map(String) : [];
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
  if (image && image.length > 6_000_000) {
    return NextResponse.json({ error: "bad_image" }, { status: 400 });
  }
  if (!image && !imageUrl) {
    return NextResponse.json({ error: "bad_image" }, { status: 400 });
  }

  const loaded = await loadImage(image, imageUrl);
  if (!loaded) {
    return NextResponse.json({ error: "bad_image" }, { status: 400 });
  }

  try {
    const suggestion = hasGemini
      ? await suggestWithGemini(loaded.data, loaded.mimeType, categories)
      : await suggestWithClaude(loaded.data, loaded.mimeType, categories);
    return NextResponse.json({ suggestion });
  } catch (error) {
    if (error instanceof AiBusyError || error instanceof Anthropic.RateLimitError) {
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
