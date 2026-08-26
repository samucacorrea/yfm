import type { Metadata } from "next";
import "../portal.css";
import "./drops-index.css";
import { getCardImage } from "../../lib/card-images";
import type { CardRecord } from "../../lib/catalog";
import { getCards, getDuelists } from "../../lib/data";
import { taxonomySlug } from "../../lib/wordpress-data";
import { CardVisual } from "../components/card-visual";
import { PortalHeading, PortalPage, SchemaScript } from "../components/portal-components";

export const metadata: Metadata = {
  title: "Drops de Yu-Gi-Oh! Forbidden Memories: cartas, duelistas e ranks",
  description: "Consulte quem dropa cada carta de Yu-Gi-Oh! Forbidden Memories, compare duelistas e entenda as bolsas S/A POW, S/A TEC e B/C/D.",
  keywords: ["drops Forbidden Memories", "quem dropa cartas Forbidden Memories", "S POW Forbidden Memories", "S TEC Forbidden Memories", "tabela de drops Yu-Gi-Oh"],
};

const siteOrigin = (process.env.SITE_URL || "https://yugiohforbiddenmemories.com").replace(/\/$/, "");
const absoluteUrl = (path: string) => `${siteOrigin}${path}`;

function cardImage(card: CardRecord) {
  return card.image || getCardImage(card.slug)?.src;
}

