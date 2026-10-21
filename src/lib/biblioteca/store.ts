import { useSyncExternalStore } from "react";
import { emptyProfile, extractFields, fieldNeedsReview, type Profile } from "./campos";
import type { Message, ToneId } from "./mensagens";

// Preferências da nutricionista, guardadas só neste aparelho (localStorage).
// Nunca guardamos nome ou dados de pacientes: o histórico registra apenas
// qual modelo foi usado e quando.

export type Usage = { count: number; last: number };
export type CustomMessage = {
  id: string;
  title: string;
  categoryId: string;
  context: string;
  text: string;
  tags: string[];
  basedOn?: string | undefined;
  updatedAt: number;
};

export type State = {
  profile: Profile;
  favorites: string[];
  usage: Record<string, Usage>;
  custom: CustomMessage[];
  preferredTone: ToneId | null;
};

const key = "respostas-do-nutri:v1";
const initial: State = {
  profile: emptyProfile,
  favorites: [],
  usage: {},
  custom: [],
  preferredTone: null,
};

let state: State = initial;
let loaded = false;
const listeners = new Set<() => void>();

function read(): State {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return initial;
    const parsed = JSON.parse(raw) as Partial<State>;
    return {
      profile: { ...emptyProfile, ...(parsed.profile ?? {}) },
      favorites: Array.isArray(parsed.favorites)
        ? parsed.favorites.filter((id) => typeof id === "string")
        : [],
      usage: parsed.usage && typeof parsed.usage === "object" ? parsed.usage : {},
      custom: Array.isArray(parsed.custom) ? parsed.custom : [],
      preferredTone: parsed.preferredTone ?? null,
    };
  } catch {
    return initial;
  }
}

function ensureLoaded() {
  if (!loaded && typeof window !== "undefined") {
    state = read();
    loaded = true;
  }
}

export let storageAvailable = true;
function update(change: (current: State) => State) {
  ensureLoaded();
  state = change(state);
  try {
    window.localStorage.setItem(key, JSON.stringify(state));
    storageAvailable = true;
  } catch {
    storageAvailable = false;
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === key) {
      state = read();
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function snapshot() {
  ensureLoaded();
  return state;
}

export function useAppState(): State {
  return useSyncExternalStore(subscribe, snapshot, () => initial);
}

export function useHydrated() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export const actions = {
  saveProfile(profile: Profile) {
    update((current) => ({ ...current, profile }));
  },
  toggleFavorite(id: string) {
    update((current) => ({
      ...current,
      favorites: current.favorites.includes(id)
        ? current.favorites.filter((item) => item !== id)
        : [id, ...current.favorites],
    }));
  },
  // Chamado ao copiar ou compartilhar: registra só o ID do modelo.
  recordUse(id: string) {
    update((current) => {
      const previous = current.usage[id] ?? { count: 0, last: 0 };
      return {
        ...current,
        usage: { ...current.usage, [id]: { count: previous.count + 1, last: Date.now() } },
      };
    });
  },
  setPreferredTone(tone: ToneId) {
    update((current) => ({ ...current, preferredTone: tone }));
  },
  saveCustom(message: Omit<CustomMessage, "id" | "updatedAt"> & { id?: string | undefined }) {
    const id =
      message.id ?? `minha-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
    update((current) => {
      const next: CustomMessage = { ...message, id, updatedAt: Date.now() };
      const exists = current.custom.some((item) => item.id === id);
      return {
        ...current,
        custom: exists
          ? current.custom.map((item) => (item.id === id ? next : item))
          : [next, ...current.custom],
      };
    });
    return id;
  },
  deleteCustom(id: string) {
    update((current) => {
      const { [id]: _removed, ...usage } = current.usage;
      return {
        ...current,
        custom: current.custom.filter((item) => item.id !== id),
        favorites: current.favorites.filter((item) => item !== id),
        usage,
      };
    });
  },
};

export function customToMessage(custom: CustomMessage): Message {
  const fields = extractFields(custom.text);
  return {
    id: custom.id,
    categoryId: custom.categoryId,
    title: custom.title,
    context: custom.context,
    tags: custom.tags,
    popular: false,
    needsReview: fields.some(fieldNeedsReview),
    fields,
    variants: [{ tone: "proxima", text: custom.text }],
    custom: true,
  };
}
