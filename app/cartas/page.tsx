import type { Metadata } from "next";
import "../discovery.css";
import { getCards } from "../../lib/data";
import { CardVisual } from "../components/card-visual";
import { SiteFooter } from "../components/site-footer";
import { SiteHeader } from "../components/site-header";

export const metadata: Metadata = {
  title: "Lista de cartas | Yu-Gi-Oh! Forbidden Memories",
  description: "Consulte cartas, atributos, ATK, DEF, passwords e onde conseguir cada carta de Yu-Gi-Oh! Forbidden Memories.",
};

export default async function CardsPage({ searchParams }: { searchParams: Promise<{ busca?: string }> }) {
  const cards = await getCards();
  const query = ((await searchParams).busca || "").trim().toLocaleLowerCase("pt-BR");
  const filtered = query
    ? cards.filter((card) => [card.name, card.namePt, card.type, card.attribute].some((value) => value.toLocaleLowerCase("pt-BR").includes(query)))
    : cards;

  return (
    <main>
      <SiteHeader solid />
      <section className="index-hero">
        <div className="shell"><p className="kicker">BANCO DE CARTAS</p><h1>Encontre qualquer <span>carta.</span></h1><p>Busque por nome, tipo ou atributo e descubra password, stats e onde farmar.</p>
          <form className="index-search" action="/cartas/" method="get"><label className="sr-only" htmlFor="index-search">Buscar cartas</label><input id="index-search" name="busca" defaultValue={query} placeholder="Ex.: Blue-Eyes, Dragon, Light..." /><button>Buscar</button></form>
        </div>
      </section>
      <section className="catalog-section"><div className="shell">
        <div className="catalog-meta"><p><b>{filtered.length}</b> {filtered.length === 1 ? "carta encontrada" : "cartas encontradas"}</p>{query && <a href="/cartas/">Limpar busca ×</a>}</div>
        {filtered.length ? <div className="catalog-grid">{filtered.map((card) => <a className="catalog-card" href={`/cartas/${card.slug}/`} key={card.slug}><CardVisual card={card} compact /><div><small>#{String(card.id).padStart(3, "0")} · {card.attribute}</small><h2>{card.name}</h2><p>{card.namePt}</p><span>ATK <b>{card.atk}</b> DEF <b>{card.def}</b></span></div></a>)}</div> : <div className="empty-state"><b>Nenhuma carta encontrada.</b><p>Tente buscar pelo nome em inglês, tipo ou atributo.</p></div>}
      </div></section>
      <SiteFooter />
    </main>
  );
}