export default async function DropsPage() {
  const [duelists, cards] = await Promise.all([getDuelists(), getCards()]);
  const cardsByDuelist = new Map<string, CardRecord[]>();

  for (const card of cards) {
    for (const drop of card.drops) {
      const slug = drop.duelistSlug || taxonomySlug(drop.duelist);
      const current = cardsByDuelist.get(slug) || [];
      if (!current.some((item) => item.slug === card.slug)) current.push(card);
      cardsByDuelist.set(slug, current);
    }
  }

  const totalsByDuelist = new Map(duelists.map((duelist) => [duelist.slug, duelist.totalCards]));
  const relatedCount = (slug: string) => totalsByDuelist.get(slug) ?? cardsByDuelist.get(slug)?.length ?? 0;
  const dropRelations = duelists.reduce((total, duelist) => total + relatedCount(duelist.slug), 0);

  const featuredCards = cards
    .filter((card) => card.droppable || card.drops.length > 0)
    .sort((a, b) => b.drops.length - a.drops.length || b.atk - a.atk)
    .slice(0, 8);
  const duelistsWithDrops = duelists.filter((duelist) => relatedCount(duelist.slug) > 0).length;
  const faq = [
    {
      q: "Como descobrir quem dropa uma carta em Forbidden Memories?",
      a: "Abra a ficha da carta ou escolha um duelista nesta página. A ficha mostra o personagem, a bolsa de recompensa, o rank necessário e a taxa de drop catalogada.",
    },
    {
      q: "Qual é a diferença entre S/A POW e S/A TEC?",
      a: "S/A POW recompensa vitórias ofensivas e rápidas. S/A TEC depende de um duelo mais longo e técnico, com maior uso de cartas, magias, armadilhas e recursos.",
    },
    {
      q: "Cartas da bolsa B/C/D também podem ser exclusivas?",
      a: "Sim. Cada faixa de rank possui sua própria lista de recompensas, por isso uma carta pode aparecer em B/C/D e não estar disponível nas bolsas S/A.",
    },
    {
      q: "A taxa de drop muda conforme o rank?",
      a: "O rank determina qual bolsa será usada no sorteio. Dentro da bolsa correta, cada carta possui a probabilidade informada no catálogo do jogo.",
    },
  ];

  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        "@id": `${absoluteUrl("/drops/")}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Início", item: absoluteUrl("/") },
          { "@type": "ListItem", position: 2, name: "Drops", item: absoluteUrl("/drops/") },
        ],
      },
      {
        "@type": "CollectionPage",
        "@id": absoluteUrl("/drops/"),
        url: absoluteUrl("/drops/"),
        name: "Drops de Yu-Gi-Oh! Forbidden Memories por duelista e rank",
        description: "Catálogo de personagens, cartas, pools, ranks e probabilidades de drop de Yu-Gi-Oh! Forbidden Memories.",
        inLanguage: "pt-BR",
        breadcrumb: { "@id": `${absoluteUrl("/drops/")}#breadcrumb` },
        mainEntity: { "@id": `${absoluteUrl("/drops/")}#duelistas` },
        hasPart: [{ "@id": `${absoluteUrl("/drops/")}#dataset` }, { "@id": `${absoluteUrl("/drops/")}#faq` }],
      },
      {
        "@type": "ItemList",
        "@id": `${absoluteUrl("/drops/")}#duelistas`,
        name: "Duelistas com tabelas de drops",
        numberOfItems: duelists.length,
        itemListElement: duelists.map((duelist, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: duelist.name,
          url: absoluteUrl(`/drops/${duelist.slug}/`),
          image: duelist.squareImage,
        })),
      },
      {
        "@type": "Dataset",
        "@id": `${absoluteUrl("/drops/")}#dataset`,
        name: "Tabela de drops de Yu-Gi-Oh! Forbidden Memories",
        description: "Relações entre cartas, duelistas, ranks, bolsas de recompensa e taxas de drop.",
        url: absoluteUrl("/drops/"),
        creator: { "@type": "Organization", name: "Yu-Gi-Oh! Forbidden Memories", url: siteOrigin },
        license: "https://creativecommons.org/licenses/by/4.0/",
        isAccessibleForFree: true,
        variableMeasured: ["Carta", "Duelista", "Pool de recompensa", "Rank", "Taxa de drop"],
      },
      {
        "@type": "FAQPage",
        "@id": `${absoluteUrl("/drops/")}#faq`,
        mainEntity: faq.map((item) => ({
          "@type": "Question",
          name: item.q,
          acceptedAnswer: { "@type": "Answer", text: item.a },
        })),
      },
    ],
  };

  return <PortalPage eyebrow="BANCO DE DADOS · FARM" title="Drops de Yu-Gi-Oh!" accent="Forbidden Memories" lead="Descubra quem dropa cada carta, qual rank alcançar e em qual bolsa de recompensa ela aparece.">
    <nav className="drop-index-crumb shell" aria-label="Navegação estrutural"><a href="/">Início</a><span>›</span><strong>Drops</strong></nav>

    <section className="drop-answer-section"><div className="shell drop-answer-grid">
      <article className="drop-answer-box">
        <small>RESPOSTA RÁPIDA</small>
        <h2>Como funcionam os drops?</h2>
        <p>Ao vencer um duelista no Free Duel, seu rank define a bolsa usada no sorteio da recompensa: <strong>S/A POW</strong>, <strong>S/A TEC</strong> ou <strong>B/C/D</strong>. Escolha um personagem abaixo para ver as cartas, imagens, taxas e ranks disponíveis.</p>
      </article>
      <dl className="drop-index-metrics">
        <div><dt>Duelistas</dt><dd>{duelists.length}</dd></div>
        <div><dt>Com drops catalogados</dt><dd>{duelistsWithDrops}</dd></div>
        <div><dt>Cartas no banco</dt><dd>{cards.length}</dd></div>
        <div><dt>Relações de drop</dt><dd>{dropRelations}</dd></div>
      </dl>
    </div></section>

    {featuredCards.length > 0 && <section className="portal-section drop-featured-section"><div className="shell">
      <PortalHeading eyebrow="BUSCA VISUAL" title="Cartas com drops" accent="catalogados" link="Ver todas as cartas" href="/cartas/" />
      <p className="drop-section-lead">Reconheça a carta pela arte e abra sua ficha para comparar todos os personagens que podem entregá-la.</p>
      <div className="drop-featured-grid">{featuredCards.map((card) => <article className="drop-featured-card" key={card.slug}>
        <a className="drop-featured-art" href={`/cartas/${card.slug}/`}><CardVisual card={card} compact /></a>
        <div className="drop-featured-copy"><small>#{String(card.id).padStart(3, "0")} · {card.type}</small><h3><a href={`/cartas/${card.slug}/`}>{card.name}</a></h3><div className="drop-featured-stats"><span>ATK <b>{card.atk}</b></span><span>DEF <b>{card.def}</b></span></div><p>{card.drops.length > 0 ? `${card.drops.length} ${card.drops.length === 1 ? "fonte de drop" : "fontes de drop"}` : "Drop disponível"}</p><a href={`/cartas/${card.slug}/`}>Comparar drops →</a></div>
      </article>)}</div>
    </div></section>}

    <section className="portal-section portal-alt drop-duelist-section" id="duelistas"><div className="shell">
      <PortalHeading eyebrow="TABELAS POR PERSONAGEM" title={`${duelists.length} duelistas`} accent="disponíveis" />
      <p className="drop-section-lead">Cada ficha reúne as três bolsas, busca dinâmica, filtros por tipo e cards visuais com ATK, DEF e probabilidade.</p>
      <div className="drop-duelist-grid">{duelists.map((duelist) => {
        const previewCards = (cardsByDuelist.get(duelist.slug) || []).slice(0, 3);
        return <article className="drop-duelist-card" key={duelist.slug}>
          <a className="drop-duelist-portrait" href={`/drops/${duelist.slug}/`}>
            {duelist.squareImage ? <img src={duelist.squareImage} alt={duelist.name} loading="lazy" /> : <b>{duelist.initial}</b>}
            {duelist.order > 0 && <span>#{duelist.order}</span>}
          </a>
          <div className="drop-duelist-copy">
            {duelist.location && <small>{duelist.location}</small>}
            <h2><a href={`/drops/${duelist.slug}/`}>{duelist.name}</a></h2>
            {previewCards.length > 0 && <div className="drop-card-preview" aria-label={`Exemplos de cartas dropadas por ${duelist.name}`}>{previewCards.map((card) => {
              const image = cardImage(card);
              return <a href={`/cartas/${card.slug}/`} title={card.name} key={card.slug}>{image ? <img src={image} alt={`Carta ${card.name}`} loading="lazy" /> : <span>{card.name.slice(0, 1)}</span>}</a>;
            })}</div>}
            <p><b>{relatedCount(duelist.slug)}</b> cartas relacionadas no catálogo.</p>
            <a className="drop-duelist-link" href={`/drops/${duelist.slug}/`}>Ver drops, taxas e ranks →</a>
          </div>
        </article>;
      })}</div>
    </div></section>

    <article className="drop-guide shell" id="guia-de-drops">
      <header><small>GUIA COMPLETO · SEO · AEO · GEO</small><h2>Tabela de drops de <span>Forbidden Memories</span></h2><p>Use este guia para escolher o duelista certo, alcançar o rank correto e reduzir tentativas desperdiçadas durante o farm.</p></header>
      <nav aria-label="Índice do guia de drops"><b>Neste guia</b><a href="#o-que-sao-drops">O que são drops?</a><a href="#ranks-de-drop">Ranks e bolsas</a><a href="#como-farmar">Como farmar</a><a href="#tabela-duelistas">Tabela de duelistas</a></nav>
      <div className="drop-guide-copy">
        <section id="o-que-sao-drops"><h3>O que são drops em Yu-Gi-Oh! Forbidden Memories?</h3><p>Drops são as cartas recebidas após uma vitória. A recompensa não vem de uma lista única: cada oponente possui bolsas separadas por faixa de rank. Por isso, vencer o personagem certo com o resultado errado pode impedir que a carta desejada entre no sorteio.</p></section>
        <section id="ranks-de-drop"><h3>Qual a diferença entre S/A POW, S/A TEC e B/C/D?</h3><div className="drop-rank-grid"><div><b>S/A POW</b><p>Priorize dano, domínio do campo e vitória rápida. É a rota mais usada para farms ofensivos.</p></div><div><b>S/A TEC</b><p>Prolongue o duelo e use recursos variados. É a bolsa associada ao desempenho técnico.</p></div><div><b>B/C/D</b><p>Reúne recompensas intermediárias e pode conter cartas que não aparecem nas faixas S/A.</p></div></div></section>
        <section id="como-farmar"><h3>Como farmar cartas com mais eficiência?</h3><ol><li><strong>Abra a ficha da carta</strong> e confirme quais duelistas realmente a dropam.</li><li><strong>Confira a bolsa</strong> antes do duelo: POW, TEC e B/C/D possuem recompensas diferentes.</li><li><strong>Compare as taxas</strong> e escolha o personagem que seu deck vence com consistência.</li><li><strong>Registre uma sequência de duelos</strong>, pois probabilidades baixas podem exigir muitas tentativas.</li></ol></section>
        <section id="tabela-duelistas"><h3>Quais duelistas têm tabelas de drops?</h3><div className="drop-table-wrap"><table><caption>Duelistas catalogados e quantidade de cartas relacionadas</caption><thead><tr><th scope="col">Duelista</th><th scope="col">Local</th><th scope="col">Cartas catalogadas</th><th scope="col">Tabela</th></tr></thead><tbody>{duelists.map((duelist) => <tr key={duelist.slug}><th scope="row">{duelist.name}</th><td>{duelist.location || "Não informado"}</td><td>{relatedCount(duelist.slug)}</td><td><a href={`/drops/${duelist.slug}/`}>Consultar →</a></td></tr>)}</tbody></table></div></section>
      </div>
    </article>

    <section className="portal-section drop-faq-section" id="faq"><div className="shell">
      <PortalHeading eyebrow="DÚVIDAS SOBRE FARM" title="Perguntas" accent="frequentes" />
      <div className="drop-index-faq">{faq.map((item, index) => <details open={index === 0} key={item.q}><summary>{item.q}</summary><p>{item.a}</p></details>)}</div>
    </div></section>
    <SchemaScript data={schema} />
  </PortalPage>;
}
