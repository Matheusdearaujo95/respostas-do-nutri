// Gera o PDF do Respostas do Nutri a partir de conteudo/*.md.
//
//   bun run pdf                      → saida/respostas-do-nutri.pdf
//   bun run pdf -- --html            → também salva o HTML intermediário
//
// O PDF tem sumário, índices e botões de "voltar" clicáveis, além dos
// marcadores (outline) que aparecem na barra lateral do leitor de PDF.
// Requer o Chromium do Playwright: `bunx playwright-core install chromium`
// (ou defina CHROMIUM_PATH com o caminho de um Chrome/Chromium instalado).

import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ArrowUp, ShieldAlert } from "lucide-react";
import { chromium } from "playwright-core";
import { fieldLabel, splitText } from "../src/lib/biblioteca/campos";
import { categories, type Category } from "../src/lib/biblioteca/categorias";
import { parseCategoryFile, tones, type Message } from "../src/lib/biblioteca/parser";

const root = resolve(import.meta.dir, "..");
const outDir = join(root, "saida");
const keepHtml = process.argv.includes("--html");

const messages: Message[] = readdirSync(join(root, "conteudo"))
  .filter((file) => file.endsWith(".md"))
  .sort()
  .flatMap((file) => parseCategoryFile(readFileSync(join(root, "conteudo", file), "utf8"), file));

const file = (path: string) => pathToFileURL(join(root, path)).href;
const icon = (Icon: Parameters<typeof createElement>[0], size = 20) =>
  renderToStaticMarkup(createElement(Icon, { size, strokeWidth: 1.8, "aria-hidden": true }));
const esc = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const anchor = (message: Message) => `m-${message.id.replace(".", "-")}`;
const catAnchor = (category: Category) => `c-${category.id}`;
const toneLabel = (id: string) => tones.find((tone) => tone.id === id)?.label ?? id;

