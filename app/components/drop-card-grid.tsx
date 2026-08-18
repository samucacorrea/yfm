import type { CardRecord } from "../../lib/catalog";
import type { PoolCard } from "../../lib/portal-content";
import { CardVisual } from "./card-visual";

export function DropCardGrid({ items, cards }: { items: PoolCard[]; cards: CardRecord[] }) {
  const cardsBySlug = new Map(cards.map((card) => [card.slug, card]));
  return <div className="drop-visual-grid">
    {items.map((item) => {
      const card = cardsBySlug.get(item.cardSlug);
      return <article className="drop-visual-card" key={`${item.cardSlug}-${item.rank}`}>
        <a className="drop-visual-art" href={`/cartas/${item.cardSlug}/`} aria-label={`Ver ${item.name}`}>
          {card ? <CardVisual card={card} compact/> : <span className="drop-art-fallback">{item.name.slice(0, 2)}</span>}
        </a>
        <div className="drop-visual-body">
          <div className="drop-visual-top"><span className="drop-pool-chip">{item.rank}</span><strong className="drop-rate"><small>CHANCE</small>{item.rate}</strong></div>
          <small className="drop-card-meta">{card ? `#${String(card.id).padStart(3, "0")} · ${card.attribute}` : "CARTA CATALOGADA"}</small>
          <h3><a href={`/cartas/${item.cardSlug}/`}>{item.name}</a></h3>
          {card && card.namePt !== card.name && <p className="drop-card-translation">{card.namePt}</p>}
          <div className="drop-card-tags"><span>{card?.type || "Tipo em validação"}</span><span>{card?.rarity || "Raridade em validação"}</span></div>
          <div className="drop-card-stats"><div><small>ATK</small><b>{card?.atk ?? "—"}</b></div><div><small>DEF</small><b>{card?.def ?? "—"}</b></div></div>
          <a className="drop-detail-link" href={`/cartas/${item.cardSlug}/`}>Ver ficha completa →</a>
        </div>
      </article>;
    })}
  </div>;
}
