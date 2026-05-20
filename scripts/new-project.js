const fs = require("fs");
const path = require("path");
const readline = require("readline/promises");
const { stdin: input, stdout: output } = require("process");
const { execFileSync } = require("child_process");

const root = path.resolve(__dirname, "..");
const portfolioDir = path.join(root, "Portifolio");
const configFile = path.join(root, "projects.config.json");

const categories = {
  "1": ["residencial", "Residencial"],
  "2": ["interiores", "Interiores"],
  "3": ["comercial", "Comercial"],
  "4": ["estudo", "Estudo"],
};

function readConfig() {
  if (!fs.existsSync(configFile)) return {};
  return JSON.parse(fs.readFileSync(configFile, "utf8"));
}

function writeConfig(config) {
  fs.writeFileSync(configFile, `${JSON.stringify(config, null, 2)}\n`, "utf8");
}

function listImages(folderName) {
  const dir = path.join(portfolioDir, folderName);
  if (!fs.existsSync(dir)) return [];

  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((item) => item.isFile() && /\.(jpe?g|png|webp|avif)$/i.test(item.name))
    .map((item) => item.name)
    .sort((a, b) => a.localeCompare(b, "pt-BR", { numeric: true }));
}

async function askRequired(rl, question) {
  let answer = "";
  while (!answer.trim()) {
    answer = await rl.question(question);
  }
  return answer.trim();
}

async function main() {
  fs.mkdirSync(portfolioDir, { recursive: true });

  const rl = readline.createInterface({ input, output });
  const config = readConfig();

  console.log("\nCadastro de novo projeto");
  console.log("Antes de cadastrar, crie a pasta em Portifolio e coloque as imagens nela.\n");

  const folderName = await askRequired(rl, "Nome exato da pasta em Portifolio: ");
  const folderPath = path.join(portfolioDir, folderName);
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
    console.log(`Pasta criada: Portifolio/${folderName}`);
    console.log("Coloque as imagens nessa pasta e rode este comando novamente se ainda nao colocou.");
  }

  const title = await askRequired(rl, "Nome publico do projeto: ");
  console.log("\nCategoria:");
  console.log("1 - Residencial");
  console.log("2 - Interiores");
  console.log("3 - Comercial");
  console.log("4 - Estudo");
  const categoryChoice = (await rl.question("Escolha uma opcao [1]: ")).trim() || "1";
  const [category, categoryLabel] = categories[categoryChoice] || categories["1"];
  const type = (await rl.question(`Tipo do projeto [${categoryLabel}]: `)).trim() || categoryLabel;
  const year = (await rl.question(`Ano [${new Date().getFullYear()}]: `)).trim() || String(new Date().getFullYear());
  const summary = await askRequired(rl, "Resumo curto para card/modal: ");

  const images = listImages(folderName);
  if (images.length) {
    console.log("\nImagens encontradas:");
    images.slice(0, 12).forEach((name) => console.log(`- ${name}`));
    if (images.length > 12) console.log(`... mais ${images.length - 12} imagem(ns)`);
  }

  const coverIncludes =
    (await rl.question("Trecho do nome da imagem de capa [primeira imagem da pasta]: ")).trim() || undefined;
  const featuredAnswer = (await rl.question("Usar como destaque principal? [s/N]: ")).trim().toLowerCase();

  config[folderName] = {
    title,
    category,
    categoryLabel,
    type,
    year,
    summary,
    ...(coverIncludes ? { coverIncludes } : {}),
    ...(featuredAnswer === "s" || featuredAnswer === "sim" ? { featured: true } : {}),
  };

  writeConfig(config);
  console.log("\nCadastro salvo em projects.config.json");

  try {
    execFileSync(process.execPath, [path.join(__dirname, "build-project-data.js")], {
      cwd: root,
      stdio: "inherit",
    });
  } catch {
    console.log("Nao foi possivel gerar os dados automaticamente. Rode npm.cmd run build:data depois.");
  }

  rl.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
