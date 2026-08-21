import type { Metadata } from "next";
import { getCards, getDuelist } from "../../../lib/data";
import { duelists as localDuelists } from "../../../lib/portal-content";
import { DuelistDetail } from "../../components/duelist-detail";
import { PortalPage } from "../../components/portal-components";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() { return localDuelists.map((duelist) => ({ slug: duelist.slug })); }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const duelist = await getDuelist((await params).slug);
  if (!duelist) return { title: "Duelista não encontrado | Yu-Gi-Oh! Forbidden Memories" };
  const title = `Drops do ${duelist.name}: cartas, taxas e ranks | Yu-Gi-Oh! Forbidden Memories`;
  const description = duelist.answer || duelist.about || `Drops de ${duelist.name} em Yu-Gi-Oh! Forbidden Memories.`;
  const images = duelist.heroImage ? [{ url: duelist.heroImage, alt: duelist.name }] : [];
  return { title, description, openGraph: { title, description, images }, twitter: { card: images.length ? "summary_large_image" : "summary", title, description, images: images.map((image) => image.url) } };
}

export default async function DuelistPage({ params }: Props) {
  const slug = (await params).slug;
  const [duelist, cards] = await Promise.all([getDuelist(slug), getCards()]);
  if (!duelist) return <PortalPage eyebrow="ERRO 404" title="Duelista" accent="não encontrado" lead=""><section className="portal-section"><div className="shell"><a className="portal-button" href="/drops/">Ver duelistas</a></div></section></PortalPage>;
  return <DuelistDetail duelist={duelist} cards={cards} />;
}
