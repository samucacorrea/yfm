import type { Metadata } from "next";
import "../portal.css";
import { getCards } from "../../lib/data";
import { taxonomySlug } from "../../lib/wordpress-data";
import { PortalHeading, PortalPage, SchemaScript } from "../components/portal-components";

export const metadata: Metadata = { title: "Passwords: lista de códigos | Yu-Gi-Oh! Forbidden Memories", description: "Tabela de passwords das cartas com ID, tipo, atributo, ATK, DEF e custo em estrelas." };

export default async function PasswordsPage({ searchParams }: { searchParams: Promise<{ busca?: string }> }) {
  const cards = await getCards();
  const query = ((await searchParams).busca || "").trim().toLocaleLowerCase("pt-BR");
  const filtered = (query ? cards.filter((card) => [card.name, card.namePt, card.type, card.attribute, card.password].some((value) => String(value).toLocaleLowerCase("pt-BR").includes(query))) : cards).filter((card) => card.password);
  const types = [...new Set(cards.map((card) => card.type))].sort((a, b) => a.localeCompare(b, "pt-BR"));
  const schema = { "@context": "https://schema.org", "@graph": [{ "@type": "Dataset", name: "Passwords de Yu-Gi-Oh! Forbidden Memories", description: "Códigos de oito dígitos, status e custo em estrelas das cartas catalogadas.", variableMeasured: ["ID", "Password", "ATK", "DEF", "Tipo", "Atributo", "Custo"] }, { "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Início" }, { "@type": "ListItem", position: 2, name: "Passwords" }] }] };
  return <PortalPage eyebrow="CÓDIGOS · 8 DÍGITOS" title="Todos os" accent="passwords" lead="Pesquise pelo nome, código, tipo ou atributo. Cada resultado leva à ficha completa da carta.">
    <section className="portal-section"><div className="shell"><form className="password-search" action="/passwords/" method="get"><label className="sr-only" htmlFor="password-query">Buscar password</label><input id="password-query" name="busca" defaultValue={query} placeholder="Carta, código, tipo ou atributo..."/><button>Buscar</button></form><div className="filter-chips"><a href="/passwords/">Todas</a>{types.map((type) => <a href={`/passwords/${taxonomySlug(type)}/`} key={type}>{type}</a>)}</div><PortalHeading eyebrow="TABELA COMPLETA" title={`${filtered.length} resultados`} accent={query ? `para “${query}”` : "catalogados"}/><div className="drop-table-wrap"><table className="portal-table password-table"><thead><tr><th>ID</th><th>Carta</th><th>Tipo</th><th>ATK</th><th>DEF</th><th>Password</th><th>Custo</th></tr></thead><tbody>{filtered.map((card) => <tr key={card.slug}><td>#{String(card.id).padStart(3, "0")}</td><td><a href={`/cartas/${card.slug}/`}>{card.name}</a><small>{card.namePt}</small></td><td>{card.type}<small>{card.attribute}</small></td><td>{card.atk}</td><td>{card.def}</td><td><b className="password-cell">{card.password}</b></td><td>{card.price ? `${card.price.toLocaleString("pt-BR")} ★` : "—"}</td></tr>)}</tbody></table></div>{!filtered.length && <div className="portal-empty">Nenhum password encontrado para esta busca.</div>}</div></section>
    <section className="portal-section portal-alt"><div className="shell password-help"><div><small>COMO USAR</small><h2>Onde inserir o password?</h2><p>No menu principal do jogo, abra a opção Password, informe os oito dígitos e confirme. A carta só poderá ser adquirida se você possuir estrelas suficientes.</p></div><ol><li>Abra o menu Password.</li><li>Digite os oito números.</li><li>Confira a carta e o custo.</li><li>Confirme a compra.</li></ol></div></section><SchemaScript data={schema}/>
  </PortalPage>;
}
