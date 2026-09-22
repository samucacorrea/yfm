import { getCards } from "../../lib/data";
import { cardsMarkdown } from "../../lib/markdown-pages";

export async function GET() {
  return cardsMarkdown(await getCards());
}
