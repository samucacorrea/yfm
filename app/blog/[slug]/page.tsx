import type { Metadata } from "next";
import "../../portal.css";
import "../blog-post.css";
import { getPublishedPost, getPublishedPosts } from "../../../lib/wordpress";
import { decodeWordPressText } from "../../../lib/wordpress-data";
import { SITE_ORIGIN } from "../../../lib/site";
import { PortalPage, SchemaScript } from "../../components/portal-components";
import { SiteFooter } from "../../components/site-footer";
import { SiteHeader } from "../../components/site-header";

type Props = { params: Promise<{ slug: string }> };
const siteOrigin = SITE_ORIGIN;
const gameFaq = [
  { q: "Quantas cartas existem em Forbidden Memories?", a: "O jogo possui 722 cartas catalogadas, entre monstros, magias, armadilhas, equipamentos e rituais." },
  { q: "Como consultar o password de uma carta?", a: "Abra a ficha da carta ou a seção de passwords para encontrar o código de oito dígitos e o custo em estrelas." },
  { q: "Como saber quem dropa uma carta?", a: "As fichas de cartas e duelistas mostram a bolsa de recompensa, o rank necessário e a taxa de drop cadastrada." },
];

function plainText(value = "") {
  return decodeWordPressText(value.replace(/<[^>]*>/g, " "))
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function headingSlug(value: string) {
  return plainText(value).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "secao";
}

function prepareArticleContent(content = "") {
  const headings: Array<{ id: string; title: string; level: number }> = [];
  const usedIds = new Set<string>();
  const html = content.replace(/<h([23])([^>]*)>([\s\S]*?)<\/h\1>/gi, (match, level: string, attributes: string, inner: string) => {
    const title = plainText(inner);
    if (!title) return match;
    const existingId = attributes.match(/\sid=(?:"([^"]+)"|'([^']+)')/i)?.slice(1).find(Boolean);
    const baseId = existingId || headingSlug(title);
    let id = baseId;
    let suffix = 2;
    while (usedIds.has(id)) id = `${baseId}-${suffix++}`;
    usedIds.add(id);
    headings.push({ id, title, level: Number(level) });
    const nextAttributes = existingId ? attributes : `${attributes} id="${id}"`;
    return `<h${level}${nextAttributes}>${inner}</h${level}>`;
  });
  return { html, headings };
}

function readingTime(content = "") {
  return Math.max(1, Math.ceil(plainText(content).split(/\s+/).filter(Boolean).length / 220));
}

function isValidJson(value: string) {
  try {
    JSON.parse(value);
    return true;
  } catch {
    return false;
  }
}

function resolveBlogSchema(post: Awaited<ReturnType<typeof getPublishedPost>>) {
  if (!post) return null;

  if (post.customSchema && isValidJson(post.customSchema)) return { raw: post.customSchema };

  const postUrl = `${siteOrigin}/blog/${post.slug}/`;
  const organizationId = `${siteOrigin}/#organization`;
  const webpageId = `${postUrl}#webpage`;
  const articleId = `${postUrl}#article`;
  const breadcrumbId = `${postUrl}#breadcrumb`;
  return {
    data: {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Organization",
          "@id": organizationId,
          name: "Yu-Gi-Oh! Forbidden Memories",
          url: `${siteOrigin}/`,
          logo: {
            "@type": "ImageObject",
            url: `${siteOrigin}/logo.webp`,
          },
        },
        {
          "@type": "WebPage",
          "@id": webpageId,
          url: postUrl,
          name: post.title.rendered,
          description: post.plainExcerpt,
          inLanguage: "pt-BR",
          isPartOf: { "@id": `${siteOrigin}/#website` },
          about: { "@id": articleId },
          primaryImageOfPage: post.featuredImage ? { "@id": `${articleId}#primaryimage` } : undefined,
        },
        {
          "@type": "BlogPosting",
          "@id": articleId,
          headline: post.title.rendered,
          description: post.plainExcerpt,
          articleSection: post.category || "Blog",
          keywords: [post.category, post.title.rendered].filter(Boolean).join(", "),
          inLanguage: "pt-BR",
          isAccessibleForFree: true,
          mainEntityOfPage: { "@id": webpageId },
          url: postUrl,
          datePublished: post.date,
          dateModified: post.modified || post.date,
          image: post.featuredImage ? { "@id": `${articleId}#primaryimage` } : undefined,
          author: {
            "@type": "Person",
            name: post.authorName || "Yu-Gi-Oh! Forbidden Memories",
          },
          publisher: { "@id": organizationId },
        },
        ...(post.featuredImage
          ? [
              {
                "@type": "ImageObject",
                "@id": `${articleId}#primaryimage`,
                url: post.featuredImage,
                caption: post.featuredImageAlt || post.title.rendered,
              },
            ]
          : []),
        {
          "@type": "BreadcrumbList",
          "@id": breadcrumbId,
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Início", item: `${siteOrigin}/` },
            { "@type": "ListItem", position: 2, name: "Blog", item: `${siteOrigin}/blog/` },
            { "@type": "ListItem", position: 3, name: post.title.rendered, item: postUrl },
          ],
        },
      ],
    },
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPublishedPost((await params).slug);
  if (!post) return { title: "Artigo não encontrado | Yu-Gi-Oh! Forbidden Memories" };
  const postTitle = plainText(post.title.rendered);
  const title = `${postTitle} | Yu-Gi-Oh! Forbidden Memories`;
  const description = post.plainExcerpt;
  const images = post.featuredImage ? [{ url: post.featuredImage, alt: post.featuredImageAlt || postTitle }] : [];
  return {
    title,
    description,
    alternates: { canonical: `/blog/${post.slug}/` },
    openGraph: { title, description, type: "article", url: `/blog/${post.slug}/`, publishedTime: post.date, modifiedTime: post.modified, images },
    twitter: { card: images.length ? "summary_large_image" : "summary", title, description, images: images.map((image) => image.url) },
  };
}

