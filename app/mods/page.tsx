import type { Metadata } from "next";
import "../exact-card.css";
import "./mods.css";
import { getMods } from "../../lib/data";
import { SiteFooter } from "../components/site-footer";
import { SiteHeader } from "../components/site-header";
import { SchemaScript } from "../components/portal-components";

export const metadata: Metadata = {
  title: "Mods | Yu-Gi-Oh! Forbidden Memories",
  description: "Mods de Yu-Gi-Oh! Forbidden Memories publicados no WordPress, com versões, autores, detalhes e links oficiais.",
};

const siteOrigin = (process.env.SITE_URL || "https://yugiohforbiddenmemories.com").replace(/\/$/, "");
const absoluteUrl = (path: string) => `${siteOrigin}${path}`;
const multiplierLabel = (value: string) => value && /^\d+(?:[.,]\d+)?$/.test(value) ? `${value}x` : value;

export default async function ModsPage() {
  const mods = await getMods();
  const schema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": absoluteUrl("/mods/"),
    name: "Mods de Yu-Gi-Oh! Forbidden Memories",
    url: absoluteUrl("/mods/"),
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: mods.length,
      itemListElement: mods.map((mod, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: mod.name,
        image: mod.image,
        url: absoluteUrl(`/mods/${mod.slug}/`),
      })),
    },
  };

  return (
    <div className="exact-card-page exact-mod-page">
      <SiteHeader solid />
      <main className="exact-wrap">
        <nav className="crumb mod-index-crumb" aria-label="Navegação estrutural">
          <a href="/">Início</a><span className="sep">›</span><span className="cur">Mods</span>
        </nav>

        <header className="mod-index-hero">
          <small>MODIFICAÇÕES · COMUNIDADE</small>
          <h1>Mods de <span>Forbidden Memories</span></h1>
          <p>Explore os projetos disponíveis, confira versões, autores, alterações e acesse os links de download informados pelos responsáveis.</p>
        </header>

        <section className="mod-catalog" aria-labelledby="mod-catalog-title">
          <div className="sec-h">
            <h2 id="mod-catalog-title">Mods <span>publicados</span></h2>
            <b className="mod-count">{mods.length} {mods.length === 1 ? "projeto" : "projetos"}</b>
          </div>
          <p className="sec-sub">Informações carregadas diretamente do catálogo do WordPress.</p>

          {mods.length ? (
            <div className="mod-catalog-grid">
              {mods.map((mod) => (
                <article className="mod-catalog-card" key={mod.slug}>
                  <a className="mod-catalog-cover" href={`/mods/${mod.slug}/`} aria-label={`Ver detalhes de ${mod.name}`}>
                    {mod.image ? <img src={mod.image} alt={mod.name} loading="lazy" /> : <span>MOD</span>}
                    {mod.multiplier && <b>{multiplierLabel(mod.multiplier)}</b>}
                  </a>
                  <div className="mod-catalog-body">
                    {(mod.tags?.length || mod.tag) ? <div className="mod-tags">{(mod.tags?.length ? mod.tags : [mod.tag]).map((tag) => <span key={tag}>{tag}</span>)}</div> : null}
                    <h2><a href={`/mods/${mod.slug}/`}>{mod.name}</a></h2>
                    {mod.summary && <p>{mod.summary}</p>}
                    <dl>
                      {mod.version && <div><dt>Versão</dt><dd>{mod.version}</dd></div>}
                      {mod.author && <div><dt>Autor</dt><dd>{mod.author}</dd></div>}
                      {mod.multiplier && <div><dt>Drop</dt><dd>{multiplierLabel(mod.multiplier)}</dd></div>}
                    </dl>
                    <a className="mod-detail-link" href={`/mods/${mod.slug}/`}>Ver ficha completa <span>→</span></a>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="mod-empty"><b>Nenhum mod publicado.</b></div>
          )}
        </section>
      </main>
      <SchemaScript data={schema} />
      <SiteFooter />
    </div>
  );
}
