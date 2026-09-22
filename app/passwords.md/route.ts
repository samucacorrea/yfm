import { getCards } from "../../lib/data";
import { passwordsMarkdown } from "../../lib/markdown-pages";

export async function GET() {
  return passwordsMarkdown(await getCards());
}
