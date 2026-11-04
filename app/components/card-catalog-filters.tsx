import type { CardCatalogFilter } from "../../lib/card-filters";

function FilterIcon({ kind }: { kind: string }) {
  const common = { fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  return <svg viewBox="0 0 24 24" aria-hidden="true" {...common}>
    {kind === "all" && <><rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><rect x="14" y="14" width="6" height="6" rx="1"/></>}
    {kind === "magic" && <><path d="m12 2 1.6 5.2L19 9l-5.4 1.8L12 16l-1.6-5.2L5 9l5.4-1.8L12 2Z"/><path d="m18.5 15 .8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8.8-2.2Z"/></>}
    {kind === "trap" && <><path d="M12 3 2.8 20h18.4L12 3Z"/><path d="M12 9v5"/><path d="M12 17.2h.01"/></>}
    {kind === "equip" && <><path d="m14.5 4.5 5-2-2 5L9 16l-3 1 1-3 7.5-9.5Z"/><path d="m5 15 4 4"/><path d="m4 18-1.5 3.5L6 20l2-2"/></>}
    {kind === "ritual" && <><circle cx="12" cy="12" r="8.5"/><path d="m12 6 1.8 3.8 4.2.5-3.1 2.8.8 4.1-3.7-2-3.7 2 .8-4.1-3.1-2.8 4.2-.5L12 6Z"/></>}
    {kind === "field" && <><path d="M3 19 9 8l3 5 2-3 7 9H3Z"/><path d="M16 5h4M18 3v4"/></>}
    {kind === "dragon" && <><path d="M4 18c3-7 7-11 15-12l-4 4 4 2-5 1c-1 5-5 7-10 5Z"/><path d="M8 16c2-1 4-1 6 0"/><path d="M13 9h.01"/></>}
    {kind === "water" && <path d="M12 2.5s6.5 7 6.5 12A6.5 6.5 0 1 1 5.5 14.5c0-5 6.5-12 6.5-12Z"/>}
    {kind === "spell" && <><path d="m5 19 10-10"/><path d="m14 4 6 6-3 1-4-4 1-3Z"/><path d="m4 5 1-2 1 2 2 1-2 1-1 2-1-2-2-1 2-1Z"/></>}
    {kind === "warrior" && <><path d="m5 4 14 14"/><path d="m19 4-5 5"/><path d="m5 20 4-4"/><path d="M3 3h5M16 3h5M3 21h5M16 21h5"/></>}
    {kind === "beast" && <><circle cx="7" cy="8" r="2"/><circle cx="12" cy="5.5" r="2"/><circle cx="17" cy="8" r="2"/><path d="M7 16c0-3 2.2-5 5-5s5 2 5 5c0 2-1.5 3-3.2 2.1a4 4 0 0 0-3.6 0C8.5 19 7 18 7 16Z"/></>}
    {kind === "nature" && <><path d="M19 4C10 4 5 9 5 18c9 0 14-5 14-14Z"/><path d="M5 19c3-4 6-7 11-10"/></>}
    {kind === "machine" && <><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/><circle cx="12" cy="12" r="7"/></>}
    {kind === "insect" && <><ellipse cx="12" cy="13" rx="4" ry="7"/><path d="M8 10 4 7M16 10l4-3M8 14H3M16 14h5M9 18l-4 3M15 18l4 3M10 6 8 3M14 6l2-3"/></>}
    {kind === "thunder" && <path d="m13 2-7 12h6l-1 8 7-12h-6l1-8Z"/>}
    {kind === "undead" && <><path d="M6 20v-6a6 6 0 0 1 12 0v6H6Z"/><circle cx="10" cy="13" r="1"/><circle cx="14" cy="13" r="1"/><path d="M10 17h4M9 20v-2M12 20v-2M15 20v-2"/></>}
    {kind === "card" && <><rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 7h8M8 11h5M8 15h8"/></>}
  </svg>;
}

function filterHref(query: string, filterKey = "") {
  const params = new URLSearchParams();
  if (query) params.set("busca", query);
  if (filterKey) params.set("tipo", filterKey);
  const search = params.toString();
  return `/cartas/${search ? `?${search}` : ""}`;
}

function FilterLink({ filter, selected, query, menu = false }: { filter: CardCatalogFilter; selected: string; query: string; menu?: boolean }) {
  const active = selected === filter.key;
  return <a
    className={`${menu ? "card-filter-menu-option" : "card-filter-option"}${active ? " is-active" : ""}`}
    href={filterHref(query, filter.key)}
    aria-current={active ? "page" : undefined}
    data-analytics-event="select_content"
    data-analytics-content-type="card_filter"
    data-analytics-content-id={filter.key}
  >
    <span className="card-filter-icon"><FilterIcon kind={filter.icon}/></span>
    <span><b>{filter.label}</b><small>{filter.count} cartas</small></span>
  </a>;
}

export function CardCatalogFilters({ total, categories, types, selected, query }: { total: number; categories: CardCatalogFilter[]; types: CardCatalogFilter[]; selected: string; query: string }) {
  const allActive = !selected;
  const allFilters = [...categories, ...types];
  const quickKeys = ["categoria-magia", "categoria-armadilha", "tipo-dragao", "tipo-mago", "tipo-aqua", "tipo-guerreiro"];
  const quickFilters = quickKeys.map((key) => allFilters.find((filter) => filter.key === key)).filter((filter): filter is CardCatalogFilter => Boolean(filter));
  const activeFilter = allFilters.find((filter) => filter.key === selected);
  const railFilters = activeFilter && !quickKeys.includes(activeFilter.key) ? [activeFilter, ...quickFilters] : quickFilters;

  return <div className="card-filter-panel">
    <span className="card-filter-label">Filtrar por</span>
    <nav className="card-filter-carousel" aria-label="Filtros rápidos de cartas">
      <div className="card-filter-scroll">
        <a className={`card-filter-option${allActive ? " is-active" : ""}`} href={filterHref(query)} aria-current={allActive ? "page" : undefined} data-analytics-event="select_content" data-analytics-content-type="card_filter" data-analytics-content-id="all_cards">
          <span className="card-filter-icon"><FilterIcon kind="all"/></span><span><b>Todas</b><small>{total}</small></span>
        </a>
        {railFilters.map((filter) => <FilterLink filter={filter} selected={selected} query={query} key={filter.key}/>)}
      </div>
    </nav>
    <details className="card-filter-more">
      <summary><span aria-hidden="true">＋</span> Mais tipos</summary>
      <div className="card-filter-menu">
        <header><div><small>CATÁLOGO DE FILTROS</small><b>Encontre seu tipo de carta</b></div>{selected && <a href={filterHref(query)}>Limpar filtro</a>}</header>
        <div className="card-filter-menu-section">
          <p>Categorias especiais</p>
          <div>{categories.map((filter) => <FilterLink filter={filter} selected={selected} query={query} menu key={filter.key}/>)}</div>
        </div>
        <div className="card-filter-menu-section">
          <p>Tipos de monstro</p>
          <div>{types.map((filter) => <FilterLink filter={filter} selected={selected} query={query} menu key={filter.key}/>)}</div>
        </div>
      </div>
    </details>
  </div>;
}
