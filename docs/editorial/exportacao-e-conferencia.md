# Arquivos finais — produção e conferência

## Onde gerar

Na tela inicial, abra **Arquivos finais**. O conteúdo é compartilhado com **Conteúdo e edição** em memória: editar, restaurar JSON e registrar revisão altera a fonte usada pelos dois formatos. Não há backend, login, upload para Hotmart nem dados de pacientes. A geração ocorre no navegador; os módulos de exportação são carregados somente ao gerar.

1. Revise as 80 situações e os três tons; toda orientação clínica exige revisão por nutricionista.
2. Resolva os alertas automáticos. Eles bloqueiam a geração, mas sua ausência não comprova qualidade ou segurança clínica.
3. Confirme a ciência da revisão e gere PDF e DOCX.
4. Baixe os arquivos, faça os testes manuais e registre o checklist.
5. Cadastre PDF e DOCX na Hotmart como arquivos do produto. Faça uma compra/teste de acesso conforme os recursos da Hotmart. Não compartilhe o endereço do estúdio.
6. Guarde o JSON como fonte interna para futuras atualizações.

Sem 80 registros de revisão, os arquivos recebem o sufixo `para-conferencia`. Com 80, recebem `final`, mas isso é apenas um nome: a publicação ainda depende dos testes reais. O checklist é uma declaração da pessoa que o preenche e não equivale a certificação automática. Edições invalidam arquivos preparados e checklist. O checklist também é reiniciado quando a área é desmontada ou um dos formatos é gerado novamente. Uma nova tentativa descarta o arquivo anterior daquele formato, para não oferecer um download antigo se houver erro. O relatório JSON registra a medição e as declarações manuais separadamente.

## PDF

- PDF real por pdf-lib, sem impressão ou captura da tela.
- A4, margens de 48 pt, mensagens em Figtree 11 pt; títulos Bricolage Grotesque.
- Fontes WOFF fornecidas pelos pacotes @fontsource, servidas pelo próprio projeto e incorporadas ao arquivo via fontkit. Não depende do Google Fonts durante a exportação. O primeiro carregamento requer que os arquivos do projeto estejam disponíveis.
- Capa vetorial de balão de conversa, apresentação, instruções, índice, dez aberturas, situações e encerramento.
- Campos permanecem como texto; nenhum dado fictício é inserido.
- Índice com dez anotações de destino interno; retorno ao índice nas páginas de conteúdo; marcadores de categoria no catálogo do PDF. A exibição de marcadores depende do leitor.
- Quebras calculadas pelas métricas das fontes. Um card inteiro migra para a página seguinte, com identificação de continuação. Não reduz automaticamente o corpo e não divide mensagens.
- Um texto grande demais para caber num card A4 ou um título/contexto que exceda sua página causa erro explícito com identificação: é preciso reduzir o conteúdo no editor. Não baixa PDF truncado. Caracteres não suportados pela fonte também interrompem a geração, em vez de desaparecerem; emojis podem precisar ser substituídos por texto.
- O relatório mede folga vertical até o limite inferior seguro. Não faz avaliação estética nem simula todos os leitores.
- A prévia é um iframe do PDF gerado. Alguns navegadores móveis não mostram PDF embutido ou ignoram o fragmento de página. Alternativa: baixar e abrir num leitor local.
- PDF não é formulário interativo. Selecione/copie o texto e personalize fora dele ou use DOCX.
- Os cliques do índice e de “Voltar ao índice” são links internos reais. Animações, efeitos de hover, filtros, edição, exportação e o botão Copiar do estúdio não são transferidos: no PDF, a cópia é feita por seleção de texto no leitor. Os três tons aparecem juntos, sem alternância por botão.
- As capas da prévia, do PDF e do DOCX não exibem quantidades. O subtítulo da identidade também é independente da contagem. As contagens internas documentam a edição atual (80 situações / 240 mensagens).

## DOCX

Arquivo OOXML ZIP nativo gerado por docx, não HTML renomeado. Contém os mesmos títulos, contextos e 240 mensagens. Usa estilos de títulos, campos destacados, cabeçalho, rodapé e numeração. Tem índice manual de categorias com bookmarks internos utilizável imediatamente. O sumário detalhado usa campos do Word: atualize os campos para calcular páginas no editor. Alguns editores exigem Ctrl + clique nos links.

Fontes não incorporadas no DOCX. Instale Figtree e Bricolage Grotesque para fidelidade; sem elas, o editor substitui as fontes. Word, LibreOffice e outros editores podem paginar de maneira diferente. O PDF é a referência visual de entrega; o DOCX privilegia edição e não promete paginação idêntica.

## Organização das fontes

- `content.ts`: 80 situações, IDs e tons.
- `library.ts`: backup e validações editoriais.
- `identity.ts` e `Brand.tsx`: identidade e vetores editáveis.
- `export-model.ts`: textos de abertura, instruções, encerramento e validação do snapshot.
- `export-pdf.ts`: diagramação, fontes, links e marcadores.
- `export-docx.ts`: estilos e estrutura OOXML.
- `LibraryProvider.tsx`: estado único do editor e das exportações.
- `ExportPanel.tsx`: geração, prévia, downloads e checklist.

## Testes: situação nesta entrega

Foram adicionados testes automatizados para contagens, snapshot, nomes de arquivos, estrutura do PDF, tamanho A4, destinos do índice, marcadores, rejeição de transbordamento e glifos ausentes, e estrutura OOXML com 240 blocos de mensagem. Os testes anteriores foram ajustados ao estado compartilhado e à entrada por Arquivos finais.

**Não foi possível executar testes nem build neste ambiente de edição.** Portanto, esses testes foram escritos, mas não se afirma que passaram. Também não foram executados: abertura em celular/computador, seleção de textos no leitor, inspeção visual de todas as páginas, edição no Word/LibreOffice ou upload/teste da Hotmart. A interface oferece geração e checklist para executar essa conferência no projeto sincronizado. A inspeção estática do código não substitui essas verificações.

Com ambiente local instalado, executar `npm test` e `npm run build`. A geração do PDF na tela executa a medição real com as fontes carregadas e só libera o download ao concluir; isso não substitui os testes manuais acima.
