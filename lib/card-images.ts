export type CardImage = {
  src: string;
  width: number;
  height: number;
};

export const cardImages: Record<string, CardImage> = {
  "blue-eyes-white-dragon": { src: "/cards/blue-eyes-white-dragon.png", width: 186, height: 271 },
  "dark-magician": { src: "/cards/dark-magician.jpg", width: 308, height: 449 },
  "exodia-the-forbidden-one": { src: "/cards/exodia-the-forbidden-one.jpg", width: 346, height: 498 },
  "exodia-the-forbidden": { src: "/cards/exodia-the-forbidden-one.jpg", width: 346, height: 498 },
  megamorph: { src: "/cards/megamorph.png", width: 284, height: 414 },
  "meteor-b-dragon": { src: "/cards/meteor-b-dragon.png", width: 189, height: 266 },
  "red-eyes-black-dragon": { src: "/cards/red-eyes-black-dragon.jpg", width: 350, height: 511 },
  "red-eyes-b-dragon": { src: "/cards/red-eyes-black-dragon.jpg", width: 350, height: 511 },
};

export const cardImageSources = Object.fromEntries(
  Object.entries(cardImages).map(([slug, image]) => [slug, image.src]),
) as Record<string, string>;

export function getCardImage(slug: string) {
  return cardImages[slug];
}
