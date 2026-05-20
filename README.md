# Eduarda Soares Portfolio

Portfolio frontend para arquitetura e urbanismo, criado para apresentar projetos reais com layout editorial, filtros por categoria, galeria em modal e identidade visual propria.

O projeto foi estruturado em HTML, CSS, JavaScript e Node.js. A parte publica funciona como frontend estatico, enquanto o Express atende a area administrativa local para login, cadastro de projetos e upload de imagens. A camada de dados e gerada automaticamente a partir da pasta `Portifolio`, o que facilita uma futura migracao para React, Node API ou PHP/Laravel.

## Tecnologias Usadas

- HTML5 semantico: estrutura da pagina, secoes, dialog/modal nativo e formulario.
- CSS3: layout responsivo, grid, flexbox, variaveis CSS, media queries e estados visuais.
- JavaScript vanilla: menu mobile, filtros, rotacao dinamica de tipos de projeto, modal de galeria, validacao do formulario e abertura do WhatsApp com mensagem preenchida.
- Node.js: script local para ler as imagens reais e gerar o manifesto de dados do portfolio.
- Express: servidor Node para servir o site e a area administrativa.
- Multer: upload de imagens no painel administrativo.
- CommonJS: usado nos scripts Node (`require`, `fs`, `path`).
- Playwright com Chromium: revisao visual automatizada em desktop e mobile.
- SVG: logos vetoriais usados no header e footer.
- PNG/ICO: assets exportados para logo, navbar e favicon.
- SEO tecnico: meta tags, Open Graph, Twitter Card, robots, manifest e dados estruturados em JSON-LD.

## Como Rodar

Abra `index.html` diretamente no navegador.

Para atualizar os dados dos projetos depois de alterar imagens ou metadados:

```bat
npm run build:data
```

No PowerShell do Windows, se `npm.ps1` for bloqueado pela politica de execucao, use:

```bat
npm.cmd run build:data
```

Para cadastrar um projeto novo com perguntas guiadas:

```bat
npm.cmd run add:project
```

Para rodar a revisao visual:

```bat
npm.cmd run review
```

Os screenshots de revisao ficam em `output/playwright`.

Para rodar o site com area administrativa:

```bat
npm.cmd start
```

URLs locais:

```text
Site:  http://127.0.0.1:3000
Admin: http://127.0.0.1:3000/admin
```

Se a porta 3000 ja estiver em uso:

```bat
set PORT=3001
npm.cmd start
```

Login local padrao:

```text
Usuario: eduarda
Senha:   eduarda2026
```

Antes de publicar, altere essas credenciais usando variaveis de ambiente:

```bat
set ADMIN_USER=eduarda
set ADMIN_PASSWORD=sua-senha-forte
set SESSION_SECRET=um-texto-grande-aleatorio
npm.cmd start
```

## Como a Arquiteta Pode Incluir Projetos Sozinha

### Pelo painel administrativo

1. Rode `npm.cmd start`.
2. Acesse `http://127.0.0.1:3000/admin`.
3. Faca login.
4. Clique em `Novo`.
5. Preencha pasta, nome publico, categoria, ano, tipo e resumo.
6. Selecione as imagens.
7. Clique em `Salvar projeto`.

O painel cria ou atualiza a pasta em `Portifolio`, salva os dados em `projects.config.json` e regenera `assets/js/projects-data.js`.

### Pelo terminal

Fluxo recomendado:

1. Abrir a pasta `Portifolio`.
2. Criar uma nova pasta com o nome do projeto, por exemplo `Casa Nova Birigui`.
3. Colocar as imagens do projeto dentro dessa pasta.
4. Abrir o terminal na pasta `portfolio-site`.
5. Rodar:

```bat
npm.cmd run add:project
```

6. Responder as perguntas: nome publico, categoria, ano, resumo e imagem de capa.
7. Abrir `index.html` para conferir o projeto no site.

O comando `add:project` salva as informacoes em `projects.config.json` e depois roda a geracao dos dados automaticamente.

Se ela apenas trocar imagens dentro de uma pasta que ja existe, basta rodar:

```bat
npm.cmd run build:data
```

## Onde Alterar o Nome dos Projetos

Os nomes dos projetos ficam em:

```text
projects.config.json
```

Dentro desse arquivo, procure o bloco do projeto:

```json
"Aline e Flavio": {
  "title": "Residência Aline e Flávio",
  "category": "residencial",
  "categoryLabel": "Residencial",
  "type": "Fachada residencial",
  "year": "2026",
  "summary": "Estudo de fachada com volume limpo, aberturas verticais e composição contemporânea.",
  "coverIncludes": "FACHADA 01- 01",
  "featured": true
}
```

