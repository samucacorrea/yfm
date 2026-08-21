import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const siteOrigin = (process.env.SITE_URL || "https://yugiohforbiddenmemories.com").replace(/\/$/, "");
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") || requestHeaders.get("host") || "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") || (host.startsWith("localhost") ? "http" : "https");
  const image = `${protocol}://${host}/og.png`;
  const title = "Yu-Gi-Oh! Forbidden Memories — Cartas, Drops e Guias";
  const description = "Encontre cartas, passwords, drops e as melhores rotas de farm de Yu-Gi-Oh! Forbidden Memories em português.";
  return {
    metadataBase: new URL(siteOrigin),
    applicationName: "Yu-Gi-Oh! Forbidden Memories",
    title,
    description,
    openGraph: { title, description, siteName: "Yu-Gi-Oh! Forbidden Memories", images: [{ url: image, width: 1730, height: 909, alt: "Yu-Gi-Oh! Forbidden Memories — Todas as cartas, todos os drops" }] },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body>{children}</body></html>;
}
