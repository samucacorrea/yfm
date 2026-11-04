"use client";
import { useState } from "react";
import { trackAnalyticsEvent } from "./analytics";

export function CopyPassword({ code, contentId }: { code: string; contentId: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(code);
    trackAnalyticsEvent("copy_password", { content_type: "card_password", content_id: contentId });
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return <button className="copybtn" type="button" onClick={copy}>{copied ? "Copiado!" : "Copiar"}</button>;
}
