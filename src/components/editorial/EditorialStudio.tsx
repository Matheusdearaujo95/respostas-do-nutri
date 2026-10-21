import { useEffect, useState } from "react";
import { ArrowDownToLine, ArrowLeft, ArrowRight, BookOpen, Check, CheckCircle2, ChevronRight, CircleHelp, LayoutGrid, Layers, LockKeyhole, Maximize2, Palette, PanelLeftOpen, PencilLine, X } from "lucide-react";
import { ElaineSignature, ProductIcon, logoSvg } from "./Brand";
import { EditorialPage } from "./EditorialPages";
import { DirectionCard, IdentityView, ReferencesView } from "./StudioViews";
import { identity, previewPages, type PreviewPage } from "../../lib/editorial/identity";
import { ContentEditor } from "./ContentEditor";
import { ExportPanel } from "./ExportPanel";
import { LibraryProvider } from "./LibraryProvider";

type StudioView = "exports" | "content" | "preview" | "identity" | "layout" | "references";
const navigation = [
  { id: "exports" as const, label: "Arquivos finais", icon: ArrowDownToLine },
  { id: "content" as const, label: "Conteúdo e edição", icon: PencilLine },
  { id: "preview" as const, label: "Visão geral", icon: LayoutGrid },
  { id: "identity" as const, label: "Identidade visual", icon: Palette },
  { id: "layout" as const, label: "Diagramação", icon: BookOpen },
  { id: "references" as const, label: "Referências e direção", icon: Layers },
];
function downloadFile(filename: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function EditorialStudio() {
  return <LibraryProvider><EditorialStudioWorkspace /></LibraryProvider>;
}
function EditorialStudioWorkspace() {
  const [view, setView] = useState<StudioView>("exports");
  const [page, setPage] = useState<PreviewPage>("cover");
  const [sidebar, setSidebar] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [approved, setApproved] = useState(false);
  const [notice, setNotice] = useState("");
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("nutri-visual-v1") || "null");
      if (stored && typeof stored.feedback === "string") setFeedback(stored.feedback);
      if (stored?.approved === true) setApproved(true);
    } catch { /* A prévia funciona sem armazenamento local. */ }
  }, []);
  useEffect(() => {
    if (!notice) return;
    const timeout = setTimeout(() => setNotice(""), 6000);
    return () => clearTimeout(timeout);
  }, [notice]);
  useEffect(() => {
    if (!feedbackOpen && !expanded) return;
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") { setFeedbackOpen(false); setExpanded(false); } };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [feedbackOpen, expanded]);
  const saveReview = (isApproved: boolean) => {
    setApproved(isApproved);
    try {
      localStorage.setItem("nutri-visual-v1", JSON.stringify({ feedback, approved: isApproved }));
      setNotice(isApproved ? "Aprovação visual registrada neste navegador. A biblioteca já está disponível em Conteúdo e edição." : "Observações salvas neste navegador. Compartilhe os ajustes no chat.");
    } catch { setNotice("Não foi possível salvar no navegador. Baixe o briefing para guardar sua revisão."); }
    setFeedbackOpen(false);
  };
  const exportBrief = () => downloadFile("respostas-da-nutri-direcao-visual.json", JSON.stringify({ stage: "Identidade visual para aprovação — não é o produto final", identity, approved, feedback, fontNote: "Os SVGs usam Bricolage Grotesque como texto editável. Instale a fonte para preservar a composição em outros editores." }, null, 2), "application/json;charset=utf-8");
  const currentIndex = previewPages.findIndex(item => item.id === page);
  return (
    <div className="studio-shell">
      <aside className={`studio-sidebar ${sidebar ? "is-open" : ""}`}>
        <a href="#main" className="studio-signature" aria-label="Estúdio Respostas prontas da Nutri"><ProductIcon /><span>Respostas prontas<strong>da Nutri<span>.</span></strong></span></a>
        <div className="workspace-label">ESTÚDIO EDITORIAL <span>INTERNO</span></div>
        <nav className="studio-nav" aria-label="Navegação do estúdio">{navigation.map(item => <button key={item.id} className={view === item.id ? "active" : ""} onClick={() => { setView(item.id); setSidebar(false); }}><item.icon size={18} strokeWidth={1.6} />{item.label}{view === item.id && <span className="nav-dot" />}</button>)}</nav>
        <div className="sidebar-production"><span className="sidebar-section-label">PRODUÇÃO DO GUIA</span><div className="production-step"><span>01</span><div>Identidade visual<small>{approved ? "Aprovação registrada" : "Direção preservada"}</small></div><Check size={13} /></div><div className="production-step"><span>02</span><div>Conteúdo editorial<small>80 situações · edição disponível</small></div><Check size={13} /></div><div className="production-step current"><span>03</span><div>Arquivos finais<small>PDF + DOCX · conferência</small></div><span className="step-indicator" /></div></div>
        <div className="sidebar-bottom"><div className="internal-note"><LockKeyhole size={16} /><div>Seu espaço de criação<p>Não é uma área de acesso para pacientes ou compradoras. Sem autenticação: não use dados pessoais.</p></div></div><div className="sidebar-family"><span>UM PRODUTO DA FAMÍLIA</span><strong>Acervo do Nutri</strong></div></div>
      </aside>
      {sidebar && <button className="sidebar-overlay" onClick={() => setSidebar(false)} aria-label="Fechar menu" />}
      <div className="studio-main">
        <header className="studio-topbar"><div><button className="mobile-menu" aria-label="Abrir menu" onClick={() => setSidebar(!sidebar)}><PanelLeftOpen size={20} /></button><span>Estúdio editorial</span><ChevronRight size={13} /><strong>{navigation.find(item => item.id === view)?.label}</strong></div><ElaineSignature className="topbar-signature" /></header>
        <main id="main" className="studio-content">
          <section className="studio-heading"><div><div className="section-eyebrow"><span /> {view === "content" ? "PALAVRAS QUE APROXIMAM" : "UM NOVO CAPÍTULO DA SUA MARCA"}</div><h1>{view === "exports" ? "Seu guia, pronto para conferir." : view === "content" ? "Cada conversa, um cuidado." : view === "identity" ? "Uma marca com voz própria." : view === "references" ? "Da referência à essência." : view === "layout" ? "Espaço para cada palavra." : "Identidade que conversa."}</h1><p>{view === "exports" ? "Gere os arquivos reais, confira a diagramação e prepare os downloads para entregar pela Hotmart." : view === "content" ? "80 situações, 240 mensagens e três tons de voz. Revise, personalize a fonte editorial e guarde suas atualizações." : view === "preview" ? "Uma direção visual para aproximar, organizar e cuidar. Conheça a proposta do seu novo guia." : view === "identity" ? "A mesma família. Uma nova personalidade. Conheça os elementos que dão voz ao produto." : view === "layout" ? "Uma amostra da experiência de leitura: clara, leve e pensada para a rotina." : "Os princípios que conectam este produto ao universo do Acervo do Nutri."}</p></div><button className="button button-outline brief-button" onClick={exportBrief}><ArrowDownToLine size={15} />Baixar briefing</button></section>
          <div className="stage-banner"><span className="stage-icon"><ArrowDownToLine size={17} /></span><div><strong>Conteúdo, edição e exportação no mesmo estúdio.</strong><p>{view === "exports" ? "Gere e visualize o PDF verdadeiro nesta área. O DOCX e o backup usam a mesma fonte editorial, incluindo suas edições locais. Confira os arquivos antes de publicar." : view === "content" ? "Edite e revise as 80 situações. As alterações são usadas imediatamente em Arquivos finais, sem inserir dados de pacientes." : "As amostras visuais foram preservadas. Para conferir o documento completo com seus textos atuais, use Arquivos finais."}</p></div><span className="tag">ARQUIVOS 03</span></div>
          {view === "exports" && <ExportPanel />}
          {view === "content" && <ContentEditor />}
          {(view === "preview" || view === "layout") && <div className="preview-grid">
            <section className={`preview-panel ${expanded ? "preview-expanded" : ""}`} aria-label="Prévia editorial">
              <header className="panel-heading"><div><BookOpen size={17} /><strong>Prévia do guia</strong><span>A4 VERTICAL</span></div><button className="icon-button" aria-label={expanded ? "Reduzir prévia" : "Ampliar prévia"} onClick={() => setExpanded(!expanded)}>{expanded ? <X size={17} /> : <Maximize2 size={17} />}</button></header>
              <div className="page-tabs" role="tablist" aria-label="Modelos de página">{previewPages.map(item => <button key={item.id} role="tab" aria-selected={page === item.id} className={page === item.id ? "active" : ""} onClick={() => setPage(item.id)}>{item.name}</button>)}</div>
              <div className="paper-stage"><EditorialPage page={page} onNavigate={setPage} /></div>
              <footer className="preview-navigation"><span><span className="small-status-dot" />{page === "messages" ? "1 situação de amostra · 3 tons de voz" : "Amostra visual · não é um PDF exportado"}</span><div><button className="icon-button" aria-label="Modelo anterior" disabled={currentIndex === 0} onClick={() => setPage(previewPages[currentIndex - 1].id)}><ArrowLeft size={15} /></button><span>{currentIndex + 1} / {previewPages.length}</span><button className="icon-button" aria-label="Próximo modelo" disabled={currentIndex === previewPages.length - 1} onClick={() => setPage(previewPages[currentIndex + 1].id)}><ArrowRight size={15} /></button></div></footer>
            </section>
            <aside className="direction-column"><DirectionCard /><div className="studio-card contents-card"><span className="card-eyebrow">UM GUIA, MUITAS CONVERSAS</span><div className="guide-metrics"><div><strong>80</strong><span>situações</span></div><div><strong>240</strong><span>mensagens</span></div><div><strong>3</strong><span>tons de voz</span></div></div><p>Os 240 textos completos estão disponíveis em Conteúdo e edição. Esta área preserva os modelos de diagramação da etapa visual.</p><div className="tone-chips"><span>A · Profissional</span><span>B · Próxima</span><span>C · Acolhedora</span></div></div><div className="human-note"><PencilLine size={19} /><p>“Finalmente, as mensagens que preciso em um só lugar.”</p><span>O sentimento que queremos entregar.</span></div></aside>
          </div>}
          {view === "identity" && <IdentityView onDownload={variant => { downloadFile(`respostas-da-nutri-${variant}.svg`, logoSvg(variant), "image/svg+xml;charset=utf-8"); setNotice("SVG baixado. Use Bricolage Grotesque instalada para preservar a tipografia editável."); }} />}
          {view === "references" && <ReferencesView />}
          {view !== "content" && view !== "exports" && <section className="approval-bar"><div><span className="approval-icon">{approved ? <CheckCircle2 size={23} /> : <CircleHelp size={23} />}</span><div><h3>{approved ? "Direção visual aprovada por você." : "Essa direção tem a sua cara?"}</h3><p>{approved ? "Registro local preservado. Você pode revisar a identidade sem perder o conteúdo editorial." : "Revise a capa, a marca e os modelos. A biblioteca completa está em Conteúdo e edição."}</p></div></div><div><button className="button button-text" onClick={() => setFeedbackOpen(true)}><PencilLine size={15} />{approved ? "Rever aprovação" : "Anotar ajustes"}</button><button className="button button-primary" onClick={() => saveReview(true)}><Check size={16} />{approved ? "Aprovação registrada" : "Aprovar direção visual"}</button></div></section>}
          <footer className="studio-footer"><span>Feito para comunicar com cuidado.</span><span>Respostas prontas da Nutri <span>·</span> Arquivos finais 03</span></footer>
        </main>
      </div>
      {feedbackOpen && <div className="review-overlay" onClick={() => setFeedbackOpen(false)}><section className="review-dialog" role="dialog" aria-modal="true" aria-labelledby="review-title" onClick={event => event.stopPropagation()}><button className="icon-button dialog-close" onClick={() => setFeedbackOpen(false)} aria-label="Fechar observações"><X size={19} /></button><span className="card-eyebrow">SUA REVISÃO</span><h2 id="review-title">Vamos refinar a proposta?</h2><p>As observações ficam somente neste navegador. Baixe o briefing e compartilhe os ajustes no chat para que sejam aplicados.</p><label htmlFor="visual-feedback">O que você gostaria de ajustar?</label><textarea id="visual-feedback" autoFocus rows={5} value={feedback} onChange={event => setFeedback(event.target.value)} placeholder="Ex.: Quero o título da capa um pouco menor…" /><div className="review-actions"><button className="button button-outline" onClick={exportBrief}>Baixar briefing</button><button className="button button-primary" onClick={() => saveReview(false)}>Salvar observações</button></div></section></div>}
      {notice && <div className="studio-toast" role="status"><CheckCircle2 size={17} />{notice}</div>}
    </div>
  );
}
