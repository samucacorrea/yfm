import type { Metadata } from "next";
import "../../portal.css";
import { getMod } from "../../../lib/data";
import { PortalFaq, PortalHeading, PortalPage, SchemaScript } from "../../components/portal-components";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const mod = await getMod((await params).slug);
  if (!mod) return { title: "MOD não encontrado | Yu-Gi-Oh! Forbidden Memories" };
  const title = `${mod.name} | Yu-Gi-Oh! Forbidden Memories`;
  const images = mod.image ? [{ url: mod.image, alt: mod.name }] : [];
  return { title, description: mod.summary, openGraph: { title, description: mod.summary, images }, twitter: { card: images.length ? "summary_large_image" : "summary", title, description: mod.summary, images: images.map((image) => image.url) } };
}

export default async function ModPage({ params }: Props) {
  const mod = await getMod((await params).slug);
  if (!mod) return <PortalPage eyebrow="ERRO 404" title="MOD" accent="não encontrado" lead=""><section className="portal-section"><div className="shell"><a className="portal-button" href="/mods/">Ver MODs</a></div></section></PortalPage>;
  const schema = { "@context": "https://schema.org", "@graph": [{ "@type": "SoftwareApplication", name: mod.name, softwareVersion: mod.version || undefined, author: mod.author ? { "@type": "Person", name: mod.author } : undefined, description: mod.summary, image: mod.image, url: `/mods/${mod.slug}/` }, ...(mod.faq.length ? [{ "@type": "FAQPage", mainEntity: mod.faq.map((item) => ({ "@type": "Question", name: item.q, acceptedAnswer: { "@type": "Answer", text: item.a } })) }] : [])] };
  const hasArticleContent = Boolean(mod.content?.replace(/<[^>]*>/g, "").trim());
  const highlights = [
    mod.version ? { label: "Versão", value: mod.version } : null,
    mod.author ? { label: "Autor", value: mod.author } : null,
    mod.multiplier ? { label: "Multiplicador", value: mod.multiplier } : null,
    mod.tag ? { label: "Categoria", value: mod.tag } : null,
  ].filter(Boolean) as Array<{ label: string; value: string }>;

  return <PortalPage eyebrow={[mod.tag, mod.version && `VERSÃO ${mod.version}`].filter(Boolean).join(" · ") || "MOD"} title={mod.name} accent="" lead={mod.summary}>
    <article className="mod-wp-article"><div className="shell article-layout"><aside>{mod.image && <img src={mod.image} alt={mod.name}/>} {mod.author && <p><span>Autor</span><b>{mod.author}</b></p>}{mod.version && <p><span>Versão</span><b>{mod.version}</b></p>}{mod.multiplier && <p><span>Multiplicador</span><b>{mod.multiplier}</b></p>}{mod.sourceUrl ? <a className="portal-button" href={mod.sourceUrl} rel="noopener noreferrer">Baixar / página oficial</a> : <p><span>Link oficial</span><b>Não informado</b></p>}</aside><div className="article-body"><section><PortalHeading title="Visão geral" accent="do mod"/><div className="wp-content"><p>{mod.summary || "Este mod foi catalogado, mas ainda não possui uma descrição detalhada cadastrada."}</p></div></section>{highlights.length > 0 && <section><PortalHeading title="Informações" accent="rápidas"/><ul className="mod-data-list">{highlights.map((item) => <li key={item.label}><strong>{item.label}:</strong> {item.value}</li>)}</ul></section>}{hasArticleContent && <section><PortalHeading title="Descrição" accent="completa"/><div className="wp-content" dangerouslySetInnerHTML={{ __html: mod.content || "" }}/></section>}{mod.features.length > 0 && <section><PortalHeading title="Principais" accent="recursos"/><ul className="mod-data-list">{mod.features.map((feature) => <li key={feature}>{feature}</li>)}</ul></section>}{mod.sourceUrl && <section><PortalHeading title="Download e" accent="links"/><div className="wp-content"><p>Use sempre a fonte oficial do autor para baixar ou acompanhar atualizações deste mod.</p><p><a className="portal-button" href={mod.sourceUrl} rel="noopener noreferrer">Abrir link oficial</a></p></div></section>}{mod.changelog.length > 0 && <section><PortalHeading title="Histórico de" accent="alterações"/><ol className="changelog">{mod.changelog.map((item) => <li key={item}>{item}</li>)}</ol></section>}{mod.faq.length > 0 && <section><PortalHeading title="Perguntas" accent="frequentes"/><PortalFaq items={mod.faq}/></section>}</div></div></article>
    <SchemaScript data={schema}/>
  </PortalPage>;
}
