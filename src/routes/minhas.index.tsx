import { createFileRoute, Link } from "@tanstack/react-router";
import { CopyPlus, PenSquare, Plus } from "lucide-react";
import { EmptyState, FooterNote, PageHeader } from "@/components/app/Common";
import { MessageCard } from "@/components/app/MessageCard";
import { customToMessage, useAppState } from "@/lib/biblioteca/store";

export const Route = createFileRoute("/minhas/")({
  head: () => ({ meta: [{ title: "Minhas mensagens · Respostas do Nutri" }] }),
  component: MinePage,
});

function MinePage() {
  const { custom } = useAppState();
  const list = [...custom].sort((a, b) => b.updatedAt - a.updatedAt).map(customToMessage);

  return (
    <div className="page">
      <PageHeader
        eyebrow="Minhas mensagens"
        title="Do seu jeito de atender"
        lead="Crie modelos próprios ou duplique uma mensagem da biblioteca para adaptar. As originais continuam preservadas."
      />
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 18 }}>
        <Link to="/minhas/nova" className="btn btn--primary">
          <Plus size={18} aria-hidden="true" /> Criar nova mensagem
        </Link>
        <Link to="/biblioteca" className="btn btn--secondary">
          <CopyPlus size={17} aria-hidden="true" /> Duplicar da biblioteca
        </Link>
      </div>

      <div style={{ marginTop: 22 }}>
        {list.length ? (
          <div className="msg-list">
            {list.map((message) => (
              <MessageCard key={message.id} message={message} />
            ))}
          </div>
        ) : (
          <EmptyState icon={PenSquare} title="Você ainda não criou mensagens">
            Comece do zero ou abra uma mensagem da biblioteca e toque em “Duplicar” para criar sua
            própria versão. Elas ficam salvas neste aparelho.
          </EmptyState>
        )}
      </div>
      <FooterNote />
    </div>
  );
}
