import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { EmptyState, FooterNote, PageHeader } from "@/components/app/Common";
import { MessageCard } from "@/components/app/MessageCard";
import { useMessages } from "@/lib/biblioteca/hooks";
import { useAppState } from "@/lib/biblioteca/store";

export const Route = createFileRoute("/favoritas")({
  head: () => ({ meta: [{ title: "Favoritas · Respostas do Nutri" }] }),
  component: FavoritesPage,
});

function FavoritesPage() {
  const { favorites } = useAppState();
  const messages = useMessages();
  const list = favorites
    .map((id) => messages.find((message) => message.id === id))
    .filter((message) => message !== undefined);

  return (
    <div className="page">
      <PageHeader
        eyebrow="Favoritas"
        title="Suas favoritas"
        lead={
          list.length
            ? `${list.length} ${list.length === 1 ? "mensagem guardada" : "mensagens guardadas"} para acesso rápido. Toque no coração para remover.`
            : undefined
        }
      />
      <div style={{ marginTop: 20 }}>
        {list.length ? (
          <div className="msg-list">
            {list.map((message) => (
              <MessageCard key={message.id} message={message} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Heart}
            title="Nenhuma favorita ainda"
            action={
              <Link to="/biblioteca" className="btn btn--primary">
                Explorar a biblioteca
              </Link>
            }
          >
            Toque no coração das mensagens que você mais usa. Elas ficam reunidas aqui, prontas para
            copiar.
          </EmptyState>
        )}
      </div>
      <FooterNote />
    </div>
  );
}
