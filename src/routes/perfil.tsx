import { createFileRoute } from "@tanstack/react-router";
import { Check, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { FooterNote, PageHeader } from "@/components/app/Common";
import { useToast } from "@/components/app/Toast";
import { profileFields, type Profile } from "@/lib/biblioteca/campos";
import { library } from "@/lib/biblioteca/mensagens";
import { actions, storageAvailable, useAppState } from "@/lib/biblioteca/store";

export const Route = createFileRoute("/perfil")({
  head: () => ({ meta: [{ title: "Meu perfil · Respostas do Nutri" }] }),
  component: ProfilePage,
});

const groups = [
  { id: "identificacao", title: "Quem atende", hint: "Como você aparece nas mensagens." },
  {
    id: "contato",
    title: "Contato e acesso",
    hint: "Canais, endereço e links que os pacientes recebem.",
  },
  {
    id: "atendimento",
    title: "Atendimento e condições",
    hint: "Valores e regras. Nada disso é inventado pelo app: só entra o que você preencher.",
  },
] as const;

function usageCount(token: string) {
  return library.filter((message) => message.fields.includes(token)).length;
}

function ProfilePage() {
  const { profile } = useAppState();
  const toast = useToast();
  const [draft, setDraft] = useState<Profile>(profile);
  useEffect(() => setDraft(profile), [profile]);
  const dirty = profileFields.some((field) => draft[field.key] !== profile[field.key]);
  const filled = profileFields.filter((field) => draft[field.key].trim()).length;

  return (
    <div className="page page--narrow has-sticky">
      <PageHeader
        eyebrow="Meu perfil"
        title="Seus dados, uma vez só"
        lead="Essas informações preenchem automaticamente os campos das mensagens. Ficam salvas somente neste aparelho."
      />

      <div className="panel panel--soft" style={{ marginTop: 18 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 13.5,
            fontWeight: 600,
            marginBottom: 8,
          }}
        >
          <span>Perfil preenchido</span>
          <span>
            {filled} de {profileFields.length}
          </span>
        </div>
        <div
          className="progress"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={profileFields.length}
          aria-valuenow={filled}
          aria-label="Perfil preenchido"
        >
          <span style={{ width: `${(filled / profileFields.length) * 100}%` }} />
        </div>
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          const cleaned = Object.fromEntries(
            profileFields.map((field) => [field.key, draft[field.key].trim()]),
          ) as Profile;
          actions.saveProfile(cleaned);
          toast(storageAvailable ? "Perfil salvo" : "Não foi possível salvar neste navegador");
        }}
      >
        {groups.map((group) => (
          <section
            key={group.id}
            className="panel"
            style={{ marginTop: 16 }}
            aria-labelledby={`g-${group.id}`}
          >
            <h2 id={`g-${group.id}`} className="panel__title">
              {group.title}
            </h2>
            <p className="panel__hint">{group.hint}</p>
            <div className="form-grid" style={{ marginTop: 16 }}>
              {profileFields
                .filter((field) => field.group === group.id)
                .map((field) => {
                  const count = usageCount(field.token);
                  const id = `p-${field.key}`;
                  return (
                    <div
                      key={field.key}
                      className={`field${field.multiline ? " field--wide" : ""}`}
                    >
                      <label htmlFor={id}>{field.label}</label>
                      {field.multiline ? (
                        <textarea
                          id={id}
                          value={draft[field.key]}
                          placeholder={field.placeholder}
                          onChange={(event) =>
                            setDraft({ ...draft, [field.key]: event.target.value })
                          }
                        />
                      ) : (
                        <input
                          id={id}
                          value={draft[field.key]}
                          placeholder={field.placeholder}
                          inputMode={
                            field.key === "whatsapp"
                              ? "tel"
                              : field.key.startsWith("link")
                                ? "url"
                                : undefined
                          }
                          autoComplete="off"
                          onChange={(event) =>
                            setDraft({ ...draft, [field.key]: event.target.value })
                          }
                        />
                      )}
                      <span className="field__help">
                        {count
                          ? `Usado em ${count} ${count === 1 ? "mensagem" : "mensagens"} como [${field.token}]`
                          : `Campo [${field.token}] para suas mensagens próprias`}
                      </span>
                    </div>
                  );
                })}
            </div>
          </section>
        ))}

        <p className="notice notice--info" style={{ marginTop: 16 }}>
          <ShieldCheck size={18} aria-hidden="true" />
          <span>
            Seus dados ficam guardados apenas no navegador deste aparelho. Nenhuma informação de
            paciente é salva pelo Respostas do Nutri.
          </span>
        </p>

        <div className="hide-mobile" style={{ marginTop: 18 }}>
          <button type="submit" className="btn btn--primary btn--lg" disabled={!dirty}>
            <Check size={19} aria-hidden="true" /> Salvar perfil
          </button>
        </div>
        <div className="sticky-actions">
          <button type="submit" className="btn btn--primary btn--lg" disabled={!dirty}>
            <Check size={19} aria-hidden="true" /> {dirty ? "Salvar perfil" : "Perfil salvo"}
          </button>
        </div>
      </form>
      <FooterNote />
    </div>
  );
}
