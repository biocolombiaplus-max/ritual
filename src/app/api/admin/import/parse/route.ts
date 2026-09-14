import { NextRequest, NextResponse } from "next/server";
import { parseCsvBuffer, parseXlsxBuffer, parsePdfText } from "@/lib/import";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file");

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "No se recibió ningún archivo" }, { status: 400 });
  }

  const name = file.name.toLowerCase();
  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    if (name.endsWith(".csv")) {
      const rows = parseCsvBuffer(buffer.toString("utf-8"));
      return NextResponse.json({ rows, source: "csv" });
    }

    if (name.endsWith(".xlsx") || name.endsWith(".xls")) {
      const rows = parseXlsxBuffer(buffer);
      return NextResponse.json({ rows, source: "xlsx" });
    }

    if (name.endsWith(".pdf")) {
      const pdfParse = (await import("pdf-parse")).default;
      const data = await pdfParse(buffer);
      const rows = parsePdfText(data.text);
      return NextResponse.json({
        rows,
        source: "pdf",
        warning:
          rows.some((r) => r.needsReview) || rows.length === 0
            ? "La lectura de PDF es aproximada. Revisa y corrige los datos antes de importar; para mejores resultados usa la plantilla CSV/Excel."
            : undefined,
      });
    }

    return NextResponse.json(
      { error: "Formato no soportado. Usa un archivo .csv, .xlsx o .pdf" },
      { status: 400 }
    );
  } catch {
    return NextResponse.json(
      { error: "No se pudo leer el archivo. Verifica que no esté dañado o protegido." },
      { status: 400 }
    );
  }
}
