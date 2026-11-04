import type { Metadata } from "next";
import { Suspense } from "react";
import { buildCardCatalogFilters, cardMatchesCatalogFilter } from "../../lib/card-filters";
import { getCards } from "../../lib/data";
import { CardCatalogFilters } from "../components/card-catalog-filters";
import { CardVisual } from "../components/card-visual";
import { AdSlot } from "../components/ad-slot";
import { SiteFooter } from "../components/site-footer";
import { SiteHeader } from "../components/site-header";

export const metadata: Metadata = {
  title: "Lista de cartas | Yu-Gi-Oh! Forbidden Memories",
  description: "Consulte cartas, atributos, ATK, DEF, passwords e onde conseguir cada carta de Yu-Gi-Oh! Forbidden Memories.",
  alternates: { canonical: "/cartas/", types: { "text/markdown": "/cartas.md" } },
};

export default async function CardsPage({ searchParams }: { searchParams: Promise<{ busca?: string; tipo?: string }> }) {
  const cards = await getCards();
  const params = await searchParams;
  const query = (params.busca || "").trim();
  const normalizedQuery = query.toLocaleLowerCase("pt-BR");
  const filters = buildCardCatalogFilters(cards);
  const validFilters = new Set([...filters.categories, ...filters.types].map((filter) => filter.key));
  const selectedFilter = validFilters.has(params.tipo || "") ? params.tipo || "" : "";
  const filtered = cards.filter((card) => {
    const matchesQuery = !normalizedQuery || [card.name, card.namePt, card.type, card.category, card.attribute]
      .some((value) => value?.toLocaleLowerCase("pt-BR").includes(normalizedQuery));
    return matchesQuery && cardMatchesCatalogFilter(card, selectedFilter);
  });
  const renderCard = (card: (typeof filtered)[number]) => <a className="catalog-card" href={`/cartas/${card.slug}/`} key={card.slug}><CardVisual card={card} compact /><div><small>#{String(card.id).padStart(3, "0")} · {card.attribute}</small><h2>{card.name}</h2><p>{card.namePt}</p><span>ATK <b>{card.atk}</b> DEF <b>{card.def}</b></span></div></a>;

  return (
    <main>
      <SiteHeader solid />
      <section className="index-hero">
        <div className="shell"><p className="kicker">BANCO DE CARTAS</p><h1>Encontre qualquer <span>carta.</span></h1><p>Busque por nome, tipo ou atributo e descubra password, stats e onde farmar.</p>
          <form className="index-search" action="/cartas/" method="get" data-search-context="card_catalog"><label className="sr-only" htmlFor="index-search">Buscar cartas</label><input id="index-search" name="busca" defaultValue={query} placeholder="Ex.: Blue-Eyes, Dragon, Light..." />{selectedFilter && <input type="hidden" name="tipo" value={selectedFilter}/>}<button>Buscar</button></form>
          <CardCatalogFilters total={cards.length} categories={filters.categories} types={filters.types} selected={selectedFilter} query={query}/>
        </div>
      </section>
      <section className="catalog-section" data-search-results-count={filtered.length} data-search-context="card_catalog"><div className="shell">
        <div className="catalog-meta"><p><b>{filtered.length}</b> {filtered.length === 1 ? "carta encontrada" : "cartas encontradas"}</p>{(query || selectedFilter) && <a href="/cartas/">Limpar filtros ×</a>}</div>
        {filtered.length ? <><Suspense fallback={null}><AdSlot placement="cards_inline" path="/cartas/" className="ad-slot-section--catalog"/></Suspense><div className="catalog-grid">{filtered.map(renderCard)}</div></> : <div className="empty-state"><b>Nenhuma carta encontrada.</b><p>Tente buscar pelo nome em inglês, tipo ou atributo.</p></div>}
      </div></section>
      <SiteFooter />
    </main>
  );
}
