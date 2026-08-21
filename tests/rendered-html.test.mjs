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

test("renders the FM Codex home with its primary discovery paths", async () => {
  const response = await render("/");
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  const html = await response.text();
  assert.match(html, /<title>FM Codex — Cartas, Drops e Guias de Forbidden Memories<\/title>/i);
  assert.match(html, /Encontre qualquer/i);
  assert.match(html, /carta, drop ou password/i);
  assert.match(html, /action="\/cartas\/"/);
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

test("renders card detail metadata and answer-first content", async () => {
  const response = await render("/cartas/blue-eyes-white-dragon/");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /<title>Blue-Eyes White Dragon: drops, password e stats \| FM Codex<\/title>/i);
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
  assert.match(html, /"name":"Início","item":"https:\/\/yugifbm\.com\/"/);
  assert.match(html, /"name":"Cartas","item":"https:\/\/yugifbm\.com\/cartas\/"/);
  assert.match(html, /"creator":\{"@type":"Organization","name":"FM Codex"/);
  assert.match(html, /"license":"https:\/\/creativecommons\.org\/licenses\/by\/4\.0\/"/);
  assert.match(html, /"hasPart":\["https:\/\/yugifbm\.com\/cartas\/blue-eyes-white-dragon\/#drop-1"/);
  assert.doesNotMatch(html, /"@type":"DataFeedItem"/);
  assert.match(html, /"@id":"https:\/\/yugifbm\.com\/cartas\/blue-eyes-white-dragon\/#faq"/);
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
