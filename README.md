# Yu-Gi-Oh! Forbidden Memories

Portal de cartas, drops, personagens, passwords, mods, guias e artigos de
Yu-Gi-Oh! Forbidden Memories. O conteúdo é consumido da API REST do WordPress.

## Desenvolvimento local

Requisitos: Node.js 22.13 ou superior.

```bash
npm ci
cp .env.example .env
npm run dev
```

O site fica disponível em `http://localhost:3000`.

## Variáveis de ambiente

Configure as credenciais como variáveis de ambiente. Nunca salve a Application
Password no repositório.

```env
WP_URL=https://wp.yugifbm.com
WP_USER=seu_usuario_wordpress
WP_APP_PASS=sua_application_password
SITE_URL=https://yugiohforbiddenmemories.com
GTM_ID=GTM-XXXXXXX
```

As rotas públicas do WordPress continuam disponíveis sem autenticação. As
credenciais são usadas quando um endpoint exigir autenticação.

`GTM_ID` é opcional. Quando configurado, o container do Google Tag Manager é
carregado em todas as páginas e o `dataLayer` recebe um evento `page_view` no
primeiro acesso e em cada navegação interna, com `page_location`, `page_path` e
`page_title`. IDs ausentes ou fora do formato `GTM-...` não carregam scripts.

## Executar com Docker

Com um arquivo `.env` configurado:

```bash
docker compose up --build
```

A aplicação responde na porta `3000` e possui verificação de saúde integrada.

## Publicar no Easypanel

1. Crie um serviço do tipo **App** a partir do repositório GitHub.
2. Selecione a branch `main` e o método de build **Dockerfile**.
3. Use `Dockerfile` como caminho do arquivo e `3000` como porta do serviço.
4. Cadastre `WP_URL`, `WP_USER`, `WP_APP_PASS`, `SITE_URL` e, quando disponível,
   `GTM_ID` na área de variáveis do serviço.
5. Faça o deploy e associe o domínio desejado.

Não é necessário informar comando de build ou start no Easypanel: ambos já
estão definidos na imagem Docker.

## Validação

```bash
npm test
npm run lint
```
