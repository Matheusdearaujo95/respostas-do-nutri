import { createFileRoute } from "@tanstack/react-router";
import { CustomForm } from "@/components/app/CustomForm";
import { PageHeader } from "@/components/app/Common";

export const Route = createFileRoute("/minhas/nova")({
  head: () => ({ meta: [{ title: "Nova mensagem · Respostas do Nutri" }] }),
  component: () => (
    <div className="page page--narrow">
      <PageHeader
        crumbs={[{ label: "Minhas mensagens", to: "/minhas" }]}
        title="Nova mensagem"
        lead="Escreva do seu jeito e use campos como [Nome] para personalizar na hora de copiar."
      />
      <CustomForm />
    </div>
  ),
});