function messageText(text: string) {
  return splitText(text, {})
    .map((part) =>
      part.kind === "text"
        ? esc(part.value)
        : `<span class="f" title="${esc(fieldLabel(part.token))}">[${esc(part.token)}]</span>`,
    )
    .join("")
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${paragraph.replace(/\n/g, "<br>")}</p>`)
    .join("");
}

const byCategory = categories.map((category) => ({
  category,
  items: messages.filter((message) => message.categoryId === category.id),
}));

const backLinks = (category: Category) => `
  <nav class="back">
    <a href="#sumario">${icon(ArrowUp, 12)} Sumário</a>
    <a href="#${catAnchor(category)}">${icon(ArrowUp, 12)} ${esc(category.name)}</a>
    <a href="#indice">${icon(ArrowUp, 12)} Índice por situação</a>
  </nav>`;

const cover = `
<section class="cover page">
  <img class="cover__logo" src="${file("public/brand/respostas-do-nutri-simbolo.svg")}" alt="">
  <p class="eyebrow">Acervo do Nutri · Biblioteca prática</p>
  <p class="cover__title">Respostas<br><em>do Nutri</em><i>.</i></p>
  <p class="cover__lead">Suas mensagens prontas, em um só lugar. Encontre a mensagem certa, personalize e envie em segundos.</p>
  <p class="cover__count">${messages.length} mensagens · ${categories.length} momentos do atendimento</p>
  <div class="cover__foot">
    <span>Curadoria e conteúdo</span>
    <img src="${file("public/brand/elaine-araujo-nutricionista.svg")}" alt="Elaine Araújo, nutricionista">
  </div>
</section>`;

const howTo = `
<section class="page howto">
  <p class="eyebrow">Antes de começar</p>
  <h2 class="h2">Como usar este guia</h2>
  <ol class="steps">
    <li><b>Escolha o momento.</b> Use o <a href="#sumario">sumário</a> para ir direto à categoria, ou o <a href="#indice">índice por situação</a> para achar a mensagem pelo nome.</li>
    <li><b>Escolha o tom.</b> Muitas situações têm versões <b>Próxima</b>, <b>Acolhedora</b> e <b>Profissional</b>. Use a que combina com a sua forma de atender.</li>
    <li><b>Copie e complete.</b> Selecione o texto, copie e cole no WhatsApp, e-mail ou no canal que preferir. Troque os campos em destaque, como <span class="f">[Nome]</span> e <span class="f">[Valor]</span>, pelos dados reais.</li>
    <li><b>Revise antes de enviar.</b> Mensagens com o selo <span class="badge">${icon(ShieldAlert, 11)} Conferir dados</span> trazem valores, datas ou condições: confira tudo antes do envio.</li>
  </ol>
  <div class="note">
    <p><b>Em todas as páginas</b> há atalhos para voltar ao sumário, à categoria ou ao índice. No celular, os marcadores do leitor de PDF também levam a cada categoria.</p>
  </div>
  <div class="note note--soft">
    <p>As mensagens são modelos editáveis e devem ser revisadas e adaptadas pela nutricionista antes do envio. Elas não contêm prescrições, doses ou promessas de resultado e não substituem a avaliação profissional. Não envie mensagens a quem pediu para não ser contatado e não exponha informações de saúde de pacientes.</p>
  </div>
</section>`;

const summary = `
<section class="page" id="sumario">
  <p class="eyebrow">Sumário</p>
  <h2 class="h2">Momentos do atendimento</h2>
  <div class="toc">
    ${byCategory
      .map(
        ({ category, items }) => `
      <a class="toc__item" href="#${catAnchor(category)}">
        <span class="toc__icon">${icon(category.icon, 20)}</span>
        <span class="toc__body"><b>${category.id} · ${esc(category.name)}</b><span>${esc(category.description)}</span></span>
        <span class="toc__count">${items.length}</span>
      </a>`,
      )
      .join("")}
    <a class="toc__item toc__item--index" href="#indice">
      <span class="toc__icon">${icon(ArrowUp, 20)}</span>
      <span class="toc__body"><b>Índice por situação</b><span>Todas as mensagens em ordem alfabética.</span></span>
    </a>
  </div>
</section>`;

const sections = byCategory
  .map(
    ({ category, items }) => `
<section class="category page" id="${catAnchor(category)}">
  <header class="cat-head">
    <span class="cat-head__icon">${icon(category.icon, 30)}</span>
    <div>
      <p class="eyebrow">Categoria ${category.id} · ${items.length} mensagens</p>
      <h2 class="h2">${esc(category.name)}</h2>
      <p class="lead">${esc(category.description)}</p>
    </div>
  </header>
  <ol class="cat-index">
    ${items
      .map(
        (message) =>
          `<li><a href="#${anchor(message)}"><span class="id">${message.id}</span>${esc(message.title)}${message.needsReview ? ' <span class="dot" title="Conferir dados"></span>' : ""}</a></li>`,
      )
      .join("")}
  </ol>
  <nav class="back back--solo"><a href="#sumario">${icon(ArrowUp, 12)} Voltar ao sumário</a></nav>
</section>
${items
  .map(
    (message) => `
<article class="msg" id="${anchor(message)}">
  <header class="msg__head">
    <p class="msg__meta"><span class="id">${message.id}</span> ${esc(category.name)}${message.needsReview ? ` <span class="badge">${icon(ShieldAlert, 11)} Conferir dados</span>` : ""}</p>
    <h3 class="msg__title">${esc(message.title)}</h3>
    <p class="msg__context"><b>Quando usar:</b> ${esc(message.context)}</p>
  </header>
  ${message.variants
    .map(
      (variant) => `
  <div class="variant">
    <p class="variant__tone">${toneLabel(variant.tone)}</p>
    <div class="bubble">${messageText(variant.text)}</div>
  </div>`,
    )
    .join("")}
  ${backLinks(category)}
</article>`,
  )
  .join("")}`,
  )
  .join("");

const alphabetical = [...messages].sort((a, b) => a.title.localeCompare(b.title, "pt-BR"));
const index = `
<section class="page index" id="indice">
  <p class="eyebrow">Encontre pelo nome da situação</p>
  <h2 class="h2">Índice por situação</h2>
  <p class="lead">Todas as ${messages.length} mensagens em ordem alfabética. Toque para ir direto.</p>
  <ul class="az">
    ${alphabetical
      .map((message) => {
        const category = categories.find((item) => item.id === message.categoryId)!;
        return `<li><a href="#${anchor(message)}"><span>${esc(message.title)}</span><small>${esc(category.short)}</small></a></li>`;
      })
      .join("")}
  </ul>
  <nav class="back back--solo"><a href="#sumario">${icon(ArrowUp, 12)} Voltar ao sumário</a></nav>
</section>`;

const css = `
@font-face { font-family: "Figtree"; font-weight: 400; src: url(${file("node_modules/@fontsource/figtree/files/figtree-latin-400-normal.woff2")}); }
@font-face { font-family: "Figtree"; font-weight: 500; src: url(${file("node_modules/@fontsource/figtree/files/figtree-latin-500-normal.woff2")}); }
@font-face { font-family: "Figtree"; font-weight: 600; src: url(${file("node_modules/@fontsource/figtree/files/figtree-latin-600-normal.woff2")}); }
@font-face { font-family: "Figtree"; font-weight: 700; src: url(${file("node_modules/@fontsource/figtree/files/figtree-latin-700-normal.woff2")}); }
@font-face { font-family: "Bricolage Grotesque"; font-weight: 600; src: url(${file("node_modules/@fontsource/bricolage-grotesque/files/bricolage-grotesque-latin-600-normal.woff2")}); }
@font-face { font-family: "Bricolage Grotesque"; font-weight: 700; src: url(${file("node_modules/@fontsource/bricolage-grotesque/files/bricolage-grotesque-latin-700-normal.woff2")}); }

@page { size: A4; margin: 18mm 16mm 20mm; }
:root {
  --bg: #faf9f3; --panel: #fff; --ink: #1d2a1f; --ink2: #5a6552; --ink3: #7d8777;
  --olive: #3f5c39; --olive-deep: #2c4128; --olive-tint: #ebf0e2; --olive-line: #c6d3bc;
  --apricot: #e8562f; --apricot-dark: #c74320; --apricot-tint: #fbe8e1; --line2: rgba(29,42,31,.1);
}
* { box-sizing: border-box; margin: 0; padding: 0; }
html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
body { font-family: "Figtree", sans-serif; color: var(--ink); font-size: 10.5pt; line-height: 1.5; }
a { color: inherit; text-decoration: none; }
b { font-weight: 700; }
.page { break-after: page; }
.eyebrow { font-size: 8pt; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: var(--olive); }
.h2 { font-family: "Bricolage Grotesque", sans-serif; font-weight: 700; font-size: 24pt; line-height: 1.1; letter-spacing: -.015em; margin-top: 4pt; }
.lead { color: var(--ink2); margin-top: 6pt; font-size: 11pt; }
.bookmark { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); }
svg { display: inline-block; vertical-align: -2px; }

