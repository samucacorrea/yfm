import type { CardRecord } from "../../lib/catalog";
import { CardVisual } from "../components/card-visual";

export function PasswordCard({ card }: { card: CardRecord }) {
  const formattedPassword = card.password.replace(/(\d{4})(?=\d)/, "$1 ");

  return <article className="password-visual-card">
    <a className="password-visual-art" href={`/cartas/${card.slug}/`} aria-label={`Abrir ficha de ${card.name}`}>
      <CardVisual card={card} compact />
    </a>
    <div className="password-visual-copy">
      <small>#{String(card.id).padStart(3, "0")} · {card.attribute}</small>
      <h2><a href={`/cartas/${card.slug}/`}>{card.name}</a></h2>
      {card.namePt && card.namePt !== card.name && <p className="password-card-translation">{card.namePt}</p>}
      <div className="password-code-block">
        <span>Password</span>
        <strong aria-label={`Password ${card.password}`}>{formattedPassword}</strong>
      </div>
      <dl className="password-card-stats">
        <div><dt>ATK</dt><dd>{card.atk}</dd></div>
        <div><dt>DEF</dt><dd>{card.def}</dd></div>
      </dl>
      <div className="password-card-footer">
        <span>{card.type}</span>
        <b>{card.price ? `${card.price.toLocaleString("pt-BR")} ★` : "Custo não informado"}</b>
      </div>
      <a className="password-card-link" href={`/cartas/${card.slug}/`}>Ver ficha completa →</a>
    </div>
  </article>;
}
