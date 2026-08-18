import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";

export function PortalPage({eyebrow,title,accent,lead,children}:{eyebrow:string;title:string;accent:string;lead:string;children:React.ReactNode}){return <main className="portal-page"><SiteHeader solid/><header className="portal-hero"><div className="shell"><p>{eyebrow}</p><h1>{title} <span>{accent}</span></h1><div className="portal-lead">{lead}</div></div></header>{children}<SiteFooter/></main>}
export function PortalHeading({eyebrow,title,accent,link,href}:{eyebrow?:string;title:string;accent?:string;link?:string;href?:string}){return <div className="portal-heading"><div>{eyebrow&&<small>{eyebrow}</small>}<h2>{title} {accent&&<span>{accent}</span>}</h2></div>{link&&href&&<a href={href}>{link} →</a>}</div>}
export function PortalFaq({items}:{items:Array<{q:string;a:string}>}){return <div className="portal-faq">{items.map((item,i)=><details open={i===0} key={item.q}><summary>{item.q}</summary><p>{item.a}</p></details>)}</div>}
export function SchemaScript({data}:{data:unknown}){return <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(data)}}/>}
