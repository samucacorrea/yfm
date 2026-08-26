import type { Metadata } from "next";
import "../../exact-card.css";
import "../mods.css";
import { getMod } from "../../../lib/data";
import { SiteFooter } from "../../components/site-footer";
import { SiteHeader } from "../../components/site-header";
import { SchemaScript } from "../../components/portal-components";

type Props = { params: Promise<{ slug: string }> };

const siteOrigin = (process.env.SITE_URL || "https://yugiohforbiddenmemories.com").replace(/\/$/, "");
const absoluteUrl = (path: string) => `${siteOrigin}${path}`;
const plainText = (value = "") => value.replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
const multiplierLabel = (value: string) => value && /^\d+(?:[.,]\d+)?$/.test(value) ? `${value}x` : value;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const mod = await getMod((await params).slug);
  if (!mod) return { title: "Mod não encontrado | Yu-Gi-Oh! Forbidden Memories" };
  const title = `${mod.name} | Yu-Gi-Oh! Forbidden Memories`;
  const description = mod.summary || plainText(mod.content).slice(0, 160);
  const images = mod.image ? [{ url: mod.image, alt: mod.name }] : [];
  return {
    title,
    description,
    openGraph: { title, description, siteName: "Yu-Gi-Oh! Forbidden Memories", images },
    twitter: { card: images.length ? "summary_large_image" : "summary", title, description, images: images.map((image) => image.url) },
  };
}

export default async function ModPage({ params }: Props) {
  const mod = await getMod((await params).slug);
  if (!mod) return <div className="exact-card-page exact-mod-page"><SiteHeader solid /><main className="exact-wrap mod-not-found"><p>404</p><h1>Mod não encontrado</h1><a className="mod-primary-button" href="/mods/">Ver todos os mods</a></main><SiteFooter /></div>;

  const modUrl = absoluteUrl(`/mods/${mod.slug}/`);
  const description = mod.summary || plainText(mod.content).slice(0, 240);
  const tags = mod.tags?.length ? mod.tags : (mod.tag ? [mod.tag] : []);
  const contentExists = Boolean(plainText(mod.content));
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Início", item: absoluteUrl("/") },
          { "@type": "ListItem", position: 2, name: "Mods", item: absoluteUrl("/mods/") },
          { "@type": "ListItem", position: 3, name: mod.name, item: modUrl },
        ],
      },
      {
        "@type": "SoftwareApplication",
        "@id": `${modUrl}#mod`,
        name: mod.name,
        softwareVersion: mod.version || undefined,
        author: mod.author ? { "@type": "Organization", name: mod.author } : undefined,
        description: description || undefined,
        image: mod.image,
        url: modUrl,
        downloadUrl: mod.sourceUrl || undefined,
        keywords: tags.length ? tags.join(", ") : undefined,
        isPartOf: { "@type": "VideoGame", name: "Yu-Gi-Oh! Forbidden Memories" },
      },
      ...(mod.faq.length ? [{
        "@type": "FAQPage",
        "@id": `${modUrl}#faq`,
        mainEntity: mod.faq.map((item) => ({ "@type": "Question", name: item.q, acceptedAnswer: { "@type": "Answer", text: item.a } })),
      }] : []),
    ],
  };

  const facts = [
    mod.version ? { label: "Versão", value: mod.version } : null,
    mod.multiplier ? { label: "Multiplicador", value: multiplierLabel(mod.multiplier) } : null,
    mod.baseVersion ? { label: "Versão-base", value: mod.baseVersion } : null,
    mod.tag ? { label: "Tipo de mod", value: mod.tag } : null,
  ].filter(Boolean) as Array<{ label: string; value: string }>;

  return (
    <div className="exact-card-page exact-mod-page">
      <SiteHeader solid />
      <main className="exact-wrap">
        <div className="topbar">
          <nav className="crumb" aria-label="Navegação estrutural">
            <a href="/">Início</a><span className="sep">›</span><a href="/mods/">Mods</a><span className="sep">›</span><span className="cur">{mod.name}</span>
          </nav>
          <a className="nbtn" href="/mods/">‹ Todos os mods</a>
        </div>

        <article className="modtop" id="visao-geral">
          <div className="mod-detail-art">
            {mod.image ? <img src={mod.image} alt={mod.name} /> : <span>MOD</span>}
          </div>
          <div className="mod-detail-main">
            <small>MOD PARA YU-GI-OH! FORBIDDEN MEMORIES</small>
            <h1>{mod.name}</h1>
            {tags.length ? <div className="badges">{tags.map((tag) => <span className="badge-c" key={tag}><span className="dot">✦</span>{tag}</span>)}</div> : null}
            {mod.summary && <p className="desc">{mod.summary}</p>}
            {facts.length ? <div className="mod-statboxes">{facts.map((fact) => <div className="mod-stat" key={fact.label}><span>{fact.label}</span><b>{fact.value}</b></div>)}</div> : null}
          </div>
          <aside className="cardaside mod-download-card">
            {mod.id ? <div className="id"><b>#{mod.id}</b><span>ID do mod no catálogo</span></div> : null}
            {mod.author && <><div className="aside-h">Autor</div><p>{mod.author}</p></>}
            {mod.editedFiles?.length ? <><div className="aside-h">Arquivos editados</div><ul>{mod.editedFiles.map((file) => <li key={file}>{file}</li>)}</ul></> : null}
            {mod.sourceUrl && <a className="mod-primary-button" href={mod.sourceUrl} target="_blank" rel="noopener noreferrer">Acessar download ↗</a>}
          </aside>
        </article>

        <nav className="tabs" aria-label="Seções do mod">
          <a className="tab active" href="#visao-geral">✦ Visão geral</a>
          {contentExists && <a className="tab" href="#guia">▤ Guia completo</a>}
          {mod.sourceUrl && <a className="tab" href="#download">↓ Download</a>}
          {mod.faq.length > 0 && <a className="tab" href="#faq">? FAQ</a>}
        </nav>

        {contentExists && <section id="guia" className="mod-content-section">
          <div className="sec-h"><h2>Informações <span>completas</span></h2></div>
          <div className="mod-wp-content" dangerouslySetInnerHTML={{ __html: mod.content || "" }} />
        </section>}

        {mod.sourceUrl && <section id="download" className="mod-download-section">
          <div><small>LINK INFORMADO NO WORDPRESS</small><h2>Download do <span>mod</span></h2><p>{mod.name}</p></div>
          <a className="mod-primary-button" href={mod.sourceUrl} target="_blank" rel="noopener noreferrer">Abrir página de download ↗</a>
        </section>}

        {mod.faq.length > 0 && <section id="faq" className="faq-exact mod-faq">
          <div className="sec-h"><h2>Perguntas <span>frequentes</span></h2></div>
          <div className="faq-exact-list">{mod.faq.map((item, index) => <details open={index === 0} key={item.q}><summary>{item.q}</summary><p>{item.a}</p></details>)}</div>
        </section>}
      </main>
      <SchemaScript data={schema} />
      <SiteFooter />
    </div>
  );
}