/* Capa */
.cover { height: 257mm; display: flex; flex-direction: column; justify-content: center; padding: 0 6mm; position: relative; }
.cover__logo { width: 34mm; margin-bottom: 14mm; }
.cover__title { font-family: "Bricolage Grotesque", sans-serif; font-weight: 700; font-size: 54pt; line-height: 1; letter-spacing: -.03em; margin-top: 6mm; }
.cover__title em { font-style: normal; color: var(--olive); }
.cover__title i { font-style: normal; color: var(--apricot); }
.cover__lead { font-size: 14pt; color: var(--ink2); max-width: 120mm; margin-top: 8mm; }
.cover__count { margin-top: 8mm; display: inline-block; align-self: flex-start; background: var(--olive-tint); color: var(--olive-deep); font-weight: 700; padding: 3mm 5mm; border-radius: 99px; font-size: 10.5pt; }
.cover__foot { position: absolute; bottom: 0; left: 6mm; display: flex; flex-direction: column; gap: 1mm; }
.cover__foot span { font-size: 7.5pt; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: var(--ink3); }
.cover__foot img { width: 42mm; }

/* Como usar */
.steps { counter-reset: s; list-style: none; margin-top: 10mm; display: grid; gap: 4mm; }
.steps li { counter-increment: s; position: relative; padding: 4mm 5mm 4mm 15mm; background: var(--panel); border: 1px solid var(--line2); border-radius: 4mm; }
.steps li::before { content: counter(s); position: absolute; left: 4.5mm; top: 4mm; width: 7mm; height: 7mm; border-radius: 99px; background: var(--olive); color: #fff; font-weight: 700; font-size: 9pt; display: grid; place-items: center; }
.steps a { color: var(--olive); font-weight: 700; text-decoration: underline; }
.note { margin-top: 6mm; padding: 4mm 5mm; border-radius: 4mm; background: var(--olive-tint); border: 1px solid var(--olive-line); color: var(--olive-deep); }
.note--soft { background: var(--bg); color: var(--ink2); border-color: var(--line2); font-size: 9.5pt; }

/* Campos e selos */
.f { background: var(--apricot-tint); color: var(--apricot-dark); font-weight: 700; border-radius: 1mm; padding: 0 .4mm; }
.badge { display: inline-flex; align-items: center; gap: 1mm; background: #fff6dc; color: #7a5a00; font-size: 7.5pt; font-weight: 700; border-radius: 1.2mm; padding: .3mm 1.6mm; vertical-align: 1px; }

/* Sumário */
.toc { margin-top: 6mm; display: grid; gap: 1.8mm; }
.toc__item { display: flex; align-items: center; gap: 4mm; padding: 2.2mm 4mm; border: 1px solid var(--line2); border-radius: 3.5mm; background: var(--panel); }
.toc__icon { width: 9mm; height: 9mm; border-radius: 2.6mm; background: var(--olive-tint); color: var(--olive); display: grid; place-items: center; flex-shrink: 0; }
.toc__body { flex: 1; display: flex; flex-direction: column; }
.toc__body b { font-family: "Bricolage Grotesque", sans-serif; font-weight: 600; font-size: 11.5pt; }
.toc__body span { font-size: 8.5pt; color: var(--ink2); }
.toc__count { font-weight: 700; color: var(--olive); font-size: 10pt; background: var(--olive-tint); border-radius: 99px; padding: .8mm 3mm; }
.toc__item--index .toc__icon { background: var(--apricot-tint); color: var(--apricot-dark); }

/* Abertura de categoria */
.cat-head { display: flex; gap: 6mm; align-items: flex-start; padding: 8mm; border-radius: 6mm; background: var(--olive-tint); }
.cat-head__icon { width: 16mm; height: 16mm; border-radius: 4mm; background: var(--panel); color: var(--olive); display: grid; place-items: center; flex-shrink: 0; }
.cat-index { list-style: none; margin-top: 7mm; columns: 1; }
.cat-index li { border-bottom: 1px solid var(--line2); }
.cat-index a { display: flex; align-items: center; gap: 3mm; padding: 2.6mm 1mm; font-weight: 600; }
.cat-index .id, .msg__meta .id { font-variant-numeric: tabular-nums; color: var(--olive); font-weight: 700; font-size: 8.5pt; background: var(--olive-tint); border-radius: 1.2mm; padding: .3mm 1.6mm; }
.dot { width: 2mm; height: 2mm; border-radius: 99px; background: #e2b400; display: inline-block; }

/* Mensagens */
.msg { padding: 5mm 0 4mm; border-bottom: 1px solid var(--line2); }
.msg:last-of-type { border-bottom: none; }
.msg__head { break-after: avoid; break-inside: avoid; }
.msg__meta { font-size: 8.5pt; color: var(--ink3); display: flex; align-items: center; gap: 2mm; }
.msg__title { font-family: "Bricolage Grotesque", sans-serif; font-weight: 700; font-size: 15pt; line-height: 1.2; margin-top: 1.5mm; letter-spacing: -.01em; }
.msg__context { color: var(--ink2); font-size: 9.5pt; margin-top: 1.5mm; }
.variant { margin-top: 4mm; break-inside: avoid; }
.variant__tone { font-size: 7.5pt; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: var(--olive); margin-bottom: 1.5mm; }
.bubble { background: var(--bg); border: 1px solid var(--olive-line); border-radius: 1.5mm 5mm 5mm 5mm; padding: 3.5mm 4.5mm; font-size: 10.5pt; line-height: 1.55; }
.bubble p + p { margin-top: 2.2mm; }
.back { break-before: avoid; display: flex; gap: 2mm; flex-wrap: wrap; margin-top: 4mm; }
.back a { display: inline-flex; align-items: center; gap: 1mm; font-size: 8pt; font-weight: 700; color: var(--olive-deep); border: 1px solid var(--olive-line); border-radius: 99px; padding: 1mm 3mm; background: var(--panel); }
.back--solo { margin-top: 8mm; }

/* Índice alfabético */
.az { list-style: none; columns: 2; column-gap: 8mm; margin-top: 7mm; }
.az li { break-inside: avoid; border-bottom: 1px solid var(--line2); }
.az a { display: flex; justify-content: space-between; gap: 2mm; padding: 1.6mm 0; font-size: 9pt; }
.az small { color: var(--ink3); font-size: 7.5pt; white-space: nowrap; }
`;

const html = `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8"><title>Respostas do Nutri</title><style>${css}</style></head>
<body>${cover}${howTo}${summary}${sections}${index}</body></html>`;

mkdirSync(outDir, { recursive: true });
const htmlPath = join(outDir, "respostas-do-nutri.html");
writeFileSync(htmlPath, html);

const executablePath =
  process.env["CHROMIUM_PATH"] ||
  (existsSync("/opt/pw-browsers/chromium-1194/chrome-linux/chrome")
    ? "/opt/pw-browsers/chromium-1194/chrome-linux/chrome"
    : undefined);
const browser = await chromium.launch(executablePath ? { executablePath } : {});
const page = await browser.newPage();
await page.goto(pathToFileURL(htmlPath).href, { waitUntil: "load" });
await page.evaluate(() => document.fonts.ready);
const pdfPath = join(outDir, "respostas-do-nutri.pdf");
await page.pdf({
  path: pdfPath,
  format: "A4",
  printBackground: true,
  outline: true,
  tagged: true,
  displayHeaderFooter: true,
  headerTemplate: "<span></span>",
  footerTemplate: `<div style="width:100%;font-family:sans-serif;font-size:7.5pt;color:#7d8777;padding:0 16mm;display:flex;justify-content:space-between"><span>Respostas do Nutri · Curadoria Elaine Araújo</span><span><span class="pageNumber"></span> / <span class="totalPages"></span></span></div>`,
  margin: { top: "18mm", bottom: "20mm", left: "16mm", right: "16mm" },
});
await browser.close();
if (!keepHtml) unlinkSync(htmlPath);
console.log(`PDF gerado: ${pdfPath} (${messages.length} mensagens)`);
