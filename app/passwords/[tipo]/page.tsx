import type { Metadata } from "next";
import { cards as localCards } from "../../../lib/catalog";
import "../../portal.css";
import "../passwords.css";
import { getCards } from "../../../lib/data";
import { absoluteSiteUrl } from "../../../lib/site";
import { taxonomySlug } from "../../../lib/wordpress-data";
import { PortalPage, SchemaScript } from "../../components/portal-components";
import { PasswordCard } from "../password-card";
import { formatDateBr, isPurchasable, PASSWORDS_AUTHOR, PASSWORDS_PER_PAGE, PASSWORDS_PUBLISHED_AT, PASSWORDS_UPDATED_AT } from "../password-data";
import { PasswordFilters, passwordSort, sortPasswordCards } from "../password-filters";

type SearchParams = { busca?: string; ordem?: string; compraveis?: string; pagina?: string };
type Props = { params: Promise<{ tipo: string }>; searchParams: Promise<SearchParams> };
const absoluteUrl = absoluteSiteUrl;

function validPage(value?: string) {
  const parsed = Number.parseInt(value || "1", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

export function generateStaticParams() {
  return [...new Set(localCards.map((card) => taxonomySlug(card.type)))].map((tipo) => ({ tipo }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const tipo = (await params).tipo;
  const cards = await getCards();
  const label = cards.find((card) => taxonomySlug(card.type) === taxonomySlug(tipo))?.type || tipo;
  const canonicalSlug = taxonomySlug(label);
  const title = `Passwords de cartas ${label} – Yu-Gi-Oh! Forbidden Memories`;
  const description = `Passwords de cartas ${label} com códigos, imagens, ATK, DEF, atributos e custos em estrelas calculados a partir do catálogo de Forbidden Memories.`;
  const url = absoluteUrl(`/passwords/${canonicalSlug}/`);
  return {
    title,
    description,
    alternates: { canonical: `/passwords/${canonicalSlug}/` },
    openGraph: { title, description, url, type: "website", siteName: "Yu-Gi-Oh! Forbidden Memories" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function PasswordTypePage({ params, searchParams }: Props) {
  const raw = (await params).tipo;
  const queryParams = await searchParams;
  const query = (queryParams.busca || "").trim();
  const normalizedQuery = query.toLocaleLowerCase("pt-BR");
  const order = passwordSort(queryParams.ordem);
  const purchasableOnly = queryParams.compraveis === "1";
  const cards = await getCards();
  const passwordCards = cards.filter((card) => card.password);
  const categoryCards = passwordCards.filter((card) => taxonomySlug(card.type) === taxonomySlug(raw));
  const label = categoryCards[0]?.type || raw;
  const canonicalSlug = taxonomySlug(label);
  const filtered = sortPasswordCards(categoryCards.filter((card) => {
    const matchesQuery = !normalizedQuery || [card.name, card.namePt, card.attribute, card.password, card.id]
      .some((value) => String(value).toLocaleLowerCase("pt-BR").includes(normalizedQuery));
    return matchesQuery && (!purchasableOnly || isPurchasable(card));
  }), order);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PASSWORDS_PER_PAGE));
  const currentPage = Math.min(validPage(queryParams.pagina), totalPages);
  const pageOffset = (currentPage - 1) * PASSWORDS_PER_PAGE;
  const visibleCards = filtered.slice(pageOffset, pageOffset + PASSWORDS_PER_PAGE);
  const types = [...new Set(passwordCards.map((card) => card.type))].sort((a, b) => a.localeCompare(b, "pt-BR"));
  const typeOptions = types.map((name) => ({ name, count: passwordCards.filter((card) => card.type === name).length }));
  const prices = categoryCards.map((card) => card.price).filter((price) => price > 0);
  const minimumPrice = prices.length ? Math.min(...prices) : 0;
  const maximumPrice = prices.length ? Math.max(...prices) : 0;
  const averageAtk = categoryCards.length ? Math.round(categoryCards.reduce((total, card) => total + card.atk, 0) / categoryCards.length) : 0;
  const maximumAtk = categoryCards.length ? Math.max(...categoryCards.map((card) => card.atk)) : 0;
  const typeSearchName = canonicalSlug === "trovao" ? `${label} — também conhecidas como Thunder ou Trovão` : label;
  const pageUrl = absoluteUrl(`/passwords/${canonicalSlug}/`);
  const pageHref = (page: number) => {
    const next = new URLSearchParams();
    if (query) next.set("busca", query);
    if (order !== "numero-asc") next.set("ordem", order);
    if (purchasableOnly) next.set("compraveis", "1");
    if (page > 1) next.set("pagina", String(page));
    const search = next.toString();
    return `/passwords/${canonicalSlug}/${search ? `?${search}` : ""}`;
  };
  const faq = [
    { q: `Onde encontrar passwords de cartas ${label}?`, a: `Esta página reúne os códigos das ${categoryCards.length} cartas ${label} encontradas no catálogo atual, acompanhados por imagem, atributo, ATK, DEF e custo em estrelas. Use a busca para localizar um nome específico ou ordene a lista por número, preço ou força de ataque.` },
    { q: `Como usar o código de uma carta ${label}?`, a: "Abra Password no menu principal, digite os oito números e confirme. O jogo exibirá a carta e seu custo em estrelas. A aquisição somente será concluída quando houver saldo suficiente; preços de 999.999 estrelas normalmente indicam que drops ou fusões são alternativas mais realistas." },
  ];
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        "@id": `${pageUrl}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Início", item: absoluteUrl("/") },
          { "@type": "ListItem", position: 2, name: "Passwords", item: absoluteUrl("/passwords/") },
          { "@type": "ListItem", position: 3, name: label, item: pageUrl },
        ],
      },
      {
        "@type": "CollectionPage",
        "@id": pageUrl,
        url: pageUrl,
        name: `Passwords de cartas ${label}`,
        description: `Códigos e informações das cartas ${typeSearchName} em Yu-Gi-Oh! Forbidden Memories.`,
        inLanguage: "pt-BR",
        datePublished: PASSWORDS_PUBLISHED_AT,
        dateModified: PASSWORDS_UPDATED_AT,
        author: { "@type": "Person", name: PASSWORDS_AUTHOR.name, url: PASSWORDS_AUTHOR.url },
        publisher: { "@type": "Organization", name: "Yu-Gi-Oh! Forbidden Memories", url: absoluteUrl("/"), logo: { "@type": "ImageObject", url: absoluteUrl("/logo.webp") } },
        breadcrumb: { "@id": `${pageUrl}#breadcrumb` },
        mainEntity: { "@id": `${pageUrl}#lista` },
        hasPart: [{ "@id": `${pageUrl}#dataset` }, { "@id": `${pageUrl}#faq` }],
      },
      {
        "@type": "ItemList",
        "@id": `${pageUrl}#lista`,
        name: `Passwords de cartas ${label}`,
        numberOfItems: filtered.length,
        itemListElement: visibleCards.map((card, index) => ({ "@type": "ListItem", position: pageOffset + index + 1, name: card.name, url: absoluteUrl(`/cartas/${card.slug}/`) })),
      },
      {
        "@type": "Dataset",
        "@id": `${pageUrl}#dataset`,
        name: `Base de passwords de cartas ${label}`,
        description: `Passwords, atributos, estatísticas e custos das cartas ${typeSearchName}.`,
        url: pageUrl,
        dateModified: PASSWORDS_UPDATED_AT,
        creator: { "@type": "Organization", name: "Yu-Gi-Oh! Forbidden Memories", url: absoluteUrl("/") },
        license: "https://creativecommons.org/licenses/by/4.0/",
        isAccessibleForFree: true,
        variableMeasured: ["Carta", "Password", "Atributo", "ATK", "DEF", "Custo em estrelas"],
      },
      {
        "@type": "FAQPage",
        "@id": `${pageUrl}#faq`,
        mainEntity: faq.map((item) => ({ "@type": "Question", name: item.q, acceptedAnswer: { "@type": "Answer", text: item.a } })),
      },
    ],
  };

  return <PortalPage
    eyebrow="PASSWORDS POR TIPO"
    title="Passwords de cartas"
    accent={label}
    lead={`Códigos, estatísticas e custos das cartas ${typeSearchName} em Yu-Gi-Oh! Forbidden Memories.`}
    meta={<><time dateTime={PASSWORDS_UPDATED_AT}>Atualizado em {formatDateBr(PASSWORDS_UPDATED_AT)}</time><span>Por {PASSWORDS_AUTHOR.label}</span></>}
  >
    <nav className="password-crumb shell" aria-label="Navegação estrutural"><a href="/">Início</a><span>›</span><a href="/passwords/">Passwords</a><span>›</span><strong>{label}</strong></nav>

    <section className="password-answer"><div className="shell password-answer-grid">
      <article className="password-answer-box"><small>RESPOSTA RÁPIDA</small><p className="password-answer-title">Passwords de cartas {label}</p><p>Esta categoria possui <strong>{categoryCards.length} cartas com password</strong>. Os custos variam de <strong>{minimumPrice.toLocaleString("pt-BR")} ★</strong> a <strong>{maximumPrice.toLocaleString("pt-BR")} ★</strong>. Use os filtros abaixo para pesquisar e comparar os resultados.</p></article>
      <dl className="password-metrics"><div><dt>Cartas do tipo</dt><dd>{categoryCards.length}</dd></div><div><dt>ATK médio</dt><dd>{averageAtk}</dd></div><div><dt>Maior ATK</dt><dd>{maximumAtk}</dd></div><div><dt>Compráveis</dt><dd>{categoryCards.filter(isPurchasable).length}</dd></div></dl>
    </div></section>

    <section className="portal-section password-catalog-section" id="lista"><div className="shell">
      <PasswordFilters types={typeOptions} total={passwordCards.length} query={query} order={order} selectedType={canonicalSlug} purchasableOnly={purchasableOnly} action={`/passwords/${canonicalSlug}/`} allowTypeSelect={false} />
      <p className="password-search-hint password-results-hint">Filtro atual: <strong>{typeSearchName}</strong>. {filtered.length} {filtered.length === 1 ? "resultado" : "resultados"}. Exibindo {visibleCards.length} na página {currentPage}. {(query || purchasableOnly || order !== "numero-asc") && <a href={`/passwords/${canonicalSlug}/`}>Limpar busca e ordem</a>}</p>
      <div className="password-catalog-heading"><small>CATÁLOGO VISUAL</small><p className="password-section-title">{filtered.length} cartas encontradas</p></div>
      <p className="password-type-intro">Cada card usa os dados recebidos do WordPress e mostra password, atributo, ATK, DEF e custo em estrelas. Abra a ficha para consultar também drops e outras formas de obtenção.</p>
      {visibleCards.length > 0 ? <div className="password-visual-grid">{visibleCards.map((card) => <PasswordCard card={card} key={card.slug} />)}</div> : <div className="portal-empty">Nenhuma carta deste tipo corresponde aos filtros.</div>}
      {totalPages > 1 && <nav className="password-pagination" aria-label="Paginação do catálogo"><a aria-disabled={currentPage === 1} href={pageHref(Math.max(1, currentPage - 1))}>← Anterior</a><span>Página {currentPage} de {totalPages}</span>{Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => <a aria-current={page === currentPage ? "page" : undefined} href={pageHref(page)} key={page}>{page}</a>)}<a aria-disabled={currentPage === totalPages} href={pageHref(Math.min(totalPages, currentPage + 1))}>Próxima →</a></nav>}
      <a className="password-type-back" href="/passwords/">← Voltar para todos os passwords</a>
    </div></section>

    <article className="password-guide shell"><header><p className="password-guide-title">Guia de passwords {label}</p><p>Como comparar as cartas desta categoria antes de gastar estrelas.</p></header><div className="password-guide-copy"><section><h2>Como escolher uma carta {label}?</h2><p className="password-direct-answer">Compare ATK, DEF e custo para encontrar a carta que oferece o melhor retorno para suas estrelas disponíveis.</p><p>Cartas fortes nem sempre representam a melhor compra quando o preço consome recursos que poderiam adquirir várias opções mais acessíveis.</p></section><section><h2>Quando vale consultar a ficha completa?</h2><p className="password-direct-answer">Abra a ficha quando quiser comparar o custo do password com drops, fusões e outras possibilidades catalogadas.</p><p>A página individual também reúne atributos, estatísticas e links relacionados à carta escolhida.</p></section></div></article>

    <section className="password-faq" id="faq"><div className="shell"><header className="password-faq-heading"><small>DÚVIDAS SOBRE {label}</small><p className="password-section-title">Perguntas frequentes</p></header><div className="password-faq-list">{faq.map((item, index) => <details open={index === 0} key={item.q}><summary>{item.q}</summary><p>{item.a}</p></details>)}</div></div></section>
    <SchemaScript data={schema} />
  </PortalPage>;
}
