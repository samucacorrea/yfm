import type { Metadata } from "next";
import "../../portal.css";
import { getPublishedPost } from "../../../lib/wordpress";
import { PortalPage, SchemaScript } from "../../components/portal-components";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPublishedPost((await params).slug);
  if (!post) return { title: "Artigo não encontrado | Yu-Gi-Oh! Forbidden Memories" };
  const title = `${post.title.rendered} | Yu-Gi-Oh! Forbidden Memories`;
  const description = post.plainExcerpt;
  const images = post.featuredImage ? [{ url: post.featuredImage, alt: post.featuredImageAlt || post.title.rendered }] : [];
  return { title, description, openGraph: { title, description, type: "article", publishedTime: post.date, modifiedTime: post.modified, images }, twitter: { card: images.length ? "summary_large_image" : "summary", title, description, images: images.map((image) => image.url) } };
}

export default async function BlogPost({ params }: Props) {
  const post = await getPublishedPost((await params).slug);
  if (!post) return <PortalPage eyebrow="ERRO 404" title="Artigo" accent="não encontrado" lead=""><section className="portal-section"><div className="shell"><a className="portal-button" href="/blog/">Voltar ao blog</a></div></section></PortalPage>;
  const schema = { "@context": "https://schema.org", "@graph": [{ "@type": "BlogPosting", headline: post.title.rendered, description: post.plainExcerpt, image: post.featuredImage, datePublished: post.date, dateModified: post.modified || post.date, author: { "@type": "Person", name: post.authorName || "Yu-Gi-Oh! Forbidden Memories" }, mainEntityOfPage: `/blog/${post.slug}/` }, { "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Início", item: "/" }, { "@type": "ListItem", position: 2, name: "Blog", item: "/blog/" }, { "@type": "ListItem", position: 3, name: post.title.rendered }] }] };
  return <PortalPage eyebrow={`${post.category || "BLOG"} · ${new Date(post.date).toLocaleDateString("pt-BR")}`} title={post.title.rendered} accent="" lead={post.plainExcerpt}>
    <article className="blog-article"><div className="shell article-layout"><aside><b>Publicado no WordPress</b>{post.authorName && <span>{post.authorName}</span>}<time dateTime={post.date}>{new Date(post.date).toLocaleDateString("pt-BR")}</time><a href="/blog/">Todos os artigos</a></aside><div className="article-body">{post.featuredImage && <img className="wp-featured-image" src={post.featuredImage} alt={post.featuredImageAlt || post.title.rendered}/>}<div className="wp-content" dangerouslySetInnerHTML={{ __html: post.content?.rendered || "" }}/></div></div></article>
    <SchemaScript data={schema}/>
  </PortalPage>;
}
