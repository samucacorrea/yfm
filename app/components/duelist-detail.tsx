import type { CardRecord } from "../../lib/catalog";
import type { Duelist, PoolKey } from "../../lib/portal-content";
import { getCardImage } from "../../lib/card-images";
import { DuelistDropCatalog } from "./duelist-drop-catalog";
import { PortalFaq, SchemaScript } from "./portal-components";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";

const poolLabels: Record<PoolKey, string> = { "s-pow": "S/A POW", "s-tec": "S/A TEC", "b-c-d": "B-C-D" };
const poolOrder: PoolKey[] = ["s-pow", "s-tec", "b-c-d"];

function rateNumber(value: string) {
  const parsed = Number(value.replace("%", "").replace(",", "."));
  return Number.isFinite(parsed) ? parsed : 0;
}

export function DuelistDetail({ duelist, cards, activePool }: { duelist: Duelist; cards: CardRecord[]; activePool?: PoolKey }) {
  const cardsBySlug = new Map(cards.map((card) => [card.slug, card]));
  const allDrops = poolOrder.flatMap((pool) => duelist.pools[pool].map((drop) => ({ ...drop, pool })));
  const visibleDrops = activePool ? allDrops.filter((drop) => drop.pool === activePool) : allDrops;
  const average = visibleDrops.length ? visibleDrops.reduce((sum, drop) => sum + rateNumber(drop.rate), 0) / visibleDrops.length : 0;
  const titleSuffix = activePool ? ` · ${poolLabels[activePool]}` : "";
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Início", item: "/" }, { "@type": "ListItem", position: 2, name: "Drops", item: "/drops/" }, { "@type": "ListItem", position: 3, name: duelist.name }] },
      { "@type": "Person", name: duelist.name, image: duelist.heroImage, description: duelist.about || duelist.answer },
      { "@type": "ItemList", name: `Drops de ${duelist.name}${titleSuffix}`, numberOfItems: visibleDrops.length, itemListElement: visibleDrops.map((drop, index) => ({ "@type": "ListItem", position: index + 1, url: `/cartas/${drop.cardSlug}/`, name: drop.name })) },
      ...(duelist.faq.length ? [{ "@type": "FAQPage", mainEntity: duelist.faq.map((item) => ({ "@type": "Question", name: item.q, acceptedAnswer: { "@type": "Answer", text: item.a } })) }] : []),
    ],
  };

  return <main className="fm-wrap fm-duelist-page">
    <SiteHeader solid />
    <nav className="fm-crumb shell" aria-label="Breadcrumb"><a href="/">Início</a><span>/</span><a href="/drops/">Drops</a><span>/</span><strong>{duelist.name}</strong></nav>

    <header className={`fm-duelist-hero${duelist.heroImage ? " has-art" : ""}`}>
      {duelist.heroImage && <div className="fm-duelist-art"><img src={duelist.heroImage} alt={duelist.name} /></div>}
      <div className="shell fm-duelist-hero-grid">
        <div className="fm-duelist-intro">
          <p className="fm-duelist-kicker"><span />Drops por <b>personagem</b><span /></p>
          <h1>{duelist.name}</h1>
          {duelist.answer && <p className="fm-duelist-lead">{duelist.answer}</p>}

          <div className="fm-duelist-stats" aria-label="Estatísticas do personagem">
            <article><i aria-hidden="true">▱</i><span>Total de cartas<strong>{visibleDrops.length}</strong></span></article>
            {duelist.bestRank && <article><i aria-hidden="true">☆</i><span>Melhor rank<strong>{duelist.bestRank}</strong></span></article>}
            <article><i aria-hidden="true">%</i><span>Taxa média<strong>{average.toFixed(2)}%</strong></span></article>
            {duelist.location && <article><i aria-hidden="true">⌖</i><span>Local<strong>{duelist.location}</strong></span></article>}
          </div>

          {duelist.farmTip && <aside className="fm-farm-tip"><i aria-hidden="true">♜</i><div><h2>Dica de farm</h2><p>{duelist.farmTip}</p></div></aside>}
        </div>

        <div className="fm-duelist-side">
          {(duelist.about || duelist.deck || duelist.order > 0) && <aside className="fm-about-box">{duelist.squareImage&&<img className="fm-about-avatar" src={duelist.squareImage} alt={duelist.name}/>}<h2>Sobre {duelist.name}</h2>{duelist.about && <p>{duelist.about}</p>}<dl>{duelist.deck && <div><dt>Deck</dt><dd>{duelist.deck}</dd></div>}{duelist.order > 0 && <div><dt>ID no jogo</dt><dd>{duelist.order}</dd></div>}</dl></aside>}
        </div>
      </div>
    </header>

    <nav className="fm-pooltabs shell" aria-label="Filtrar drops por pool">
      <a className={!activePool ? "is-active" : ""} href={`/drops/${duelist.slug}/`}>Todas as cartas</a>
      {poolOrder.map((pool) => <a className={activePool === pool ? "is-active" : ""} href={`/drops/${duelist.slug}/${pool}/`} key={pool}>{poolLabels[pool]} <span>{duelist.pools[pool].length}</span></a>)}
    </nav>

    <section className="fm-sec fm-drop-catalog">
      <div className="shell">
        <DuelistDropCatalog items={visibleDrops} cards={cards} titleSuffix={titleSuffix} />
        <details className="fm-semantic-table">
          <summary>Ver tabela completa</summary>
          <div className="fm-table-wrap">
          <table className="fm-table">
            <caption className="sr-only">Cartas dropadas por {duelist.name}{titleSuffix}</caption>
            <thead><tr><th scope="col">Carta</th><th scope="col">Tipo</th><th scope="col">Pool / Rank</th><th scope="col">Taxa de drop</th></tr></thead>
            <tbody>{visibleDrops.map((drop) => {
              const card = cardsBySlug.get(drop.cardSlug);
              const localImage = getCardImage(drop.cardSlug);
              const image = card?.image || localImage?.src;
              return <tr key={`${drop.pool}-${drop.cardSlug}`}>
                <th scope="row"><a className="fm-drop-card-link" href={`/cartas/${drop.cardSlug}/`}>{image && <img src={image} alt={`Carta ${drop.name}`} loading="lazy" />}<span><small>{card ? `#${String(card.id).padStart(3, "0")}` : ""}</small>{drop.name}</span></a></th>
                <td>{card?.type || "—"}</td><td><span className={`fm-pool-badge fm-pool-${drop.pool}`}>{poolLabels[drop.pool]}</span></td><td><strong className="fm-drop-rate">{drop.rate}</strong></td>
              </tr>;
            })}</tbody>
          </table>
          </div>
        </details>
      </div>
    </section>

    {duelist.farmGuide && <section className="fm-sec fm-farm-guide"><div className="shell"><p>Estratégia</p><h2>Como farmar {duelist.name}</h2><div>{duelist.farmGuide}</div></div></section>}
    {duelist.faq.length > 0 && <section className="fm-sec fm-duelist-faq"><div className="shell"><p>Perguntas frequentes</p><h2>Dúvidas sobre {duelist.name}</h2><PortalFaq items={duelist.faq} /></div></section>}
    <SchemaScript data={schema} />
    <SiteFooter />
  </main>;
}
