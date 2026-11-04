import type { CardRecord } from "./catalog";
import { taxonomySlug } from "./wordpress-data";

export type CardCatalogFilter = {
  key: string;
  label: string;
  count: number;
  icon: string;
};

const categoryFilters = [
  { value: "Magia", label: "Mágica", icon: "magic" },
  { value: "Armadilha", label: "Armadilha", icon: "trap" },
  { value: "Equipamento", label: "Equipamento", icon: "equip" },
  { value: "Ritual", label: "Ritual", icon: "ritual" },
  { value: "Field", label: "Campo", icon: "field" },
];

const preferredTypes = ["Dragão", "Mago", "Guerreiro", "Aqua", "Demônio", "Máquina", "Trovão"];

function normalizedCategory(card: CardRecord) {
  if (card.category) return card.category;
  if (taxonomySlug(card.type) === "equip") return "Equipamento";
  if (taxonomySlug(card.attribute) === "magic") return "Magia";
  return "Normal";
}

function typeIcon(type: string) {
  const slug = taxonomySlug(type);
  if (slug === "dragao") return "dragon";
  if (["aqua", "peixe", "serpente-marinha"].includes(slug)) return "water";
  if (["mago", "fada", "demonio"].includes(slug)) return "spell";
  if (["guerreiro", "besta-guerreira"].includes(slug)) return "warrior";
  if (["besta", "besta-alada"].includes(slug)) return "beast";
  if (["planta", "piro", "rocha", "reptil", "dinossauro"].includes(slug)) return "nature";
  if (slug === "maquina") return "machine";
  if (slug === "inseto") return "insect";
  if (slug === "trovao") return "thunder";
  if (slug === "zumbi") return "undead";
  return "card";
}

export function buildCardCatalogFilters(cards: CardRecord[]) {
  const categories = categoryFilters.map((filter) => ({
    key: `categoria-${taxonomySlug(filter.value)}`,
    label: filter.label,
    icon: filter.icon,
    count: cards.filter((card) => taxonomySlug(normalizedCategory(card)) === taxonomySlug(filter.value)).length,
  })).filter((filter) => filter.count > 0);

  const typeCounts = new Map<string, { label: string; count: number }>();
  for (const card of cards) {
    if (normalizedCategory(card) !== "Normal" || taxonomySlug(card.type) === "sem-tipo") continue;
    const key = taxonomySlug(card.type);
    const current = typeCounts.get(key);
    typeCounts.set(key, { label: card.type, count: (current?.count || 0) + 1 });
  }

  const preferredOrder = new Map(preferredTypes.map((type, index) => [taxonomySlug(type), index]));
  const types = [...typeCounts.entries()].map(([slug, value]) => ({
    key: `tipo-${slug}`,
    label: value.label,
    count: value.count,
    icon: typeIcon(value.label),
  })).sort((a, b) => {
    const aOrder = preferredOrder.get(a.key.replace("tipo-", "")) ?? preferredTypes.length;
    const bOrder = preferredOrder.get(b.key.replace("tipo-", "")) ?? preferredTypes.length;
    return aOrder - bOrder || a.label.localeCompare(b.label, "pt-BR");
  });

  return { categories, types };
}

export function cardMatchesCatalogFilter(card: CardRecord, filterKey: string) {
  if (!filterKey) return true;
  if (filterKey.startsWith("categoria-")) {
    return taxonomySlug(normalizedCategory(card)) === filterKey.replace("categoria-", "");
  }
  if (filterKey.startsWith("tipo-")) {
    return normalizedCategory(card) === "Normal" && taxonomySlug(card.type) === filterKey.replace("tipo-", "");
  }
  return true;
}
