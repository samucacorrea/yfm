import { guidesMarkdown } from "../../lib/markdown-pages";
import { getPublishedGuides } from "../../lib/wordpress";

export async function GET() {
  return guidesMarkdown(await getPublishedGuides());
}
