import { useNavigate } from "@tanstack/react-router";
import { AlertTriangle } from "lucide-react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { fieldLabel, fillText, missingFields, type FieldValues } from "@/lib/biblioteca/campos";
import { copyText } from "@/lib/biblioteca/copiar";
import type { Message, ToneId } from "@/lib/biblioteca/mensagens";
import { actions } from "@/lib/biblioteca/store";
import { useToast } from "./Toast";

type CopyRequest = {
  message: Message;
  text: string; // texto já editado ou o modelo original
  values: FieldValues;
  tone?: ToneId;
  inEditor?: boolean;
  onCopied?: () => void;
};

const CopyContext = createContext<(request: CopyRequest) => void>(() => {});

export function CopyProvider({ children }: { children: ReactNode }) {
  const toast = useToast();
  const navigate = useNavigate();
  const [pending, setPending] = useState<{ request: CopyRequest; missing: string[] } | null>(null);
  const firstButton = useRef<HTMLButtonElement>(null);

  const finish = useCallback(
    async (request: CopyRequest) => {
      const ok = await copyText(fillText(request.text, request.values));
      if (ok) {
        actions.recordUse(request.message.id);
        toast("Mensagem copiada!");
        request.onCopied?.();
      } else {
        toast("Não foi possível copiar. Toque e segure o texto para copiar manualmente.");
      }
    },
    [toast],
  );

  const request = useCallback(
    (copy: CopyRequest) => {
      const missing = missingFields(copy.text, copy.values);
      if (missing.length) setPending({ request: copy, missing });
      else void finish(copy);
    },
    [finish],
  );

  useEffect(() => {
    if (!pending) return;
    firstButton.current?.focus();
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setPending(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [pending]);

  return (
    <CopyContext.Provider value={request}>
      {children}
      {pending && (
        <div className="dialog-backdrop" onClick={() => setPending(null)}>
          <div
            className="dialog"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="copy-title"
            aria-describedby="copy-desc"
            onClick={(event) => event.stopPropagation()}
          >
            <span className="badge badge--review">
              <AlertTriangle size={13} aria-hidden="true" /> Antes de copiar
            </span>
            <h2 id="copy-title" style={{ marginTop: 10 }}>
              {pending.missing.length === 1
                ? "Falta preencher 1 campo"
                : `Faltam preencher ${pending.missing.length} campos`}
            </h2>
            <p id="copy-desc">
              Esses campos vão aparecer entre colchetes na mensagem. Preencha agora para não enviar
              informação incompleta.
            </p>
            <div className="missing-list">
              {pending.missing.map((token) => (
                <span key={token}>{fieldLabel(token)}</span>
              ))}
            </div>
            <div className="dialog__actions">
              <button
                type="button"
                className="btn btn--ghost"
                onClick={() => {
                  const copy = pending.request;
                  setPending(null);
                  void finish(copy);
                }}
              >
                Copiar assim mesmo
              </button>
              <button
                ref={firstButton}
                type="button"
                className="btn btn--primary"
                onClick={() => {
                  const copy = pending.request;
                  setPending(null);
                  if (!copy.inEditor) {
                    void navigate({
                      to: "/mensagem/$id/editar",
                      params: { id: copy.message.id },
                      search: copy.tone ? { tom: copy.tone } : {},
                    });
                  } else {
                    document
                      .querySelector<HTMLInputElement>(
                        ".field.is-missing input, .field.is-missing textarea",
                      )
                      ?.focus();
                  }
                }}
              >
                Preencher campos
              </button>
            </div>
          </div>
        </div>
      )}
    </CopyContext.Provider>
  );
}

export const useCopy = () => useContext(CopyContext);
