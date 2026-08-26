import type { CardRecord, Drop } from "./catalog";
import type { Duelist, ModRecord, PoolCard, PoolKey } from "./portal-content";
import { wordpressPaginatedRequest, wordpressRequest } from "./wordpress-client";

type WordPressCardRaw = {
  id: number;
  id_jogo: string;
  nome: string;
  nome_pt?: string;
  slug: string;
  tipo?: string[];
  atributo?: string[];
  categoria?: string[];
  nivel?: string;
  atk?: string;
  def?: string;
  password?: string;
  valor_venda?: string;
  preco_loja?: string;
  raridade?: string | number;
  dropavel?: boolean;
  compravel?: boolean;
  trocavel?: boolean;
  imagem?: false | string | { url?: string; sizes?: Record<string, string> };
  imagem_quadrada?: false | string | { url?: string; sizes?: Record<string, string> };
  resposta_rapida?: string;
  guia_completo?: string;
  faq?: Array<{ pergunta?: string; resposta?: string; q?: string; a?: string }>;
  drops?: Array<{
    personagem_id: number;
    personagem: string;
    slug: string;
    pool: string;
    prob_pct: number;
  }>;
};

type WordPressCharacterRaw = {
  id: number;
  nome: string;
  slug: string;
  id_jogo?: string;
  local?: string;
  deck?: string;
  deck_nome?: string;
  melhor_rank?: string;
  sobre?: string;
  dica_farm?: string;
  guia_farm?: string;
  resposta_rapida?: string;
  imagem?: false | string | { url?: string; sizes?: Record<string, string> };
  faq_json?: string;
  faq?: Array<{ pergunta?: string; resposta?: string; q?: string; a?: string }>;
  drops?: Array<{
    carta_id: number;
    carta: string;
    slug: string;
    pool: string;
    prob_pct: number;
  }>;
};

const entities: Record<string, string> = {
  "&#038;": "&",
  "&#8217;": "’",
  "&#8211;": "–",
  "&#8212;": "—",
  "&amp;": "&",
  "&quot;": '"',
  "&#039;": "'",
};

