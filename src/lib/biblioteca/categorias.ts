import {
  CalendarCheck,
  ClipboardList,
  FileHeart,
  HandHeart,
  HeartHandshake,
  MessageCircleHeart,
  MessagesSquare,
  RefreshCcw,
  Send,
  Sparkles,
  Star,
  Stethoscope,
  type LucideIcon,
} from "lucide-react";

export type Category = {
  id: string;
  slug: string;
  name: string;
  short: string;
  description: string;
  icon: LucideIcon;
};

export const categories: Category[] = [
  {
    id: "01",
    slug: "primeiro-contato",
    name: "Primeiro contato",
    short: "Primeiro contato",
    description: "Para quem chega perguntando sobre consulta, valores e horários.",
    icon: MessageCircleHeart,
  },
  {
    id: "02",
    slug: "orcamentos-e-agendamentos",
    name: "Orçamentos e agendamentos",
    short: "Orçamentos",
    description: "Valores, pagamento, confirmação, remarcação e cancelamento.",
    icon: CalendarCheck,
  },
  {
    id: "03",
    slug: "pre-consulta",
    name: "Pré-consulta",
    short: "Pré-consulta",
    description: "Boas-vindas, lembretes, endereço, link e preparação.",
    icon: ClipboardList,
  },
  {
    id: "04",
    slug: "durante-a-consulta",
    name: "Durante a consulta",
    short: "Na consulta",
    description: "Para copiar durante o atendimento: envios, próximos passos e canal.",
    icon: Stethoscope,
  },
  {
    id: "05",
    slug: "pos-consulta",
    name: "Pós-consulta",
    short: "Pós-consulta",
    description: "Agradecimento, resumo do combinado e próximos passos.",
    icon: Sparkles,
  },
  {
    id: "06",
    slug: "entrega-de-materiais",
    name: "Entrega de materiais",
    short: "Materiais",
    description: "Plano alimentar, guias, listas e materiais do Acervo do Nutri.",
    icon: Send,
  },
  {
    id: "07",
    slug: "duvidas-frequentes",
    name: "Dúvidas frequentes",
    short: "Dúvidas",
    description: "Respostas gerais e educativas, sem orientação clínica individual.",
    icon: MessagesSquare,
  },
  {
    id: "08",
    slug: "acompanhamento",
    name: "Acompanhamento",
    short: "Acompanhamento",
    description: "Check-ins, adaptação à rotina e apoio entre consultas.",
    icon: HandHeart,
  },
  {
    id: "09",
    slug: "retornos",
    name: "Retornos",
    short: "Retornos",
    description: "Convites gentis para a consulta de retorno, sem pressão.",
    icon: RefreshCcw,
  },
  {
    id: "10",
    slug: "reativacao-de-pacientes",
    name: "Reativação de pacientes",
    short: "Reativação",
    description: "Reaproximação respeitosa com quem se afastou.",
    icon: HeartHandshake,
  },
  {
    id: "11",
    slug: "relacionamento-e-acolhimento",
    name: "Relacionamento e acolhimento",
    short: "Relacionamento",
    description: "Agradecimentos, incentivo, datas especiais e encerramentos.",
    icon: FileHeart,
  },
  {
    id: "12",
    slug: "feedback-e-experiencia",
    name: "Feedback e experiência",
    short: "Feedback",
    description: "Pesquisa de satisfação, críticas, avaliações e depoimentos.",
    icon: Star,
  },
];

const bySlug = new Map(categories.map((category) => [category.slug, category]));
const byId = new Map(categories.map((category) => [category.id, category]));
export const categoryBySlug = (slug: string) => bySlug.get(slug);
export const categoryById = (id: string) => byId.get(id);
