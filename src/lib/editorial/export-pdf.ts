import { PDFDocument, PDFHexString, PDFName, PDFString, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import bodyUrl from "@fontsource/figtree/files/figtree-latin-400-normal.woff?url";
import displayUrl from "@fontsource/bricolage-grotesque/files/bricolage-grotesque-latin-700-normal.woff?url";
import { tones } from "./content";
import { libraryCategories, personalizedFields, type Library } from "./library";
import { exportSnapshot, publication } from "./export-model";

const W = 595.28, H = 841.89, M = 48, BOTTOM = 76;
const colors = { paper: rgb(250/255,249/255,243/255), white: rgb(1,1,1), ink: rgb(29/255,42/255,31/255), green: rgb(63/255,92/255,57/255), muted: rgb(90/255,101/255,82/255), tint: rgb(235/255,240/255,226/255), line: rgb(198/255,211/255,188/255), orange: rgb(232/255,86/255,47/255), sage: rgb(219/255,233/255,208/255), peach: rgb(252/255,231/255,216/255), honey: rgb(250/255,240/255,205/255), field: rgb(247/255,216/255,135/255), fieldInk: rgb(97/255,61/255,20/255) };
const toneColors = { A: colors.tint, B: colors.peach, C: colors.honey };
export type PdfReport = { pages: number; messages: number; situations: number; categoryPages: { id: string; name: string; page: number }[]; continuationPages: number; minBottomSpace: number; checkedAt: string };
export type PdfResult = { bytes: Uint8Array; report: PdfReport };

async function fontBytes(url: string) {
  const response = await fetch(url);
  if (!response.ok) throw new Error("Não foi possível carregar as fontes locais. Tente novamente após recarregar a página.");
  return response.arrayBuffer();
}
export async function generatePdf(source: Library): Promise<PdfResult> {
  const library = exportSnapshot(source);
  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);
  const [bodyBytes, titleBytes] = await Promise.all([fontBytes(bodyUrl), fontBytes(displayUrl)]);
  const body = await doc.embedFont(bodyBytes, { subset: true });
  const display = await doc.embedFont(titleBytes, { subset: true });
  const logoResponse = await fetch("/images/elaine-logo.jpg");
  if (!logoResponse.ok) throw new Error("Não foi possível carregar a logo da Elaine. Recarregue a página e tente novamente.");
  const elaineLogo = await doc.embedJpg(await logoResponse.arrayBuffer());
  const bubble = (x: number, top: number, width: number, height: number, color: typeof colors.tint) => {
    const r = 14;
    page.drawSvgPath(`M ${r} 0 H ${width-r} Q ${width} 0 ${width} ${r} V ${height-r} Q ${width} ${height} ${width-r} ${height} H ${r} L 0 ${height} V ${r} Q 0 0 ${r} 0 Z`, { x, y: top, color });
  };
  doc.setTitle(publication.title); doc.setSubject(publication.subtitle); doc.setAuthor("Acervo do Nutri");
  doc.catalog.set(PDFName.of("Lang"), PDFString.of("pt-BR"));
  const bodyAllowed = new Set(body.getCharacterSet());
  const displayAllowed = new Set(display.getCharacterSet());
  const allText = JSON.stringify({ publication, library, libraryCategories, personalizedFields });
  const unsupported = [...new Set(Array.from(allText).filter(char => !bodyAllowed.has(char.codePointAt(0)!) && !/[\n\r\t]/.test(char)))];
  const displayText = [...libraryCategories.map(cat => cat.name), ...library.situations.map(item => item.title)].join(" ");
  const unsupportedTitles = [...new Set(Array.from(displayText).filter(char => !displayAllowed.has(char.codePointAt(0)!) && !/[\n\r\t]/.test(char)))];
  if (unsupported.length || unsupportedTitles.length) throw new Error(`Uma fonte do PDF não suporta: ${[...new Set([...unsupported, ...unsupportedTitles])].join(" ")}. Substitua esses caracteres no editor; nada foi exportado com símbolos ausentes.`);
  let page!: PDFPage;
  let y = 0, category = "GUIA DE COMUNICAÇÃO";
  let minBottomSpace = H, continuationPages = 0, messages = 0;
  const links: { page: PDFPage; rect: number[]; target: number }[] = [];
  const categoryPages: PdfReport["categoryPages"] = [];
  const lines = (text: string, font: PDFFont, size: number, width = W - M*2): string[] => {
    const output: string[] = [];
    for (const paragraph of text.split(/\r?\n/)) {
      let line = "";
      for (const word of paragraph.split(/\s+/).filter(Boolean)) {
        const candidate = line ? `${line} ${word}` : word;
        if (font.widthOfTextAtSize(candidate, size) <= width) { line = candidate; continue; }
        if (line) { output.push(line); line = ""; }
        for (const char of Array.from(word)) {
          if (font.widthOfTextAtSize(line + char, size) > width && line) { output.push(line); line = ""; }
          line += char;
        }
      }
      output.push(line);
    }
    return output;
  };
  const text = (value: string, size = 11, font = body, color = colors.ink, x = M, width = W - M*2) => {
    const wrapped = lines(value, font, size, width);
    const height = wrapped.length * size * 1.48;
    if (y - height < BOTTOM) throw new Error(`Texto excede a página ${doc.getPageCount()} (${category}). Reduza o título/contexto ou a mensagem e gere novamente.`);
    for (const line of wrapped) { page.drawText(line, { x, y: y - size, size, font, color }); y -= size * 1.48; }
    minBottomSpace = Math.min(minBottomSpace, y - BOTTOM);
  };
  const newPage = (heading = category) => {
    page = doc.addPage([W,H]); y = H - 90;
    page.drawRectangle({ x:0, y:0, width:W, height:H, color: colors.paper });
    page.drawRectangle({ x:0, y:H-8, width:W, height:8, color: colors.green });
    page.drawImage(elaineLogo, { x:M, y:20, width:34, height:34 });
    page.drawText("Elaine", { x:M+42, y:39, font:display, size:10, color:colors.green });
    page.drawText(heading.toLocaleUpperCase("pt-BR"), { x:M, y:H-43, font:body, size:8, color:colors.muted });
    page.drawLine({ start:{x:M,y:H-57}, end:{x:W-M,y:H-57}, thickness:0.6, color:colors.line });
    page.drawText(publication.title, {x:M+42,y:25,font:body,size:7,color:colors.muted});
    page.drawText(String(doc.getPageCount()).padStart(2,"0"), {x:W-M-17,y:32,font:body,size:9,color:colors.green});
    if (doc.getPageCount() > 4) {
      page.drawText("Voltar ao índice", {x:W-M-80,y:53,font:body,size:9,color:colors.green});
      links.push({page,rect:[W-M-84,49,W-M,66],target:3});
    }
    return page;
  };
  newPage("ACERVO DO NUTRI / BIBLIOTECA PRÁTICA");
  page.drawSvgPath("M19 14h43a10 10 0 0 1 10 10v31a10 10 0 0 1-10 10H37L20 77V65h-1A10 10 0 0 1 9 55V24a10 10 0 0 1 10-10Z", {x:M,y:686,scale:0.9,color:colors.tint,borderColor:colors.green,borderWidth:2.5});
  for (let i=0;i<3;i++) page.drawLine({start:{x:M+22.5,y:658.1-i*9},end:{x:M+50.4-i*6.75,y:658.1-i*9},thickness:4.05,color:colors.green});
  page.drawCircle({x:M+62.1,y:671.6,size:8.1,color:colors.orange,borderColor:colors.paper,borderWidth:3.6});
  for (const [i, label] of ["Olá, [Nome]!", "Vamos conversar?", "Cuidar começa aqui."].entries()) {
    const top = 742 - i*49, x = i === 1 ? 290 : 322;
    bubble(x, top, 205, 38, [colors.sage, colors.peach, colors.honey][i]!);
    page.drawText(label, {x:x+16,y:top-24,font:body,size:12,color:colors.green});
  }
  y = 568; text("Respostas\nprontas",56,display); text("da Nutri.",56,display,colors.green);
  y -= 30; text(publication.subtitle,19,body,colors.muted,M,385);
  y = 156; text("Palavras que aproximam.\nTempo para cuidar.",16,display,colors.green);
  newPage("APRESENTAÇÃO"); text("Cada conversa,\num cuidado.",34,display,colors.green); y-=26;
  text(publication.introduction,14); y-=28;
  text("Um repertório para a vida real",19,display); y-=12;
  text("Primeiros contatos, organização de consultas, entrega de materiais e acompanhamento: as mensagens estão organizadas por finalidade, sem presumir o gênero de quem recebe ou de quem atende.",12); y-=24;
  text("Um guia independente",19,display); y-=12;
  text("Você não precisa acessar nenhum sistema para usar este produto. O PDF permite selecionar e copiar os textos; o DOCX acompanha as mesmas 240 mensagens em formato editável. Os campos permanecem em aberto para sua personalização.",12);
  newPage("COMO UTILIZAR"); text("Escolha. Personalize. Revise.",25,display,colors.green); y-=16;
  for (const instruction of publication.instructions) { text(instruction,10.5); y-=9; }
  y-=8; text("Campos personalizáveis",14,display,colors.green); y-=8;
  text("Nos cards, os trechos em amarelo e entre colchetes precisam ser substituídos antes do envio. Personalize uma cópia da mensagem e confira todos os campos.",10,body,colors.fieldInk); y-=10;
  bubble(M-8, y+6, W-M*2+16, lines(personalizedFields.map(field=>`[${field}]`).join("  ·  "),body,10).length*14.8+14, colors.honey);
  text(personalizedFields.map(field=>`[${field}]`).join("  ·  "),10);
  const indexPage = newPage("ÍNDICE CLICÁVEL"); text("Encontre a conversa.",30,display,colors.green); y-=12;
  text("Clique na categoria para ir à abertura. Cada categoria reúne oito situações e 24 mensagens.",11); y-=24;
  const indexRows: {y:number; id:string}[] = [];
  for (const [i, cat] of libraryCategories.entries()) {
    indexRows.push({y,id:cat.id});
    bubble(M-10, y+6, W-M*2+20, 39, [colors.tint, colors.peach, colors.honey][i%3]!);
    text(`${cat.id}   ${cat.name}`,15,display,colors.green,M,430); y-=21;
  }
  for (const cat of libraryCategories) {
    category = `${cat.id} / ${cat.name}`;
    const target = doc.getPageCount();
    newPage(); categoryPages.push({...cat,page:target+1});
    bubble(M-12, H-110, W-M*2+24, 150, colors.sage);
    y = H - 170; text(cat.id,76,display,colors.green); y-=30;
    text(cat.name,34,display,colors.green); y-=18;
    text("8 situações · 24 mensagens · 3 tons de voz",11,body,colors.muted); y-=32;
    for (const item of library.situations.filter(s=>s.categoryId===cat.id)) { text(`${item.id}   ${item.title}`,11); y-=10; }
    for (const item of library.situations.filter(s=>s.categoryId===cat.id)) {
      newPage(); text(`SITUAÇÃO ${item.id}`,10,display,colors.green); y-=12;
      text(item.title,23,display); y-=12;
      text(`CONTEXTO: ${item.context}`,10.5,body,colors.muted); y-=20;
      for (const tone of tones) {
        const wrapped = lines(item.messages[tone.id],body,11,W-M*2-32);
        const height = 49 + wrapped.length*16.28;
        if (height > H-90-31-BOTTOM) throw new Error(`Situação ${item.id}, tom ${tone.id}: a mensagem não cabe inteira em A4 a 11 pt. Reduza o texto antes de exportar; nenhuma mensagem será cortada.`);
        if (y-height < BOTTOM) {
          continuationPages++; newPage();
          text(`SITUAÇÃO ${item.id} · CONTINUAÇÃO`,10,display,colors.green); y-=16;
        }
        bubble(M, y, W-M*2, height, toneColors[tone.id]);
        page.drawRectangle({x:M,y:y-height+10,width:3,height:height-20,color:tone.id === "B" ? colors.orange : colors.green});
        page.drawText(`MENSAGEM ${tone.id} / ${tone.label}`,{x:M+16,y:y-23,font:display,size:10,color:colors.green});
        let baseline = y-45, inField = false;
        for (const line of wrapped) {
          let x=M+16;
          // Mantém o destaque mesmo quando um campo ocupa duas linhas.
          for (const part of line.split(/(\[|\])/g).filter(Boolean)) {
            if (part === "[") inField = true;
            const width = body.widthOfTextAtSize(part,11);
            if (inField) page.drawRectangle({x:x-0.5,y:baseline-3,width:width+1,height:14,color:colors.field});
            page.drawText(part,{x,y:baseline,font:body,size:11,color:inField?colors.fieldInk:colors.ink});
            x+=width;
            if (part === "]") inField = false;
          }
          baseline-=16.28;
        }
        y-=height; minBottomSpace=Math.min(minBottomSpace,y-BOTTOM); y-=14; messages++;
      }
    }
  }
  category="ATÉ A PRÓXIMA CONVERSA"; newPage(); y-=80;
  text("Palavras que aproximam.\nTempo para cuidar.",34,display,colors.green); y-=30;
  text(publication.closing,14); y-=35;
  text("Antes de enviar",16,display,colors.green); y-=12;
  text("Confira os campos, respeite o contexto e revise toda orientação clínica com nutricionista. Nenhuma mensagem substitui uma avaliação individual. Respeite sempre a privacidade e a decisão de não receber novos contatos.",12);
  for (const row of indexRows) {
    const cat=categoryPages.find(c=>c.id===row.id)!;
    indexPage.drawText(String(cat.page).padStart(2,"0"),{x:W-M-26,y:row.y-15,font:display,size:12,color:colors.green});
    links.push({page:indexPage,rect:[M,row.y-25,W-M,row.y+3],target:cat.page-1});
  }
  for (const link of links) {
    const annotation=doc.context.register(doc.context.obj({Type:"Annot",Subtype:"Link",Rect:link.rect,Border:[0,0,0],Dest:[doc.getPage(link.target).ref,PDFName.of("Fit")]}));
    link.page.node.addAnnot(annotation);
  }
  const root=doc.context.register(doc.context.obj({Type:"Outlines"}));
  const entries=[{name:"Índice",page:4},...categoryPages.map(c=>({name:`${c.id} · ${c.name}`,page:c.page}))];
  const refs=entries.map(()=>doc.context.register(doc.context.obj({})));
  entries.forEach((entry,i)=>{
    const outline=doc.context.obj({Title:PDFHexString.fromText(entry.name),Parent:root,Dest:[doc.getPage(entry.page-1).ref,PDFName.of("Fit")]});
    const previous = refs[i-1], next = refs[i+1], current = refs[i];
    if (previous) outline.set(PDFName.of("Prev"), previous);
    if (next) outline.set(PDFName.of("Next"), next);
    if (current) doc.context.assign(current, outline);
  });
  doc.context.assign(root,doc.context.obj({Type:"Outlines",First:refs[0]!,Last:refs[refs.length-1]!,Count:refs.length}));
  doc.catalog.set(PDFName.of("Outlines"),root);
  doc.catalog.set(PDFName.of("PageMode"),PDFName.of("UseOutlines"));
  const bytes=await doc.save();
  return {bytes,report:{pages:doc.getPageCount(),messages,situations:library.situations.length,categoryPages,continuationPages,minBottomSpace:Math.round(minBottomSpace*10)/10,checkedAt:new Date().toISOString()}};
}
