import assert from "node:assert/strict";
import test from "node:test";

async function render(path = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-${path}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(
    new Request(`http://localhost${path}`, { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("renders the Yu-Gi-Oh! Forbidden Memories home with its primary discovery paths", async () => {
  const response = await render("/");
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  const html = await response.text();
  assert.match(html, /<title>Yu-Gi-Oh! Forbidden Memories — Cartas, Drops e Guias<\/title>/i);
  assert.match(html, /Encontre qualquer/i);
  assert.match(html, /carta, drop ou password/i);
  assert.match(html, /action="\/cartas\/"/);
  assert.match(html, /<meta name="theme-color" content="#08080A"/i);
  assert.match(html, /<link rel="icon" href="\/favicon\.png" type="image\/png"/i);
  assert.match(html, /<link rel="apple-touch-icon" href="\/favicon\.png"/i);
  assert.match(html, /O que você/);
  assert.match(html, /Mais <span>buscados/);
  assert.match(html, /Explorar <span>mais/);
  assert.match(html, /Espaço publicitário/);
  assert.match(html, /Ver todos os posts/);
  for (const href of [
    "/cartas/dark-magician/",
    "/cartas/blue-eyes-white-dragon/",
    "/cartas/meteor-b-dragon/",
    "/cartas/red-eyes-b-dragon/",
    "/cartas/exodia-the-forbidden/",
    "/cartas/megamorph/",
  ]) assert.match(html, new RegExp(`href="${href}"`));
  assert.doesNotMatch(html, /href="\/cartas\/(?:red-eyes-black-dragon|exodia-the-forbidden-one)\//);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape|react-loading-skeleton/i);
});

test("uses canonical WordPress character links", async () => {
  const response = await render("/drops/");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /href="\/drops\/weevil-underwood\/"/);
  assert.doesNotMatch(html, /href="\/drops\/weevil\/"/);
  assert.match(html, /RESPOSTA R.PIDA/i);
  assert.match(html, /class="drop-featured-grid"/);
  assert.match(html, /class="drop-card-preview"/);
  assert.match(html, /<dd>[1-9]\d*<\/dd><\/div><div><dt>Rela(?:Ã§Ãµ|çõ)es de drop<\/dt><dd>[1-9]\d*<\/dd>/);
  assert.match(html, /<table>/);
  assert.match(html, /"@type":"Dataset"/);
  assert.match(html, /"@type":"FAQPage"/);
  assert.match(html, /"@type":"BreadcrumbList"/);
});

for (const path of ["/cartas/", "/cartas/tipo/dragao/", "/drops/", "/drops/heishin/", "/mods/", "/passwords/", "/guias/", "/blog/"]) {
  test(`renders ${path}`, async () => {
    const response = await render(path);
    assert.equal(response.status, 200);
    assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  });
}

const portalRoutes = [
  ["/drops/seto-3rd/", /<h1>Seto 3rd<\/h1>/i, /"@type":"FAQPage"/],
  ["/drops/heishin/s-pow/", /<h1>Heishin<\/h1>/i, /"@type":"ItemList"/],
  ["/passwords/dragon/", /C.digos de.*Drag/i, /"@type":"ItemList"/],
];

for (const [path, contentPattern, schemaPattern] of portalRoutes) {
  test(`renders complete portal content and schema for ${path}`, async () => {
    const response = await render(path);
    assert.equal(response.status, 200);
    const html = await response.text();
    assert.match(html, contentPattern);
    assert.match(html, /application\/ld\+json/);
    assert.match(html, schemaPattern);
    assert.match(html, /class="(?:portal-page|fm-wrap fm-duelist-page)"/);
  });
}

test("does not inject local fallback posts, guides or mods", async () => {
  for (const path of ["/blog/", "/guias/", "/mods/"]) {
    const response = await render(path);
    const html = await response.text();
    assert.doesNotMatch(html, /cartas-mais-raras|como-conseguir-s-pow|mod-15-drop-x15/i);
  }
});

test("renders the semantic character drop table with card links, types and rates", async () => {
  const response = await render("/drops/heishin/s-pow/");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /class="fm-table"/);
  assert.match(html, /class="drop-visual-grid"/);
  assert.match(html, /class="drop-card-stats"/);
  assert.match(html, /class="drop-card-tags"/);
  assert.match(html, /<th scope="col">Carta<\/th>/);
  assert.match(html, /<th scope="col">Tipo<\/th>/);
  assert.match(html, /class="fm-drop-rate"/);
  assert.match(html, /href="\/cartas\/meteor-b-dragon\/"/);
});

test("renders server-side pool tabs and marks the selected character pool", async () => {
  const response = await render("/drops/heishin/");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /class="fm-pooltabs shell"/);
  assert.match(html, /href="\/drops\/heishin\/s-pow\/"/);
  assert.match(html, /href="\/drops\/heishin\/s-tec\/"/);
  assert.match(html, /href="\/drops\/heishin\/b-c-d\/"/);
  const poolResponse = await render("/drops/heishin/s-pow/");
  const poolHtml = await poolResponse.text();
  assert.match(poolHtml, /class="is-active" href="\/drops\/heishin\/s-pow\/"/);
  assert.doesNotMatch(poolHtml, /href="\/cartas\/dark-magician\/"/);
});

test("renders character drop search and card type filter", async () => {
  const response = await render("/drops/heishin/");
  const html = await response.text();
  assert.equal(response.status, 200);
  assert.match(html, /placeholder="Nome, ID, tipo ou atributo\.\.\."/);
  assert.match(html, />Todos os tipos</);
  assert.match(html, /class="drop-filter-panel fm-inline-drop-filter"/);
});

test("renders the visual password catalog with answer-first content and complete schemas", async () => {
  const response = await render("/passwords/");
  const html = await response.text();
  assert.equal(response.status, 200);
  assert.match(html, /class="[^"]*password-answer-grid/);
  assert.match(html, /class="password-visual-grid"/);
  assert.match(html, /class="password-visual-card"/);
  assert.match(html, /Nome, ID, password, tipo ou atributo/);
  assert.match(html, /Guia de passwords/);
  assert.match(html, /class="password-faq-list"/);
  assert.match(html, /"@type":"CollectionPage"/);
  assert.match(html, /"@type":"Dataset"/);
  assert.match(html, /"@type":"FAQPage"/);
  assert.match(html, /"creator":\{"@type":"Organization","name":"Yu-Gi-Oh! Forbidden Memories"/);
  assert.match(html, /"license":"https:\/\/creativecommons\.org\/licenses\/by\/4\.0\/"/);
});

test("renders visual type-specific password pages with a canonical URL", async () => {
  const response = await render("/passwords/dragon/");
  const html = await response.text();
  assert.equal(response.status, 200);
  assert.match(html, /class="password-visual-grid"/);
  assert.match(html, /class="password-metrics"/);
  assert.match(html, /rel="canonical" href="https:\/\/yugiohforbiddenmemories\.com\/passwords\/dragao\/"/);
  assert.match(html, /"@type":"Dataset"/);
  assert.match(html, /"@type":"FAQPage"/);
});

test("renders card detail metadata and answer-first content", async () => {
  const response = await render("/cartas/blue-eyes-white-dragon/");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /<title>Blue-Eyes White Dragon: drops, password e stats \| Yu-Gi-Oh! Forbidden Memories<\/title>/i);
  assert.match(html, /Resposta rápida/i);
  assert.match(html, /89631139/);
  assert.match(html, /Quem <span>dropa/);
  assert.match(html, /href="\/drops\/seto-3rd\/"/);
  assert.match(html, /href="\/drops\/nitemare\/"/);
  assert.match(html, /class="cardtop"/);
  assert.match(html, /class="tabs"/);
  assert.match(html, /class="pwblock"/);
  assert.match(html, /class="pricegrid"/);
  assert.match(html, /class="detwrap"/);
  assert.match(html, /class="seo-guide"/);
  assert.match(html, /Guia completo: como conseguir/);
  assert.match(html, /<table>/);
  assert.match(html, /"@type":"Thing"/);
  assert.match(html, /"@type":"Dataset"/);
  assert.match(html, /"@type":"FAQPage"/);
  assert.match(html, /"name":"Início","item":"https:\/\/yugiohforbiddenmemories\.com\/"/);
  assert.match(html, /"name":"Cartas","item":"https:\/\/yugiohforbiddenmemories\.com\/cartas\/"/);
  assert.match(html, /"creator":\{"@type":"Organization","name":"Yu-Gi-Oh! Forbidden Memories"/);
  assert.match(html, /"license":"https:\/\/creativecommons\.org\/licenses\/by\/4\.0\/"/);
  assert.match(html, /"hasPart":\["https:\/\/yugiohforbiddenmemories\.com\/cartas\/blue-eyes-white-dragon\/#drop-1"/);
  assert.doesNotMatch(html, /"@type":"DataFeedItem"/);
  assert.match(html, /"@id":"https:\/\/yugiohforbiddenmemories\.com\/cartas\/blue-eyes-white-dragon\/#faq"/);
  assert.match(html, /id="drop-1"/);
  assert.ok(html.indexOf('id="precos"') < html.indexOf("seo-guide"));
  assert.ok(html.indexOf("seo-guide") < html.indexOf("faq-exact"));
  assert.match(html, /application\/ld\+json/);
  assert.match(html, /property="og:image"/);
  assert.match(html, /name="twitter:image"/);
  assert.match(html, /\/cards\/blue-eyes-white-dragon\.png/);
});

test("uses the supplied card artwork across visual card surfaces", async () => {
  const response = await render("/");
  assert.equal(response.status, 200);
  const html = await response.text();
  for (const image of [
    "blue-eyes-white-dragon.png",
    "dark-magician.jpg",
    "meteor-b-dragon.png",
    "red-eyes-black-dragon.jpg",
    "exodia-the-forbidden-one.jpg",
    "megamorph.png",
  ]) assert.match(html, new RegExp(`/cards/${image.replace(".", "\\.")}`));
});

test("loads Google Tag Manager globally only when a valid GTM_ID is configured", async () => {
  const previousGtmId = process.env.GTM_ID;
  process.env.GTM_ID = "GTM-TEST123";

  try {
    const response = await render("/guias/");
    const html = await response.text();
    assert.equal(response.status, 200);
    assert.match(html, /id="google-tag-manager"/);
    assert.match(html, /googletagmanager\.com\/gtm\.js/);
    assert.match(html, /googletagmanager\.com\/ns\.html\?id=GTM-TEST123/);
  } finally {
    if (previousGtmId === undefined) delete process.env.GTM_ID;
    else process.env.GTM_ID = previousGtmId;
  }
});

test("renders the WordPress mod API fields in the card-aligned detail layout", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (input, init) => {
    const url = String(input instanceof Request ? input.url : input);
    if (url.includes("/wp-json/fm/v1/mod/")) return Response.json({
      id: 1548,
      nome: "Yugioh Forbidem Memories &#8211; Mod 15 DROP 15x",
      slug: "yugioh-forbidem-memories-mod-15-drop-15x",
      versao: "1.0",
      autor: "Comunidade / ferramenta Drop More Cards",
      drop_multiplier: "15",
      tags: ["Drop Multiplier", "mod 15"],
      imagem: "https://wp.yugifbm.com/mod-15.webp",
      link_download: "https://example.com/download",
      changelog: "<h3>O que é o mod</h3><p>Conteúdo completo do mod.</p>",
      faq: [["O que é o mod?", "É uma modificação do jogo."]],
    });
    return originalFetch(input, init);
  };

  try {
    const response = await render("/mods/yugioh-forbidem-memories-mod-15-drop-15x/");
    const html = await response.text();
    assert.equal(response.status, 200);
    assert.match(html, /class="modtop"/);
    assert.match(html, /Yugioh Forbidem Memories/);
    assert.match(html, /Comunidade \/ ferramenta/);
    assert.match(html, />15x</);
    assert.match(html, /id="guia"/);
    assert.match(html, /id="download"/);
    assert.match(html, /id="faq"/);
    assert.match(html, /"@type":"SoftwareApplication"/);
    assert.match(html, /"@type":"FAQPage"/);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
