export const identity = {
  name: "Respostas prontas da Nutri",
  subtitle: "Mensagens para facilitar sua comunicação com pacientes.",
  version: "Direção visual 01",
  fonts: { display: "Bricolage Grotesque", body: "Figtree" },
  palette: [
    { name: "Papel", hex: "#FAF9F3", role: "Fundo editorial" },
    { name: "Folha", hex: "#3F5C39", role: "Cor principal" },
    { name: "Bosque", hex: "#2C4128", role: "Contraste" },
    { name: "Sálvia", hex: "#EBF0E2", role: "Respiro visual" },
    { name: "Tinta", hex: "#1D2A1F", role: "Leitura" },
    { name: "Musgo", hex: "#5A6552", role: "Texto secundário" },
    { name: "Papaya", hex: "#E8562F", role: "Acento pontual" },
    { name: "Branco", hex: "#FFFFFF", role: "Cards de mensagem" },
  ],
  concept: "Palavras que aproximam. Tempo para cuidar.",
  description: "Um balão de conversa com linhas de texto transforma a ideia de mensagem em um símbolo próprio. O ponto papaya representa a presença humana: um pequeno detalhe, com intenção.",
} as const;

export type PreviewPage = "cover" | "intro" | "index" | "category" | "messages";
export const previewPages: { id: PreviewPage; name: string; number: string }[] = [
  { id: "cover", name: "Capa", number: "01" },
  { id: "intro", name: "Apresentação", number: "02" },
  { id: "index", name: "Índice", number: "04" },
  { id: "category", name: "Abertura de categoria", number: "05" },
  { id: "messages", name: "Mensagens", number: "06" },
];

export const categories = [
  "Primeiro contato", "Orçamentos e valores", "Agendamentos", "Pré-consulta",
  "Pós-consulta", "Entrega de materiais", "Dúvidas frequentes", "Acompanhamento",
  "Retorno de pacientes", "Reativação de pacientes",
];

// Uma situação de amostra para aprovar a diagramação. Não representa o acervo final.
export const sampleSituation = {
  id: "01.01",
  title: "Como funciona o atendimento?",
  context: "Utilize quando uma pessoa entrar em contato para entender sua forma de atendimento.",
  messages: [
    { id: "A", tone: "Profissional", text: "Olá, [Nome]. Agradeço pelo interesse no atendimento. A consulta inclui [Descrição do atendimento]. Para apresentar as informações mais relevantes, poderia me contar o que você busca neste momento? Fico à disposição para explicar as etapas e verificar a disponibilidade." },
    { id: "B", tone: "Próxima", text: "Oi, [Nome]! Que bom receber sua mensagem. Vou te contar como funciona: [Descrição do atendimento]. Me conta um pouco do que você procura? Assim, conversamos sobre o atendimento e os horários que podem funcionar para você." },
    { id: "C", tone: "Acolhedora", text: "Oi, [Nome]. Buscar acompanhamento pode trazer algumas perguntas, e podemos conversar sobre elas com calma. O atendimento funciona assim: [Descrição do atendimento]. Se fizer sentido para você, me conte o que espera desse cuidado. Vamos pensar nos próximos passos respeitando seu momento." },
  ],
};
