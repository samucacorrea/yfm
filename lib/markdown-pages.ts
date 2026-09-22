import type { CardRecord } from "./catalog";
import type { Duelist } from "./portal-content";
import { absoluteSiteUrl } from "./site";
import type { WordPressPost } from "./wordpress";

const POOL_LABELS = ["S/A POW", "S/A TEC", "B/C/D"] as const;

function cleanText(value: string | number | undefined) {
  return String(value ?? "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#8211;/g, "–")
    .replace(/&#8212;/g, "—")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/([\\`*_\[\]|])/g, "\\$1");
}

function documentResponse(content: string, canonicalPath: string) {
  return new Response(`${content.trim()}\n`, {
    headers: {
      "Cache-Control": "public, max-age=300, stale-while-revalidate=3600",
      "Content-Type": "text/markdown; charset=utf-8",
      Link: `<${absoluteSiteUrl(canonicalPath)}>; rel="canonical", </llms.txt>; rel="describedby"`,
    },
  });
}

export function cardsMarkdown(cards: CardRecord[]) {
  const rows = cards.map((card) => {
    const password = card.password || "não disponível";
    const drops = card.drops.length ? `${card.drops.length} fonte(s) de drop` : "sem drop catalogado";
    return `- [#${String(card.id).padStart(3, "0")} ${cleanText(card.name)}](${absoluteSiteUrl(`/cartas/${card.slug}/`)}): ${cleanText(card.namePt)}; ${cleanText(card.type)}; atributo ${cleanText(card.attribute)}; nível ${card.level}; ATK ${card.atk}; DEF ${card.def}; password ${cleanText(password)}; custo ${card.price.toLocaleString("pt-BR")} estrelas; ${drops}.`;
  });

  return documentResponse(`# Catálogo de cartas de Yu-Gi-Oh! Forbidden Memories

> Relação textual das ${cards.length} cartas catalogadas, com links para as fichas canônicas em português.

Cada ficha HTML contém os dados estruturados JSON-LD canônicos, detalhes de obtenção e informações adicionais da carta.

## Cartas

${rows.join("\n")}`, "/cartas/");
}

export function dropsMarkdown(duelists: Duelist[], cards: CardRecord[]) {
  const dropsByDuelist = new Map<string, Map<string, Set<string>>>();
  for (const card of cards) {
    for (const drop of card.drops) {
      const key = drop.duelistSlug || drop.duelist.toLocaleLowerCase("pt-BR").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      const pools = dropsByDuelist.get(key) || new Map<string, Set<string>>();
      const pool = pools.get(drop.pool) || new Set<string>();
      pool.add(card.slug);
      pools.set(drop.pool, pool);
      dropsByDuelist.set(key, pools);
    }
  }

  const rows = duelists.map((duelist) => {
    const pools = dropsByDuelist.get(duelist.slug);
    const coverage = POOL_LABELS.map((label) => `${label}: ${pools?.get(label)?.size ?? 0}`).join("; ");
    const total = duelist.totalCards ?? new Set([...(pools?.values() || [])].flatMap((items) => [...items])).size;
    const location = duelist.location ? `; local ${cleanText(duelist.location)}` : "";
    return `- [${cleanText(duelist.name)}](${absoluteSiteUrl(`/drops/${duelist.slug}/`)}): ${total} carta(s); ${coverage}${location}.`;
  });

  return documentResponse(`# Drops de Yu-Gi-Oh! Forbidden Memories

> Índice textual de ${duelists.length} duelistas e suas bolsas de recompensa S/A POW, S/A TEC e B/C/D.

O rank obtido ao vencer um duelista determina qual bolsa participa do sorteio. As fichas vinculadas apresentam cartas, taxas e ranks detalhados; seus dados JSON-LD são canônicos.

## Duelistas e bolsas

${rows.join("\n")}`, "/drops/");
}

export function passwordsMarkdown(cards: CardRecord[]) {
  const passwordCards = cards.filter((card) => card.password);
  const rows = passwordCards.map((card) =>
    `- [${cleanText(card.name)}](${absoluteSiteUrl(`/cartas/${card.slug}/`)}): password ${cleanText(card.password)}; #${String(card.id).padStart(3, "0")}; ${cleanText(card.type)}; atributo ${cleanText(card.attribute)}; ATK ${card.atk}; DEF ${card.def}; custo ${card.price.toLocaleString("pt-BR")} estrelas.`,
  );

  return documentResponse(`# Passwords de Yu-Gi-Oh! Forbidden Memories

> Lista textual de ${passwordCards.length} cartas com password catalogado, estatísticas e custo em estrelas.

O password identifica a carta na opção Password do jogo; a aquisição ainda exige o pagamento do custo indicado. As fichas HTML vinculadas e seus dados JSON-LD são canônicos.

## Passwords

${rows.join("\n")}`, "/passwords/");
}

export function guidesMarkdown(guides: WordPressPost[]) {
  const rows = guides.length
    ? guides.map((guide) => `- [${cleanText(guide.title.rendered)}](${absoluteSiteUrl(`/guias/${guide.slug}/`)}): ${cleanText(guide.plainExcerpt) || "Guia de estratégia de Yu-Gi-Oh! Forbidden Memories."}`)
    : ["Nenhum guia publicado no momento."];

  return documentResponse(`# Guias de Yu-Gi-Oh! Forbidden Memories

> Índice textual dos guias de estratégia publicados em português sobre ranks, farm, fusões, decks e progressão.

Os artigos HTML vinculados e seus dados estruturados JSON-LD são a fonte canônica.

## Guias publicados

${rows.join("\n")}`, "/guias/");
}
