import type { Metadata } from "next";
import { cards as localCards } from "../../../lib/catalog";
import "../../portal.css";
import "../passwords.css";
import { getCards } from "../../../lib/data";
import { taxonomySlug } from "../../../lib/wordpress-data";
import { PortalHeading, PortalPage, SchemaScript } from "../../components/portal-components";
import { PasswordCard } from "../password-card";

type Props = { params: Promise<{ tipo: string }> };
const siteOrigin = (process.env.SITE_URL || "https://yugiohforbiddenmemories.com").replace(/\/$/, "");
const absoluteUrl = (path: string) => `${siteOrigin}${path}`;

export function generateStaticParams() {
  return [...new Set(localCards.map((card) => taxonomySlug(card.type)))].map((tipo) => ({ tipo }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const tipo = (await params).tipo;
  const cards = await getCards();
  const label = cards.find((card) => taxonomySlug(card.type) === taxonomySlug(tipo))?.type || tipo;
  const canonicalSlug = taxonomySlug(label);
  const title = `Passwords de cartas ${label} | Yu-Gi-Oh! Forbidden Memories`;
  const description = `Consulte códigos, imagens, ATK, DEF, atributos e custos das cartas do tipo ${label} em Yu-Gi-Oh! Forbidden Memories.`;
  return { title, description, alternates: { canonical: `/passwords/${canonicalSlug}/` }, openGraph: { title, description }, twitter: { title, description } };
}

export default async function PasswordTypePage({ params }: Props) {
  const raw = (await params).tipo;
  const cards = await getCards();
  const passwordCards = cards.filter((card) => card.password);
  const filtered = passwordCards.filter((card) => taxonomySlug(card.type) === taxonomySlug(raw));
  const label = filtered[0]?.type || raw;
  const types = [...new Set(passwordCards.map((card) => card.type))].sort((a, b) => a.localeCompare(b, "pt-BR"));
  const averageAtk = filtered.length ? Math.round(filtered.reduce((total, card) => total + card.atk, 0) / filtered.length) : 0;
  const maximumAtk = filtered.length ? Math.max(...filtered.map((card) => card.atk)) : 0;
  const pageUrl = absoluteUrl(`/passwords/${taxonomySlug(label)}/`);
  const faq = [
    { q: `Onde encontrar passwords de cartas ${label}?`, a: `Esta página reúne os códigos de todas as cartas ${label} recebidas do catálogo, acompanhados por imagem, atributo, ATK, DEF e custo em estrelas.` },
    { q: `Como usar o código de uma carta ${label}?`, a: "Abra Password no menu principal, digite os oito números e confirme. Para adquirir a carta, será necessário possuir as estrelas exigidas." },
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
        description: `Códigos e informações das cartas ${label} em Yu-Gi-Oh! Forbidden Memories.`,
        inLanguage: "pt-BR",
        breadcrumb: { "@id": `${pageUrl}#breadcrumb` },
        mainEntity: { "@id": `${pageUrl}#lista` },
        hasPart: [{ "@id": `${pageUrl}#dataset` }, { "@id": `${pageUrl}#faq` }],
      },
      {
        "@type": "ItemList",
        "@id": `${pageUrl}#lista`,
        name: `Passwords de cartas ${label}`,
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
        name: `Base de passwords de cartas ${label}`,
        description: `Passwords, atributos, estatísticas e custos das cartas ${label} em Yu-Gi-Oh! Forbidden Memories.`,
        url: pageUrl,
        creator: { "@type": "Organization", name: "Yu-Gi-Oh! Forbidden Memories", url: siteOrigin },
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

  return <PortalPage eyebrow="PASSWORDS POR TIPO" title="Códigos de cartas" accent={label} lead={`Consulte visualmente os passwords, atributos, estatísticas e custos das cartas ${label} cadastradas.`}>
    <nav className="password-crumb shell" aria-label="Navegação estrutural"><a href="/">Início</a><span>›</span><a href="/passwords/">Passwords</a><span>›</span><strong>{label}</strong></nav>

    <section className="password-answer"><div className="shell password-answer-grid">
      <article className="password-answer-box"><small>RESPOSTA RÁPIDA</small><h2>Passwords de cartas {label}</h2><p>Foram encontradas <strong>{filtered.length} cartas</strong> do tipo {label} com password catalogado. Use o código de oito dígitos no menu Password e confira o custo antes de comprar.</p></article>
      <dl className="password-metrics">
        <div><dt>Cartas do tipo</dt><dd>{filtered.length}</dd></div>
        <div><dt>ATK médio</dt><dd>{averageAtk}</dd></div>
        <div><dt>Maior ATK</dt><dd>{maximumAtk}</dd></div>
        <div><dt>Tipos disponíveis</dt><dd>{types.length}</dd></div>
      </dl>
    </div></section>

    <section className="portal-section password-catalog-section" id="lista"><div className="shell">
      <div className="password-search-panel"><div className="filter-chips" aria-label="Trocar tipo de carta"><a href="/passwords/">Todas</a>{types.map((type) => <a aria-current={taxonomySlug(type) === taxonomySlug(raw) ? "page" : undefined} href={`/passwords/${taxonomySlug(type)}/`} key={type}>{type}</a>)}</div><p className="password-search-hint">Filtro atual: <strong>{label}</strong>.</p></div>
      <PortalHeading eyebrow="CATÁLOGO VISUAL" title={`${filtered.length} cartas`} accent="encontradas" />
      <p className="password-type-intro">Cada card combina a arte oficial recebida do WordPress com password, atributo, ATK, DEF e custo em estrelas. Abra a ficha para consultar também drops e detalhes completos.</p>
      {filtered.length > 0 ? <div className="password-visual-grid">{filtered.map((card) => <PasswordCard card={card} key={card.slug} />)}</div> : <div className="portal-empty">Nenhuma carta deste tipo possui password catalogado.</div>}
      <a className="password-type-back" href="/passwords/">← Voltar para todos os passwords</a>
    </div></section>

    <article className="password-guide shell">
      <header><small>CONTEÚDO SEO · AEO · GEO</small><h2>Como usar passwords de cartas <span>{label}</span></h2><p>Os códigos desta categoria identificam cartas do tipo {label}; o processo de compra e a exigência de estrelas são os mesmos das demais cartas.</p></header>
      <div className="password-guide-copy"><section><h3>Como escolher uma carta {label}?</h3><p>Compare ATK, DEF, atributo e custo. Cartas com estatísticas maiores nem sempre são a melhor compra se consumirem estrelas que podem ser usadas em várias opções mais acessíveis.</p></section><section><h3>Quando consultar a ficha completa?</h3><p>Abra a carta antes de decidir. A ficha mostra o password novamente e permite comparar o preço com as alternativas de drop, os duelistas disponíveis e os ranks necessários.</p></section></div>
    </article>

    <section className="password-faq" id="faq"><div className="shell"><PortalHeading eyebrow={`DÚVIDAS SOBRE ${label}`} title="Perguntas" accent="frequentes" /><div className="password-faq-list">{faq.map((item, index) => <details open={index === 0} key={item.q}><summary>{item.q}</summary><p>{item.a}</p></details>)}</div></div></section>
    <SchemaScript data={schema} />
  </PortalPage>;
}
