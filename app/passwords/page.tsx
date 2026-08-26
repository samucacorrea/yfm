import type { Metadata } from "next";
import "../portal.css";
import "./passwords.css";
import { getCards } from "../../lib/data";
import { taxonomySlug } from "../../lib/wordpress-data";
import { PortalHeading, PortalPage, SchemaScript } from "../components/portal-components";
import { PasswordCard } from "./password-card";

export const metadata: Metadata = {
  title: "Passwords de Yu-Gi-Oh! Forbidden Memories: lista completa",
  description: "Consulte passwords de cartas de Yu-Gi-Oh! Forbidden Memories com imagem, código, tipo, atributo, ATK, DEF e custo em estrelas.",
  keywords: ["passwords Forbidden Memories", "códigos Yu-Gi-Oh Forbidden Memories", "senha das cartas Forbidden Memories", "password cartas PS1"],
  alternates: { canonical: "/passwords/" },
};

const siteOrigin = (process.env.SITE_URL || "https://yugiohforbiddenmemories.com").replace(/\/$/, "");
const absoluteUrl = (path: string) => `${siteOrigin}${path}`;

export default async function PasswordsPage({ searchParams }: { searchParams: Promise<{ busca?: string }> }) {
  const cards = await getCards();
  const query = ((await searchParams).busca || "").trim();
  const normalizedQuery = query.toLocaleLowerCase("pt-BR");
  const passwordCards = cards.filter((card) => card.password);
  const filtered = normalizedQuery
    ? passwordCards.filter((card) => [card.name, card.namePt, card.type, card.attribute, card.password, card.id]
      .some((value) => String(value).toLocaleLowerCase("pt-BR").includes(normalizedQuery)))
    : passwordCards;
  const types = [...new Set(passwordCards.map((card) => card.type))].sort((a, b) => a.localeCompare(b, "pt-BR"));
  const eightDigitPasswords = passwordCards.filter((card) => /^\d{8}$/.test(card.password)).length;
  const maximumPrice = Math.max(0, ...passwordCards.map((card) => card.price));
  const faq = [
    { q: "Onde digitar passwords em Yu-Gi-Oh! Forbidden Memories?", a: "No menu principal, entre em Password, informe os oito dígitos da carta e confirme para consultar seu custo em estrelas." },
    { q: "Digitar o password entrega a carta gratuitamente?", a: "Não. O código localiza a carta no menu Password, mas a compra só é concluída quando o jogador possui a quantidade de estrelas exigida." },
    { q: "Todas as cartas podem ser compradas por password?", a: "O catálogo mostra os códigos fornecidos pelo banco do jogo. Algumas cartas podem ter custo muito alto ou restrições que tornam o farm por drops mais conveniente." },
    { q: "Como encontrar rapidamente o código de uma carta?", a: "Use a busca por nome, ID, tipo, atributo ou pelos próprios números do password. Também é possível abrir uma categoria para consultar somente aquele tipo de carta." },
  ];
  const pageUrl = absoluteUrl("/passwords/");
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        "@id": `${pageUrl}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Início", item: absoluteUrl("/") },
          { "@type": "ListItem", position: 2, name: "Passwords", item: pageUrl },
        ],
      },
      {
        "@type": "CollectionPage",
        "@id": pageUrl,
        url: pageUrl,
        name: "Passwords de Yu-Gi-Oh! Forbidden Memories",
        description: "Lista pesquisável de passwords, cartas, atributos, estatísticas e custos em estrelas.",
        inLanguage: "pt-BR",
        breadcrumb: { "@id": `${pageUrl}#breadcrumb` },
        mainEntity: { "@id": `${pageUrl}#lista` },
        hasPart: [{ "@id": `${pageUrl}#dataset` }, { "@id": `${pageUrl}#faq` }],
      },
      {
        "@type": "ItemList",
        "@id": `${pageUrl}#lista`,
        name: "Lista de passwords das cartas",
        numberOfItems: filtered.length,
        itemListElement: filtered.map((card, index) => ({
          "@type": "ListItem",
          position: index + 1,
          url: absoluteUrl(`/cartas/${card.slug}/`),
          item: {
            "@type": "Thing",
            name: card.name,
            identifier: String(card.id),
            url: absoluteUrl(`/cartas/${card.slug}/`),
            additionalProperty: [
              { "@type": "PropertyValue", name: "Password", value: card.password },
              { "@type": "PropertyValue", name: "Tipo", value: card.type },
              { "@type": "PropertyValue", name: "ATK", value: card.atk },
              { "@type": "PropertyValue", name: "DEF", value: card.def },
              { "@type": "PropertyValue", name: "Custo em estrelas", value: card.price },
            ],
          },
        })),
      },
      {
        "@type": "Dataset",
        "@id": `${pageUrl}#dataset`,
        name: "Base de passwords de Yu-Gi-Oh! Forbidden Memories",
        description: "Passwords de oito dígitos e informações das cartas catalogadas no jogo de PlayStation.",
        url: pageUrl,
        creator: { "@type": "Organization", name: "Yu-Gi-Oh! Forbidden Memories", url: siteOrigin },
        license: "https://creativecommons.org/licenses/by/4.0/",
        isAccessibleForFree: true,
        variableMeasured: ["ID", "Carta", "Password", "Tipo", "Atributo", "ATK", "DEF", "Custo em estrelas"],
      },
      {
        "@type": "FAQPage",
        "@id": `${pageUrl}#faq`,
        mainEntity: faq.map((item) => ({ "@type": "Question", name: item.q, acceptedAnswer: { "@type": "Answer", text: item.a } })),
      },
    ],
  };

  return <PortalPage eyebrow="CÓDIGOS · 8 DÍGITOS" title="Passwords de" accent="Forbidden Memories" lead="Encontre o código exato de cada carta e compare imagem, tipo, atributos, estatísticas e custo em estrelas.">
    <nav className="password-crumb shell" aria-label="Navegação estrutural"><a href="/">Início</a><span>›</span><strong>Passwords</strong></nav>

    <section className="password-answer"><div className="shell password-answer-grid">
      <article className="password-answer-box">
        <small>RESPOSTA RÁPIDA</small>
        <h2>Como usar os passwords?</h2>
        <p>Abra <strong>Password</strong> no menu principal, digite os oito números e confirme. O código identifica a carta, mas você ainda precisa pagar o <strong>custo em estrelas</strong> exibido pelo jogo.</p>
      </article>
      <dl className="password-metrics">
        <div><dt>Passwords</dt><dd>{passwordCards.length}</dd></div>
        <div><dt>Tipos de carta</dt><dd>{types.length}</dd></div>
        <div><dt>Códigos de 8 dígitos</dt><dd>{eightDigitPasswords}</dd></div>
        <div><dt>Maior custo</dt><dd>{maximumPrice.toLocaleString("pt-BR")} ★</dd></div>
      </dl>
    </div></section>

    <section className="portal-section password-catalog-section" id="lista"><div className="shell">
      <div className="password-search-panel">
        <form className="password-search" action="/passwords/" method="get">
          <label className="sr-only" htmlFor="password-query">Buscar password</label>
          <input id="password-query" name="busca" defaultValue={query} placeholder="Nome, ID, password, tipo ou atributo..." />
          <button type="submit">Buscar</button>
        </form>
        <div className="filter-chips" aria-label="Filtrar passwords por tipo"><a href="/passwords/">Todas</a>{types.map((type) => <a href={`/passwords/${taxonomySlug(type)}/`} key={type}>{type}</a>)}</div>
        <p className="password-search-hint">A busca é processada no servidor e encontrou <strong>{filtered.length}</strong> {filtered.length === 1 ? "carta" : "cartas"}.</p>
      </div>
      <PortalHeading eyebrow="CATÁLOGO VISUAL" title={`${filtered.length} passwords`} accent={query ? `para “${query}”` : "catalogados"} />
      {filtered.length > 0
        ? <div className="password-visual-grid">{filtered.map((card) => <PasswordCard card={card} key={card.slug} />)}</div>
        : <div className="portal-empty">Nenhum password encontrado. Tente buscar pelo nome, ID, tipo ou atributo.</div>}
    </div></section>

    <article className="password-guide shell" id="guia-passwords">
      <header><small>GUIA COMPLETO · SEO · AEO · GEO</small><h2>Guia de passwords de <span>Forbidden Memories</span></h2><p>Entenda o que o código faz, onde digitá-lo e quando vale mais a pena comprar uma carta ou tentar obtê-la por drop.</p></header>
      <nav className="password-guide-nav" aria-label="Índice do guia de passwords"><b>Neste guia</b><a href="#o-que-e-password">O que é?</a><a href="#como-digitar">Como usar?</a><a href="#estrelas">Custo em estrelas</a><a href="#password-ou-drop">Password ou drop?</a></nav>
      <div className="password-guide-copy">
        <section id="o-que-e-password"><h3>O que é um password?</h3><p>O password é o código numérico associado a uma carta em Yu-Gi-Oh! Forbidden Memories. Ele serve para localizar a carta na tela Password e consultar sua disponibilidade e seu preço dentro do jogo.</p></section>
        <section id="como-digitar"><h3>Como digitar um password?</h3><ol><li>Entre na opção <strong>Password</strong> do menu principal.</li><li>Digite os oito números sem espaços.</li><li>Confira o nome e a arte da carta.</li><li>Se houver estrelas suficientes, confirme a compra.</li></ol></section>
        <section id="estrelas"><h3>Por que o jogo cobra estrelas?</h3><p>As estrelas funcionam como moeda para adquirir cartas por código. Cartas poderosas podem custar muito mais, então o password não substitui a necessidade de acumular recursos durante a campanha e os duelos.</p></section>
        <section id="password-ou-drop"><h3>É melhor usar password ou farmar drops?</h3><p>Compare o custo mostrado no card com a ficha completa da carta. Quando o preço é alto, abrir a página da carta e consultar duelistas, ranks e taxas de drop pode indicar uma rota de farm mais eficiente.</p></section>
      </div>
    </article>

    <section className="password-faq" id="faq"><div className="shell">
      <PortalHeading eyebrow="DÚVIDAS SOBRE CÓDIGOS" title="Perguntas" accent="frequentes" />
      <div className="password-faq-list">{faq.map((item, index) => <details open={index === 0} key={item.q}><summary>{item.q}</summary><p>{item.a}</p></details>)}</div>
    </div></section>
    <SchemaScript data={schema} />
  </PortalPage>;
}
