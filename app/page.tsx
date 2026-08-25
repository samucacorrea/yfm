import { getCardImage } from "../lib/card-images";
import { getPublishedPosts } from "../lib/wordpress";
import { getCards, getDuelists } from "../lib/data";
import { CardVisual } from "./components/card-visual";
import { SchemaScript } from "./components/portal-components";
import { SiteFooter } from "./components/site-footer";
import { SiteHeader } from "./components/site-header";

const paths = [
  { icon:"▱", title:"Buscar por carta", text:"Banco das 722 cartas", href:"/cartas/" },
  { icon:"△", title:"Por tipo / atributo", text:"Descubra quem dropa mais", href:"/cartas/tipo/dragao/" },
  { icon:"♙", title:"Drops por personagem", text:"Veja todos os drops", href:"/drops/" },
  { icon:"♜", title:"Rankings de farm", text:"Melhores para farmar cada tipo", href:"/guias/" },
];
const trending = [
  { glyph:"☥", title:"Dark Magician", meta:"Carta · Mago", rarity:"Ultra", tone:"violet", href:"/cartas/dark-magician/" },
  { glyph:"✦", title:"Blue-Eyes W. Dragon", meta:"Carta · Dragão", rarity:"Ultra", tone:"gold", href:"/cartas/blue-eyes-white-dragon/" },
  { glyph:"✷", title:"Meteor B. Dragon", meta:"Carta · Fusão", rarity:"Rara", tone:"ember", href:"/cartas/meteor-b-dragon/" },
  { glyph:"𓂀", title:"Heishin", meta:"Duelista", rarity:"Boss", tone:"red", href:"/drops/heishin/" },
  { glyph:"⚔", title:"Megamorph", meta:"Carta · Equip", rarity:"Ultra", tone:"bronze", href:"/cartas/megamorph/" },
  { glyph:"☄", title:"Twin-Headed Thunder", meta:"Carta · Thunder", rarity:"Ultra", tone:"orange", href:"/cartas/twin-headed-thunder-dragon/" },
];
const featuredCardSlugs = ["dark-magician", "blue-eyes-white-dragon", "meteor-b-dragon", "red-eyes-b-dragon", "exodia-the-forbidden", "megamorph"];
const explore = [
  { icon:"▣", title:"Passwords & Códigos", text:"As senhas de todas as cartas.", href:"/passwords/" },
  { icon:"⬡", title:"MODs", text:"Mod 15, Perfect, Remaster e mais.", href:"/mods/" },
  { icon:"▤", title:"Como jogar / Onde baixar", text:"Emuladores, PC e celular — via links.", href:"/guias/" },
  { icon:"☆", title:"Cheats & Estrelas infinitas", text:"Truques, códigos e muito mais.", href:"/guias/" },
];
export default async function Home() {
  const siteOrigin = (process.env.SITE_URL || "https://yugiohforbiddenmemories.com").replace(/\/$/, "");
  const organizationId = `${siteOrigin}/#organization`;
  const websiteSchema = { "@context": "https://schema.org", "@graph": [{ "@type": "WebSite", "@id": `${siteOrigin}/#website`, url: `${siteOrigin}/`, name: "Yu-Gi-Oh! Forbidden Memories", inLanguage: "pt-BR", publisher: { "@id": organizationId } }, { "@type": "Organization", "@id": organizationId, name: "Yu-Gi-Oh! Forbidden Memories", url: `${siteOrigin}/`, logo: { "@type": "ImageObject", url: `${siteOrigin}/logo.webp` } }] };
  const [wp, allCards, allDuelists] = await Promise.all([getPublishedPosts(3), getCards(), getDuelists()]);
  const posts = wp;
  const cardsBySlug = new Map(allCards.map((card) => [card.slug, card]));
  const duelistsBySlug = new Map(allDuelists.map((duelist) => [duelist.slug, duelist]));
  const featuredCards = featuredCardSlugs.flatMap((slug) => {
    const card = cardsBySlug.get(slug);
    return card ? [card] : [];
  });
  return <main className="template-home"><SiteHeader />
    <section className="template-hero">
      <img
        className="template-hero-bg"
        src="/bg.webp"
        alt=""
        width="1717"
        height="916"
        fetchPriority="high"
        loading="eager"
        decoding="async"
        aria-hidden="true"
      />
      <div className="field-badge"><span>FIELD</span><b>WASTELAND</b></div>
      <div className="duel-hud"><div><span>COM · LP</span><b>8000</b></div><div><span>CARTAS</span><b>35</b></div><div className="you"><span>YOU · LP</span><b>4033</b></div><div><span>CARTAS</span><b>38</b></div></div>
      <div className="template-hero-content">
        <p className="template-kicker"><span>A MAIOR REFERÊNCIA DO</span><b>YU-GI-OH! FORBIDDEN MEMORIES</b></p>
        <h1>Encontre qualquer<br/><span>carta, drop ou password do Forbidden Memories</span></h1>
        <p>Busque de forma reversa e descubra quem dropa, onde farmar e os passwords de cada carta!</p>
        <form className="template-search" action="/cartas/" method="get" id="buscar"><label className="sr-only" htmlFor="home-search">Buscar</label><i/><input id="home-search" name="busca" placeholder="Busque uma carta, personagem ou tipo..."/><button>Buscar</button></form>
        <small className="examples-label">Exemplos populares</small>
        <div className="template-chips"><a href="/cartas/tipo/dragao/">carta de dragão</a><a href="/cartas/megamorph/">quem dropa Megamorph</a><a href="/cartas/dark-magician/">password Dark Magician</a><a href="/drops/heishin/">drops do Heishin</a><a href="/guias/">estrelas infinitas</a></div>
      </div>
      <div className="classic-card-row">{featuredCards.map(card=><a href={`/cartas/${card.slug}/`} key={card.slug} aria-label={card.name}><CardVisual card={card} compact/></a>)}</div>
    </section>

    <section className="template-section"><div className="shell"><div className="template-divider"><h2>O que você <span>procura?</span></h2></div><div className="template-paths">{paths.map(item=><a className="template-path" href={item.href} key={item.title}><i>{item.icon}</i><div><h3>{item.title}</h3><p>{item.text}</p></div></a>)}</div></div></section>

    <section className="template-section"><div className="shell"><div className="template-section-head"><h2>Mais <span>buscados</span></h2><a href="/cartas/">Ver todos →</a></div><div className="trending-row">{trending.map(item=>{const slug=item.href.split("/").filter(Boolean).at(-1)||"";const fallbackImage=getCardImage(slug);const remoteImage=cardsBySlug.get(slug)?.image;const portrait=duelistsBySlug.get(slug)?.squareImage;const source=portrait||remoteImage||fallbackImage?.src;return <a className="trending-card" href={item.href} key={item.title}><div className={`trending-art ${item.tone}`}>{source?<img src={source} width={portrait?400:fallbackImage?.width||350} height={portrait?400:fallbackImage?.height||511} alt={item.title} loading="lazy" referrerPolicy="no-referrer"/>:<b>{item.glyph}</b>}<small className={item.rarity==="Boss"?"boss":""}>{item.rarity}</small></div><div><strong>{item.title}</strong><span>{item.meta}</span></div></a>})}</div></div></section>

    <section className="template-section"><div className="shell"><div className="template-section-head"><h2>Explorar <span>mais</span></h2></div><div className="explore-grid">{explore.map(item=><a href={item.href} key={item.title}><i>{item.icon}</i><div><strong>{item.title}</strong><span>{item.text}</span></div></a>)}</div></div></section>

    <section className="template-ad-section"><div className="shell"><aside className="template-ad"><div><b>Espaço publicitário · Fase 2 (opcional)</b><small>Slot reservado para AdSense — ativado quando a conta for aprovada.</small></div></aside></div></section>

    <section className="template-section"><div className="shell"><div className="template-section-head"><h2>Do <span>blog</span></h2><a href="/blog/">Ver todos os posts →</a></div><div className="template-posts">{posts.slice(0,3).map((post,index)=><a className="template-post" href={`/blog/${post.slug}/`} key={post.slug}><div className={`post-cover cover-${index+1}`}>{post.featuredImage?<img src={post.featuredImage} alt={post.featuredImageAlt||post.title.rendered} loading="lazy"/>:<b>{["𓂀","☥","✦"][index]}</b>}</div><div><h3>{post.title.rendered}</h3><span>{post.plainExcerpt}</span></div></a>)}</div></div></section>
    <SchemaScript data={websiteSchema} />
    <SiteFooter />
  </main>;
}
