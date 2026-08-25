import { wordpressRequest } from "./wordpress-client";

type Rendered = { rendered: string };
type EmbeddedTerm = { id: number; name: string; slug: string; taxonomy?: string };
type EmbeddedMedia = { source_url?: string; alt_text?: string; media_details?: { sizes?: Record<string, { source_url?: string }> } };

type WordPressPostRaw = {
  id: number;
  slug: string;
  date: string;
  modified?: string;
  title: Rendered;
  excerpt: Rendered;
  content?: Rendered;
  link: string;
  featured_media?: number;
  _embedded?: {
    "wp:featuredmedia"?: EmbeddedMedia[];
    "wp:term"?: EmbeddedTerm[][];
    author?: Array<{ name?: string }>;
  };
};

export type WordPressPost = WordPressPostRaw & {
  plainExcerpt: string;
  category: string;
  categorySlug: string;
  featuredImage?: string;
  featuredImageAlt?: string;
  authorName?: string;
};

const stripHtml = (value = "") => value.replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&#8217;/g, "’").replace(/&#8211;/g, "–").replace(/&#8212;/g, "—").replace(/\s+/g, " ").trim();

function normalizePost(post: WordPressPostRaw): WordPressPost {
  const terms = (post._embedded?.["wp:term"] || []).flat();
  const category = terms.find((term) => term.taxonomy === "category") || terms[0];
  const media = post._embedded?.["wp:featuredmedia"]?.[0];
  return {
    ...post,
    plainExcerpt: stripHtml(post.excerpt?.rendered) || stripHtml(post.content?.rendered).slice(0, 220),
    category: category?.name || "",
    categorySlug: category?.slug || "",
    featuredImage: media?.media_details?.sizes?.large?.source_url || media?.media_details?.sizes?.medium_large?.source_url || media?.source_url,
    featuredImageAlt: media?.alt_text || stripHtml(post.title.rendered),
    authorName: post._embedded?.author?.[0]?.name,
  };
}

function isGuide(post: WordPressPost) { return post.categorySlug === "guia" || post.categorySlug === "guias"; }

async function publishedPosts(limit = 100) {
  const perPage = Math.max(1, Math.min(100, Math.trunc(limit)));
  const posts = await wordpressRequest<WordPressPostRaw[]>(`wp/v2/posts?per_page=${perPage}&status=publish&orderby=date&order=desc&_embed=1`);
  return posts.filter((post) => post.slug !== "ola-mundo").map(normalizePost);
}

export async function getPublishedPosts(limit?: number): Promise<WordPressPost[]> {
  try { return (await publishedPosts(limit)).filter((post) => !isGuide(post)); }
  catch { return []; }
}

export async function getPublishedPost(slug: string): Promise<WordPressPost | null> {
  try {
    const posts = await wordpressRequest<WordPressPostRaw[]>(`wp/v2/posts?slug=${encodeURIComponent(slug)}&status=publish&_embed=1`);
    return posts[0] ? normalizePost(posts[0]) : null;
  } catch { return null; }
}

export async function getPublishedGuides(): Promise<WordPressPost[]> {
  try { return (await publishedPosts()).filter(isGuide); }
  catch { return []; }
}

export async function getPublishedGuide(slug: string): Promise<WordPressPost | null> {
  const post = await getPublishedPost(slug);
  return post && isGuide(post) ? post : null;
}
