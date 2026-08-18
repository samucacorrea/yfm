import type { Metadata } from "next";
import { getCards, getDuelist } from "../../../../lib/data";
import { duelists as localDuelists, type PoolKey } from "../../../../lib/portal-content";
import { DuelistDetail } from "../../../components/duelist-detail";
import { PortalPage } from "../../../components/portal-components";

const valid: PoolKey[] = ["s-pow", "s-tec", "b-c-d"];
const labels: Record<PoolKey, string> = { "s-pow": "S/A POW", "s-tec": "S/A TEC", "b-c-d": "B-C-D" };
type Props = { params: Promise<{ slug: string; pool: string }> };

export function generateStaticParams() { return localDuelists.flatMap((duelist) => valid.map((pool) => ({ slug: duelist.slug, pool }))); }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const values = await params;
  const duelist = await getDuelist(values.slug);
  const pool = valid.includes(values.pool as PoolKey) ? values.pool as PoolKey : undefined;
  if (!duelist || !pool) return { title: "Bolsa não encontrada | FM Codex" };
  const title = `Drops ${labels[pool]} de ${duelist.name} | FM Codex`;
  const description = `${duelist.name}: cartas, tipos e probabilidades da bolsa ${labels[pool]} em Forbidden Memories.`;
  const images = duelist.heroImage ? [{ url: duelist.heroImage, alt: duelist.name }] : [];
  return { title, description, openGraph: { title, description, images }, twitter: { card: images.length ? "summary_large_image" : "summary", title, description, images: images.map((image) => image.url) } };
}

export default async function PoolPage({ params }: Props) {
  const values = await params;
  const pool = valid.includes(values.pool as PoolKey) ? values.pool as PoolKey : undefined;
  const [duelist, cards] = await Promise.all([getDuelist(values.slug), getCards()]);
  if (!duelist || !pool) return <PortalPage eyebrow="ERRO 404" title="Bolsa" accent="não encontrada" lead=""><section className="portal-section"><div className="shell"><a className="portal-button" href="/drops/">Voltar aos drops</a></div></section></PortalPage>;
  return <DuelistDetail duelist={duelist} cards={cards} activePool={pool} />;
}