O que cada campo faz:

- Chave do objeto, exemplo `"Aline e Flavio"`: precisa bater com o nome da pasta dentro de `Portifolio`.
- `title`: nome que aparece no card e no modal.
- `category`: categoria tecnica usada pelo filtro (`residencial`, `interiores`, `comercial`, `estudo`).
- `categoryLabel`: texto visivel da categoria.
- `type`: classificacao interna do projeto.
- `year`: ano exibido.
- `summary`: descricao exibida no card e no modal.
- `coverIncludes`: parte do nome do arquivo que deve ser usado como capa.
- `featured`: quando `true`, prioriza o projeto como destaque/hero.

Depois de alterar qualquer nome, resumo, ano, categoria ou capa, rode:

```bat
npm.cmd run build:data
```

Nao edite manualmente `assets/js/projects-data.js` para mudar nomes. Esse arquivo e gerado automaticamente e sera sobrescrito pelo script.

## Como Adicionar Projetos

1. Crie uma pasta dentro de `Portifolio` com o nome do projeto.
2. Coloque as imagens do projeto dentro dessa pasta.
3. Rode `npm.cmd run add:project`.
4. Responda as perguntas do cadastro.
5. Abra `index.html` e confira.

Se uma pasta nova existir em `Portifolio` mas nao tiver cadastro em `projects.config.json`, o projeto ainda entra no site com dados padrao. Mesmo assim, para um portfolio apresentavel, o ideal e preencher `title`, `category`, `year`, `summary` e `coverIncludes`.

## Estrutura do Projeto

```text
portfolio-site/
  index.html
  styles.css
  app.js
  package.json
  projects.config.json
  robots.txt
  site.webmanifest
  review-playwright.js
  scripts/
    build-project-data.js
    new-project.js
  admin/
    index.html
    login.html
    admin.css
    admin.js
  assets/
    brand/
      logo-navbar-olive.svg
      logo-navbar-white.svg
    js/
      projects-data.js
  Portifolio/
    Aline e Flavio/
    Claverson/
    Dennis/
    ...
  output/
    playwright/
```

## Arquivos Principais

- `index.html`: estrutura da pagina e pontos de montagem do conteudo dinamico.
- `styles.css`: identidade visual, responsividade, cards, modal, galeria e formulario.
- `app.js`: comportamento da interface no navegador.
- `server.js`: servidor Express com login, sessoes locais, API administrativa e upload de imagens.
- `projects.config.json`: cadastro editavel dos nomes, categorias, anos, resumos e capas.
- `scripts/build-project-data.js`: script Node que transforma as pastas de imagens e o cadastro JSON em dados para o frontend.
- `scripts/new-project.js`: assistente de terminal para cadastrar projetos novos.
- `admin`: telas do painel administrativo.
- `assets/js/projects-data.js`: manifesto gerado com todos os projetos e imagens.
- `review-playwright.js`: automacao de revisao visual em desktop e mobile.
- `robots.txt`: arquivo basico para permitir indexacao por mecanismos de busca.
- `site.webmanifest`: manifesto com nome, tema e icone do site.
- `Portifolio`: imagens reais usadas no site.

## Contato e WhatsApp

A secao de contato nao envia email, nao grava em banco e nao cria lead no servidor neste momento.

O formulario e tratado no navegador pelo `app.js`. Quando a pessoa preenche nome, email, tipo de projeto e mensagem, o JavaScript monta um texto e abre o WhatsApp da arquiteta usando o link oficial:

```text
https://wa.me/5518991745227
```

O numero e a mensagem padrao ficam em `app.js`:

```js
const whatsappNumber = "5518991745227";
const whatsappDefaultMessage = "Olá, vi seu trabalho pelo seu site e gostaria de falar sobre um projeto.";
```

Para trocar o telefone, altere apenas `whatsappNumber`, mantendo o formato internacional sem espacos, parenteses ou tracos:

```text
55 + DDD + numero
```

Exemplo:

```text
5518991745227
```

O botao `Chamar no WhatsApp` usa a mesma configuracao e abre uma conversa rapida com a mensagem padrao. O envio do formulario abre uma conversa com os dados preenchidos, no formato:

```text
Olá, vi seu trabalho pelo seu site e gostaria de falar sobre um projeto.

Nome: ...
Email: ...
Tipo de projeto: ...

Mensagem: ...
```

