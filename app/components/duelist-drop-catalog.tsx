"use client";

import { useDeferredValue, useMemo, useState } from "react";
import type { CardRecord } from "../../lib/catalog";
import type { PoolCard } from "../../lib/portal-content";
import { DropCardGrid } from "./drop-card-grid";

const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR");

export function DuelistDropCatalog({ items, cards, titleSuffix }: { items: PoolCard[]; cards: CardRecord[]; titleSuffix: string }) {
  const [query, setQuery] = useState("");
  const [type, setType] = useState("todos");
  const deferredQuery = useDeferredValue(query);
  const cardsBySlug = useMemo(() => new Map(cards.map((card) => [card.slug, card])), [cards]);
  const types = useMemo(() => [...new Set(items
    .map((item) => cardsBySlug.get(item.cardSlug)?.type)
    .filter((value): value is string => Boolean(value)))]
    .sort((a, b) => a.localeCompare(b, "pt-BR")), [cardsBySlug, items]);
  const filtered = useMemo(() => {
    const search = normalize(deferredQuery.trim());
    return items.filter((item) => {
      const card = cardsBySlug.get(item.cardSlug);
      const matchesType = type === "todos" || card?.type === type;
      const haystack = normalize([item.name, item.cardSlug, card?.id, card?.namePt, card?.type, card?.attribute].filter(Boolean).join(" "));
      return matchesType && (!search || haystack.includes(search));
    });
  }, [cardsBySlug, deferredQuery, items, type]);
  const hasFilters = query.length > 0 || type !== "todos";
  const clear = () => { setQuery(""); setType("todos"); };

  return <>
    <header className="fm-drop-heading"><div><p>Banco de drops</p><h2>Todas as cartas que ele dropa{titleSuffix}</h2><span aria-live="polite">{filtered.length} {filtered.length === 1 ? "carta encontrada" : "cartas encontradas"}</span></div></header>
    <div className="drop-filter-panel fm-inline-drop-filter">
      <div className="drop-filter-title"><div><small>FILTRAR RECOMPENSAS</small><h3>Encontre uma carta</h3></div><strong><b>{filtered.length}</b> resultados</strong></div>
      <div className="drop-filter-fields">
        <label className="drop-search-field"><span className="sr-only">Buscar nos drops</span><i aria-hidden="true" /><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Nome, ID, tipo ou atributo..." autoComplete="off" /></label>
        <label className="drop-type-field"><span>Tipo de carta</span><select value={type} onChange={(event) => setType(event.target.value)}><option value="todos">Todos os tipos</option>{types.map((item) => <option value={item} key={item}>{item}</option>)}</select></label>
      </div>
      {hasFilters && <div className="drop-pool-filters"><button className="clear" type="button" onClick={clear}>Limpar filtros</button></div>}
    </div>
    {filtered.length > 0 ? <DropCardGrid items={filtered} cards={cards} /> : <div className="portal-empty fm-drop-empty"><b>Nenhuma carta encontrada.</b><p>Tente buscar outro nome, ID, tipo ou atributo.</p><button className="portal-button" type="button" onClick={clear}>Limpar filtros</button></div>}
  </>;
}
