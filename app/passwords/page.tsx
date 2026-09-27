import type { Metadata } from "next";
import "../portal.css";
import "./passwords.css";
import { getCards } from "../../lib/data";
import { absoluteSiteUrl } from "../../lib/site";
import { taxonomySlug } from "../../lib/wordpress-data";
import { PortalPage, SchemaScript } from "../components/portal-components";
import { PasswordCard } from "./password-card";
import {
  bestValueCards,
  formatDateBr,
  formatPassword,
  INFINITE_STARS_GAMESHARK_CODE,
  isPurchasable,
  MAX_STAR_COST,
  mostSearchedPasswordCards,
  PASSWORDS_AUTHOR,
  PASSWORDS_PER_PAGE,
  PASSWORDS_PUBLISHED_AT,
  PASSWORDS_UPDATED_AT,
  strongestPurchasableCard,
} from "./password-data";
import { PasswordFilters, passwordSort, sortPasswordCards } from "./password-filters";

type SearchParams = { busca?: string; tipo?: string; ordem?: string; compraveis?: string; pagina?: string };
const absoluteUrl = absoluteSiteUrl;
const pageUrl = absoluteUrl("/passwords/");

function validPage(value?: string) {
  const parsed = Number.parseInt(value || "1", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

export async function generateMetadata({ searchParams }: { searchParams: Promise<SearchParams> }): Promise<Metadata> {
  const params = await searchParams;
  const year = new Date().getFullYear();
  const title = "Passwords Yu-Gi-Oh! Forbidden Memories: todos os códigos";
  const description = `Todos os passwords de Yu-Gi-Oh! Forbidden Memories (PS1) com custo em estrelas, filtro por tipo e o código de estrelas infinitas. Atualizado em ${year}.`;
  const hasFilter = Boolean(params.busca || params.tipo || params.compraveis === "1" || (params.ordem && params.ordem !== "numero-asc"));
  const page = validPage(params.pagina);
  const canonical = !hasFilter && page > 1 ? `/passwords/?pagina=${page}` : "/passwords/";
  const canonicalUrl = absoluteUrl(canonical);
  return {
    title,
    description,
    keywords: ["password yu gi oh forbidden memories", "códigos yu gi oh forbidden memories", "senhas forbidden memories", "estrelas infinitas ps1"],
    alternates: { canonical, types: { "text/markdown": "/passwords.md" } },
    openGraph: { title, description, url: canonicalUrl, siteName: "Yu-Gi-Oh! Forbidden Memories", type: "website" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function PasswordsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const cards = await getCards();
  const params = await searchParams;
  const query = (params.busca || "").trim();
  const normalizedQuery = query.toLocaleLowerCase("pt-BR");
  const selectedType = taxonomySlug(params.tipo || "");
  const order = passwordSort(params.ordem);
  const purchasableOnly = params.compraveis === "1";
  const passwordCards = cards.filter((card) => card.password);
  const cardsWithoutPassword = cards.filter((card) => !card.password);
  const maxCostCards = passwordCards.filter((card) => card.price === MAX_STAR_COST);
  const purchasableCards = passwordCards.filter(isPurchasable);
  const matchedCards = passwordCards.filter((card) => {
    const matchesQuery = !normalizedQuery || [card.name, card.namePt, card.type, card.attribute, card.password, card.id]
      .some((value) => String(value).toLocaleLowerCase("pt-BR").includes(normalizedQuery));
    const matchesType = !selectedType || taxonomySlug(card.type) === selectedType;
    return matchesQuery && matchesType && (!purchasableOnly || isPurchasable(card));
  });
  const filtered = sortPasswordCards(matchedCards, order);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PASSWORDS_PER_PAGE));
  const currentPage = Math.min(validPage(params.pagina), totalPages);
  const pageOffset = (currentPage - 1) * PASSWORDS_PER_PAGE;
  const visibleCards = filtered.slice(pageOffset, pageOffset + PASSWORDS_PER_PAGE);
  const types = [...new Set(passwordCards.map((card) => card.type))].sort((a, b) => a.localeCompare(b, "pt-BR"));
  const typeOptions = types.map((name) => ({ name, count: passwordCards.filter((card) => card.type === name).length }));
  const popularCards = mostSearchedPasswordCards(cards);
  const valueCards = bestValueCards(cards);
  const strongestCard = strongestPurchasableCard(cards);
  const exodia = popularCards.find((card) => card.name.toLocaleLowerCase("en-US").includes("exodia"));
  const blueEyes = popularCards.find((card) => card.slug.includes("blue-eyes"));

  const pageHref = (page: number) => {
    const next = new URLSearchParams();
    if (query) next.set("busca", query);
    if (selectedType) next.set("tipo", selectedType);
    if (order !== "numero-asc") next.set("ordem", order);
    if (purchasableOnly) next.set("compraveis", "1");
    if (page > 1) next.set("pagina", String(page));
    const search = next.toString();
    return `/passwords/${search ? `?${search}` : ""}`;
  };

  const faq = [
    {
      q: "Onde digitar passwords em Yu-Gi-Oh! Forbidden Memories?",
      a: "No menu principal do jogo, abra a opção Password, digite os oito números exibidos nesta página e confirme. O jogo localizará a carta e mostrará seu custo em estrelas. A aquisição somente será concluída quando sua conta possuir estrelas suficientes para pagar o valor solicitado.",
    },
    {
      q: "Digitar o password entrega a carta gratuitamente?",
      a: "Não. O password apenas identifica a carta no catálogo interno de Yu-Gi-Oh! Forbidden Memories. Depois de informar o código, o jogo cobra o custo indicado em estrelas. Cartas muito caras podem exigir drops, fusões ou cheats, porque alcançar o valor necessário normalmente não é viável.",
    },
    {
      q: "Todas as cartas podem ser compradas por password?",
      a: `Não. A base possui ${cards.length} cartas, mas ${passwordCards.length} apresentam password e ${cardsWithoutPassword.length} não possuem código cadastrado. Além disso, cartas que custam ${MAX_STAR_COST.toLocaleString("pt-BR")} estrelas atingem o limite do jogo e, na prática normal, devem ser obtidas por drop, fusão ou ritual.`,
    },
    {
      q: "Como encontrar rapidamente o código de uma carta?",
      a: "Use a busca por nome, número, atributo ou pelo próprio password. O filtro de tipo reduz a lista para uma categoria, enquanto a ordenação organiza por número, custo ou ATK. Cada resultado possui link para a ficha completa, com detalhes adicionais sobre drops e obtenção.",
    },
    {
      q: "Qual o password do Exodia em Forbidden Memories?",
      a: exodia ? `O password de ${exodia.name} é ${formatPassword(exodia.password)} e seu custo registrado é ${exodia.price.toLocaleString("pt-BR")} estrelas. Esse código corresponde à peça central do Exodia; braços e pernas possuem passwords próprios. Consulte a tabela de mais buscados para abrir cada ficha individual.` : "A peça central do Exodia não foi localizada na base atual. Use a busca do catálogo para conferir se o nome foi atualizado no WordPress. As cinco peças possuem registros independentes, portanto cada braço, perna e a cabeça utilizam um password diferente.",
    },
    {
      q: "Qual o password do Dragão Branco de Olhos Azuis?",
      a: blueEyes ? `O password de ${blueEyes.name} é ${formatPassword(blueEyes.password)} e o custo registrado é ${blueEyes.price.toLocaleString("pt-BR")} estrelas. Digite os oito números no menu Password. Como o preço pode atingir o limite do jogo, compare também os duelistas e as alternativas de drop na ficha da carta.` : "O Dragão Branco de Olhos Azuis não foi localizado na base atual. Pesquise pelo nome em inglês no catálogo e abra a ficha correspondente. O resultado, quando disponível no WordPress, mostra o password, o custo em estrelas, os atributos e as alternativas de obtenção.",
    },
    {
      q: "Existe password de estrelas infinitas?",
      a: `Não existe password interno para estrelas infinitas em Forbidden Memories. O código ${INFINITE_STARS_GAMESHARK_CODE} é um cheat GameShark citado pela comunidade para emuladores. Faça backup do save antes de testar: cheats podem corromper o progresso, alterar resultados e não são permitidos em categorias oficiais de speedrun.`,
    },
    {
      q: "Qual a carta mais forte que dá para comprar com password?",
      a: strongestCard ? `Entre as cartas com password e custo abaixo de ${MAX_STAR_COST.toLocaleString("pt-BR")} estrelas, ${strongestCard.name} possui o maior ATK calculado na base: ${strongestCard.atk}. Seu código é ${formatPassword(strongestCard.password)} e custa ${strongestCard.price.toLocaleString("pt-BR")} estrelas. O resultado muda automaticamente quando os dados do WordPress são atualizados.` : `Nenhuma carta com custo válido abaixo de ${MAX_STAR_COST.toLocaleString("pt-BR")} estrelas foi localizada na base atual. O cálculo considera apenas registros com password, preço positivo e valor inferior ao limite. Quando o WordPress receber preços compráveis, esta resposta será atualizada automaticamente com a carta de maior ATK.`,
    },
  ];

  const howToSteps = [
    "Abra a opção Password no menu principal.",
    "Digite os oito números do código da carta.",
    "Confira o nome, a imagem e o custo em estrelas.",
    "Confirme a compra se possuir estrelas suficientes.",
  ];
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
        name: "Passwords Yu-Gi-Oh! Forbidden Memories: todos os códigos",
        description: "Passwords das cartas de Yu-Gi-Oh! Forbidden Memories com custos, filtros, guia e perguntas frequentes.",
        inLanguage: "pt-BR",
        datePublished: PASSWORDS_PUBLISHED_AT,
        dateModified: PASSWORDS_UPDATED_AT,
        author: { "@type": "Person", name: PASSWORDS_AUTHOR.name, url: PASSWORDS_AUTHOR.url },
        publisher: { "@type": "Organization", name: "Yu-Gi-Oh! Forbidden Memories", url: absoluteUrl("/"), logo: { "@type": "ImageObject", url: absoluteUrl("/logo.webp") } },
        breadcrumb: { "@id": `${pageUrl}#breadcrumb` },
        mainEntity: { "@id": `${pageUrl}#lista` },
        hasPart: [{ "@id": `${pageUrl}#dataset` }, { "@id": `${pageUrl}#como-usar` }, { "@id": `${pageUrl}#faq` }],
      },
      {
        "@type": "ItemList",
        "@id": `${pageUrl}#lista`,
        name: "Lista de passwords das cartas",
        numberOfItems: filtered.length,
        itemListElement: visibleCards.map((card, index) => ({ "@type": "ListItem", position: pageOffset + index + 1, name: card.name, url: absoluteUrl(`/cartas/${card.slug}/`) })),
      },
      {
        "@type": "Dataset",
        "@id": `${pageUrl}#dataset`,
        name: "Base de passwords de Yu-Gi-Oh! Forbidden Memories",
        description: "Passwords de oito dígitos, estatísticas e custos das cartas catalogadas no jogo de PlayStation.",
        url: pageUrl,
        dateModified: PASSWORDS_UPDATED_AT,
        creator: { "@type": "Organization", name: "Yu-Gi-Oh! Forbidden Memories", url: absoluteUrl("/") },
        license: "https://creativecommons.org/licenses/by/4.0/",
        isAccessibleForFree: true,
        variableMeasured: ["ID", "Carta", "Password", "Tipo", "Atributo", "ATK", "DEF", "Custo em estrelas"],
      },
      {
        "@type": "HowTo",
        "@id": `${pageUrl}#como-usar`,
        name: "Como digitar um password em Yu-Gi-Oh! Forbidden Memories",
        step: howToSteps.map((text, index) => ({ "@type": "HowToStep", position: index + 1, text })),
      },
      {
        "@type": "FAQPage",
        "@id": `${pageUrl}#faq`,
        mainEntity: faq.map((item) => ({ "@type": "Question", name: item.q, acceptedAnswer: { "@type": "Answer", text: item.a } })),
      },
    ],
  };

  return <PortalPage
    eyebrow="CÓDIGOS · PLAYSTATION 1"
    title="Passwords Yu-Gi-Oh!"
    accent="Forbidden Memories"
    lead="Todos os códigos das cartas, custos em estrelas e filtros para encontrar rapidamente o password correto."
    meta={<><time dateTime={PASSWORDS_UPDATED_AT}>Atualizado em {formatDateBr(PASSWORDS_UPDATED_AT)}</time><span>Por {PASSWORDS_AUTHOR.label}</span></>}
  >
    <nav className="password-crumb shell" aria-label="Navegação estrutural"><a href="/">Início</a><span>›</span><strong>Passwords</strong></nav>

    <section className="password-answer"><div className="shell">
      <article className="password-answer-box">
        <small>RESPOSTA RÁPIDA</small>
        <p className="password-answer-title">Como usar os passwords?</p>
        <p>Abra <strong>Password</strong> no menu principal, digite os oito números e confirme. O código identifica a carta, mas você ainda precisa pagar o <strong>custo em estrelas</strong> exibido pelo jogo.</p>
      </article>
    </div></section>

    <section className="password-popular-section shell" aria-labelledby="passwords-populares-title">
      <header><small>CONSULTA RÁPIDA</small><p className="password-section-title" id="passwords-populares-title">Passwords mais buscados</p><p>Exodia, Blue-Eyes, Dark Magician e outras cartas procuradas com frequência.</p></header>
      <div className="password-table-wrap"><table><caption>Passwords mais buscados em Yu-Gi-Oh! Forbidden Memories</caption><thead><tr><th scope="col">Carta</th><th scope="col">Password</th><th scope="col">Custo</th><th scope="col">Ficha</th></tr></thead><tbody>{popularCards.map((card) => <tr id={`password-${card.slug}`} key={card.slug}><th scope="row">{card.name}</th><td><code>{formatPassword(card.password)}</code></td><td>{card.price.toLocaleString("pt-BR")} ★</td><td><a href={`/cartas/${card.slug}/`}>Ver carta →</a></td></tr>)}</tbody></table></div>
    </section>

    <section className="portal-section password-catalog-section" id="lista"><div className="shell">
      <dl className="password-metrics password-catalog-metrics">
        <div><dt>Cartas no jogo</dt><dd>{cards.length}</dd></div>
        <div><dt>Com password</dt><dd>{passwordCards.length}</dd></div>
        <div><dt>Sem password</dt><dd>{cardsWithoutPassword.length}</dd></div>
        <div><dt>Compráveis</dt><dd>{purchasableCards.length}</dd></div>
      </dl>
      <PasswordFilters types={typeOptions} total={passwordCards.length} query={query} order={order} selectedType={selectedType} purchasableOnly={purchasableOnly} />
      <p className="password-search-hint password-results-hint">Foram encontradas <strong>{filtered.length}</strong> {filtered.length === 1 ? "carta" : "cartas"}. Exibindo {visibleCards.length} na página {currentPage} de {totalPages}. {(query || selectedType || purchasableOnly || order !== "numero-asc") && <a href="/passwords/">Limpar filtros</a>}</p>
      <div className="password-catalog-heading"><small>CATÁLOGO VISUAL</small><p className="password-section-title">{filtered.length} passwords catalogados</p></div>
      {visibleCards.length > 0 ? <div className="password-visual-grid">{visibleCards.map((card) => <PasswordCard card={card} key={card.slug} />)}</div> : <div className="portal-empty">Nenhum password encontrado. Tente outro nome, tipo ou faixa de custo.</div>}
      {totalPages > 1 && <nav className="password-pagination" aria-label="Paginação do catálogo"><a aria-disabled={currentPage === 1} href={pageHref(Math.max(1, currentPage - 1))}>← Anterior</a><span>Página {currentPage} de {totalPages}</span>{Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => <a aria-current={page === currentPage ? "page" : undefined} href={pageHref(page)} key={page}>{page}</a>)}<a aria-disabled={currentPage === totalPages} href={pageHref(Math.min(totalPages, currentPage + 1))}>Próxima →</a></nav>}
    </div></section>

    <article className="password-guide shell" id="guia-passwords">
      <header><p className="password-guide-title">Guia completo de passwords</p><p>Respostas diretas sobre códigos, estrelas, cartas sem password e as melhores compras do jogo.</p></header>
      <nav className="password-guide-nav" aria-label="Índice do guia de passwords"><b>Neste guia</b><a href="#estrelas-infinitas">Estrelas infinitas</a><a href="#cartas-sem-password">Cartas sem password</a><a href="#custo-maximo">999.999 estrelas</a><a href="#melhores-cartas-baratas">Melhores compras</a><a href="#o-que-e-password">O que é password?</a><a href="#como-digitar">Como usar?</a></nav>
      <div className="password-guide-copy">
        <section id="estrelas-infinitas">
          <h2>Qual o password de estrelas infinitas em Forbidden Memories?</h2>
          <p className="password-direct-answer">Não existe password de estrelas infinitas no jogo; existe apenas um cheat GameShark usado em emuladores de PlayStation.</p>
          <p>O código citado pela comunidade é <code className="password-cheat-code">{INFINITE_STARS_GAMESHARK_CODE}</code>. Faça backup do save antes de ativá-lo.</p>
          <div className="password-emulator-grid"><div><h3>Como ativar no DuckStation</h3><ol><li>Abra as propriedades de Yu-Gi-Oh! Forbidden Memories.</li><li>Entre em Cheats e escolha adicionar um novo código.</li><li>Cole o código GameShark, salve e marque-o como ativo.</li><li>Reinicie o jogo e confira a quantidade de estrelas.</li></ol></div><div><h3>Como ativar no ePSXe</h3><ol><li>Abra o gerenciador de cheats usado com o ePSXe.</li><li>Selecione o jogo e crie uma nova entrada GameShark.</li><li>Informe o código, salve e ative antes de iniciar a emulação.</li><li>Carregue o jogo e valide as estrelas em um save de teste.</li></ol></div></div>
          <aside className="password-warning"><strong>Atenção:</strong> cheats podem corromper ou alterar o save e são proibidos em speedruns. Use somente em uma cópia de segurança.</aside>
        </section>

        <section id="cartas-sem-password">
          <h2>Por que são {passwordCards.length} passwords e não {cards.length} cartas?</h2>
          <p className="password-direct-answer">O jogo possui {cards.length} cartas, mas apenas {passwordCards.length} têm password; as outras {cardsWithoutPassword.length} precisam de métodos alternativos.</p>
          <p>As cartas abaixo não possuem código na base. Abra a ficha para consultar possibilidades de fusão, ritual ou drop.</p>
          <ul className="password-missing-list">{cardsWithoutPassword.map((card) => <li key={card.slug}><a href={`/cartas/${card.slug}/`}><span>#{String(card.id).padStart(3, "0")}</span><strong>{card.name}</strong><em>Ver formas de obter →</em></a></li>)}</ul>
        </section>

        <section id="custo-maximo">
          <h2>O que significa custo de 999.999 estrelas?</h2>
          <p className="password-direct-answer">O valor de 999.999 estrelas representa o limite do jogo e torna a compra normal dessas cartas praticamente inviável.</p>
          <p>A base possui <strong>{maxCostCards.length} cartas</strong> nesse valor. Sem cheat, o caminho real costuma ser drop ou fusão; use o filtro para consultar apenas preços inferiores ao limite.</p>
          <a className="password-guide-action" href="/passwords/?compraveis=1">Ver somente cartas compráveis →</a>
        </section>

        <section id="melhores-cartas-baratas">
          <h2>Quais as melhores cartas baratas para comprar com password?</h2>
          <p className="password-direct-answer">O ranking compara cartas compráveis com pelo menos 1.500 ATK e prioriza a maior relação entre ataque e custo.</p>
          <p>O critério original desta página é <strong>ATK ÷ custo em estrelas</strong>; empates favorecem maior ATK e depois menor número da carta.</p>
          <div className="password-table-wrap"><table><caption>Top {valueCards.length} cartas por ATK por estrela</caption><thead><tr><th scope="col">Carta</th><th scope="col">ATK / DEF</th><th scope="col">Custo</th><th scope="col">Password</th><th scope="col">Ficha</th></tr></thead><tbody>{valueCards.map((card) => <tr key={card.slug}><th scope="row">{card.name}</th><td>{card.atk} / {card.def}</td><td>{card.price.toLocaleString("pt-BR")} ★</td><td><code>{formatPassword(card.password)}</code></td><td><a href={`/cartas/${card.slug}/`}>Abrir →</a></td></tr>)}</tbody></table></div>
        </section>

        <section id="o-que-e-password"><h2>O que é um password em Forbidden Memories?</h2><p className="password-direct-answer">Um password é o código numérico de oito dígitos que identifica uma carta no catálogo interno do jogo.</p><p>Ele permite localizar a carta e consultar seu preço, mas não garante uma cópia gratuita nem substitui as estrelas exigidas.</p></section>
        <section id="como-digitar"><h2>Como digitar um password no jogo?</h2><p className="password-direct-answer">Abra Password no menu principal, informe os oito números, confira a carta exibida e confirme a compra com estrelas.</p><ol>{howToSteps.map((step) => <li key={step}>{step}</li>)}</ol></section>
        <section id="estrelas"><h2>Por que o jogo cobra estrelas pelos passwords?</h2><p className="password-direct-answer">As estrelas funcionam como moeda e equilibram o acesso direto às cartas encontradas por seus respectivos códigos numéricos.</p><p>Quanto mais rara ou poderosa a carta, maior pode ser o preço, chegando ao limite de 999.999 estrelas.</p></section>
        <section id="password-ou-drop"><h2>É melhor usar password ou farmar drops?</h2><p className="password-direct-answer">Use password quando o custo for acessível; para valores extremos, compare drops e fusões antes de gastar suas estrelas.</p><p>A ficha de cada carta reúne as opções catalogadas, permitindo comparar preço, duelistas, ranks e probabilidades.</p></section>
      </div>
    </article>

    <section className="password-faq" id="faq"><div className="shell">
      <header className="password-faq-heading"><small>DÚVIDAS SOBRE CÓDIGOS</small><p className="password-section-title">Perguntas frequentes</p></header>
      <div className="password-faq-list">{faq.map((item, index) => <details open={index === 0} key={item.q}><summary>{item.q}</summary><p>{item.a}</p></details>)}</div>
    </div></section>
    <SchemaScript data={schema} />
  </PortalPage>;
}
