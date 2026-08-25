import type { Metadata } from "next";
import "../portal.css";
import { getPublishedPosts } from "../../lib/wordpress";
import { PortalHeading, PortalPage, SchemaScript } from "../components/portal-components";

export const metadata: Metadata = { title: "Blog | Yu-Gi-Oh! Forbidden Memories", description: "Posts publicados no WordPress sobre Forbidden Memories." };

export default async function BlogPage() {
  const posts = await getPublishedPosts();
  const featured = posts[0];
  const schema = { "@context": "https://schema.org", "@type": "Blog", name: "Blog Yu-Gi-Oh! Forbidden Memories", blogPost: posts.map((post) => ({ "@type": "BlogPosting", headline: post.title.rendered, image: post.featuredImage, datePublished: post.date, url: `/blog/${post.slug}/` })) };
  return <PortalPage eyebrow="EDITORIAL · WORDPRESS" title="Do" accent="blog" lead="Notícias, listas, história e estratégias publicadas no WordPress.">
    {featured ? <>
      <section className="portal-section"><div className="shell"><article className="featured-post"><a className="featured-art" href={`/blog/${featured.slug}/`}>{featured.featuredImage ? <img src={featured.featuredImage} alt={featured.featuredImageAlt || featured.title.rendered} /> : <span>DESTAQUE</span>}</a><div><small>{featured.category || "BLOG"} · {new Date(featured.date).toLocaleDateString("pt-BR")}</small><h2>{featured.title.rendered}</h2><p>{featured.plainExcerpt}</p><a href={`/blog/${featured.slug}/`}>Ler artigo completo →</a></div></article></div></section>
      <section className="portal-section portal-alt"><div className="shell"><PortalHeading eyebrow="PUBLICAÇÕES" title="Últimos" accent="artigos"/><div className="editorial-grid">{posts.map((post, index) => <article key={post.slug}><a className={`editorial-cover cover-${index % 3 + 1}`} href={`/blog/${post.slug}/`}>{post.featuredImage ? <img src={post.featuredImage} alt={post.featuredImageAlt || post.title.rendered} loading="lazy" /> : <span>{String(index + 1).padStart(2, "0")}</span>}</a><div><small>{post.category || "BLOG"} · {new Date(post.date).toLocaleDateString("pt-BR")}</small><h2><a href={`/blog/${post.slug}/`}>{post.title.rendered}</a></h2><p>{post.plainExcerpt}</p><a href={`/blog/${post.slug}/`}>Continuar lendo →</a></div></article>)}</div></div></section>
    </> : <section className="portal-section"><div className="shell"><div className="portal-empty"><b>Nenhum post publicado.</b><p>Os artigos aparecerão aqui assim que forem publicados no WordPress.</p></div></div></section>}
    <SchemaScript data={schema}/>
  </PortalPage>;
}
