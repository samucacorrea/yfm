import type { CardRecord } from "../../lib/catalog";
import { getCardImage } from "../../lib/card-images";

export function CardVisual({ card, compact = false }: { card: CardRecord; compact?: boolean }) {
  const image = getCardImage(card.slug);
  const source = card.image || image?.src;
  if (source) {
    return (
      <figure className={`real-card${compact ? " real-card-compact" : ""}`}>
        <img
          src={source}
          width={image?.width || 350}
          height={image?.height || 511}
          alt={`Carta ${card.name} de Yu-Gi-Oh! Forbidden Memories`}
          loading={compact ? "lazy" : "eager"}
          decoding="async"
          referrerPolicy="no-referrer"
        />
      </figure>
    );
  }
  const initials = card.name.split(" ").map((part) => part[0]).join("").slice(0, 3);
  return (
    <div className={`game-card${compact ? " game-card-compact" : ""}`} aria-label={`Representação visual de ${card.name}`}>
      <div className="game-card-name">{card.name}</div>
      <div className="game-card-level">{"✦".repeat(Math.min(card.level, 8))}</div>
      <div className="game-card-art"><span>{initials}</span><b>龍</b></div>
      <div className="game-card-type">[{card.type} / {card.attribute}]</div>
      <div className="game-card-description">{card.summary}</div>
      <div className="game-card-stats">ATK/{card.atk} DEF/{card.def}</div>
    </div>
  );
}
