# Respostas do Nutri

Biblioteca de mensagens prontas, editáveis e organizadas para nutricionistas. Complemento do Acervo do Nutri.

A nutricionista escolhe o momento do atendimento, encontra a mensagem, preenche o nome do paciente e copia com um toque. Sem IA em tempo real, sem envio automático e sem guardar dados de pacientes.

## Gerar o PDF (produto vendido na Hotmart)

```sh
bun install
bunx playwright-core install chromium   # só na primeira vez
bun run pdf                             # gera saida/respostas-do-nutri.pdf
```

O PDF sai com capa, "Como usar", sumário clicável, índice por categoria, atalhos de voltar em cada mensagem, índice alfabético por situação e marcadores para a barra lateral do leitor. Ele é gerado a partir dos mesmos arquivos de `conteudo/`, então basta editar uma mensagem e rodar de novo. Use `bun run pdf -- --html` para guardar também o HTML intermediário. Se já tiver o Chrome instalado, dá para usar `CHROMIUM_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" bun run pdf`.

## Rodar o app web localmente

```sh
bun install   # ou npm install
bun run dev   # http://localhost:5173
bun run test  # testes de conteúdo, busca e rotas
bun run build
```

## Onde fica cada coisa

| Caminho | O que é |
| --- | --- |
| `conteudo/01.md` … `conteudo/12.md` | A biblioteca de mensagens, um arquivo por categoria |
| `src/lib/biblioteca/` | Categorias, campos personalizáveis, busca, cópia e armazenamento local |
| `src/routes/` | As telas (início, biblioteca, categoria, mensagem, editor, favoritas, minhas mensagens, perfil, ajuda) |
| `src/components/app/` | Componentes visuais (layout, cards, editor) |
| `src/app.css` | Identidade visual (cores, tipografia, componentes) |
| `public/brand/` | Logo do Respostas do Nutri e monograma da Elaine |

## Editar ou criar mensagens

Cada mensagem em `conteudo/*.md` segue este formato:

```md
## 09.13 · Título da mensagem
situacao: quando usar esta mensagem
tags: retorno, voltar consulta, convite
popular: sim

### Próxima
Oi, [Nome]! ...

### Profissional
Olá, [Nome]. ...
```

- Tons aceitos: `Próxima`, `Acolhedora`, `Profissional` (um ou mais).
- Campos entre colchetes, como `[Nome]`, `[Valor]` ou `[Link de agendamento]`, são preenchidos pelo perfil ou no editor. A lista está em `src/lib/biblioteca/campos.ts`.
- Mensagens com valores, datas ou condições recebem automaticamente o selo "Conferir dados".
- `bun run test` confere quantidade mínima (150), IDs únicos, linguagem neutra de gênero e ausência de promessas ou prescrições.

## Privacidade

Perfil, favoritas, histórico de uso e mensagens próprias ficam apenas no `localStorage` do navegador. O histórico guarda só o ID do modelo usado; o nome do paciente digitado no editor nunca é salvo.
