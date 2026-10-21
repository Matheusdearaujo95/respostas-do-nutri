# Respostas prontas da Nutri — direção visual 01

## Estado desta entrega

Etapa 1 de 3: proposta de identidade para aprovação. Não é o produto final para venda.
A interface inclui uma capa, apresentação, índice de amostra, abertura de categoria e uma situação com três mensagens originais de amostra.
Os números 80 e 240 na capa e nos indicadores descrevem o escopo planejado, não a quantidade já produzida.

## Referências analisadas

- ID-visual.md fornecido na solicitação: papel quente, branco, verdes, papaya pontual; Bricolage Grotesque e Figtree; cantos suaves e ausência de gradientes e vidro.
- Acervo do Nutri: composição tipográfica forte, respiro, fundo claro, pequenos traços e ponto laranja.
- Templates do Nutri: ícone próprio ao lado da tipografia, verde e papaya, leveza dos elementos lineares.

As referências foram analisadas visualmente; os logotipos anteriores não foram incorporados ao novo logotipo.

## Conceito proposto

“Palavras que aproximam. Tempo para cuidar.”

Um balão com três linhas sugere mensagens organizadas. O ponto papaya representa presença humana.
A marca tem quatro composições: principal, horizontal, compacta e ícone. A capa utiliza uma composição editorial própria.

## Sistema visual

- Fundo: #FAF9F3.
- Branco: #FFFFFF.
- Verde: #3F5C39; contraste: #2C4128; tonalidade clara: #EBF0E2.
- Texto: #1D2A1F; secundário: #5A6552.
- Destaque pontual: #E8562F.
- Títulos: Bricolage Grotesque; corpo: Figtree.
- A interface carrega fontes pelo Google Fonts. Sem conexão ou com bloqueio ao serviço, usa fontes de sistema.
- Os tokens CSS usam oklch; o briefing e os vetores mantêm as referências hexadecimais.
- Tema exclusivamente claro. Sem fotos, elementos 3D ou imagens geradas.

## Organização dos arquivos-fonte

- `src/lib/editorial/identity.ts`: identidade, paleta, categorias planejadas e conteúdo de amostra.
- `src/components/editorial/Brand.tsx`: símbolo, variações da marca e geração de SVG editável.
- `src/components/editorial/EditorialPages.tsx`: templates de capa, apresentação, índice, abertura e mensagens.
- `src/components/editorial/EditorialStudio.tsx`: navegação, aprovação local e downloads do briefing e dos vetores.
- `src/components/editorial/StudioViews.tsx`: painéis de identidade e direção criativa.
- `src/editorial.css`: layout do estúdio e composições editoriais.
- `src/styles.css`: tokens globais do tema.
- `src/test/editorial-studio.test.tsx`: testes de interface, navegação, aprovação local e validade dos SVGs.

## Downloads desta etapa

Na seção Identidade visual, cada composição permite baixar um SVG real. Os textos permanecem editáveis e dependem da fonte Bricolage Grotesque instalada no editor de destino; ainda não estão convertidos em curvas.

“Baixar briefing” gera JSON com a direção visual e a revisão local. Não é um backup das futuras 240 mensagens.

Não há exportação PDF ou DOCX nesta etapa. A prévia HTML não usa impressão do navegador nem simula arquivos finais.

## Revisão e privacidade

Aprovação e observações ficam no localStorage deste navegador, sem sincronização. Para continuar a produção ou aplicar ajustes, compartilhar a decisão no chat. Limpar dados do navegador apaga esse registro; o briefing serve para guardá-lo.

Não há autenticação nem proteção de acesso. O rótulo “interno” descreve a finalidade editorial, não uma restrição técnica. O site solicita não indexação, mas isso não é controle de acesso. Não publicar dados pessoais de pacientes ou informações confidenciais. A ferramenta não é uma área para as compradoras.

## Próximas etapas, somente após aprovação

2. Conteúdo: 80 situações estáveis, 240 mensagens distintas e neutras em gênero, edição e backup de conteúdo.
3. Exportação: PDF real com texto selecionável, índice e links internos; DOCX real editável; checagem de layout e downloads para envio à Hotmart.

A publicação dos arquivos na Hotmart será realizada por quem administra o produto. Revisão clínica por nutricionista continua necessária antes da utilização.

## Validação

Foram adicionados testes automatizados, mas não executados nesta sessão: o ambiente de edição não oferece terminal, leitor de PDF/DOCX ou navegador de testes. A compilação e a apresentação visual precisam ser conferidas no preview do Lovable. Os testes de leitura de arquivos em celular, computador, Word e leitores PDF pertencem à etapa de exportação e ainda não foram realizados.
