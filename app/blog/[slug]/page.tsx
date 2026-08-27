import type { Metadata } from "next";
import "../../portal.css";
import { getPublishedPost } from "../../../lib/wordpress";
import { PortalPage, SchemaScript } from "../../components/portal-components";

type Props = { params: Promise<{ slug: string }> };
const siteOrigin = (process.env.SITE_URL || "https://yugiohforbiddenmemories.com").replace(/\/$/, "");

function resolveBlogSchema(post: Awaited<ReturnType<typeof getPublishedPost>>) {
  if (!post) return null;

  if (post.customSchema) {
    try {
      JSON.parse(post.customSchema);
      return { raw: post.customSchema };
    } catch {}
  }

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
  const title = `${post.title.rendered} | Yu-Gi-Oh! Forbidden Memories`;
  const description = post.plainExcerpt;
  const images = post.featuredImage ? [{ url: post.featuredImage, alt: post.featuredImageAlt || post.title.rendered }] : [];
  return {
    title,
    description,
    alternates: { canonical: `/blog/${post.slug}/` },
    openGraph: { title, description, type: "article", publishedTime: post.date, modifiedTime: post.modified, images },
    twitter: { card: images.length ? "summary_large_image" : "summary", title, description, images: images.map((image) => image.url) },
  };
}

export default async function BlogPost({ params }: Props) {
  const post = await getPublishedPost((await params).slug);
  if (!post) return <PortalPage eyebrow="ERRO 404" title="Artigo" accent="não encontrado" lead=""><section className="portal-section"><div className="shell"><a className="portal-button" href="/blog/">Voltar ao blog</a></div></section></PortalPage>;
  const schema = resolveBlogSchema(post);
  return <PortalPage eyebrow={`${post.category || "BLOG"} · ${new Date(post.date).toLocaleDateString("pt-BR")}`} title={post.title.rendered} accent="" lead={post.plainExcerpt}>
    <article className="blog-article"><div className="shell article-layout"><aside><b>Publicado no WordPress</b>{post.authorName && <span>{post.authorName}</span>}<time dateTime={post.date}>{new Date(post.date).toLocaleDateString("pt-BR")}</time><a href="/blog/">Todos os artigos</a></aside><div className="article-body">{post.featuredImage && <img className="wp-featured-image" src={post.featuredImage} alt={post.featuredImageAlt || post.title.rendered}/>}<div className="wp-content" dangerouslySetInnerHTML={{ __html: post.content?.rendered || "" }}/></div></div></article>
    <SchemaScript data={schema?.data} raw={schema?.raw}/>
  </PortalPage>;
}