export function decodeWordPressText(value = "") {
  return value.replace(/&#\d+;|&(?:amp|quot);/g, (entity) => entities[entity] || entity);
}

export function taxonomySlug(value: string) {
  const slug = value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return ({ dragon: "dragao", spellcaster: "mago", thunder: "trovao" } as Record<string, string>)[slug] || slug;
}

function numberValue(value: string | number | undefined, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function imageUrl(image: WordPressCardRaw["imagem"]) {
  if (!image) return undefined;
  const source = typeof image === "string" ? image : image.sizes?.large || image.sizes?.medium_large || image.url;
  if (!source) return undefined;
  const normalized = decodeWordPressText(source).trim();
  if (!normalized) return undefined;
  try { return new URL(normalized, "https://wp.yugifbm.com").toString(); }
  catch { return undefined; }
}

function poolLabel(pool: string) {
  if (pool === "sapow") return "S/A POW";
  if (pool === "satec" || pool === "astec") return "S/A TEC";
  return "B/C/D";
}

function poolKey(pool: string): PoolKey {
  if (pool === "sapow") return "s-pow";
  if (pool === "satec" || pool === "astec") return "s-tec";
  return "b-c-d";
}

function rate(value: number) {
  return `${value.toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}%`;
}

function mapCard(raw: WordPressCardRaw): CardRecord {
  const drops: Drop[] = (raw.drops || []).map((drop) => ({
    duelist: decodeWordPressText(drop.personagem),
    duelistSlug: drop.slug,
    pool: poolLabel(drop.pool),
    rate: rate(drop.prob_pct),
    location: "Free Duel",
  }));
  const name = decodeWordPressText(raw.nome);
  const type = decodeWordPressText(raw.tipo?.[0] || "Sem tipo");
  const attribute = decodeWordPressText(raw.atributo?.[0] || "Sem atributo");

  return {
    id: numberValue(raw.id_jogo, raw.id),
    slug: raw.slug,
    name,
    namePt: decodeWordPressText(raw.nome_pt || raw.nome),
    type,
    attribute,
    level: numberValue(raw.nivel),
    atk: numberValue(raw.atk),
    def: numberValue(raw.def),
    password: raw.password || "",
    price: numberValue(raw.preco_loja),
    rarity: String(raw.raridade || raw.categoria?.[0] || "Não informada"),
    summary: decodeWordPressText(raw.resposta_rapida) || `${name} é uma carta do tipo ${type} com ${numberValue(raw.atk)} de ATK e ${numberValue(raw.def)} de DEF.`,
    drops,
    image: imageUrl(raw.imagem),
  };
}

export async function getWordPressCards() {
  const first = await wordpressPaginatedRequest<WordPressCardRaw[]>("fm/v1/cartas?per_page=100&page=1");
  const remaining = first.totalPages > 1
    ? await Promise.all(Array.from({ length: first.totalPages - 1 }, (_, index) => wordpressRequest<WordPressCardRaw[]>(`fm/v1/cartas?per_page=100&page=${index + 2}`)))
    : [];
  const records = [first.data, ...remaining].flat();
  return records.map(mapCard).sort((a, b) => a.id - b.id);
}

export async function getWordPressCard(slug: string) {
  const record = await wordpressRequest<WordPressCardRaw>(`fm/v1/carta/${encodeURIComponent(slug)}`);
  return mapCard(record);
}

export async function getWordPressDuelists() {
  const records = await wordpressRequest<WordPressCharacterRaw[]>("fm/v1/personagens?per_page=100");
  return records.map((record): Duelist => {
    const name = decodeWordPressText(record.nome);
    return {
      slug: record.slug,
      name,
      initial: name.charAt(0),
      location: decodeWordPressText(record.local || ""),
      deck: "",
      order: 0,
      bestRank: decodeWordPressText(record.melhor_rank || ""),
      heroImage: imageUrl(record.imagem),
      squareImage: imageUrl(record.imagem_quadrada),
      bio: "",
      answer: "",
      pools: { "s-pow": [], "s-tec": [], "b-c-d": [] },
      faq: [],
    };
  });
}

export async function getWordPressDuelist(slug: string): Promise<Duelist> {
  const raw = await wordpressRequest<WordPressCharacterRaw>(`fm/v1/personagem/${encodeURIComponent(slug)}`);
  const pools: Record<PoolKey, PoolCard[]> = { "s-pow": [], "s-tec": [], "b-c-d": [] };
  for (const drop of raw.drops || []) {
    const key = poolKey(drop.pool);
    pools[key].push({ cardSlug: drop.slug, name: decodeWordPressText(drop.carta), rate: rate(drop.prob_pct), rank: poolLabel(drop.pool) });
  }
  for (const items of Object.values(pools)) items.sort((a, b) => numberValue(b.rate.replace("%", "").replace(",", ".")) - numberValue(a.rate.replace("%", "").replace(",", ".")));
  const name = decodeWordPressText(raw.nome);
  let rawFaq = raw.faq || [];
  if (!rawFaq.length && raw.faq_json) {
    try { const parsed = JSON.parse(raw.faq_json); if (Array.isArray(parsed)) rawFaq = parsed; }
    catch { rawFaq = []; }
  }
  const faq = rawFaq.map((item) => ({ q: decodeWordPressText(item.pergunta || item.q), a: decodeWordPressText(item.resposta || item.a) })).filter((item) => item.q && item.a);
  return {
    slug: raw.slug,
    name,
    initial: name.charAt(0),
    location: decodeWordPressText(raw.local || ""),
    deck: decodeWordPressText(raw.deck_nome || raw.deck || ""),
    order: numberValue(raw.id_jogo),
    bestRank: decodeWordPressText(raw.melhor_rank || ""),
    about: decodeWordPressText(raw.sobre || ""),
    farmTip: decodeWordPressText(raw.dica_farm || ""),
    farmGuide: decodeWordPressText(raw.guia_farm || ""),
    heroImage: imageUrl(raw.imagem),
    squareImage: imageUrl(raw.imagem_quadrada),
    bio: decodeWordPressText(raw.sobre || ""),
    answer: decodeWordPressText(raw.resposta_rapida || raw.sobre || ""),
    pools,
    faq,
  };
}

type WordPressModRaw = {
  id: number;
  nome: string;
  slug: string;
  link?: string;
  versao?: string;
  autor?: string;
  tipo_de_mod?: string;
  drop_multiplier?: string | number;
  versao_base?: string;
  arquivos_editados?: string | string[];
  link_download?: string;
  tags?: string[];
  imagem?: string | false;
  resposta_rapida?: string;
  guia_completo?: string;
  changelog?: string;
  faq?: Array<[string, string] | { pergunta?: string; resposta?: string; q?: string; a?: string }>;
};

function modList(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value.map((item) => decodeWordPressText(String(item).trim())).filter(Boolean);
  return value ? value.split(/\r?\n|,/).map((item) => decodeWordPressText(item.trim())).filter(Boolean) : [];
}

function mapMod(record: WordPressModRaw): ModRecord {
  const name = decodeWordPressText(record.nome);
  const tags = (record.tags || []).map((tag) => decodeWordPressText(tag)).filter(Boolean);
  const faq = (record.faq || []).map((item) => {
    if (Array.isArray(item)) return { q: decodeWordPressText(item[0] || ""), a: decodeWordPressText(item[1] || "") };
    return { q: decodeWordPressText(item.pergunta || item.q || ""), a: decodeWordPressText(item.resposta || item.a || "") };
  }).filter((item) => item.q && item.a);
  const guideContent = record.guia_completo || "";
  const changelogContent = record.changelog || "";
  const summary = decodeWordPressText(record.resposta_rapida || "");
  return {
    id: record.id,
    slug: record.slug,
    name,
    version: decodeWordPressText(record.versao || ""),
    author: decodeWordPressText(record.autor || ""),
    tag: decodeWordPressText(record.tipo_de_mod || tags[0] || ""),
    tags,
    multiplier: decodeWordPressText(String(record.drop_multiplier || "")),
    baseVersion: decodeWordPressText(record.versao_base || ""),
    editedFiles: modList(record.arquivos_editados),
    summary,
    content: guideContent || changelogContent,
    guideContent,
    changelogContent,
    image: record.imagem ? imageUrl(record.imagem) : undefined,
    sourceUrl: record.link_download ? decodeWordPressText(record.link_download) : "",
    wordpressUrl: record.link ? decodeWordPressText(record.link) : "",
    features: [],
    changelog: [],
    faq,
  };
}

export async function getWordPressMods() {
  const records = await wordpressRequest<WordPressModRaw[]>("fm/v1/mods");
  return records.map(mapMod);
}

export async function getWordPressMod(slug: string) {
  const record = await wordpressRequest<WordPressModRaw>(`fm/v1/mod/${encodeURIComponent(slug)}`);
  return record?.slug ? mapMod(record) : undefined;
}
