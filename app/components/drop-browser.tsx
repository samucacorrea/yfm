"use client";

import { useDeferredValue, useMemo, useState } from "react";
import type { CardRecord } from "../../lib/catalog";
import type { PoolCard, PoolKey } from "../../lib/portal-content";
import { DropCardGrid } from "./drop-card-grid";

const poolLabels: Record<PoolKey, string> = { "s-pow": "S/A POW", "s-tec": "S/A TEC", "b-c-d": "B-C-D" };
const poolKeys: PoolKey[] = ["s-pow", "s-tec", "b-c-d"];
const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR");

export function DropBrowser({ duelistSlug, pools, cards }: { duelistSlug: string; pools: Record<PoolKey, PoolCard[]>; cards: CardRecord[] }) {
  const [query, setQuery] = useState("");
  const [type, setType] = useState("todos");
  const [pool, setPool] = useState<"todos" | PoolKey>("todos");
  const deferredQuery = useDeferredValue(query);
  const cardsBySlug = useMemo(() => new Map(cards.map((card) => [card.slug, card])), [cards]);
  const types = useMemo(() => [...new Set(cards.map((card) => card.type).filter(Boolean))].sort((a, b) => a.localeCompare(b, "pt-BR")), [cards]);
  const filtered = useMemo(() => {
    const search = normalize(deferredQuery.trim());
    return Object.fromEntries(poolKeys.map((key) => {
      const items = pool !== "todos" && pool !== key ? [] : pools[key].filter((item) => {
        const card = cardsBySlug.get(item.cardSlug);
        const matchesType = type === "todos" || card?.type === type;
        const haystack = normalize([item.name, item.cardSlug, card?.id, card?.namePt, card?.type, card?.attribute].filter(Boolean).join(" "));
        return matchesType && (!search || haystack.includes(search));
      });
      return [key, items];
    })) as Record<PoolKey, PoolCard[]>;
  }, [cardsBySlug, deferredQuery, pool, pools, type]);
  const total = poolKeys.reduce((sum, key) => sum + filtered[key].length, 0);
  const hasFilters = query || type !== "todos" || pool !== "todos";
  const clear = () => { setQuery(""); setType("todos"); setPool("todos"); };

  return <div className="drop-browser">
    <section className="drop-filter-section"><div className="shell">
      <div className="drop-filter-panel">
        <div className="drop-filter-title"><div><small>FILTRAR RECOMPENSAS</small><h2>Encontre uma carta</h2></div><strong><b>{total}</b> resultados</strong></div>
        <div className="drop-filter-fields">
          <label className="drop-search-field"><span className="sr-only">Buscar nos drops</span><i aria-hidden="true"></i><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Nome, ID, tipo ou atributo..." autoComplete="off"/></label>
          <label className="drop-type-field"><span>Tipo de carta</span><select value={type} onChange={(event) => setType(event.target.value)}><option value="todos">Todos os tipos</option>{types.map((item) => <option value={item} key={item}>{item}</option>)}</select></label>
        </div>
        <div className="drop-pool-filters" role="group" aria-label="Filtrar por pool"><button className={pool === "todos" ? "active" : ""} onClick={() => setPool("todos")} type="button">Todas</button>{poolKeys.map((key) => <button className={pool === key ? "active" : ""} onClick={() => setPool(key)} type="button" key={key}>{poolLabels[key]} <span>{pools[key].length}</span></button>)}{hasFilters && <button className="clear" onClick={clear} type="button">Limpar filtros</button>}</div>
      </div>
    </div></section>

    {poolKeys.map((key) => filtered[key].length > 0 && <section className="portal-section drop-results-section" id={key} key={key}><div className="shell"><div className="drop-results-heading"><div><small>BOLSA DE RECOMPENSAS</small><h2>{poolLabels[key]} <span>{filtered[key].length} cartas</span></h2></div><a href={`/drops/${duelistSlug}/${key}/`}>Abrir página desta bolsa →</a></div><DropCardGrid items={filtered[key]} cards={cards}/></div></section>)}
    {total === 0 && <section className="portal-section"><div className="shell"><div className="portal-empty"><b>Nenhuma carta encontrada.</b><p>Tente outro nome, tipo ou pool.</p><button className="portal-button" type="button" onClick={clear}>Limpar filtros</button></div></div></section>}
  </div>;
}
