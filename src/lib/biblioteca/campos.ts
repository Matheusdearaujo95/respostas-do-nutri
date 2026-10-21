// Campos personalizáveis usados entre colchetes nas mensagens, como [Nome] ou [Valor].
// Campos de perfil são preenchidos automaticamente a partir de "Meu perfil";
// os demais são preenchidos no editor, só para aquela cópia.

export type ProfileKey =
  | "nomeNutricionista"
  | "nomeProfissional"
  | "consultorio"
  | "whatsapp"
  | "endereco"
  | "linkAgendamento"
  | "linkOnline"
  | "valor"
  | "pagamento"
  | "prazo"
  | "politica"
  | "descricao"
  | "horarios"
  | "acompanhamento";

export type Profile = Record<ProfileKey, string>;

export type ProfileField = {
  key: ProfileKey;
  token: string;
  label: string;
  placeholder: string;
  multiline?: boolean;
  group: "identificacao" | "contato" | "atendimento";
};

export const profileFields: ProfileField[] = [
  {
    key: "nomeNutricionista",
    token: "Nome da nutricionista",
    label: "Nome da nutricionista",
    placeholder: "Ex.: Elaine Araújo",
    group: "identificacao",
  },
  {
    key: "nomeProfissional",
    token: "Nome profissional",
    label: "Nome profissional",
    placeholder: "Ex.: Nutri Elaine Araújo",
    group: "identificacao",
  },
  {
    key: "consultorio",
    token: "Nome do consultório",
    label: "Nome do consultório",
    placeholder: "Ex.: Consultório Bem Nutrir",
    group: "identificacao",
  },
  {
    key: "whatsapp",
    token: "WhatsApp profissional",
    label: "WhatsApp profissional",
    placeholder: "Ex.: (11) 90000-0000",
    group: "contato",
  },
  {
    key: "endereco",
    token: "Endereço",
    label: "Endereço da clínica",
    placeholder: "Rua, número, bairro, cidade",
    group: "contato",
  },
  {
    key: "linkAgendamento",
    token: "Link de agendamento",
    label: "Link de agendamento",
    placeholder: "https://",
    group: "contato",
  },
  {
    key: "linkOnline",
    token: "Link do atendimento online",
    label: "Link do atendimento online",
    placeholder: "https://",
    group: "contato",
  },
  {
    key: "horarios",
    token: "Dias e horários de atendimento",
    label: "Dias e horários de atendimento",
    placeholder: "Ex.: segunda a sexta, das 8h às 18h",
    group: "contato",
  },
  {
    key: "valor",
    token: "Valor",
    label: "Valor da consulta",
    placeholder: "Ex.: R$ 000,00",
    group: "atendimento",
  },
  {
    key: "pagamento",
    token: "Formas de pagamento",
    label: "Formas de pagamento",
    placeholder: "Ex.: Pix, cartão de crédito em até 2x",
    group: "atendimento",
  },
  {
    key: "prazo",
    token: "Prazo de entrega",
    label: "Prazo de entrega dos materiais",
    placeholder: "Ex.: 5 dias úteis",
    group: "atendimento",
  },
  {
    key: "descricao",
    token: "Descrição do atendimento",
    label: "Como funciona o atendimento",
    placeholder:
      "Ex.: consulta de 1h, plano alimentar individual e suporte por WhatsApp por 30 dias",
    multiline: true,
    group: "atendimento",
  },
  {
    key: "acompanhamento",
    token: "Condições do acompanhamento",
    label: "Condições do acompanhamento",
    placeholder: "Canal, horários, prazo de resposta e o que está incluído entre consultas",
    multiline: true,
    group: "atendimento",
  },
  {
    key: "politica",
    token: "Política de cancelamento",
    label: "Política de cancelamento",
    placeholder: "Ex.: remarcações com até 24h de antecedência, sem custo",
    multiline: true,
    group: "atendimento",
  },
];

export const emptyProfile: Profile = Object.fromEntries(
  profileFields.map((field) => [field.key, ""]),
) as Profile;

const byToken = new Map(profileFields.map((field) => [field.token, field]));
export function profileFieldFor(token: string) {
  return byToken.get(token);
}

// Rótulos amigáveis e dicas para os campos preenchidos na hora.
const momentHints: Record<string, { label: string; placeholder: string }> = {
  Nome: { label: "Nome do paciente", placeholder: "Usado só nesta cópia, não fica salvo" },
  Data: { label: "Data", placeholder: "Ex.: 12/11" },
  Horário: { label: "Horário", placeholder: "Ex.: 14h30" },
};
export function fieldLabel(token: string) {
  return profileFieldFor(token)?.label ?? momentHints[token]?.label ?? token;
}
export function fieldPlaceholder(token: string) {
  return (
    profileFieldFor(token)?.placeholder ??
    momentHints[token]?.placeholder ??
    "Preencha antes de copiar"
  );
}

// Informações que mudam de nutricionista para nutricionista ou de paciente para paciente
// e que nunca podem ser inventadas: a mensagem é marcada para conferência antes do envio.
const needsReview = new Set([
  "Valor",
  "Formas de pagamento",
  "Política de cancelamento",
  "Descrição do atendimento",
  "Condições do acompanhamento",
  "Data",
  "Horário",
  "Prazo de entrega",
  "Nova data de entrega",
  "Novas opções de horário",
  "Tolerância para atraso",
  "Prazo para confirmar",
  "Etapa pendente",
  "Próximos passos combinados",
  "Orientações de preparação",
  "Documentos e exames solicitados",
]);
export function fieldNeedsReview(token: string) {
  return needsReview.has(token);
}

const tokenPattern = /\[([^\]\n]{1,60})\]/g;
export function extractFields(text: string): string[] {
  const found: string[] = [];
  for (const match of text.matchAll(tokenPattern))
    if (match[1] && !found.includes(match[1])) found.push(match[1]);
  return found;
}

export type FieldValues = Record<string, string>;

export function valuesFromProfile(profile: Profile): FieldValues {
  const values: FieldValues = {};
  for (const field of profileFields)
    if (profile[field.key].trim()) values[field.token] = profile[field.key].trim();
  return values;
}

// Substitui apenas os campos com valor; os demais continuam visíveis entre colchetes.
export function fillText(text: string, values: FieldValues): string {
  return text.replace(tokenPattern, (whole, token: string) => {
    const value = values[token]?.trim();
    return value ? value : whole;
  });
}

export function missingFields(text: string, values: FieldValues): string[] {
  return extractFields(text).filter((token) => !values[token]?.trim());
}

export type TextPart =
  { kind: "text"; value: string } | { kind: "field"; token: string; value?: string };
export function splitText(text: string, values: FieldValues): TextPart[] {
  const parts: TextPart[] = [];
  let last = 0;
  for (const match of text.matchAll(tokenPattern)) {
    const index = match.index ?? 0;
    if (index > last) parts.push({ kind: "text", value: text.slice(last, index) });
    const token = match[1] ?? "";
    const value = values[token]?.trim();
    parts.push(value ? { kind: "field", token, value } : { kind: "field", token });
    last = index + match[0].length;
  }
  if (last < text.length) parts.push({ kind: "text", value: text.slice(last) });
  return parts;
}
