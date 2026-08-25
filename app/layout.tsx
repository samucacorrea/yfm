import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

const GTM_ID_PATTERN = /^GTM-[A-Z0-9]+$/i;

function getGoogleTagManagerId() {
  const value = (process.env.GTM_ID || process.env.NEXT_PUBLIC_GTM_ID || "").trim();
  return GTM_ID_PATTERN.test(value) ? value.toUpperCase() : "";
}

function googleTagManagerBootstrap(containerId: string) {
  return `
    window.dataLayer = window.dataLayer || [];
    const loadGtm = () => {
      window.dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });

      const gtmScript = document.createElement("script");
      gtmScript.async = true;
      gtmScript.src = "https://www.googletagmanager.com/gtm.js?id=${containerId}";
      document.head.appendChild(gtmScript);
    };

    let lastLocation = "";
    const sendPageView = () => {
      const pageLocation = window.location.href;
      if (pageLocation === lastLocation) return;

      lastLocation = pageLocation;
      window.dataLayer.push({
        event: "page_view",
        page_location: pageLocation,
        page_path: window.location.pathname + window.location.search,
        page_title: document.title,
      });
    };

    const schedulePageView = () => window.requestAnimationFrame(sendPageView);
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function (...args) {
      originalPushState.apply(this, args);
      schedulePageView();
    };

    history.replaceState = function (...args) {
      originalReplaceState.apply(this, args);
      schedulePageView();
    };

    window.addEventListener("popstate", schedulePageView);
    schedulePageView();

    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(loadGtm, { timeout: 2500 });
    } else {
      window.addEventListener("load", () => window.setTimeout(loadGtm, 1), { once: true });
    }
  `;
}

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
  const gtmId = getGoogleTagManagerId();

  return (
    <html lang="pt-BR">
      <head>
        {gtmId ? (
          <script
            id="google-tag-manager"
            dangerouslySetInnerHTML={{ __html: googleTagManagerBootstrap(gtmId) }}
          />
        ) : null}
      </head>
      <body>
        {gtmId ? (
          <>
            <noscript>
              <iframe
                src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
                height="0"
                width="0"
                style={{ display: "none", visibility: "hidden" }}
                title="Google Tag Manager"
              />
            </noscript>
          </>
        ) : null}
        {children}
      </body>
    </html>
  );
}
