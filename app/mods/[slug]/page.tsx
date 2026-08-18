import type { Metadata } from "next";
import { getMod } from "../../../lib/data";
import { PortalFaq, PortalHeading, PortalPage, SchemaScript } from "../../components/portal-components";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const mod = await getMod((await params).slug);
  if (!mod) return { title: "MOD não encontrado | FM Codex" };
  const title = `${mod.name} | FM Codex`;
  const images = mod.image ? [{ url: mod.image, alt: mod.name }] : [];
  return { title, description: mod.summary, openGraph: { title, description: mod.summary, images }, twitter: { card: images.length ? "summary_large_image" : "summary", title, description: mod.summary, images: images.map((image) => image.url) } };
}

export default async function ModPage({ params }: Props) {
  const mod = await getMod((await params).slug);
  if (!mod) return <PortalPage eyebrow="ERRO 404" title="MOD" accent="não encontrado" lead=""><section className="portal-section"><div className="shell"><a className="portal-button" href="/mods/">Ver MODs</a></div></section></PortalPage>;
  const schema = { "@context": "https://schema.org", "@graph": [{ "@type": "SoftwareApplication", name: mod.name, softwareVersion: mod.version || undefined, author: mod.author ? { "@type": "Person", name: mod.author } : undefined, description: mod.summary, image: mod.image, url: `/mods/${mod.slug}/` }, ...(mod.faq.length ? [{ "@type": "FAQPage", mainEntity: mod.faq.map((item) => ({ "@type": "Question", name: item.q, acceptedAnswer: { "@type": "Answer", text: item.a } })) }] : [])] };
  return <PortalPage eyebrow={[mod.tag, mod.version && `VERSÃO ${mod.version}`].filter(Boolean).join(" · ") || "MOD"} title={mod.name} accent="" lead={mod.summary}>
    <article className="mod-wp-article"><div className="shell article-layout"><aside>{mod.image && <img src={mod.image} alt={mod.name}/>} {mod.author && <p><span>Autor</span><b>{mod.author}</b></p>}{mod.version && <p><span>Versão</span><b>{mod.version}</b></p>}{mod.multiplier && <p><span>Multiplicador</span><b>{mod.multiplier}</b></p>}{mod.sourceUrl && <a className="portal-button" href={mod.sourceUrl} rel="noopener noreferrer">Página oficial</a>}</aside><div className="article-body"><div className="wp-content" dangerouslySetInnerHTML={{ __html: mod.content || "" }}/>{mod.features.length > 0 && <section><PortalHeading title="Principais" accent="recursos"/><ul className="mod-data-list">{mod.features.map((feature) => <li key={feature}>{feature}</li>)}</ul></section>}{mod.changelog.length > 0 && <section><PortalHeading title="Histórico de" accent="alterações"/><ol className="changelog">{mod.changelog.map((item) => <li key={item}>{item}</li>)}</ol></section>}{mod.faq.length > 0 && <section><PortalHeading title="Perguntas" accent="frequentes"/><PortalFaq items={mod.faq}/></section>}</div></div></article>
    <SchemaScript data={schema}/>
  </PortalPage>;
}
