import { getWordPressConfig } from "./wordpress-client";

export type AdPlacement =
  | "home_billboard"
  | "cards_inline"
  | "card_detail_inline"
  | "passwords_inline"
  | "drops_inline"
  | "mods_inline"
  | "blog_inline"
  | "blog_sidebar";

export type AdCreative = {
  type: "image" | "gif";
  url: string;
  width: number;
  height: number;
  mimeType: string;
  alt: string;
};

export type AdCampaign = {
  id: number;
  campaignId: string;
  campaignName: string;
  advertiser: string;
  placement: AdPlacement;
  format: "billboard" | "square" | "mobile_strip";
  destinationUrl: string;
  disclosure: string;
  desktopCreative: AdCreative;
  mobileCreative?: AdCreative;
};

type RawCreative = {
  type?: unknown;
  url?: unknown;
  width?: unknown;
  height?: unknown;
  mime_type?: unknown;
  alt?: unknown;
};

type RawCampaign = {
  id?: unknown;
  campaign_id?: unknown;
  campaign_name?: unknown;
  advertiser?: unknown;
  placement?: unknown;
  format?: unknown;
  destination_url?: unknown;
  disclosure?: unknown;
  creative?: RawCreative;
  creatives?: { desktop?: RawCreative; mobile?: RawCreative | null };
};

type CacheEntry = { expiresAt: number; request: Promise<AdCampaign | null> };

const AD_CACHE_TTL = 5 * 60 * 1000;
const requests = new Map<string, CacheEntry>();
const formats = new Set(["billboard", "square", "mobile_strip"]);

function httpUrl(value: unknown) {
  if (typeof value !== "string") return "";
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : "";
  } catch {
    return "";
  }
}

function normalizeCreative(value: RawCreative | null | undefined): AdCreative | undefined {
  const url = httpUrl(value?.url);
  const width = Number(value?.width);
  const height = Number(value?.height);
  if (!url || !Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) return undefined;

  return {
    type: value?.type === "gif" ? "gif" : "image",
    url,
    width,
    height,
    mimeType: typeof value?.mime_type === "string" ? value.mime_type : "image/jpeg",
    alt: typeof value?.alt === "string" ? value.alt.trim() : "",
  };
}

function normalizeCampaign(value: RawCampaign, placement: AdPlacement): AdCampaign | null {
  const id = Number(value.id);
  const destinationUrl = httpUrl(value.destination_url);
  const desktopCreative = normalizeCreative(value.creatives?.desktop || value.creative);
  const mobileCreative = normalizeCreative(value.creatives?.mobile);
  const format = typeof value.format === "string" && formats.has(value.format) ? value.format : "square";
  if (!Number.isInteger(id) || id <= 0 || !destinationUrl || !desktopCreative) return null;

  return {
    id,
    campaignId: typeof value.campaign_id === "string" ? value.campaign_id : `yfm-${id}`,
    campaignName: typeof value.campaign_name === "string" && value.campaign_name.trim() ? value.campaign_name.trim() : `Campanha ${id}`,
    advertiser: typeof value.advertiser === "string" ? value.advertiser.trim() : "",
    placement,
    format: format as AdCampaign["format"],
    destinationUrl,
    disclosure: typeof value.disclosure === "string" && value.disclosure.trim() ? value.disclosure.trim() : "Publicidade",
    desktopCreative,
    mobileCreative,
  };
}

async function requestCampaign(placement: AdPlacement, path: string) {
  const { apiBase } = getWordPressConfig();
  const params = new URLSearchParams({ placement, path, device: "desktop" });
  const response = await fetch(`${apiBase}/yfm-ads/v1/campaign?${params}`, {
    headers: { Accept: "application/json" },
  });
  if (response.status === 204) return null;
  if (!response.ok) throw new Error(`YFM Ads retornou HTTP ${response.status}`);
  return normalizeCampaign(await response.json() as RawCampaign, placement);
}

export async function getAdCampaign(placement: AdPlacement, path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const key = `${placement}|${normalizedPath}`;
  const cached = requests.get(key);
  if (cached && Date.now() < cached.expiresAt) return cached.request;

  const request = requestCampaign(placement, normalizedPath)
    .then((campaign) => {
      if (!campaign) requests.delete(key);
      return campaign;
    })
    .catch(() => {
      requests.delete(key);
      return null;
    });
  requests.set(key, { expiresAt: Date.now() + AD_CACHE_TTL, request });
  return request;
}
