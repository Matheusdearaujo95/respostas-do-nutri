import { categoryById } from "./categorias";
import { parseCategoryFile, type Message } from "./parser";

export * from "./parser";

const files = import.meta.glob("/conteudo/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

export const library: Message[] = Object.keys(files)
  .sort()
  .flatMap((path) => parseCategoryFile(files[path] ?? "", path))
  .filter((message) => categoryById(message.categoryId));

const byId = new Map(library.map((message) => [message.id, message]));
export const messageById = (id: string) => byId.get(id);
export const messagesInCategory = (categoryId: string) =>
  library.filter((message) => message.categoryId === categoryId);

export function previewOf(message: Message, lines = 2) {
  const text = message.variants[0]?.text ?? "";
  const flat = text.replace(/\s*\n+\s*/g, " ").trim();
  const limit = lines * 90;
  return flat.length > limit ? `${flat.slice(0, limit).replace(/\s+\S*$/, "")}…` : flat;
}
