import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { ArrowDownToLine, ArrowLeft, ArrowRight, CheckCircle2, Copy, FileUp, Search } from "lucide-react";
import { tones, type Situation, type Tone } from "../../lib/editorial/content";
import { checkLibrary, createLibrary, downloadBackup, libraryCategories, libraryStorageKey, parseLibrary, personalizedFields, type Library } from "../../lib/editorial/library";
import "./content-editor.css";

const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
function HighlightedText({ text }: { text: string }) {
  return <>{text.split(/(\[[^\]]+\])/g).map((part, index) => part.startsWith("[") ? <mark key={index}>{part}</mark> : part)}</>;
}

export function ContentEditor() {
  const [library, setLibrary] = useState<Library>(createLibrary);
  const [ready, setReady] = useState(false);
  const [storageBlocked, setStorageBlocked] = useState(false);
  const [saveStatus, setSaveStatus] = useState("Carregando conteúdo local…");
  const [categoryId, setCategoryId] = useState("01");
  const [selectedId, setSelectedId] = useState("01.01");
  const [query, setQuery] = useState("");
  const [toneFilter, setToneFilter] = useState<Tone | "all">("all");
  const [reviewFilter, setReviewFilter] = useState("all");
  const [editing, setEditing] = useState(true);
  const [notice, setNotice] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);
  useEffect(() => {
    try {
      const stored = localStorage.getItem(libraryStorageKey);
      if (stored) setLibrary(parseLibrary(stored));
      setSaveStatus(stored ? "Conteúdo recuperado deste navegador." : "Textos-base carregados. Alterações serão salvas neste navegador.");
    } catch {
      setStorageBlocked(true);
      setSaveStatus("Não foi possível ler o armazenamento. Os textos-base estão em memória; o conteúdo local anterior não será sobrescrito. Baixe um backup de suas alterações.");
    }
    setReady(true);
  }, []);
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(""), 6000);
    return () => clearTimeout(timer);
  }, [notice]);

  const persist = (next: Library, replaceBlocked = false) => {
    setLibrary(next);
    if (storageBlocked && !replaceBlocked) return;
    try {
      localStorage.setItem(libraryStorageKey, JSON.stringify(next));
      setStorageBlocked(false);
      setSaveStatus("Alterações salvas neste navegador. Faça um backup para guardar fora dele.");
    } catch {
      setSaveStatus("Não foi possível salvar no navegador. As alterações estão em memória: baixe o backup JSON antes de sair.");
      setStorageBlocked(true);
    }
  };
  const issues = checkLibrary(library);
  const issueIds = new Set(issues.map(item => item.id));
  const filtered = library.situations.filter(item => (!categoryId || item.categoryId === categoryId)
    && (!query || normalize([item.id, item.title, item.context, ...Object.values(item.messages)].join(" ")).includes(normalize(query)))
    && (reviewFilter === "all" || (reviewFilter === "reviewed" ? library.reviewedIds.includes(item.id) : reviewFilter === "issues" ? issueIds.has(item.id) : !library.reviewedIds.includes(item.id))));
  const selected = filtered.find(item => item.id === selectedId) || filtered[0];
  const selectedIndex = selected ? filtered.indexOf(selected) : -1;
  const selectedIssues = selected ? issues.filter(item => item.id === selected.id) : [];
  const reviewed = selected ? library.reviewedIds.includes(selected.id) : false;
  const update = (item: Situation) => persist({ ...library, situations: library.situations.map(current => current.id === item.id ? item : current), reviewedIds: library.reviewedIds.filter(id => id !== item.id) });
  const changeMessage = (tone: Tone, text: string) => { if (selected) update({ ...selected, messages: { ...selected.messages, [tone]: text } }); };
  const toggleReview = () => {
    if (!selected) return;
    persist({ ...library, reviewedIds: reviewed ? library.reviewedIds.filter(id => id !== selected.id) : [...library.reviewedIds, selected.id] });
  };
  const importBackup = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      if (file.size > 2_000_000) throw new Error("O backup excede o limite de 2 MB.");
      const imported = parseLibrary(await file.text());
      if (!window.confirm("Restaurar este backup substituirá as 80 situações e os registros de revisão deste navegador. Baixe o backup atual antes de continuar. Deseja substituir?")) return;
      persist(imported, true);
      setNotice("Backup restaurado. Confira os textos e os registros de revisão importados.");
    } catch (error) { setNotice(error instanceof Error ? error.message : "Não foi possível ler este arquivo."); }
  };
  const copy = async (text: string) => {
    try { await navigator.clipboard.writeText(text); setNotice("Mensagem copiada. Substitua os campos antes de enviar."); }
    catch { setNotice("Não foi possível copiar automaticamente. Selecione o texto na leitura e copie manualmente."); }
  };
  const messageCount = library.situations.reduce((total, item) => total + tones.filter(tone => item.messages[tone.id].trim().length > 0).length, 0);
  return <section className="content-library" aria-label="Biblioteca editorial">
    <div className="library-summary">
      <div><strong>{library.situations.length}</strong><span>situações</span></div><div><strong>{messageCount}</strong><span>mensagens preenchidas</span></div><div><strong>{library.reviewedIds.length}/80</strong><span>revisadas por você</span></div>
      <div className="library-backup-actions"><button className="button button-outline" disabled={!ready} onClick={() => fileInput.current?.click()}><FileUp size={15} />Restaurar JSON</button><button className="button button-primary" disabled={!ready} onClick={() => { downloadBackup(library); setNotice("Backup JSON gerado com todo o conteúdo e as revisões."); }}><ArrowDownToLine size={15} />Baixar backup JSON</button><input ref={fileInput} type="file" accept=".json,application/json" onChange={importBackup} aria-label="Arquivo de backup JSON" hidden /></div>
    </div>
    <p className={`library-save-status ${storageBlocked ? "storage-warning" : ""}`} role="status">{saveStatus}</p>
    <details className="library-instructions"><summary>Como personalizar e revisar este conteúdo</summary><p>Escolha uma situação e um tom. Substitua todos os campos entre colchetes por informações reais antes de utilizar a mensagem. O campo [Descrição do atendimento] pode receber condições, instruções ou um acesso ao material, conforme o contexto. Em consultas online, substitua [Link de agendamento] pelo link real da chamada quando indicado.</p><div className="library-fields">{personalizedFields.map(field => <mark key={field}>[{field}]</mark>)}</div><p>Os textos-base receberam revisão editorial de clareza, neutralidade e finalidade. A checagem automática é limitada: não comprova segurança clínica nem substitui leitura humana. Toda orientação clínica precisa de revisão por nutricionista antes do uso. Em reativações, respeite a autorização e qualquer pedido de não contato.</p><p>Sem login, nuvem ou sincronização entre aparelhos. As alterações ficam somente neste navegador e podem ser perdidas se os dados locais forem apagados. Não insira dados de pacientes. Baixe o JSON para guardar e restaurar seu trabalho. PDF e DOCX pertencem à próxima etapa.</p></details>
    <div className="library-filters"><label><Search size={16} /><span className="sr-only">Buscar no conteúdo</span><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Buscar situação, campo ou mensagem…" /></label><label><span className="sr-only">Filtrar revisão</span><select value={reviewFilter} onChange={event => setReviewFilter(event.target.value)}><option value="all">Todas as revisões</option><option value="pending">A revisar por você</option><option value="reviewed">Revisadas por você</option><option value="issues">Com alertas automáticos</option></select></label><span>{issues.length === 0 ? "Sem alertas nas checagens automáticas" : `${issues.length} alerta(s) para conferir`}</span></div>
    <div className="library-workspace">
      <aside className="library-index studio-card"><label htmlFor="library-category">Categoria</label><select id="library-category" value={categoryId} onChange={event => setCategoryId(event.target.value)}><option value="">Todas as categorias</option>{libraryCategories.map(category => <option key={category.id} value={category.id}>{category.id} · {category.name} (8)</option>)}</select><p>{filtered.length} situação(ões) nesta seleção</p><nav aria-label="Situações da biblioteca">{filtered.map(item => <button key={item.id} className={selected?.id === item.id ? "active" : ""} aria-current={selected?.id === item.id ? "true" : undefined} onClick={() => setSelectedId(item.id)}><span>{item.id}{library.reviewedIds.includes(item.id) && <CheckCircle2 size={13} aria-label="Revisada" />}{issueIds.has(item.id) && <span aria-label="Com alerta">!</span>}</span><strong>{item.title || "Título a preencher"}</strong></button>)}</nav></aside>
      <div className="library-detail">{selected ? <>
        <header className="library-detail-header"><div><span className="card-eyebrow">{selected.categoryId} / {libraryCategories.find(category => category.id === selected.categoryId)?.name}</span><h2>Situação {selected.id}</h2></div><div className="library-view-toggle" role="group" aria-label="Modo de visualização"><button aria-pressed={editing} onClick={() => setEditing(true)}>Editar</button><button aria-pressed={!editing} onClick={() => setEditing(false)}>Leitura</button></div></header>
        <fieldset disabled={!ready} className="library-editor-fields">
          {editing ? <><label htmlFor="situation-title">Título da situação</label><input id="situation-title" maxLength={12000} value={selected.title} onChange={event => update({ ...selected, title: event.target.value })} /><label htmlFor="situation-context">Contexto de utilização</label><textarea id="situation-context" rows={3} maxLength={12000} value={selected.context} onChange={event => update({ ...selected, context: event.target.value })} /></> : <div className="library-reading-intro"><h3>{selected.title}</h3><p><strong>Contexto:</strong> {selected.context}</p></div>}
          <div className="library-tone-bar"><label htmlFor="library-tone">Tom de comunicação</label><select id="library-tone" value={toneFilter} onChange={event => setToneFilter(event.target.value as Tone | "all")}><option value="all">Comparar os três tons</option>{tones.map(tone => <option key={tone.id} value={tone.id}>{tone.id} · {tone.label}</option>)}</select></div>
          {tones.filter(tone => toneFilter === "all" || tone.id === toneFilter).map(tone => <article className="library-message studio-card" key={`${selected.id}-${tone.id}`}><header><div><label htmlFor={`message-${tone.id}`}>{tone.id} · {tone.label}</label><p>{tone.guidance}</p></div><button type="button" className="button button-text" onClick={() => copy(selected.messages[tone.id])} aria-label={`Copiar mensagem ${tone.id}`}><Copy size={14} />Copiar</button></header>{editing ? <textarea id={`message-${tone.id}`} maxLength={12000} rows={6} value={selected.messages[tone.id]} onChange={event => changeMessage(tone.id, event.target.value)} /> : <p className="library-message-text" id={`message-${tone.id}`}><HighlightedText text={selected.messages[tone.id]} /></p>}<small>{selected.messages[tone.id].length} caracteres · campos mantidos para personalização</small></article>)}
        </fieldset>
        {selectedIssues.length > 0 && <div className="library-alerts" role="status"><strong>Conferir antes de marcar como revisada</strong><ul>{selectedIssues.map((issue, index) => <li key={index}>{issue.detail}</li>)}</ul></div>}
        <div className="library-review-bar"><button className="button button-primary" disabled={!ready || (!reviewed && selectedIssues.length > 0)} onClick={toggleReview}><CheckCircle2 size={15} />{reviewed ? "Remover marca de revisão" : "Marcar situação como revisada"}</button><p>{reviewed ? "Revisão manual registrada por você." : "Leia contexto e os três tons antes de marcar."} Qualquer edição remove esta marca.</p></div>
        <footer className="library-pagination"><button className="button button-outline" disabled={selectedIndex <= 0} onClick={() => setSelectedId(filtered[selectedIndex - 1].id)}><ArrowLeft size={14} />Anterior</button><span>{selectedIndex + 1} de {filtered.length}</span><button className="button button-outline" disabled={selectedIndex >= filtered.length - 1} onClick={() => setSelectedId(filtered[selectedIndex + 1].id)}>Próxima<ArrowRight size={14} /></button></footer>
      </> : <div className="studio-card library-empty"><h2>Nenhuma situação encontrada</h2><p>Revise a busca ou escolha outra categoria e outro filtro de revisão.</p><button className="button button-outline" onClick={() => { setQuery(""); setReviewFilter("all"); setCategoryId(""); }}>Limpar filtros</button></div>}</div>
    </div>
    {notice && <div className="studio-toast" role="status">{notice}</div>}
  </section>;
}
