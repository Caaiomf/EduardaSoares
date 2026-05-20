# Eduarda Soares Portfolio

Frontend estatico em HTML, CSS e JavaScript, usando imagens reais da pasta `Portifolio`.

## Como atualizar projetos

1. Coloque as imagens dentro de `Portifolio/<Nome do projeto>/`.
2. Rode:

```bat
npm run build:data
```

3. Abra `index.html` no navegador.

O comando gera `assets/js/projects-data.js`, que e o arquivo consumido pelo frontend.

## Estrutura

- `index.html`: estrutura da pagina.
- `styles.css`: layout e responsividade.
- `app.js`: menu, filtros, galeria/modal e formulario.
- `scripts/build-project-data.js`: script Node que le a pasta `Portifolio`.
- `assets/js/projects-data.js`: manifesto gerado com projetos e imagens.
- `Portifolio`: imagens reais dos projetos.

## Pensando em Node ou Laravel

Hoje os dados ficam em `assets/js/projects-data.js`. Em Node, esse conteudo pode virar um endpoint JSON. Em Laravel, vira uma estrutura com tabelas parecidas com:

- `projects`: titulo, categoria, ano, resumo, capa.
- `project_images`: projeto, caminho da imagem, texto alternativo, ordem.
