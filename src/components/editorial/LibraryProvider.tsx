import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { createLibrary, libraryStorageKey, parseLibrary, type Library } from "../../lib/editorial/library";

type LibraryState = {
  library: Library;
  ready: boolean;
  storageBlocked: boolean;
  saveStatus: string;
  persist: (next: Library, replaceBlocked?: boolean) => void;
};
const LibraryContext = createContext<LibraryState | null>(null);
export function LibraryProvider({ children }: { children: ReactNode }) {
  const [library, setLibrary] = useState<Library>(createLibrary);
  const [ready, setReady] = useState(false);
  const [storageBlocked, setStorageBlocked] = useState(false);
  const [saveStatus, setSaveStatus] = useState("Carregando conteúdo local…");
  useEffect(() => {
    try {
      const stored = localStorage.getItem(libraryStorageKey);
      if (stored) setLibrary(parseLibrary(stored));
      setSaveStatus(stored ? "Conteúdo recuperado deste navegador." : "Textos-base carregados. Alterações serão salvas neste navegador.");
    } catch {
      setStorageBlocked(true);
      setSaveStatus("Não foi possível ler o armazenamento. Os textos-base estão em memória; o conteúdo local anterior não será sobrescrito. Baixe um backup de suas alterações.");
    }
    setReady(true);
  }, []);
  const persist = (next: Library, replaceBlocked = false) => {
    setLibrary(next);
    if (storageBlocked && !replaceBlocked) return;
    try {
      localStorage.setItem(libraryStorageKey, JSON.stringify(next));
      setStorageBlocked(false);
      setSaveStatus("Alterações salvas neste navegador. Faça um backup para guardar fora dele.");
    } catch {
      setStorageBlocked(true);
      setSaveStatus("Não foi possível salvar no navegador. As alterações estão em memória: baixe o backup JSON antes de sair.");
    }
  };
  return <LibraryContext.Provider value={{ library, ready, storageBlocked, saveStatus, persist }}>{children}</LibraryContext.Provider>;
}
export function useLibrary() {
  const context = useContext(LibraryContext);
  if (!context) throw new Error("Biblioteca fora do estúdio editorial.");
  return context;
}
