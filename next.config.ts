import type { NextConfig } from "next";

const remotePatterns: NonNullable<NextConfig["images"]>["remotePatterns"] = [
  {
    protocol: "https",
    hostname: "*.public.blob.vercel-storage.com",
  },
  {
    protocol: "https",
    hostname: "*.r2.dev",
  },
];

// Si R2_PUBLIC_URL usa un dominio propio (no *.r2.dev), lo agregamos también.
if (process.env.R2_PUBLIC_URL) {
  try {
    const hostname = new URL(process.env.R2_PUBLIC_URL).hostname;
    if (!hostname.endsWith(".r2.dev")) {
      remotePatterns.push({ protocol: "https", hostname });
    }
  } catch {
    // URL inválida: se ignora, el build no debe romperse por esto.
  }
}

const nextConfig: NextConfig = {
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns,
  },
};

export default nextConfig;
