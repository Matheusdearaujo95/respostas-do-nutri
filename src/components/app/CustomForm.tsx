import { useNavigate } from "@tanstack/react-router";
import { Save, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { extractFields, fieldLabel } from "@/lib/biblioteca/campos";
import { categories } from "@/lib/biblioteca/categorias";
import { actions, type CustomMessage } from "@/lib/biblioteca/store";
import { useToast } from "./Toast";

const quickFields = [
  "Nome",
  "Nome profissional",
  "Data",
  "Horário",
  "Valor",
  "Link de agendamento",
  "Endereço",
];

export function CustomForm({ initial }: { initial?: CustomMessage }) {
  const navigate = useNavigate();
  const toast = useToast();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? "01");
  const [context, setContext] = useState(initial?.context ?? "");
  const [text, setText] = useState(initial?.text ?? "Oi, [Nome]! ");
  const [tags, setTags] = useState(initial?.tags.join(", ") ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirming, setConfirming] = useState(false);
  const textRef = useRef<HTMLTextAreaElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (confirming) cancelRef.current?.focus();
  }, [confirming]);

  const insertField = (token: string) => {
    const area = textRef.current;
    const start = area?.selectionStart ?? text.length;
    const end = area?.selectionEnd ?? text.length;
    const next = `${text.slice(0, start)}[${token}]${text.slice(end)}`;
    setText(next);
    requestAnimationFrame(() => {
      area?.focus();
      const caret = start + token.length + 2;
      area?.setSelectionRange(caret, caret);
    });
  };

  const save = () => {
    const nextErrors: Record<string, string> = {};
    if (!title.trim()) nextErrors["title"] = "Dê um título para encontrar a mensagem depois.";
    if (text.trim().length < 10) nextErrors["text"] = "Escreva o texto da mensagem.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      document.getElementById(nextErrors["title"] ? "m-titulo" : "m-texto")?.focus();
      return;
    }
    const id = actions.saveCustom({
      id: initial?.id,
      title: title.trim(),
      categoryId,
      context: context.trim(),
      text: text.trim(),
      tags: tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      basedOn: initial?.basedOn,
    });
    toast(initial ? "Mensagem atualizada" : "Mensagem salva");
    void navigate({ to: "/mensagem/$id", params: { id } });
  };

  const fieldsInText = extractFields(text);

  return (
    <form
      className="panel"
      style={{ marginTop: 20 }}
      onSubmit={(event) => {
        event.preventDefault();
        save();
      }}
      noValidate
    >
      <div className="form-grid">
        <div className="field">
          <label htmlFor="m-titulo">Título</label>
          <input
            id="m-titulo"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Ex.: Lembrete com meu Pix"
            aria-invalid={!!errors["title"]}
            aria-describedby={errors["title"] ? "e-titulo" : undefined}
          />
          {errors["title"] && (
            <span id="e-titulo" className="field__help" style={{ color: "var(--danger)" }}>
              {errors["title"]}
            </span>
          )}
        </div>
        <div className="field">
          <label htmlFor="m-categoria">Categoria</label>
          <select
            id="m-categoria"
            value={categoryId}
            onChange={(event) => setCategoryId(event.target.value)}
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        <div className="field field--wide">
          <label htmlFor="m-contexto">
            Quando usar <span className="opt">(opcional)</span>
          </label>
          <input
            id="m-contexto"
            value={context}
            onChange={(event) => setContext(event.target.value)}
            placeholder="Ex.: Para pacientes que pagam por Pix"
          />
        </div>
        <div className="field field--wide">
          <label htmlFor="m-texto">Texto</label>
          <textarea
            ref={textRef}
            id="m-texto"
            className="editor-area"
            value={text}
            onChange={(event) => setText(event.target.value)}
            aria-invalid={!!errors["text"]}
            aria-describedby="m-texto-ajuda"
          />
          <span id="m-texto-ajuda" className="field__help">
            {errors["text"] ? (
              <strong style={{ color: "var(--danger)" }}>{errors["text"]} </strong>
            ) : null}
            Toque em um campo para inseri-lo no texto. Ele será preenchido na hora de copiar. Não
            salve nomes ou dados de pacientes aqui.
          </span>
          <div className="quick" style={{ marginTop: 4 }}>
            {quickFields.map((token) => (
              <button key={token} type="button" className="chip" onClick={() => insertField(token)}>
                + {fieldLabel(token)}
              </button>
            ))}
          </div>
          {fieldsInText.length > 0 && (
            <span className="field__help">
              Campos nesta mensagem: {fieldsInText.map(fieldLabel).join(", ")}.
            </span>
          )}
        </div>
        <div className="field field--wide">
          <label htmlFor="m-tags">
            Palavras para busca <span className="opt">(separadas por vírgula)</span>
          </label>
          <input
            id="m-tags"
            value={tags}
            onChange={(event) => setTags(event.target.value)}
            placeholder="Ex.: pix, pagamento, lembrete"
          />
        </div>
      </div>

      <div
        style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 20, alignItems: "center" }}
      >
        <button type="submit" className="btn btn--primary">
          <Save size={17} aria-hidden="true" /> Salvar mensagem
        </button>
        <button type="button" className="btn btn--ghost" onClick={() => history.back()}>
          Cancelar
        </button>
        {initial && (
          <button
            type="button"
            className="btn btn--danger-ghost"
            style={{ marginLeft: "auto" }}
            onClick={() => setConfirming(true)}
          >
            <Trash2 size={17} aria-hidden="true" /> Excluir
          </button>
        )}
      </div>

      {confirming && initial && (
        <div className="dialog-backdrop" onClick={() => setConfirming(false)}>
          <div
            className="dialog"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="del-title"
            onClick={(event) => event.stopPropagation()}
            onKeyDown={(event) => event.key === "Escape" && setConfirming(false)}
          >
            <h2 id="del-title">Excluir esta mensagem?</h2>
            <p>
              “{initial.title}” será removida de Minhas mensagens e das favoritas. Isso não pode ser
              desfeito. As mensagens originais da biblioteca não são afetadas.
            </p>
            <div className="dialog__actions">
              <button
                ref={cancelRef}
                type="button"
                className="btn btn--ghost"
                onClick={() => setConfirming(false)}
              >
                Manter mensagem
              </button>
              <button
                type="button"
                className="btn btn--danger"
                onClick={() => {
                  actions.deleteCustom(initial.id);
                  toast("Mensagem excluída");
                  void navigate({ to: "/minhas" });
                }}
              >
                <Trash2 size={17} aria-hidden="true" /> Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
