import type { Metadata } from "next";
import { getPublishedGuide } from "../../../lib/wordpress";
import { PortalPage, SchemaScript } from "../../components/portal-components";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const guide = await getPublishedGuide((await params).slug);
  if (!guide) return { title: "Guia não encontrado | FM Codex" };
  const title = `${guide.title.rendered}: guia completo | FM Codex`;
  const images = guide.featuredImage ? [{ url: guide.featuredImage, alt: guide.featuredImageAlt || guide.title.rendered }] : [];
  return { title, description: guide.plainExcerpt, openGraph: { title, description: guide.plainExcerpt, type: "article", publishedTime: guide.date, modifiedTime: guide.modified, images }, twitter: { card: images.length ? "summary_large_image" : "summary", title, description: guide.plainExcerpt, images: images.map((image) => image.url) } };
}

export default async function GuidePage({ params }: Props) {
  const guide = await getPublishedGuide((await params).slug);
  if (!guide) return <PortalPage eyebrow="ERRO 404" title="Guia" accent="não encontrado" lead=""><section className="portal-section"><div className="shell"><a className="portal-button" href="/guias/">Ver guias</a></div></section></PortalPage>;
  const schema = { "@context": "https://schema.org", "@graph": [{ "@type": "Article", headline: guide.title.rendered, description: guide.plainExcerpt, image: guide.featuredImage, datePublished: guide.date, dateModified: guide.modified || guide.date, author: { "@type": "Person", name: guide.authorName || "FM Codex" }, mainEntityOfPage: `/guias/${guide.slug}/` }, { "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Início", item: "/" }, { "@type": "ListItem", position: 2, name: "Guias", item: "/guias/" }, { "@type": "ListItem", position: 3, name: guide.title.rendered }] }] };
  return <PortalPage eyebrow={`${guide.category} · ${new Date(guide.date).toLocaleDateString("pt-BR")}`} title={guide.title.rendered} accent="" lead={guide.plainExcerpt}>
    <article className="guide-wp-article"><div className="shell article-layout"><aside><b>Publicado no WordPress</b>{guide.authorName && <span>{guide.authorName}</span>}<time dateTime={guide.date}>{new Date(guide.date).toLocaleDateString("pt-BR")}</time><a href="/guias/">Todos os guias</a></aside><div className="article-body">{guide.featuredImage && <img className="wp-featured-image" src={guide.featuredImage} alt={guide.featuredImageAlt || guide.title.rendered}/>}<div className="wp-content" dangerouslySetInnerHTML={{ __html: guide.content?.rendered || "" }}/></div></div></article>
    <SchemaScript data={schema}/>
  </PortalPage>;
}
