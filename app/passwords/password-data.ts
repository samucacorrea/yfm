import type { CardRecord } from "../../lib/catalog";

export const PASSWORDS_AUTHOR = {
  name: "Samuel",
  label: "Samuel – yugiohforbiddenmemories.com",
  url: "https://yugiohforbiddenmemories.com/",
};
export const PASSWORDS_PUBLISHED_AT = "2026-08-26";
export const PASSWORDS_UPDATED_AT = "2026-09-27";
export const PASSWORDS_PER_PAGE = 150;
export const MAX_STAR_COST = 999999;

// TODO: validar código em emulador antes do deploy
export const INFINITE_STARS_GAMESHARK_CODE = "801D07ED 07E2 000F";

const MOST_SEARCHED_NAMES = [
  ["Exodia the Forbidden One", "Exodia the Forbidden"],
  ["Right Arm of the Forbidden One"],
  ["Left Arm of the Forbidden One"],
  ["Right Leg of the Forbidden One"],
  ["Left Leg of the Forbidden One"],
  ["Blue-Eyes White Dragon", "Blue-eyes White Dragon"],
  ["Dark Magician"],
  ["Raigeki"],
  ["Red-Eyes B. Dragon", "Red-eyes B. Dragon"],
  ["Gaia the Fierce Knight"],
  ["Summoned Skull"],
  ["Time Wizard"],
];

function normalizedName(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("en-US").replace(/[^a-z0-9]+/g, " ").trim();
}

export function mostSearchedPasswordCards(cards: CardRecord[]) {
  const found = MOST_SEARCHED_NAMES.map((aliases) => {
    const normalizedAliases = aliases.map(normalizedName);
    return cards.find((card) => normalizedAliases.includes(normalizedName(card.name)));
  }).filter((card): card is CardRecord => Boolean(card?.password));
  return [...new Map(found.map((card) => [card.slug, card])).values()];
}

export function formatPassword(password: string) {
  return password.replace(/(\d{4})(?=\d)/, "$1 ");
}

export function formatDateBr(isoDate: string) {
  const [year, month, day] = isoDate.split("-");
  return `${day}/${month}/${year}`;
}

export function isPurchasable(card: Pick<CardRecord, "price">) {
  return card.price > 0 && card.price < MAX_STAR_COST;
}

export function bestValueCards(cards: CardRecord[]) {
  return cards
    .filter((card) => card.password && card.atk >= 1500 && isPurchasable(card))
    .sort((a, b) => (b.atk / b.price) - (a.atk / a.price) || b.atk - a.atk || a.id - b.id)
    .slice(0, 10);
}

export function strongestPurchasableCard(cards: CardRecord[]) {
  return cards.filter((card) => card.password && isPurchasable(card)).sort((a, b) => b.atk - a.atk || a.price - b.price || a.id - b.id)[0];
}
