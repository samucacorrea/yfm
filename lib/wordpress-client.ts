type WordPressConfig = {
  apiBase: string;
  username?: string;
  applicationPassword?: string;
};

type WordPressErrorBody = {
  code?: string;
  message?: string;
};

export type WordPressRendered = { rendered: string };

export type WordPressEntitySummary = {
  id: number;
  slug: string;
  title: WordPressRendered;
};

export type WordPressAuthenticatedUser = {
  id: number;
  name: string;
  username: string;
  roles?: string[];
};

export function getWordPressConfig(): WordPressConfig {
  const configuredUrl = (process.env.WP_URL?.trim() || "https://wp.yugifbm.com")
    .replace(/\/+$/, "")
    .replace(/\/wp-json$/, "");
  const username = process.env.WP_USER?.trim();
  const applicationPassword = process.env.WP_APP_PASS?.trim();

  return {
    apiBase: `${configuredUrl}/wp-json`,
    username: username && applicationPassword ? username : undefined,
    applicationPassword: username && applicationPassword ? applicationPassword : undefined,
  };
}

function encodeBasicAuth(username: string, password: string) {
  const bytes = new TextEncoder().encode(`${username}:${password}`);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

async function wordpressFetch(endpoint: string, init: RequestInit = {}) {
  const config = getWordPressConfig();
  const path = endpoint.replace(/^\/+/, "");
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");
  if (config.username && config.applicationPassword) headers.set("Authorization", `Basic ${encodeBasicAuth(config.username, config.applicationPassword)}`);

  const response = await fetch(`${config.apiBase}/${path}`, { ...init, headers });
  if (!response.ok) {
    const error = await response.json().catch(() => null) as WordPressErrorBody | null;
    throw new Error(error?.message || `WordPress REST API retornou HTTP ${response.status}`);
  }

  return response;
}

export async function wordpressRequest<T>(endpoint: string, init: RequestInit = {}): Promise<T> {
  const response = await wordpressFetch(endpoint, init);
  return response.json() as Promise<T>;
}

export async function wordpressPaginatedRequest<T>(endpoint: string, init: RequestInit = {}) {
  const response = await wordpressFetch(endpoint, init);
  return {
    data: await response.json() as T,
    total: Number(response.headers.get("x-wp-total") || 0),
    totalPages: Number(response.headers.get("x-wp-totalpages") || 1),
  };
}

export function getAuthenticatedWordPressUser() {
  return wordpressRequest<WordPressAuthenticatedUser>("wp/v2/users/me?context=edit");
}

function normalizedLimit(limit: number) {
  return Math.max(1, Math.min(100, Math.trunc(limit)));
}

export function listWordPressCards(limit = 5) {
  return wordpressRequest<WordPressEntitySummary[]>(
    `wp/v2/fm_carta?per_page=${normalizedLimit(limit)}&_fields=id,title,slug`,
  );
}

export function listWordPressCharacters(limit = 5) {
  return wordpressRequest<WordPressEntitySummary[]>(
    `wp/v2/fm_personagem?per_page=${normalizedLimit(limit)}&_fields=id,title,slug`,
  );
}

export function listWordPressMods(limit = 5) {
  return wordpressRequest<WordPressEntitySummary[]>(
    `wp/v2/fm_mod?per_page=${normalizedLimit(limit)}&_fields=id,title,slug`,
  );
}
