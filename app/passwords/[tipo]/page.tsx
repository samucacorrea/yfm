import type { Metadata } from "next";
import { cards as localCards } from "../../../lib/catalog";
import "../../portal.css";
import { getCards } from "../../../lib/data";
import { taxonomySlug } from "../../../lib/wordpress-data";
import { PortalHeading, PortalPage, SchemaScript } from "../../components/portal-components";

type Props = { params: Promise<{ tipo: string }> };
export function generateStaticParams() { return [...new Set(localCards.map((card) => taxonomySlug(card.type)))].map((tipo) => ({ tipo })); }
export async function generateMetadata({ params }: Props): Promise<Metadata> { const tipo = (await params).tipo; return { title: `Passwords de cartas ${tipo} | Yu-Gi-Oh! Forbidden Memories`, description: `Códigos e stats das cartas do tipo ${tipo} em Forbidden Memories.` }; }
export default async function PasswordTypePage({ params }: Props) { const raw = (await params).tipo; const cards = await getCards(); const filtered = cards.filter((card) => taxonomySlug(card.type) === taxonomySlug(raw) && card.password); const label = filtered[0]?.type || raw; const schema = { "@context": "https://schema.org", "@type": "ItemList", name: `Passwords de cartas ${label}`, itemListElement: filtered.map((card, index) => ({ "@type": "ListItem", position: index + 1, name: card.name, description: `Password ${card.password}` })) }; return <PortalPage eyebrow="PASSWORDS POR TIPO" title="Códigos de" accent={label} lead={`Lista indexável de passwords das cartas ${label} cadastradas.`}><section className="portal-section"><div className="shell"><PortalHeading title={`${filtered.length} cartas`} accent="encontradas"/><div className="password-card-grid">{filtered.map((card) => <a href={`/cartas/${card.slug}/`} key={card.slug}><small>#{String(card.id).padStart(3, "0")} · {card.attribute}</small><h2>{card.name}</h2><b>{card.password}</b><p>ATK {card.atk} · DEF {card.def}</p></a>)}</div><a className="portal-back" href="/passwords/">← Voltar para todos os passwords</a></div></section><SchemaScript data={schema}/></PortalPage>; }
