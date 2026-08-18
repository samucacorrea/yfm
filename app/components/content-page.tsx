import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";

export type InfoItem = { label: string; title: string; text: string; href?: string; link?: string };

export function ContentPage({ eyebrow, title, accent, lead, items }: { eyebrow: string; title: string; accent: string; lead: string; items: InfoItem[] }) {
  return <main><SiteHeader solid /><section className="content-page"><div className="shell"><p className="kicker">{eyebrow}</p><h1>{title} <span>{accent}</span></h1><p className="content-lead">{lead}</p><div className="info-grid">{items.map(item => <article className="info-card" key={item.title}><small>{item.label}</small><h2>{item.title}</h2><p>{item.text}</p>{item.href && <a href={item.href}>{item.link || "Abrir →"}</a>}</article>)}</div></div></section><SiteFooter /></main>;
}
