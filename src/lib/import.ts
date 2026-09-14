import Papa from "papaparse";
import * as XLSX from "xlsx";

export interface ImportRow {
  name: string;
  shortDescription: string;
  description: string;
  price: number | null;
  compareAtPrice: number | null;
  sku: string;
  stock: number;
  category: string;
  featured: boolean;
  imageUrl: string;
  needsReview?: boolean;
}

function emptyRow(): ImportRow {
  return {
    name: "",
    shortDescription: "",
    description: "",
    price: null,
    compareAtPrice: null,
    sku: "",
    stock: 10,
    category: "",
    featured: false,
    imageUrl: "",
  };
}

const HEADER_MAP: Record<string, keyof ImportRow> = {
  nombre: "name",
  producto: "name",
  name: "name",
  descripcion: "description",
  "descripción": "description",
  description: "description",
  descripcioncorta: "shortDescription",
  "descripcion corta": "shortDescription",
  "descripción corta": "shortDescription",
  shortdescription: "shortDescription",
  precio: "price",
  price: "price",
  precioantes: "compareAtPrice",
  "precio antes": "compareAtPrice",
  "precio anterior": "compareAtPrice",
  compareatprice: "compareAtPrice",
  sku: "sku",
  referencia: "sku",
  stock: "stock",
  inventario: "stock",
  categoria: "category",
  "categoría": "category",
  category: "category",
  destacado: "featured",
  featured: "featured",
  imagen: "imageUrl",
  imagenurl: "imageUrl",
  "imagen url": "imageUrl",
  imageurl: "imageUrl",
  foto: "imageUrl",
};

function normalizeHeader(h: string): string {
  return h
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function lookupHeader(h: string): keyof ImportRow | undefined {
  const normalized = normalizeHeader(h);
  return HEADER_MAP[normalized] ?? HEADER_MAP[normalized.replace(/\s+/g, "")];
}

function parsePrice(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const cleaned = String(value).replace(/[^\d]/g, "");
  if (!cleaned) return null;
  const num = parseInt(cleaned, 10);
  return Number.isFinite(num) ? num : null;
}

function parseBool(value: unknown): boolean {
  const s = String(value ?? "").trim().toLowerCase();
  return ["si", "sí", "true", "1", "x", "yes"].includes(s);
}

function rowFromRecord(record: Record<string, unknown>): ImportRow {
  const row = emptyRow();
  for (const [rawKey, value] of Object.entries(record)) {
    const key = lookupHeader(rawKey);
    if (!key) continue;
    if (key === "price" || key === "compareAtPrice") {
      row[key] = parsePrice(value);
    } else if (key === "stock") {
      row.stock = parsePrice(value) ?? 10;
    } else if (key === "featured") {
      row.featured = parseBool(value);
    } else {
      row[key] = String(value ?? "").trim() as never;
    }
  }
  if (!row.description && row.shortDescription) row.description = row.shortDescription;
  return row;
}

export function parseCsvBuffer(text: string): ImportRow[] {
  const result = Papa.parse<Record<string, unknown>>(text, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
  });
  return (result.data ?? [])
    .filter((r) => Object.values(r).some((v) => String(v ?? "").trim() !== ""))
    .map(rowFromRecord);
}

export function parseXlsxBuffer(buffer: Buffer): ImportRow[] {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const records = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });
  return records
    .filter((r) => Object.values(r).some((v) => String(v ?? "").trim() !== ""))
    .map(rowFromRecord);
}

const LABELS: Record<string, keyof ImportRow> = {
  producto: "name",
  nombre: "name",
  descripcion: "description",
  "descripcion corta": "shortDescription",
  precio: "price",
  "precio antes": "compareAtPrice",
  "precio anterior": "compareAtPrice",
  categoria: "category",
  sku: "sku",
  referencia: "sku",
  stock: "stock",
  destacado: "featured",
  imagen: "imageUrl",
};

function normalizeLabel(l: string): string {
  return l
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

// Parser estructurado: espera bloques tipo "Campo: valor" separados por
// líneas en blanco o "---". Es la forma confiable de importar desde PDF.
export function parsePdfText(text: string): ImportRow[] {
  const blocks = text
    .split(/\n\s*(?:-{3,}|\*{3,})\s*\n|\n{2,}/)
    .map((b) => b.trim())
    .filter(Boolean);

  const rows: ImportRow[] = [];

  for (const block of blocks) {
    const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
    const row = emptyRow();
    let matchedFields = 0;

    for (const line of lines) {
      const m = line.match(/^([^:]{2,30}):\s*(.+)$/);
      if (!m) continue;
      const key = LABELS[normalizeLabel(m[1])];
      if (!key) continue;
      matchedFields++;
      const value = m[2].trim();
      if (key === "price" || key === "compareAtPrice") {
        row[key] = parsePrice(value);
      } else if (key === "stock") {
        row.stock = parsePrice(value) ?? 10;
      } else if (key === "featured") {
        row.featured = parseBool(value);
      } else {
        row[key] = value as never;
      }
    }

    if (matchedFields >= 2 && row.name) {
      rows.push(row);
    }
  }

  if (rows.length > 0) return rows;

  // Fallback: una línea por producto con formato "Nombre ... $precio"
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const fallbackRows: ImportRow[] = [];
  const priceRegex = /\$?\s?([\d.,]{4,})\s*(?:cop|pesos)?$/i;

  for (const line of lines) {
    const match = line.match(priceRegex);
    if (!match) continue;
    const price = parsePrice(match[1]);
    if (!price || price < 1000) continue;
    const name = line.slice(0, match.index).replace(/[-–:]+$/, "").trim();
    if (!name || name.length < 3) continue;
    const row = emptyRow();
    row.name = name;
    row.price = price;
    row.needsReview = true;
    fallbackRows.push(row);
  }

  return fallbackRows;
}
