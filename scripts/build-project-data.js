const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const portfolioDir = path.join(root, "Portifolio");
const outFile = path.join(root, "assets", "js", "projects-data.js");
const projectConfigFile = path.join(root, "projects.config.json");
const imageExtensions = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif"]);

function loadProjectConfig() {
  if (!fs.existsSync(projectConfigFile)) {
    return {};
  }

  try {
    return JSON.parse(fs.readFileSync(projectConfigFile, "utf8"));
  } catch (error) {
    throw new Error(`Nao foi possivel ler ${path.relative(root, projectConfigFile)}: ${error.message}`);
  }
}

const projectDefaults = {
  "Aline e Flavio": {
    title: "Residência Aline e Flávio",
    category: "residencial",
    categoryLabel: "Residencial",
    type: "Fachada residencial",
    year: "2026",
    summary: "Estudo de fachada com volume limpo, aberturas verticais e composição contemporânea.",
    coverIncludes: "FACHADA 01- 01",
    featured: true,
  },
  Claverson: {
    title: "Residência Claverson",
    category: "residencial",
    categoryLabel: "Residencial",
    type: "Fachada residencial",
    year: "2026",
    summary: "Proposta de fachada com leitura horizontal e materiais de baixa manutenção.",
    coverIncludes: "Fachada 01 - 01",
  },
  Dennis: {
    title: "Residência Dennis",
    category: "residencial",
    categoryLabel: "Residencial",
    type: "Fachada residencial",
    year: "2026",
    summary: "Composição frontal com aberturas ritmadas, sombra e presença urbana.",
    coverIncludes: "FACHADA 01 - 01",
  },
  DIEMINI: {
    title: "Projeto Diemini",
    category: "residencial",
    categoryLabel: "Residencial",
    type: "Estudo residencial",
    year: "2025",
    summary: "Estudo de volumetria, acesso e materialidade para uma residência compacta.",
    coverIncludes: "Final 01",
  },
  EDVALDO: {
    title: "Residência Edvaldo",
    category: "residencial",
    categoryLabel: "Residencial",
    type: "Residencial",
    year: "2025",
    summary: "Projeto residencial com imagens de apoio para apresentação e tomada de decisão.",
    coverIncludes: "Foto 01",
  },
  Elaine: {
    title: "Casa Elaine",
    category: "interiores",
    categoryLabel: "Interiores",
    type: "Ambientes residenciais",
    year: "2025",
    summary: "Conjunto de ambientes internos e externos: escritório, garagem, lavabo, piscina e varanda.",
    coverIncludes: "piscina 01",
  },
  "IDAIR - LOJA": {
    title: "Loja Idair",
    category: "comercial",
    categoryLabel: "Comercial",
    type: "Projeto comercial",
    year: "2025",
    summary: "Estudo comercial para loja, fachada e apresentação de conceito.",
    coverIncludes: "FINAL 01 - 01",
  },
  JULIANA: {
    title: "Residência Juliana",
    category: "residencial",
    categoryLabel: "Residencial",
    type: "Fachada residencial",
    year: "2025",
    summary: "Fachada residencial com composição de planos, aberturas e materialidade clara.",
    coverIncludes: "FACHADA 02 - 01",
  },
  Marcelo: {
    title: "Residência Marcelo",
    category: "residencial",
    categoryLabel: "Residencial",
    type: "Residencial completo",
    year: "2025",
    summary: "Sequência de estudos, finais e imagens de acompanhamento para projeto residencial.",
    coverIncludes: "Final -01",
  },
  PEDRO: {
    title: "Estudo Pedro",
    category: "estudo",
    categoryLabel: "Estudo",
    type: "Estudo de projeto",
    year: "2025",
    summary: "Imagem de estudo para avaliação de conceito e comunicação da proposta.",
    coverIncludes: "Duda 4",
  },
  RENAN: {
    title: "Residência Renan",
    category: "residencial",
    categoryLabel: "Residencial",
    type: "Render final",
    year: "2025",
    summary: "Renders finais para apresentação de proposta residencial.",
    coverIncludes: "RENDER FINAL FINAL 02 - 01",
  },
  "THALES E SARA": {
    title: "Casa Thales e Sara",
    category: "interiores",
    categoryLabel: "Interiores",
    type: "Residencial e interiores",
    year: "2025",
    summary: "Projeto com cozinha, sala de TV e fachada, conectando interiores e linguagem externa.",
    coverIncludes: "FACHADA 02 - 01",
  },
  WILLIAN: {
    title: "Residência Willian",
    category: "residencial",
    categoryLabel: "Residencial",
    type: "Fachada residencial",
    year: "2025",
    summary: "Estudos de fachada para residência com três alternativas de visualização.",
    coverIncludes: "FACHADA 01",
  },
};

const projectMeta = { ...projectDefaults, ...loadProjectConfig() };

function toUrl(filePath) {
  return path.relative(root, filePath).split(path.sep).join("/");
}

function slugify(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function titleCase(value) {
  return value
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function imageLabel(filePath) {
  return titleCase(path.basename(filePath, path.extname(filePath)).replace(/\d+/g, " "));
}

function walkImages(dir) {
  const files = [];
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      files.push(...walkImages(fullPath));
      continue;
    }
    if (imageExtensions.has(path.extname(item.name).toLowerCase())) {
      files.push(fullPath);
    }
  }
  return files.sort((a, b) => a.localeCompare(b, "pt-BR", { numeric: true }));
}

function getProjectFolders() {
  if (!fs.existsSync(portfolioDir)) {
    throw new Error(`Pasta de portfolio nao encontrada: ${portfolioDir}`);
  }

  return fs
    .readdirSync(portfolioDir, { withFileTypes: true })
    .filter((item) => item.isDirectory())
    .map((item) => item.name)
    .sort((a, b) => a.localeCompare(b, "pt-BR", { numeric: true }));
}

function buildProject(folderName) {
  const dir = path.join(portfolioDir, folderName);
  const meta = projectMeta[folderName] || {};
  const projectTitle = meta.title || titleCase(folderName);
  const projectType = meta.type || "Projeto de arquitetura";
  const images = walkImages(dir).map((filePath) => ({
    src: toUrl(filePath),
    alt: `${projectTitle} - ${projectType} - ${imageLabel(filePath)}`,
  }));

  if (images.length === 0) {
    return null;
  }

  const cover =
    images.find((image) => meta.coverIncludes && image.src.toLowerCase().includes(meta.coverIncludes.toLowerCase())) ||
    images[0];

  return {
    id: slugify(folderName),
    folder: folderName,
    title: projectTitle,
    category: meta.category || "residencial",
    categoryLabel: meta.categoryLabel || "Residencial",
    type: meta.type || "Projeto arquitetônico",
    year: meta.year || "2025",
    summary: meta.summary || "Projeto selecionado do portfólio de arquitetura e urbanismo.",
    cover: cover.src,
    coverAlt: cover.alt,
    featured: Boolean(meta.featured),
    images,
  };
}

const projects = getProjectFolders().map(buildProject).filter(Boolean);
const heroProject = projects.find((project) => project.featured) || projects[0];

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(
  outFile,
  `window.PORTFOLIO_HERO_PROJECT_ID = ${JSON.stringify(heroProject?.id || null)};\n` +
    `window.PORTFOLIO_PROJECTS = ${JSON.stringify(projects, null, 2)};\n`,
  "utf8",
);

console.log(`Gerados ${projects.length} projetos em ${path.relative(root, outFile)}`);
