const content = `# Yu-Gi-Oh! Forbidden Memories

> Portal de referência em português sobre Yu-Gi-Oh! Forbidden Memories, com catálogo de cartas, passwords, drops e guias de estratégia. O conteúdo reúne dados pesquisáveis e estruturados para facilitar consultas sobre o jogo.

Yu-Gi-Oh! Forbidden Memories é um jogo de cartas lançado para PlayStation. O portal cobre as 722 cartas do jogo, seus atributos e estatísticas, passwords, custos em estrelas, duelistas, bolsas de recompensa, ranks e rotas de farm.

As versões Markdown abaixo apresentam o conteúdo principal sem navegação ou elementos visuais. Os dados estruturados em JSON-LD publicados nas páginas HTML correspondentes são a fonte canônica.

## Páginas principais

- [Catálogo completo de cartas](https://yugiohforbiddenmemories.com/cartas.md): catálogo das 722 cartas com ID, nomes, tipo, atributo, nível, ATK, DEF, password, custo e disponibilidade por drop.
- [Drops por duelista](https://yugiohforbiddenmemories.com/drops.md): todos os duelistas e suas bolsas S/A POW, S/A TEC e B/C/D, com quantidade de cartas e links para as tabelas detalhadas.
- [Passwords das cartas](https://yugiohforbiddenmemories.com/passwords.md): lista pesquisável dos códigos de oito dígitos, custos em estrelas, tipos, atributos e estatísticas das cartas.
- [Guias de estratégia](https://yugiohforbiddenmemories.com/guias.md): guias publicados sobre ranks, farm, fusões, decks e progressão em Forbidden Memories.

## Optional

- [Mods da comunidade](https://yugiohforbiddenmemories.com/mods/): informações, versões, autores, instruções e links externos de mods catalogados.
- [Blog](https://yugiohforbiddenmemories.com/blog/): artigos editoriais, novidades e conteúdo complementar sobre o jogo.
`;

export function GET() {
  return new Response(content, {
    headers: {
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
