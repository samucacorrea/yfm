import { taxonomySlug } from "../../lib/wordpress-data";

export type PasswordSort = "numero-asc" | "custo-desc" | "custo-asc" | "atk-desc";
export type PasswordTypeOption = { name: string; count: number };

export function sortPasswordCards<T extends { id: number; name: string; price: number; atk: number }>(cards: T[], order: PasswordSort) {
  return [...cards].sort((a, b) => {
    if (order === "custo-desc") return b.price - a.price || a.name.localeCompare(b.name, "pt-BR");
    if (order === "custo-asc") return a.price - b.price || a.name.localeCompare(b.name, "pt-BR");
    if (order === "atk-desc") return b.atk - a.atk || a.name.localeCompare(b.name, "pt-BR");
    return a.id - b.id || a.name.localeCompare(b.name, "pt-BR");
  });
}

export function passwordSort(value?: string): PasswordSort {
  return (["numero-asc", "custo-desc", "custo-asc", "atk-desc"] as PasswordSort[]).includes(value as PasswordSort)
    ? value as PasswordSort
    : "numero-asc";
}

export function PasswordFilters({
  types,
  total,
  query = "",
  order = "numero-asc",
  selectedType = "",
  purchasableOnly = false,
  action = "/passwords/",
  allowTypeSelect = true,
}: {
  types: PasswordTypeOption[];
  total: number;
  query?: string;
  order?: PasswordSort;
  selectedType?: string;
  purchasableOnly?: boolean;
  action?: string;
  allowTypeSelect?: boolean;
}) {
  return <div className="password-search-panel">
    <form className={`password-filter-form${allowTypeSelect ? " has-type" : ""}`} action={action} method="get">
      <label className="password-filter-search"><span>Buscar carta ou código</span><input name="busca" defaultValue={query} placeholder="Nome, ID, password ou atributo..." /></label>
      {allowTypeSelect && <label><span>Tipo de carta</span><select name="tipo" defaultValue={selectedType}><option value="">Todos os tipos</option>{types.map((type) => <option value={taxonomySlug(type.name)} key={type.name}>{type.name} ({type.count})</option>)}</select></label>}
      <label><span>Ordenar resultados</span><select name="ordem" defaultValue={order}><option value="numero-asc">Número da carta</option><option value="custo-asc">Menor custo em estrelas</option><option value="custo-desc">Maior custo em estrelas</option><option value="atk-desc">Maior ATK</option></select></label>
      <label className="password-buyable-toggle"><input type="checkbox" name="compraveis" value="1" defaultChecked={purchasableOnly} /><span>Somente compráveis</span></label>
      <button type="submit"><span aria-hidden="true">⌕</span> Aplicar filtros</button>
    </form>
    <div className="password-type-filter" aria-label="Filtrar passwords por tipo">
      <a className={!selectedType ? "is-active" : undefined} href="/passwords/"><span className="password-type-mark">ALL</span><span><b>Todas</b><small>{total} cartas</small></span></a>
      {types.map((type) => {
        const slug = taxonomySlug(type.name);
        return <a className={selectedType === slug ? "is-active" : undefined} href={`/passwords/${slug}/`} key={type.name}><span className="password-type-mark">{type.name.slice(0, 2).toUpperCase()}</span><span><b>{type.name}</b><small>{type.count} cartas</small></span></a>;
      })}
    </div>
  </div>;
}
