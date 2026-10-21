# Etapa 2 — Conteúdo editorial e edição

## Fonte de conteúdo

- `src/lib/editorial/content.ts`: 80 situações, com título, contexto e três mensagens escritas individualmente (A — Profissional, B — Próxima, C — Acolhedora).
- IDs estáveis de `01.01` a `10.08`; cada categoria tem oito situações. Os IDs não são editáveis na interface.
- `src/lib/editorial/identity.ts`: nomes das categorias e identidade visual preservada da etapa 1.
- `src/lib/editorial/library.ts`: ordenação, cópia dos textos-base, validação, serialização, restauração e download de backup JSON.
- `src/components/editorial/ContentEditor.tsx`: biblioteca e editor interno, apresentados na página inicial em **Conteúdo e edição**.

## Operação

1. Escolha uma categoria ou pesquise por ID, título, contexto, campos ou texto das mensagens. A busca ignora diferenças de acentuação.
2. Edite o título, o contexto e os textos. Compare os três tons ou filtre um tom. Use **Leitura** para selecionar textos e visualizar os campos destacados.
3. A gravação acontece a cada alteração no armazenamento local do navegador. Não há conta, banco de dados, servidor de conteúdo nem sincronização entre dispositivos. Não use dados reais de pacientes.
4. Após ler o contexto e os três tons, marque a situação como revisada. Qualquer alteração posterior remove a marca dessa situação. O indicador de revisão é uma declaração manual da pessoa que opera o estúdio, não uma certificação clínica.
5. Baixe o backup JSON ao concluir uma sessão. Para usar em outro navegador, restaure esse arquivo. A restauração pede confirmação antes de substituir o conteúdo local.

## Backup

O JSON usa `format: respostas-nutri-editorial` e `schemaVersion: 1`. Contém todas as situações, IDs, registros de revisão, data de exportação, identidade, categorias, tons e campos padronizados. Na restauração, apenas o conteúdo e os registros de revisão são aplicados; identidade e categorias continuam definidas no código, evitando alterações acidentais pela importação.

A validação exige os 80 IDs conhecidos, categorias correspondentes e os três campos de mensagem. Rejeita versões incompatíveis, IDs repetidos, estruturas inválidas e arquivos maiores que 2 MB. Rascunhos com campos vazios são preservados para não perder trabalho em andamento; eles geram alertas editoriais. O briefing visual da etapa 1 não pode ser restaurado como biblioteca.

Se o conteúdo local não puder ser lido, o editor apresenta os textos-base em memória e não sobrescreve automaticamente o valor anterior. Se o navegador impedir novas gravações, o aviso orienta baixar um JSON. Restaurar um backup válido permite tentar substituir esse estado, com confirmação.

## Revisão e limites

Os textos-base foram redigidos e revistos editorialmente quanto a finalidade, clareza, naturalidade e neutralidade de gênero, sem geração por substituição mecânica de palavras. As três versões mantêm objetivos comuns, mas têm construções próprias. Não contêm nomes, preços, locais ou dados pessoais fictícios.

As checagens automáticas apontam título ou contexto ausentes, mensagens muito curtas, repetições literais, algumas expressões marcadas por gênero, campos fora do padrão e colchetes incompletos. Não são uma análise linguística completa nem validam conduta clínica, autorização para contato ou semelhança semântica entre mensagens. Exigem revisão humana complementar.

Dúvidas clínicas solicitam contexto para avaliação profissional; não fornecem doses ou prescrição automática. Toda orientação clínica deve ser revisada por nutricionista antes de ser utilizada. Reativação depende de autorização prévia e exige respeitar pedidos de não contato; a ferramenta não envia mensagens a pacientes nem gerencia permissões.

## Conferência automatizada preparada

`src/test/editorial-content.test.tsx` cobre contagem, IDs, distribuição por categoria, distinção literal dos 240 textos, checagens dos textos-base, ida e volta do JSON, rejeição de estrutura inválida, edição, persistência, revisão manual, filtros e proteção de armazenamento corrompido. Os testes da identidade foram adaptados para acessar a prévia pelo menu, mantendo a biblioteca como tela inicial.

Os testes foram adicionados, mas não executados neste ambiente de edição. Executar `npm test` e `npm run build` no ambiente de desenvolvimento. Conferir também download/restauração do JSON e persistência em navegador real, inclusive com armazenamento bloqueado.

## Fora desta etapa

PDF, DOCX, paginação final, links internos do PDF e conferência dos arquivos finais pertencem à etapa 3. Os modelos visuais continuam explicitamente identificados como amostras. O JSON é um backup editorial, não o produto final para a Hotmart.
