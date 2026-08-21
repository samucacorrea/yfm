import type { Metadata } from "next";
import { getMods } from "../../lib/data";
import { PortalHeading, PortalPage, SchemaScript } from "../components/portal-components";

export const metadata: Metadata = { title: "Mods | Yu-Gi-Oh! Forbidden Memories", description: "MODs publicados no WordPress para Yu-Gi-Oh! Forbidden Memories." };

export default async function ModsPage() {
  const mods = await getMods();
  const schema = { "@context": "https://schema.org", "@type": "CollectionPage", name: "Mods de Forbidden Memories", mainEntity: { "@type": "ItemList", itemListElement: mods.map((mod, index) => ({ "@type": "ListItem", position: index + 1, name: mod.name, image: mod.image, url: `/mods/${mod.slug}/` })) } };
  return <PortalPage eyebrow="COMUNIDADE · WORDPRESS" title="Mods de" accent="Forbidden Memories" lead="Projetos publicados e mantidos pelo catálogo do WordPress.">
    <section className="portal-section"><div className="shell"><PortalHeading eyebrow="CATÁLOGO" title={`${mods.length} mods`} accent="publicados"/>{mods.length ? <div className="mod-grid">{mods.map((mod) => <a className="mod-card" href={`/mods/${mod.slug}/`} key={mod.slug}><div className="mod-cover">{mod.image ? <img src={mod.image} alt={mod.name} loading="lazy"/> : <span>{mod.tag || "MOD"}</span>}</div><div>{(mod.version || mod.author) && <small>{[mod.version && `VERSÃO ${mod.version}`, mod.author].filter(Boolean).join(" · ")}</small>}<h2>{mod.name}</h2>{mod.summary && <p>{mod.summary}</p>}<strong>Ver ficha completa →</strong></div></a>)}</div> : <div className="portal-empty"><b>Nenhum MOD publicado.</b><p>Os projetos aparecerão aqui quando forem publicados no WordPress.</p></div>}</div></section>
    <SchemaScript data={schema}/>
  </PortalPage>;
}
