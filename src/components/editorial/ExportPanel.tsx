import { useEffect, useState } from "react";
import { ArrowDownToLine, FileCheck2, FileText, RefreshCw } from "lucide-react";
import { checkLibrary, downloadBackup } from "../../lib/editorial/library";
import { publicationFilename, saveBlob } from "../../lib/editorial/export-model";
import type { PdfResult } from "../../lib/editorial/export-pdf";
import { useLibrary } from "./LibraryProvider";
import "./export-panel.css";

const tests = [
  "Abrir o PDF no computador e conferir capa, fontes, acentos e últimas páginas.",
  "Abrir o PDF no celular e conferir leitura e navegação.",
  "Clicar nas 10 categorias, em Voltar ao índice e nos marcadores do leitor, se disponíveis.",
  "Copiar mensagens dos três tons e conferir acentos e campos entre colchetes.",
  "Percorrer todas as páginas: nenhum card cortado, sobreposto ou sem texto.",
  "Abrir o DOCX no Word ou LibreOffice, editar uma mensagem e salvar uma cópia.",
  "Conferir as 80 situações, 240 mensagens e a revisão clínica por nutricionista.",
];
export function ExportPanel() {
  const { library, ready, saveStatus, storageBlocked } = useLibrary();
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [pdf, setPdf] = useState<PdfResult | null>(null);
  const [pdfUrl, setPdfUrl] = useState("");
  const [docx, setDocx] = useState<Blob | null>(null);
  const [page, setPage] = useState(1);
  const [confirmed, setConfirmed] = useState<number[]>([]);
  const [acknowledged, setAcknowledged] = useState(false);
  const issues = checkLibrary(library);
  const reviewed = library.reviewedIds.length;
  useEffect(() => {
    setPdf(null); setDocx(null); setConfirmed([]); setAcknowledged(false); setError("");
  }, [library]);
  useEffect(() => {
    if (!pdf) { setPdfUrl(""); return; }
    const url = URL.createObjectURL(new Blob([new Uint8Array(pdf.bytes)], { type: "application/pdf" }));
    setPdfUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [pdf]);
  const prepare = async (format: "pdf" | "docx") => {
    setBusy(format); setError(""); setConfirmed([]);
    // Uma nova geração precisa de nova conferência, inclusive se ela falhar.
    if (format === "pdf") setPdf(null);
    else setDocx(null);
    try {
      if (format === "pdf") {
        const { generatePdf } = await import("../../lib/editorial/export-pdf");
        setPdf(await generatePdf(library)); setPage(1);
      } else {
        const { generateDocx } = await import("../../lib/editorial/export-docx");
        setDocx(await generateDocx(library));
      }
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Não foi possível gerar o arquivo. Tente novamente."); }
    finally { setBusy(""); }
  };
  const blocked = !ready || !!busy || issues.length > 0 || !acknowledged;
  const releaseReady = reviewed === 80 && confirmed.length === tests.length && !!pdf && !pdf.report.warnings.length && !!docx;
  return <section className="export-workspace" aria-label="Exportação e conferência">
    <div className="export-summary studio-card"><FileCheck2 size={30} /><div><h2>Do estúdio para o arquivo.</h2><p>Exporte o conteúdo atual, com todas as suas edições. PDF A4 com texto selecionável e navegação real; DOCX nativo e editável. Sem impressão do navegador, sem acesso das compradoras ao estúdio.</p></div><span className="tag">80 / 240</span></div>
    <p className={`export-status ${storageBlocked ? "export-warning" : ""}`}>{saveStatus}</p>
    <section className="studio-card" aria-labelledby="pdf-interactions-title"><h3 id="pdf-interactions-title">O que continua clicável no PDF?</h3><p><strong>Os links de navegação continuam funcionando:</strong> as categorias do índice levam às páginas correspondentes e “Voltar ao índice” retorna ao sumário. Os marcadores laterais também ajudam a navegar, quando o leitor de PDF oferece esse recurso.</p><p><strong>Animações, efeitos ao passar o mouse e controles do estúdio não vão para o PDF.</strong> Editar, filtrar tons, gerar arquivos e o botão Copiar pertencem apenas a esta ferramenta interna. No PDF, os três tons ficam visíveis em blocos separados; a pessoa seleciona o texto e usa a função de copiar do próprio leitor. Para alterar os textos no documento, use o DOCX.</p><p>A diagramação usa fundos lisos em verde e neutros, sem degradês ou alternância de cores entre os tons. Os campos para personalizar ficam destacados em verde. Gere novamente os arquivos para obter esta versão; arquivos já baixados não mudam automaticamente. Se a imagem da Elaine estiver indisponível, o PDF de conferência ainda poderá ser baixado, com um aviso explícito para corrigir a logo antes da publicação.</p><p>A capa não exibe quantidades. As contagens ficam na conferência e no conteúdo interno, sem prender a identidade a uma edição específica.</p></section>
    <div className="export-review studio-card"><h3>Antes de gerar</h3><p><strong>{reviewed}/80 situações marcadas como revisadas por você.</strong> {issues.length ? `${issues.length} alerta(s) impedem a exportação. Corrija em Conteúdo e edição.` : "Nenhum alerta nas checagens editoriais automáticas."}</p><p>Checagens automáticas não comprovam naturalidade, neutralidade completa nem segurança clínica. Sem as 80 revisões, o nome do download indica <strong>para-conferência</strong>. Mesmo com todas as revisões, faça os testes abaixo antes da venda.</p><label className="export-checkbox"><input type="checkbox" checked={acknowledged} onChange={event => setAcknowledged(event.target.checked)} />Entendo que devo revisar o conteúdo e que toda orientação clínica exige revisão por nutricionista antes de disponibilizar o produto.</label>
      {issues.length > 0 && <details><summary>Ver alertas</summary><ul>{issues.map((issue, index) => <li key={index}>{issue.id}: {issue.detail}</li>)}</ul></details>}
    </div>
    <div className="export-downloads">
      <article className="studio-card"><span className="card-eyebrow">01 / VERSÃO PREMIUM</span><h3>Guia em PDF</h3><p>Capa, apresentação, instruções, índice, aberturas, 240 mensagens e encerramento. Fontes incorporadas, links internos e marcadores. Cada mensagem permanece inteira em um card.</p><button className="button button-primary" disabled={blocked} onClick={() => prepare("pdf")}><RefreshCw size={15} />{busy === "pdf" ? "Diagramando…" : pdf ? "Gerar PDF novamente" : "Gerar e conferir PDF"}</button>{pdfUrl && <div><p role="status">PDF gerado. Use o botão abaixo para salvar no seu aparelho.</p><a className="button button-outline" href={pdfUrl} target="_blank" rel="noopener noreferrer" download={publicationFilename(pdf!.report.warnings.length ? { ...library, reviewedIds: [] } : library, "pdf")}><ArrowDownToLine size={15} />Baixar PDF ({pdf!.report.pages} páginas)</a><a className="button button-text" href={pdfUrl} target="_blank" rel="noopener noreferrer">Abrir PDF em outra aba</a><p>Se o download for bloqueado na prévia do editor, abra o site fora do editor e tente novamente. Você também pode abrir o PDF em outra aba e usar o botão de salvar do leitor.</p></div>}</article>
      <article className="studio-card"><span className="card-eyebrow">02 / VERSÃO EDITÁVEL</span><h3>Mensagens em DOCX</h3><p>As mesmas mensagens, com categorias, títulos, contextos, campos e estilos editáveis. Índice de categorias já clicável e sumário detalhado atualizável no Word.</p><button className="button button-primary" disabled={blocked} onClick={() => prepare("docx")}><FileText size={15} />{busy === "docx" ? "Preparando…" : docx ? "Gerar DOCX novamente" : "Gerar DOCX editável"}</button>{docx && <button className="button button-outline" onClick={() => saveBlob(docx, publicationFilename(library, "docx"))}><ArrowDownToLine size={15} />Baixar DOCX</button>}</article>
    </div>
    {busy && <p role="status" className="export-status">{busy === "pdf" ? "Carregando as fontes do projeto e medindo cada texto. Aguarde a conclusão…" : "Montando o documento editável…"}</p>}
    {error && <div role="alert" className="export-error"><strong>Não foi possível gerar o arquivo.</strong><p>{error}</p><p>Se estiver usando a prévia dentro do editor, abra o site em outra aba, recarregue e tente novamente. Suas edições não são apagadas ao tentar gerar.</p></div>}
    {pdf?.report.warnings.map(warning => <div role="alert" className="export-warning" key={warning}>{warning}</div>)}
    {!acknowledged && <p className="export-status">Para habilitar a geração, marque a confirmação de revisão em “Antes de gerar”. Não é necessário marcar todas as situações como revisadas para baixar uma versão de conferência.</p>}
    {pdf && <section className="studio-card export-proof"><header><h3>Conferência do PDF gerado</h3><span className="tag">ARQUIVO REAL</span></header><div className="export-metrics"><span><strong>{pdf.report.pages}</strong> páginas A4</span><span><strong>{pdf.report.situations}</strong> situações</span><span><strong>{pdf.report.messages}</strong> mensagens</span><span><strong>{pdf.report.continuationPages}</strong> continuações</span></div><p>A medição com as fontes incorporadas terminou sem transbordamento. Menor folga até o limite de segurança: {pdf.report.minBottomSpace} pt. Isso não substitui inspeção visual em leitores reais.</p><div className="export-page-controls"><label htmlFor="pdf-page">Página</label><select id="pdf-page" value={page} onChange={event => setPage(Number(event.target.value))}>{Array.from({ length: pdf.report.pages }, (_, i) => <option key={i} value={i+1}>{i+1}</option>)}</select><button className="button button-text" onClick={() => setPage(4)}>Índice</button>{pdf.report.categoryPages.map(cat => <button className="button button-text" key={cat.id} onClick={() => setPage(cat.page)} title={cat.name}>{cat.id}</button>)}</div>{pdfUrl && <iframe key={`${pdfUrl}-${page}`} src={`${pdfUrl}#page=${page}&zoom=page-width`} title={`PDF final — página ${page}`} className="export-pdf-frame" />}<p>Se o navegador não mostrar a prévia ou ignorar a página selecionada, baixe o PDF e abra em um leitor. Em celulares, a visualização embutida depende do navegador.</p><button className="button button-outline" onClick={() => saveBlob(new Blob([JSON.stringify({ ...pdf.report, reviewedSituations: reviewed, readerTestsConfirmedByUser: confirmed.map(i=>tests[i]), note: "Medição automática executada na geração. Testes manuais são declarações da pessoa que marcou as caixas; não são testes executados pelo sistema." }, null, 2)], { type: "application/json" }), "respostas-da-nutri-conferencia.json")}>Baixar relatório da geração</button></section>}
    <section className="studio-card export-checklist"><h3>Conferência antes de enviar à Hotmart</h3><p>Marque somente os testes que você realmente realizou nos arquivos baixados. Este checklist vale para o conteúdo atual e é reiniciado ao editar ou sair desta área.</p>{tests.map((test, index) => <label className="export-checkbox" key={test}><input type="checkbox" checked={confirmed.includes(index)} onChange={event => setConfirmed(current => event.target.checked ? [...current, index] : current.filter(i => i !== index))} />{test}</label>)}<div className="export-release"><strong>{releaseReady ? "Conferência registrada por você." : "Publicação ainda depende de conferência."}</strong><p>{releaseReady ? "Baixe o PDF e o DOCX acima. Cadastre ambos como arquivos do produto na Hotmart e teste o acesso da compra. O estúdio não envia arquivos automaticamente." : "Gere os dois formatos, revise as 80 situações e conclua os testes. Os downloads de conferência permitem fazer essa validação antes de publicar."}</p></div></section>
    <section className="studio-card export-sources"><h3>Guarde a fonte, entregue os arquivos.</h3><p>Para futuras atualizações, preserve o backup JSON e o código do projeto. O JSON é fonte editorial interna, não é necessário entregá-lo às compradoras. PDF e DOCX funcionam fora do Lovable. As fontes do DOCX não são incorporadas: instale Figtree e Bricolage Grotesque para maior fidelidade. A paginação do DOCX varia entre editores.</p><button className="button button-outline" disabled={!ready} onClick={() => downloadBackup(library)}><ArrowDownToLine size={15} />Baixar fonte editorial JSON</button></section>
  </section>;
}
