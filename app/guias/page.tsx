import type { Metadata } from "next";
import "../portal.css";
import { getPublishedGuides } from "../../lib/wordpress";
import { PortalHeading, PortalPage, SchemaScript } from "../components/portal-components";

export const metadata: Metadata = { title: "Guias | Yu-Gi-Oh! Forbidden Memories", description: "Guias publicados no WordPress sobre Yu-Gi-Oh! Forbidden Memories." };

export default async function GuidesPage() {
  const guides = await getPublishedGuides();
  const schema = { "@context": "https://schema.org", "@type": "CollectionPage", name: "Guias de Yu-Gi-Oh! Forbidden Memories", mainEntity: { "@type": "ItemList", itemListElement: guides.map((guide, index) => ({ "@type": "ListItem", position: index + 1, name: guide.title.rendered, image: guide.featuredImage, url: `/guias/${guide.slug}/` })) } };
  return <PortalPage eyebrow="ESTRATÉGIA · WORDPRESS" title="Guias de" accent="Forbidden Memories" lead="Tutoriais publicados na categoria Guias do WordPress.">
    <section className="portal-section"><div className="shell"><PortalHeading eyebrow="PUBLICAÇÕES" title={`${guides.length} guias`} accent="disponíveis"/>{guides.length ? <div className="guide-index-grid">{guides.map((guide, index) => <a href={`/guias/${guide.slug}/`} key={guide.slug}>{guide.featuredImage ? <img src={guide.featuredImage} alt={guide.featuredImageAlt || guide.title.rendered} loading="lazy"/> : <span>{String(index + 1).padStart(2, "0")}</span>}<small>{guide.category} · {new Date(guide.date).toLocaleDateString("pt-BR")}</small><h2>{guide.title.rendered}</h2><p>{guide.plainExcerpt}</p><b>Ler guia completo →</b></a>)}</div> : <div className="portal-empty"><b>Nenhum guia publicado.</b><p>Publique posts na categoria “Guias” do WordPress para exibi-los aqui.</p></div>}</div></section>
    <SchemaScript data={schema}/>
  </PortalPage>;
}
