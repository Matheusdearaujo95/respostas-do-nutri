import { createFileRoute, Link } from "@tanstack/react-router";
import { MessageSquareDashed } from "lucide-react";
import { CustomForm } from "@/components/app/CustomForm";
import { EmptyState, PageHeader } from "@/components/app/Common";
import { useAppState, useHydrated } from "@/lib/biblioteca/store";

export const Route = createFileRoute("/minhas/$id")({
  head: () => ({ meta: [{ title: "Editar mensagem · Respostas do Nutri" }] }),
  component: EditMinePage,
});

function EditMinePage() {
  const { id } = Route.useParams();
  const { custom } = useAppState();
  const hydrated = useHydrated();
  const message = custom.find((item) => item.id === id);

  if (!message) {
    if (!hydrated) return <div className="page" aria-busy="true" />;
    return (
      <div className="page page--narrow">
        <EmptyState
          icon={MessageSquareDashed}
          title="Mensagem não encontrada"
          action={
            <Link to="/minhas" className="btn btn--primary">
              Ver Minhas mensagens
            </Link>
          }
        >
          Ela pode ter sido excluída. As mensagens próprias ficam salvas apenas no aparelho em que
          foram criadas.
        </EmptyState>
      </div>
    );
  }

  return (
    <div className="page page--narrow">
      <PageHeader crumbs={[{ label: "Minhas mensagens", to: "/minhas" }]} title="Editar mensagem" />
      <CustomForm key={message.id} initial={message} />
    </div>
  );
}
