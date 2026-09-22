import { getCards, getDuelists } from "../../lib/data";
import { dropsMarkdown } from "../../lib/markdown-pages";

export async function GET() {
  const [duelists, cards] = await Promise.all([getDuelists(), getCards()]);
  return dropsMarkdown(duelists, cards);
}
