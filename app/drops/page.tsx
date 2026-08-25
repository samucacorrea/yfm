import type { Metadata } from "next";
import "../portal.css";
import { getDuelists } from "../../lib/data";
import { PortalHeading, PortalPage, SchemaScript } from "../components/portal-components";

export const metadata: Metadata = { title: "Drops por duelista | Yu-Gi-Oh! Forbidden Memories", description: "Consulte personagens, pools S/A POW, S/A TEC e B-C-D e descubra quais cartas cada duelista pode dropar." };
export default async function DropsPage() {
  const duelists = await getDuelists();
  const schema = { "@context": "https://schema.org", "@type": "CollectionPage", name: "Drops de Yu-Gi-Oh! Forbidden Memories", mainEntity: { "@type": "ItemList", itemListElement: duelists.map((duelist, index) => ({ "@type": "ListItem", position: index + 1, name: duelist.name, url: `/drops/${duelist.slug}/` })) } };
  return <PortalPage eyebrow="BUSCA REVERSA · PERSONAGENS" title="Drops por" accent="duelista" lead="Escolha um personagem e consulte as três bolsas de recompensa: S/A POW, S/A TEC e B-C-D.">
    <section className="portal-section"><div className="shell"><PortalHeading eyebrow="PERSONAGENS CATALOGADOS" title={`${duelists.length} duelistas`} accent="disponíveis"/><div className="duelist-grid">{duelists.map((duelist) => <a className="duelist-tile" href={`/drops/${duelist.slug}/`} key={duelist.slug}><div className="duelist-portrait">{duelist.squareImage?<img src={duelist.squareImage} alt={duelist.name} loading="lazy"/>:<b>{duelist.initial}</b>}{duelist.order>0&&<span>{duelist.order}</span>}</div><div>{duelist.location&&<small>{duelist.location}</small>}<h2>{duelist.name}</h2>{duelist.bio&&<p>{duelist.bio}</p>}<b>Ver todas as bolsas →</b></div></a>)}</div></div></section>
    <section className="portal-section portal-alt"><div className="shell"><PortalHeading eyebrow="ENTENDA OS RANKS" title="Três bolsas de" accent="drop"/><div className="pool-explain"><article><b>S/A POW</b><p>Recompensas ofensivas para vitórias rápidas e dominantes.</p></article><article><b>S/A TEC</b><p>Bolsa técnica para duelos longos, variados e controlados.</p></article><article><b>B-C-D</b><p>Recompensas intermediárias que também possuem cartas exclusivas.</p></article></div></div></section><SchemaScript data={schema}/>
  </PortalPage>;
}