Se no futuro quiser guardar contatos em banco ou enviar email, o caminho recomendado e criar uma rota `POST /api/contact` no Express ou Laravel e salvar os dados antes de redirecionar para o WhatsApp.

## Funcionamento Tecnico

O fluxo de dados e simples:

```text
Portifolio/<nome-do-projeto> + projects.config.json -> scripts/build-project-data.js -> assets/js/projects-data.js -> app.js -> interface
```

O `build-project-data.js` percorre as pastas com `fs`, filtra arquivos de imagem, monta um array de projetos e grava duas variaveis globais:

```js
window.PORTFOLIO_HERO_PROJECT_ID = "...";
window.PORTFOLIO_PROJECTS = [...];
```

O `app.js` le essas variaveis e renderiza:

- imagem principal do hero;
- filtros de categoria;
- cards dos projetos;
- chamada dinamica com imagem por tipo de projeto;
- modal com imagem completa usando `object-fit: contain`;
- miniaturas da galeria;
- validacao visual do formulario;
- geracao do link de contato pelo WhatsApp.

## Revisao Visual

O script `review-playwright.js` abre o site em Chromium e valida:

- desktop e mobile;
- erros de console;
- erros de pagina;
- overflow horizontal;
- quantidade de cards visiveis;
- filtro de interiores;
- troca dinamica da chamada de projetos;
- abertura do modal;
- carregamento da imagem principal;
- uso de `object-fit: contain` na imagem principal e nas miniaturas.

## SEO Local

O site foi otimizado para buscas ligadas a arquitetura em Birigui, Aracatuba e regiao.

Implementacoes feitas:

- `title` com termos principais: arquitetura, Birigui, Aracatuba, projetos residenciais e interiores.
- `meta description` orientada para servicos e localizacao.
- metadados `robots`, `geo.region`, `geo.placename` e `theme-color`.
- Open Graph e Twitter Card para compartilhamento.
- secao visivel de atendimento regional com cidades atendidas.
- textos do hero e servicos com termos locais naturais.
- `alt` das imagens gerado com nome do projeto e tipo de projeto.
- JSON-LD dinamico via `app.js` com `WebSite`, `WebPage`, `HomeAndConstructionBusiness` e `ItemList` dos projetos.
- `robots.txt` preparado para indexacao.
- `site.webmanifest` com identidade do site.

Pontos para configurar quando o site for publicado:

- trocar/adicionar a URL canonica oficial no `index.html`;
- usar URL absoluta no `og:image` e `twitter:image`;
- criar `sitemap.xml` com o dominio real;
- adicionar a linha `Sitemap: https://seudominio.com.br/sitemap.xml` no `robots.txt`;
- cadastrar o site no Google Search Console;
- criar ou atualizar o Perfil da Empresa no Google com nome, endereco, telefone, site, horario e fotos reais;
- se houver endereco publico do escritorio, completar o JSON-LD com `streetAddress` e `postalCode`.

## Caminho Para React, Node ou Laravel

Hoje o projeto usa HTML/CSS/JS puro para manter a base simples.

Em React, os dados de `PORTFOLIO_PROJECTS` podem virar estado ou vir de um arquivo JSON/API.

Em Node, o conteudo de `assets/js/projects-data.js` pode virar um endpoint:

```text
GET /api/projects
```

Em Laravel, a estrutura pode virar:

- `projects`: titulo, categoria, ano, resumo, capa, destaque.
- `project_images`: projeto, caminho da imagem, texto alternativo, ordem.

Assim, o frontend atual ja funciona como um prototipo real da interface e tambem como base para uma futura aplicacao full stack.

## Area Administrativa

O painel administrativo usa Express no backend e Multer para receber imagens.

Rotas principais:

- `GET /admin/login`: tela de login.
- `POST /admin/login`: autentica e cria cookie de sessao.
- `GET /admin`: painel de projetos.
- `GET /admin/api/projects`: lista projetos, metadados e imagens.
- `POST /admin/api/projects`: cria/atualiza projeto e envia imagens.
- `DELETE /admin/api/images`: remove uma imagem do projeto.

Observacoes de seguranca:

- O login padrao e apenas para desenvolvimento local.
- Em producao, configure `ADMIN_USER`, `ADMIN_PASSWORD` e `SESSION_SECRET`.
- Para publicar na internet, use HTTPS.
- O painel atual guarda sessao em memoria; ao reiniciar o servidor, o login e perdido.
- Para Laravel no futuro, essa area pode virar um CRUD com usuarios, storage e banco de dados.
