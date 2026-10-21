import { useNavigate } from "@tanstack/react-router";
import { Search, X } from "lucide-react";
import { useEffect, useState } from "react";

// Busca sempre leva à Biblioteca com o termo na URL, para que o resultado
// possa ser compartilhado, voltado no histórico e recarregado.
export function SearchBox({
  initial = "",
  compact = false,
  autoFocus = false,
  live = false,
  label = "O que você precisa responder hoje?",
  visibleLabel = false,
  placeholder,
}: {
  initial?: string;
  compact?: boolean;
  autoFocus?: boolean;
  live?: boolean;
  visibleLabel?: boolean;
  placeholder?: string;
  label?: string;
}) {
  const navigate = useNavigate();
  const [value, setValue] = useState(initial);
  useEffect(() => setValue(initial), [initial]);

  const go = (q: string) =>
    navigate({
      to: "/biblioteca",
      search: (prev: Record<string, unknown>) => ({
        ...(live ? prev : {}),
        q: q.trim() || undefined,
      }),
      replace: live,
    });

  const inputId = compact ? "busca-compacta" : "busca";
  return (
    <>
      {visibleLabel && (
        <label className="search-label" htmlFor={inputId}>
          {label}
        </label>
      )}
      <form
        role="search"
        className={`search${compact ? " search--compact" : ""}`}
        onSubmit={(event) => {
          event.preventDefault();
          void go(value);
          (document.activeElement as HTMLElement | null)?.blur();
        }}
      >
        <Search className="search__icon" size={20} aria-hidden="true" />
        {!visibleLabel && (
          <label className="sr-only" htmlFor={inputId}>
            {label}
          </label>
        )}
        <input
          id={inputId}
          type="search"
          inputMode="search"
          enterKeyHint="search"
          autoComplete="off"
          autoFocus={autoFocus}
          placeholder={placeholder ?? label}
          value={value}
          onChange={(event) => {
            setValue(event.target.value);
            if (live) void go(event.target.value);
          }}
        />
        {value && (
          <button
            type="button"
            className="icon-btn search__clear"
            aria-label="Limpar busca"
            onClick={() => {
              setValue("");
              if (live) void go("");
            }}
          >
            <X size={18} aria-hidden="true" />
          </button>
        )}
      </form>
    </>
  );
}