export default async function BlogPost({ params }: Props) {
  const slug = (await params).slug;
  const [post, publishedPosts] = await Promise.all([getPublishedPost(slug), getPublishedPosts(8)]);
  if (!post) return <PortalPage eyebrow="ERRO 404" title="Artigo" accent="não encontrado" lead=""><section className="portal-section"><div className="shell"><a className="portal-button" href="/blog/">Voltar ao blog</a></div></section></PortalPage>;
  const schema = resolveBlogSchema(post);
  const title = plainText(post.title.rendered);
  const article = prepareArticleContent(post.content?.rendered);
  const minutes = readingTime(post.content?.rendered);
  const postUrl = `${siteOrigin}/blog/${post.slug}/`;
  const related = publishedPosts.filter((item) => item.slug !== post.slug).sort((a, b) => Number(b.categorySlug === post.categorySlug) - Number(a.categorySlug === post.categorySlug)).slice(0, 4);
  const tags = [...new Set([post.category, ...post.tags].filter(Boolean))];
  const encodedUrl = encodeURIComponent(postUrl);
  const encodedShareText = encodeURIComponent(title);

  return <main className="blog-post-page">
    <SiteHeader solid />
    <nav className="blog-breadcrumb blog-post-shell" aria-label="Navegação estrutural"><a href="/">Início</a><span>›</span><a href="/blog/">Blog</a><span>›</span><strong>{title}</strong></nav>
    <div className="blog-post-shell blog-post-layout">
      <aside className="blog-post-left">
        {article.headings.length > 0 && <nav className="blog-side-card blog-toc" aria-label="Neste artigo"><b>Neste artigo</b>{article.headings.map((heading, index) => <a className={heading.level === 3 ? "is-subheading" : ""} href={`#${heading.id}`} key={heading.id}><span>{index + 1}.</span>{heading.title}</a>)}</nav>}
        <section className="blog-side-card blog-explore-card"><b>Continue explorando</b><p>Consulte cartas, passwords e tabelas completas de drops.</p><a href="/cartas/">Abrir banco de cartas</a></section>
        <section className="blog-side-card blog-share-card"><b>Compartilhe</b><div><a href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedShareText}`} target="_blank" rel="noreferrer" aria-label="Compartilhar no X">X</a><a href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`} target="_blank" rel="noreferrer" aria-label="Compartilhar no Facebook">f</a><a href={`https://wa.me/?text=${encodedShareText}%20${encodedUrl}`} target="_blank" rel="noreferrer" aria-label="Compartilhar no WhatsApp">w</a></div></section>
      </aside>

      <article className="blog-post-main">
        <header className="blog-post-header"><div className="blog-post-badges"><span>{post.category || "BLOG"}</span>{post.tags.slice(0, 2).map((tag) => <small key={tag}>{tag}</small>)}</div><h1>{title}</h1><p>{post.plainExcerpt}</p><div className="blog-post-meta"><span className="blog-author-mark">{(post.authorName || "YFM").slice(0, 1).toUpperCase()}</span><span>Por <b>{post.authorName || "Yu-Gi-Oh! Forbidden Memories"}</b></span><time dateTime={post.date}>{new Date(post.date).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}</time><span>{minutes} min de leitura</span></div></header>
        {post.featuredImage && <figure className="blog-post-cover"><img src={post.featuredImage} alt={post.featuredImageAlt || title}/></figure>}
        <div className="wp-content blog-post-content" dangerouslySetInnerHTML={{ __html: article.html }}/>
      </article>

      <aside className="blog-post-right">
        <section className="blog-side-card blog-game-card"><img src="/logo.webp" width="346" height="112" alt="Yu-Gi-Oh! Forbidden Memories"/><div><h2>Yu-Gi-Oh! Forbidden Memories</h2><dl><div><dt>Plataforma</dt><dd>PlayStation</dd></div><div><dt>Lançamento</dt><dd>1999</dd></div><div><dt>Gênero</dt><dd>RPG / Estratégia</dd></div><div><dt>Catálogo</dt><dd>722 cartas</dd></div></dl></div></section>
        {related.length > 0 && <section className="blog-side-card blog-related"><b>Posts relacionados</b>{related.map((item) => <a href={`/blog/${item.slug}/`} key={item.slug}>{item.featuredImage ? <img src={item.featuredImage} alt="" loading="lazy"/> : <span>{item.title.rendered.slice(0, 1)}</span>}<div><small>{item.category || "BLOG"}</small><strong>{plainText(item.title.rendered)}</strong><em>{readingTime(item.content?.rendered)} min de leitura</em></div></a>)}</section>}
        <section className="blog-side-card blog-quick-faq"><b>FAQ</b>{gameFaq.map((item, index) => <details open={index === 0} key={item.q}><summary>{item.q}</summary><p>{item.a}</p></details>)}</section>
        {tags.length > 0 && <section className="blog-side-card blog-post-tags"><b>Tags deste post</b><div>{tags.map((tag) => <span key={tag}>{tag}</span>)}</div></section>}
      </aside>
    </div>
    <SchemaScript data={schema?.data} raw={schema?.raw}/>
    <SiteFooter />
  </main>;
}
