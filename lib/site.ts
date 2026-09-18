export const SITE_ORIGIN = "https://yugiohforbiddenmemories.com";

export function absoluteSiteUrl(path = "/") {
  return `${SITE_ORIGIN}${path.startsWith("/") ? path : `/${path}`}`;
}
