import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronDown, ShieldCheck } from "lucide-react";
import { elaineLogo } from "@/components/app/Brand";
import { FooterNote } from "@/components/app/Common";

export const Route = createFileRoute("/ajuda")({
  head: () => ({ meta: [{ title: "Ajuda · Respostas do Nutri" }] }),
  component: HelpPage,
});

const steps = [
  {
    title: "Escolha o momento",
    text: "Busque pela situação (ex.: “paciente sumiu”) ou entre na categoria do atendimento.",
  },
  {
    title: "Escolha o tom",
    text: "Muitas mensagens têm versões Próxima, Acolhedora e Profissional. O app lembra o tom que você prefere.",
  },
  {
    title: "Personalize",
    text: "Digite o nome do paciente e confira os campos. Os dados de Meu perfil entram sozinhos.",
  },
  {
    title: "Copie e cole",
    text: "Toque em “Copiar mensagem” e cole no WhatsApp, e-mail ou no canal que preferir.",
  },
];

const faq = [
  {
    q: "O app envia mensagens pelos meus pacientes ou pelo meu WhatsApp?",
    a: "Não. O Respostas do Nutri só copia o texto. Você decide quando, para quem e por onde enviar. Não há disparos automáticos nem envio em massa.",
  },
  {
    q: "Onde ficam meus dados, favoritas e mensagens próprias?",
    a: "Ficam salvos apenas no navegador deste aparelho. Se você limpar os dados do navegador ou trocar de aparelho, eles não acompanham. Nenhuma informação vai para servidores.",
  },
  {
    q: "O nome do paciente fica salvo?",
    a: "Não. O nome digitado no editor vale só para aquela cópia. O histórico guarda apenas qual modelo você usou, nunca dados de pacientes.",
  },
  {
    q: "O que significa o selo “Conferir dados”?",
    a: "A mensagem contém valores, datas, prazos ou condições. Confira se estão corretos antes de enviar: o app nunca inventa preço, disponibilidade ou regras.",
  },
  {
    q: "E se faltar algum campo?",
    a: "Antes de copiar, o app avisa quais campos estão vazios e leva você ao editor para preencher. Você também pode copiar assim mesmo, se preferir completar no WhatsApp.",
  },
  {
    q: "Posso mudar o texto de uma mensagem?",
    a: "Sim. Use “Editar antes de copiar” para ajustes pontuais (o original não muda) ou “Duplicar” para criar sua própria versão em Minhas mensagens.",
  },
  {
    q: "As mensagens substituem a avaliação profissional?",
    a: "Não. São modelos de comunicação. Não contêm prescrições, doses ou promessas de resultado, e devem ser revisados e adaptados por você antes do envio.",
  },
  {
    q: "Os materiais do Acervo do Nutri combinam com as mensagens?",
    a: "Sim. A categoria Entrega de materiais tem mensagens para enviar plano alimentar, guias, listas e checklists, incluindo materiais do Acervo do Nutri.",
  },
];

function HelpPage() {
  return (
    <div className="page page--narrow">
      <header
        className="panel panel--soft"
        style={{ display: "flex", gap: 18, alignItems: "center" }}
      >
        <img
          src={elaineLogo}
          alt="Monograma da Elaine"
          width={56}
          height={81}
          style={{ flexShrink: 0 }}
        />
        <div>
          <p className="eyebrow">Ajuda e instruções</p>
          <h1 className="page-title">Como usar o Respostas do Nutri</h1>
          <p className="page-lead" style={{ marginTop: 4 }}>
            Uma biblioteca de mensagens com curadoria da Elaine, para você copiar a primeira em
            menos de 30 segundos.
          </p>
        </div>
      </header>

      <section className="section" aria-labelledby="passos">
        <h2 id="passos" className="section__title" style={{ marginBottom: 14 }}>
          Em quatro passos
        </h2>
        <ol className="steps" style={{ listStyle: "none" }}>
          {steps.map((step, index) => (
            <li key={step.title} className="step panel" style={{ padding: 14 }}>
              <span className="step__n" aria-hidden="true">
                {index + 1}
              </span>
              <span>
                <strong>{step.title}</strong>
                <span className="muted" style={{ display: "block", fontSize: 14 }}>
                  {step.text}
                </span>
              </span>
            </li>
          ))}
        </ol>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 16 }}>
          <Link to="/biblioteca" className="btn btn--primary">
            Encontrar uma mensagem
          </Link>
          <Link to="/perfil" className="btn btn--secondary">
            Preencher Meu perfil
          </Link>
        </div>
      </section>

      <section className="section" aria-labelledby="duvidas">
        <h2 id="duvidas" className="section__title" style={{ marginBottom: 6 }}>
          Perguntas frequentes
        </h2>
        <div className="panel faq">
          {faq.map((item) => (
            <details key={item.q}>
              <summary>
                {item.q}
                <ChevronDown size={18} aria-hidden="true" />
              </summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      <p className="notice notice--info" style={{ marginTop: 24 }}>
        <ShieldCheck size={18} aria-hidden="true" />
        <span>
          <strong>Privacidade:</strong> não armazene dados de saúde de pacientes nas mensagens
          próprias. Ao pedir avaliações ou depoimentos, solicite autorização específica e nunca
          exponha informações clínicas.
        </span>
      </p>
      <FooterNote />
    </div>
  );
}
