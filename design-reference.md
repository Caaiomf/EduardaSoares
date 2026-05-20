# Referencia Visual

Direcao: portfolio editorial de arquitetura para Eduarda Soares, com foco em projetos, leitura calma e identidade sofisticada.

## Estrutura

- Header fixo discreto com logo, navegacao curta e chamada para contato.
- Hero full-bleed com imagem real do portfolio e texto sobreposto, sem card.
- Faixa de indicadores com areas de atuacao e numero de projetos.
- Grid filtravel de projetos com imagens reais vindas da pasta `Portifolio`.
- Secao de processo com etapas de trabalho.
- Secao de servicos em blocos objetivos.
- Contato com formulario visual e informacoes de atendimento.

## Sistema visual

- Verde da marca: `#34431d`
- Off-white: `#f5f1e8`
- Concreto claro: `#d9d6ca`
- Grafite: `#171a13`
- Argila discreta: `#9b765b`
- Sombra suave, bordas de ate `8px`, tipografia leve e espacamento generoso.

## Comportamento

- Filtros de projeto sem recarregar a pagina.
- Navegacao responsiva com menu compacto no mobile.
- Formulario com validacao simples no front.
- Layout otimizado para desktop e mobile.

## Dados

- Os projetos sao gerados por `scripts/build-project-data.js`.
- O script le a pasta `Portifolio` e cria `assets/js/projects-data.js`.
- Essa estrutura em JS pode virar uma API Node ou uma tabela `projects`/`project_images` no Laravel.
