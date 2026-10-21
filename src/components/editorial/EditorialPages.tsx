import { ArrowUpRight } from "lucide-react";
import { Brand, ProductIcon } from "./Brand";
import { categories, identity, sampleSituation, type PreviewPage } from "../../lib/editorial/identity";

function PageFooter({ number, onIndex }: { number: string; onIndex: () => void }) {
  return <footer className="paper-footer"><span>Respostas prontas da Nutri</span><button onClick={onIndex}>Voltar ao índice ↗</button><span>{number}</span></footer>;
}

export function CoverPage() {
  return (
    <article className="editorial-paper cover-paper" aria-label="Prévia da capa A4">
      <div className="cover-top"><span>ACERVO DO NUTRI</span><span>GUIA DE COMUNICAÇÃO</span></div>
      <div className="cover-content">
        <ProductIcon className="cover-symbol" />
        <div className="cover-eyebrow">MENOS TEMPO ESCREVENDO. MAIS TEMPO CUIDANDO.</div>
        <h2>Respostas<br />prontas<br /><span>da Nutri<i>.</i></span></h2>
        <div className="cover-rule" />
        <p>{identity.subtitle}</p>
      </div>
      <div className="cover-bottom"><div><strong>Palavras que aproximam.</strong><span>Um cuidado que começa na conversa.</span></div></div>
    </article>
  );
}

export function EditorialPage({ page, onNavigate }: { page: PreviewPage; onNavigate: (page: PreviewPage) => void }) {
  if (page === "cover") return <CoverPage />;
  return (
    <article className={`editorial-paper inside-paper paper-${page}`} aria-label={`Amostra editorial: ${page}`}>
      <header className="paper-running"><Brand variant="compact" /><span>{page === "messages" ? "01 / PRIMEIRO CONTATO" : "UM GUIA PARA O SEU DIA A DIA"}</span></header>
      {page === "intro" && <div className="intro-content"><span className="paper-kicker">ANTES DA PRIMEIRA MENSAGEM</span><h2>Uma boa conversa<br />também é cuidado.</h2><div className="paper-short-rule" /><p>Entre uma consulta e outra, existem muitas conversas. Uma dúvida sobre o atendimento, um lembrete de retorno, uma orientação que precisa chegar com clareza.</p><p>Este guia foi pensado para deixar essas palavras mais próximas de você — sem perder o que torna sua comunicação única.</p><h3>Escolha. Personalize. Converse.</h3><p>Encontre a situação, escolha o tom e substitua os campos entre colchetes, como <mark>[Nome]</mark> e <mark>[Data]</mark>. Leia a mensagem antes de enviar e adapte ao contexto real de cada pessoa.</p><div className="paper-note"><strong>A sua escuta vem primeiro.</strong><p>As mensagens apoiam a comunicação, mas não substituem a avaliação profissional. Conteúdos clínicos devem passar pela revisão de nutricionista antes do uso.</p></div></div>}
      {page === "index" && <div className="index-content"><span className="paper-kicker">ENCONTRE AS PALAVRAS</span><h2>Cada conversa,<br />no seu lugar.</h2><p>De um primeiro “oi” à retomada do cuidado.</p><nav aria-label="Índice da prévia">{categories.map((category, index) => <button key={category} onClick={() => onNavigate("category")}><span>{String(index + 1).padStart(2, "0")}</span><strong>{category}</strong><ArrowUpRight size={13} /></button>)}</nav><div className="sample-note">Nesta amostra, os cliques abrem o modelo de Primeiro contato. No PDF gerado em Arquivos finais, cada categoria tem seu próprio destino e o link de retorno funciona. Animações e controles de edição ficam apenas no estúdio.</div></div>}
      {page === "category" && <div className="category-opening"><div className="category-big-number">01<span>UMA CONVERSA COMEÇA AQUI</span></div><h2>Primeiro<br />contato<i>.</i></h2><p>Receba cada nova conversa com clareza, atenção e espaço para escutar.</p><div className="category-summary"><span>08 SITUAÇÕES PREVISTAS</span><span>03 TONS DE VOZ</span></div><button className="paper-next" onClick={() => onNavigate("messages")}>Conhecer a situação de amostra <ArrowUpRight size={16} /></button></div>}
      {page === "messages" && <div className="messages-content"><span className="paper-kicker">SITUAÇÃO {sampleSituation.id} · AMOSTRA EDITORIAL</span><h2>{sampleSituation.title}</h2><p className="situation-context">{sampleSituation.context}</p><div className="paper-message-list">{sampleSituation.messages.map(message => <section className={`paper-message tone-${message.id}`} key={message.id}><h3><span>{message.id}</span>{message.tone}</h3><p>{message.text.split(/(\[[^\]]+\])/g).map((piece, index) => piece.startsWith("[") ? <mark key={index}>{piece}</mark> : piece)}</p></section>)}</div><p className="paper-review">Personalize os campos e revise o contexto antes de enviar.</p></div>}
      <PageFooter number={page === "intro" ? "02" : page === "index" ? "04" : page === "category" ? "05" : "06"} onIndex={() => onNavigate("index")} />
    </article>
  );
}
