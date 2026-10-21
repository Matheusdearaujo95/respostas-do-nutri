import { useMemo } from "react";
import { valuesFromProfile } from "./campos";
import { library, messageById, type Message } from "./mensagens";
import { customToMessage, useAppState } from "./store";

// Biblioteca original + mensagens próprias da nutricionista.
export function useMessages() {
  const { custom } = useAppState();
  return useMemo(() => [...custom.map(customToMessage), ...library], [custom]);
}

export function useMessage(id: string): Message | undefined {
  const { custom } = useAppState();
  return useMemo(() => {
    const own = custom.find((item) => item.id === id);
    return own ? customToMessage(own) : messageById(id);
  }, [custom, id]);
}

export function useProfileValues() {
  const { profile } = useAppState();
  return useMemo(() => valuesFromProfile(profile), [profile]);
}
