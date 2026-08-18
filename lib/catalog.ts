export type Drop = { duelist: string; duelistSlug?: string; pool: string; rate: string; location: string };
export type CardRecord = {
  id: number;
  slug: string;
  name: string;
  namePt: string;
  type: string;
  attribute: string;
  level: number;
  atk: number;
  def: number;
  password: string;
  price: number;
  rarity: string;
  summary: string;
  drops: Drop[];
  image?: string;
};

export const cards: CardRecord[] = [
  {
    id: 1,
    slug: "blue-eyes-white-dragon",
    name: "Blue-Eyes White Dragon",
    namePt: "Dragão Branco de Olhos Azuis",
    type: "Dragon",
    attribute: "Light",
    level: 8,
    atk: 3000,
    def: 2500,
    password: "89631139",
    price: 999999,
    rarity: "Ultra rara",
    summary: "O Blue-Eyes White Dragon é uma das cartas mais fortes e desejadas de Yu-Gi-Oh! Forbidden Memories, com 3000 de ATK e 2500 de DEF.",
    drops: [
      { duelist: "Seto 3rd", pool: "S/A POW", rate: "0,05%", location: "Final do jogo" },
      { duelist: "Nitemare", pool: "S/A POW", rate: "0,05%", location: "Duelo final" },
    ],
  },
  { id: 35, slug: "dark-magician", name: "Dark Magician", namePt: "Mago Negro", type: "Spellcaster", attribute: "Dark", level: 7, atk: 2500, def: 2100, password: "46986414", price: 999999, rarity: "Ultra rara", summary: "O Dark Magician é o monstro assinatura de Yugi e uma das cartas clássicas mais buscadas no jogo.", drops: [] },
  { id: 6, slug: "meteor-b-dragon", name: "Meteor B. Dragon", namePt: "Dragão Meteoro Negro", type: "Dragon", attribute: "Fire", level: 8, atk: 3500, def: 2000, password: "90660762", price: 999999, rarity: "Ultra rara", summary: "Meteor B. Dragon combina enorme poder de ataque com uma das fusões mais conhecidas de Forbidden Memories.", drops: [] },
  { id: 82, slug: "red-eyes-b-dragon", name: "Red-Eyes B. Dragon", namePt: "Dragão Negro de Olhos Vermelhos", type: "Dragon", attribute: "Dark", level: 7, atk: 2400, def: 2000, password: "74677422", price: 999999, rarity: "Ultra rara", summary: "Red-Eyes B. Dragon é um dos dragões mais icônicos de Forbidden Memories e uma base valiosa para fusões ofensivas.", drops: [] },
  { id: 21, slug: "exodia-the-forbidden", name: "Exodia the Forbidden", namePt: "Exodia, o Proibido", type: "Spellcaster", attribute: "Dark", level: 3, atk: 1000, def: 1000, password: "33396948", price: 999999, rarity: "Ultra rara", summary: "Exodia the Forbidden é a peça central do conjunto lendário de cinco cartas que representa uma vitória automática.", drops: [] },
  { id: 657, slug: "megamorph", name: "Megamorph", namePt: "Megamorph", type: "Equip", attribute: "Magic", level: 0, atk: 0, def: 0, password: "22046459", price: 999999, rarity: "Ultra rara", summary: "Megamorph é um equipamento essencial para decks de alto poder e um dos farms mais cobiçados do jogo.", drops: [] },
  { id: 374, slug: "gate-guardian", name: "Gate Guardian", namePt: "Guardião do Portal", type: "Warrior", attribute: "Dark", level: 11, atk: 3750, def: 3400, password: "25833572", price: 999999, rarity: "Ultra rara", summary: "Gate Guardian é uma carta de poder excepcional formada pelos três guardiões elementais.", drops: [] },
  { id: 613, slug: "twin-headed-thunder-dragon", name: "Twin-Headed Thunder Dragon", namePt: "Dragão Trovão de Duas Cabeças", type: "Thunder", attribute: "Light", level: 7, atk: 2800, def: 2100, password: "54752875", price: 999999, rarity: "Super rara", summary: "Twin-Headed Thunder Dragon é a fusão que define boa parte da progressão dos decks clássicos de Forbidden Memories.", drops: [] },
];

export const getCard = (slug: string) => cards.find((card) => card.slug === slug);
