// @vitest-environment node
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { inflateRawSync } from "node:zlib";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PDFArray, PDFDict, PDFDocument, PDFName } from "pdf-lib";
import { generatePdf } from "../lib/editorial/export-pdf";
import { generateDocx } from "../lib/editorial/export-docx";
import { exportSnapshot, publicationFilename } from "../lib/editorial/export-model";
import { createLibrary } from "../lib/editorial/library";
const require = createRequire(import.meta.url);
afterEach(() => vi.unstubAllGlobals());
function localFonts() {
  vi.stubGlobal("fetch", async (url: string) => {
    const name=String(url).includes("bricolage") ? "@fontsource/bricolage-grotesque/files/bricolage-grotesque-latin-700-normal.woff" : "@fontsource/figtree/files/figtree-latin-400-normal.woff";
    const bytes=String(url).includes("elaine-logo.jpg")
      ? await readFile(new URL("../../public/images/elaine-logo.jpg", import.meta.url))
      : await readFile(require.resolve(name));
    return {ok:true,arrayBuffer:async()=>bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength)};
  });
}
// Lê entradas ZIP locais sem streaming produzidas pelo Packer (OOXML real).
function unzipXml(bytes: Uint8Array): string {
  const data=Buffer.from(bytes); const xml:string[]=[]; let offset=0;
  while(offset+30<data.length && data.readUInt32LE(offset)===0x04034b50) {
    const method=data.readUInt16LE(offset+8), size=data.readUInt32LE(offset+18);
    const nameLength=data.readUInt16LE(offset+26), extraLength=data.readUInt16LE(offset+28);
    const name=data.subarray(offset+30,offset+30+nameLength).toString();
    const start=offset+30+nameLength+extraLength;
    const compressed=data.subarray(start,start+size);
    if(name==="word/document.xml") xml.push((method===8?inflateRawSync(compressed):compressed).toString("utf8"));
    offset=start+size;
  }
  return xml.join("");
}
describe("Arquivos editoriais reais",()=>{
  it("valida uma cópia sem alterar a biblioteca e distingue conferência de final",()=>{
    const library=createLibrary();
    expect(exportSnapshot(library)).toEqual(library);
    expect(exportSnapshot(library)).not.toBe(library);
    expect(publicationFilename(library,"pdf")).toContain("para-conferencia");
    library.reviewedIds=library.situations.map(s=>s.id);
    expect(publicationFilename(library,"docx")).toContain("-final.docx");
    library.situations[0].messages.A="";
    expect(()=>exportSnapshot(library)).toThrow(/alertas/);
  });
  it("gera PDF A4 com 240 mensagens, links e marcadores",async()=>{
    localFonts();
    const result=await generatePdf(createLibrary());
    expect(result.report.messages).toBe(240);
    expect(result.report.situations).toBe(80);
    expect(result.report.minBottomSpace).toBeGreaterThanOrEqual(0);
    expect(result.report.warnings).toEqual([]);
    const pdf=await PDFDocument.load(result.bytes);
    expect(pdf.getPageCount()).toBe(result.report.pages);
    // A assinatura da Elaine acompanha todas as páginas, sem rasterizar os textos.
    for (const page of pdf.getPages()) {
      const images = page.node.Resources()!.lookup(PDFName.of("XObject"), PDFDict);
      expect(images.entries().some(([, ref]) => pdf.context.lookup(ref, PDFDict).get(PDFName.of("Subtype"))?.toString() === "/Image")).toBe(true);
    }
    expect(pdf.getPageCount()).toBeGreaterThanOrEqual(95);
    expect(pdf.getPage(0).getWidth()).toBeCloseTo(595.28);
    expect(pdf.getPage(0).getHeight()).toBeCloseTo(841.89);
    const annots=pdf.getPage(3).node.lookup(PDFName.of("Annots"),PDFArray);
    expect(annots.size()).toBe(10);
    for(let i=0;i<10;i++) {
      const link=annots.lookup(i,PDFDict);
      const dest=link.lookup(PDFName.of("Dest"),PDFArray);
      expect(dest.get(0).toString()).toBe(pdf.getPage(result.report.categoryPages[i].page-1).ref.toString());
    }
    const outlines=pdf.catalog.lookup(PDFName.of("Outlines"),PDFDict);
    expect(outlines.get(PDFName.of("Count"))?.toString()).toBe("11");
    for(let i=4;i<pdf.getPageCount();i++) {
      const annotations=pdf.getPage(i).node.lookup(PDFName.of("Annots"),PDFArray);
      const back=annotations.lookup(0,PDFDict).lookup(PDFName.of("Dest"),PDFArray);
      expect(back.get(0).toString()).toBe(pdf.getPage(3).ref.toString());
    }
    // Texto real com mapeamento Unicode, não páginas rasterizadas.
    const fonts=pdf.getPage(0).node.Resources()!.lookup(PDFName.of("Font"),PDFDict);
    expect(fonts.entries().length).toBeGreaterThanOrEqual(2);
    for(const [,ref] of fonts.entries()) {
      const font=pdf.context.lookup(ref,PDFDict);
      expect(font.has(PDFName.of("ToUnicode"))).toBe(true);
    }
  },30000);
  it("permite baixar um PDF de conferência quando a logo falha, sem esconder o aviso",async()=>{
    localFonts();
    const fetchLocal = globalThis.fetch;
    vi.stubGlobal("fetch", (url: string) => String(url).includes("elaine-logo.jpg")
      ? Promise.resolve({ ok: false })
      : fetchLocal(url));
    const result = await generatePdf(createLibrary());
    expect(result.report.messages).toBe(240);
    expect(result.report.warnings).toHaveLength(1);
    expect(result.report.warnings[0]).toContain("sem a imagem");
    const pdf = await PDFDocument.load(result.bytes);
    expect(pdf.getPageCount()).toBe(result.report.pages);
  },30000);
  it("recusa caracteres sem suporte e mensagens que não cabem inteiras",async()=>{
    localFonts();
    const library=createLibrary(); library.situations[0].messages.A+=" 🥑";
    await expect(generatePdf(library)).rejects.toThrow(/não suporta/);
    library.situations[0].messages.A="Texto de conferência de tamanho. ".repeat(150);
    await expect(generatePdf(library)).rejects.toThrow(/não cabe/);
  },30000);
  it("produz DOCX ZIP com todos os textos, acentos, âncoras e estilos",async()=>{
    localFonts();
    const library=createLibrary();
    const blob=await generateDocx(library);
    const bytes=new Uint8Array(await blob.arrayBuffer());
    expect(Array.from(bytes.slice(0,2))).toEqual([80,75]);
    const xml=unzipXml(bytes);
    expect(xml).toContain("wordprocessingml");
    const coverXml = xml.split('<w:br w:type="page"')[0]!;
    expect(coverXml).not.toMatch(/240|80 situações/);
    expect(coverXml).toContain("Mensagens para facilitar sua comunicação com pacientes.");
    expect(xml).toContain('w:anchor="categoria_01"');
    expect(xml).toContain("[Horário]");
    expect(xml).toContain("Heading1");
    expect((xml.match(/MENSAGEM [ABC] \/ /g)||[]).length).toBe(240);
    for(const item of library.situations) for(const message of Object.values(item.messages)) {
      const escape=(s:string)=>s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
      for(const part of message.split(/(\[[^\]]+\]|\r?\n)/g).filter(p=>p.trim())) expect(xml).toContain(escape(part));
    }
  },30000);
});
