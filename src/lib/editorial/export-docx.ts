import { AlignmentType, Bookmark, BorderStyle, Document, Footer, Header, HeadingLevel, ImageRun, InternalHyperlink, PageBreak, PageNumber, Packer, Paragraph, ShadingType, TableOfContents, TextRun } from "docx";
import { tones } from "./content";
import { libraryCategories, personalizedFields, type Library } from "./library";
import { exportSnapshot, publication } from "./export-model";

const green="3F5C39", ink="1D2A1F", muted="5A6552";
const run=(text:string,bold=false,color=ink,size=24)=>new TextRun({text,bold,color,size,font:"Figtree"});
const paragraph=(text:string)=>new Paragraph({children:[run(text)],spacing:{after:180,line:320}});
const heading=(text:string,level:typeof HeadingLevel.HEADING_1 | typeof HeadingLevel.HEADING_2)=>new Paragraph({text,heading:level,spacing:{before:240,after:200},keepNext:true});
const pageBreak=()=>new Paragraph({children:[new PageBreak()]});
const back=()=>new Paragraph({children:[new InternalHyperlink({anchor:"indice",children:[run("Voltar ao índice",false,green,20)]})],spacing:{before:180,after:120}});

export async function generateDocx(source: Library): Promise<Blob> {
  const library=exportSnapshot(source);
  const logoResponse=await fetch("/images/elaine-logo.jpg");
  if (!logoResponse.ok) throw new Error("Não foi possível carregar a logo da Elaine. Recarregue e tente novamente.");
  const logoBytes=new Uint8Array(await logoResponse.arrayBuffer());
  const children: Paragraph[]=[];
  children.push(new Paragraph({children:[run("ACERVO DO NUTRI / BIBLIOTECA PRÁTICA",false,green,20)],spacing:{after:1000}}));
  children.push(new Paragraph({children:[new TextRun({text:publication.title,font:"Bricolage Grotesque",bold:true,color:green,size:76})],spacing:{after:420}}));
  children.push(paragraph(publication.subtitle),paragraph("Palavras que aproximam. Tempo para cuidar."));
  children.push(pageBreak(),heading("Apresentação",HeadingLevel.HEADING_1),paragraph(publication.introduction));
  children.push(paragraph("Este documento contém as mesmas mensagens do PDF e pode ser editado sem acessar o estúdio. Mantenha uma cópia original antes de personalizar. Instale Figtree e Bricolage Grotesque para maior fidelidade tipográfica; sem elas, o editor usará fontes substitutas. A paginação varia entre Word, LibreOffice e outros editores."));
  children.push(heading("Como utilizar",HeadingLevel.HEADING_2));
  publication.instructions.forEach(text=>children.push(paragraph(text)));
  children.push(heading("Campos personalizáveis",HeadingLevel.HEADING_2),paragraph(personalizedFields.map(f=>`[${f}]`).join(" · ")));
  children.push(pageBreak(),new Paragraph({children:[new Bookmark({id:"indice",children:[run("Índice de categorias",true,green,44)]})],spacing:{after:240}}));
  children.push(paragraph("Os links abaixo funcionam sem atualizar campos. Alguns editores exigem Ctrl + clique para seguir o link."));
  for(const cat of libraryCategories) children.push(new Paragraph({children:[new InternalHyperlink({anchor:`categoria_${cat.id}`,children:[run(`${cat.id} · ${cat.name}`,true,green,26)]})],spacing:{after:240}}));
  // O sumário de campos é adicional ao índice manual, que funciona imediatamente.
  const toc=new TableOfContents("Sumário detalhado (atualize os campos no Word)",{hyperlink:true,headingStyleRange:"1-2"});
  const beforeToc=[...children]; children.length=0;
  for(const cat of libraryCategories) {
    children.push(pageBreak(),new Paragraph({heading:HeadingLevel.HEADING_1,children:[new Bookmark({id:`categoria_${cat.id}`,children:[run(`${cat.id} / ${cat.name}`,true,green,40)]})],keepNext:true,spacing:{after:240}}),paragraph("8 situações · 24 mensagens"));
    for(const item of library.situations.filter(s=>s.categoryId===cat.id)) {
      children.push(pageBreak(),heading(`Situação ${item.id} — ${item.title}`,HeadingLevel.HEADING_2),paragraph(`Contexto: ${item.context}`));
      for(const tone of tones) {
        children.push(new Paragraph({children:[run(`MENSAGEM ${tone.id} / ${tone.label}`,true,green,22)],keepNext:true,spacing:{before:240,after:120}}));
        const parts=item.messages[tone.id].split(/(\[[^\]]+\]|\r?\n)/g);
        children.push(new Paragraph({children:parts.filter(Boolean).map(part=>part.includes("\n")?new TextRun({break:1}):part.startsWith("[")?new TextRun({text:part,bold:true,color:"613D14",font:"Figtree",size:24,shading:{type:ShadingType.CLEAR,fill:"F7D887"}}):run(part)),keepLines:true,spacing:{after:200,line:320},indent:{left:160,right:160},shading:{type:ShadingType.CLEAR,fill:tone.id === "A"?"EBF0E2":tone.id === "B"?"FCE7D8":"FAF0CD"},border:{left:{style:BorderStyle.SINGLE,color:tone.id === "B"?"E8562F":green,size:14,space:10}}}));
      }
      children.push(back());
    }
  }
  children.push(pageBreak(),heading("Até a próxima conversa",HeadingLevel.HEADING_1),paragraph(publication.closing),paragraph("Orientações clínicas exigem revisão por nutricionista. Respeite a privacidade e qualquer pedido de não contato."),back());
  const doc=new Document({title:publication.title,subject:publication.subtitle,creator:"Acervo do Nutri",description:"80 situações e 240 mensagens editáveis",features:{updateFields:true},styles:{default:{document:{run:{font:"Figtree",size:24,color:ink},paragraph:{spacing:{after:160}}},heading1:{run:{font:"Bricolage Grotesque",size:40,bold:true,color:green}},heading2:{run:{font:"Bricolage Grotesque",size:30,bold:true,color:green}}}},sections:[{properties:{page:{size:{width:11906,height:16838},margin:{top:1134,bottom:1134,left:1134,right:1134}}},headers:{default:new Header({children:[new Paragraph({children:[run(publication.title,false,muted,18)]})]})},footers:{default:new Footer({children:[new Paragraph({alignment:AlignmentType.RIGHT,children:[new ImageRun({type:"jpg",data:logoBytes,transformation:{width:36,height:36},altText:{title:"Logo da Elaine",description:"Monograma da Elaine",name:"Elaine"}}),run("  Elaine · Respostas prontas da Nutri · ",false,muted,18),new TextRun({children:[PageNumber.CURRENT],size:18,color:muted})]})]})},children:[...beforeToc,pageBreak(),toc,...children]}]});
  return Packer.toBlob(doc);
}
