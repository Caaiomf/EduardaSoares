const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const express = require("express");
const multer = require("multer");

const app = express();
const root = __dirname;
const adminDir = path.join(root, "admin");
const portfolioDir = path.join(root, "Portifolio");
const tmpDir = path.join(root, ".upload-tmp");
const configFile = path.join(root, "projects.config.json");
const buildScript = path.join(root, "scripts", "build-project-data.js");

const port = Number(process.env.PORT || 3000);
const adminUser = process.env.ADMIN_USER || "eduarda";
const adminPassword = process.env.ADMIN_PASSWORD || "eduarda2026";
const sessionSecret = process.env.SESSION_SECRET || crypto.randomBytes(32).toString("hex");
const sessions = new Map();
const imageExtensions = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif"]);

fs.mkdirSync(portfolioDir, { recursive: true });
fs.mkdirSync(tmpDir, { recursive: true });

const upload = multer({
  dest: tmpDir,
  limits: {
    fileSize: 18 * 1024 * 1024,
    files: 40,
  },
  fileFilter(_req, file, callback) {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!imageExtensions.has(ext)) {
      callback(new Error("Envie apenas imagens JPG, PNG, WEBP ou AVIF."));
      return;
    }
    callback(null, true);
  },
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

function parseCookies(header = "") {
  return Object.fromEntries(
    header
      .split(";")
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => {
        const index = part.indexOf("=");
        return [decodeURIComponent(part.slice(0, index)), decodeURIComponent(part.slice(index + 1))];
      }),
  );
}

function sign(value) {
  return crypto.createHmac("sha256", sessionSecret).update(value).digest("hex");
}

function createSession() {
  const id = crypto.randomBytes(32).toString("hex");
  sessions.set(id, { createdAt: Date.now() });
  return `${id}.${sign(id)}`;
}

function safeCompare(left, right) {
  const leftBuffer = Buffer.from(String(left || ""));
  const rightBuffer = Buffer.from(String(right || ""));
  return leftBuffer.length === rightBuffer.length && crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

function getSession(req) {
  const token = parseCookies(req.headers.cookie).admin_session;
  if (!token) return null;

  const [id, signature] = token.split(".");
  if (!id || signature !== sign(id)) return null;
  return sessions.has(id) ? id : null;
}

function requireAuth(req, res, next) {
  if (getSession(req)) {
    next();
    return;
  }
  res.redirect("/admin/login");
}

function safeSegment(value) {
  return String(value || "")
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 90);
}

function resolveProjectDir(folderName) {
  const safeName = safeSegment(folderName);
  if (!safeName) throw new Error("Informe o nome da pasta do projeto.");

  const target = path.resolve(portfolioDir, safeName);
  const base = path.resolve(portfolioDir);
  if (target !== base && target.startsWith(`${base}${path.sep}`)) {
    return { safeName, target };
  }
  throw new Error("Nome de pasta invalido.");
}

function readConfig() {
  if (!fs.existsSync(configFile)) return {};
  return JSON.parse(fs.readFileSync(configFile, "utf8"));
}

function writeConfig(config) {
  fs.writeFileSync(configFile, `${JSON.stringify(config, null, 2)}\n`, "utf8");
}

function walkImages(dir) {
  if (!fs.existsSync(dir)) return [];

  const output = [];
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      output.push(...walkImages(fullPath));
      continue;
    }
    if (imageExtensions.has(path.extname(item.name).toLowerCase())) {
      output.push(path.relative(root, fullPath).split(path.sep).join("/"));
    }
  }
  return output.sort((a, b) => a.localeCompare(b, "pt-BR", { numeric: true }));
}

function listProjects() {
  const config = readConfig();
  const folders = fs
    .readdirSync(portfolioDir, { withFileTypes: true })
    .filter((item) => item.isDirectory())
    .map((item) => item.name);

  const names = [...new Set([...Object.keys(config), ...folders])].sort((a, b) => a.localeCompare(b, "pt-BR"));
  return names.map((folder) => ({
    folder,
    meta: config[folder] || {},
    images: walkImages(path.join(portfolioDir, folder)),
  }));
}

function safeFileName(originalName) {
  const ext = path.extname(originalName).toLowerCase();
  const base = path
    .basename(originalName, ext)
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80) || "imagem";
  return `${base}${ext}`;
}

function uniqueTarget(dir, fileName) {
  const ext = path.extname(fileName);
  const base = path.basename(fileName, ext);
  let candidate = path.join(dir, fileName);
  let counter = 2;

  while (fs.existsSync(candidate)) {
    candidate = path.join(dir, `${base}-${counter}${ext}`);
    counter += 1;
  }
  return candidate;
}

function rebuildData() {
  execFileSync(process.execPath, [buildScript], {
    cwd: root,
    stdio: "inherit",
  });
}

function cleanUploaded(files = []) {
  for (const file of files) {
    if (file?.path && fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
  }
}

app.get("/admin/login", (req, res) => {
  if (getSession(req)) {
    res.redirect("/admin");
    return;
  }
  res.sendFile(path.join(adminDir, "login.html"));
});

app.post("/admin/login", (req, res) => {
  const userOk = safeCompare(req.body.user, adminUser);
  const passwordOk = safeCompare(req.body.password, adminPassword);

  if (!userOk || !passwordOk) {
    res.status(401).send("Login invalido. Volte e tente novamente.");
    return;
  }

  res.cookie("admin_session", createSession(), {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 1000 * 60 * 60 * 8,
  });
  res.redirect("/admin");
});

app.post("/admin/logout", requireAuth, (req, res) => {
  const token = parseCookies(req.headers.cookie).admin_session;
  const id = token?.split(".")[0];
  if (id) sessions.delete(id);
  res.clearCookie("admin_session");
  res.redirect("/admin/login");
});

app.get("/admin", requireAuth, (_req, res) => {
  res.sendFile(path.join(adminDir, "index.html"));
});

app.use("/admin", requireAuth, express.static(adminDir));

app.get("/admin/api/projects", requireAuth, (_req, res) => {
  res.json({
    projects: listProjects(),
    categories: [
      ["residencial", "Residencial"],
      ["interiores", "Interiores"],
      ["comercial", "Comercial"],
      ["estudo", "Estudo"],
    ],
  });
});

app.post("/admin/api/projects", requireAuth, upload.array("images"), (req, res) => {
  try {
    const { safeName, target } = resolveProjectDir(req.body.folder);
    fs.mkdirSync(target, { recursive: true });

    for (const file of req.files || []) {
      const targetFile = uniqueTarget(target, safeFileName(file.originalname));
      fs.renameSync(file.path, targetFile);
    }

    const config = readConfig();
    config[safeName] = {
      title: req.body.title?.trim() || safeName,
      category: req.body.category || "residencial",
      categoryLabel: req.body.categoryLabel || "Residencial",
      type: req.body.type?.trim() || req.body.categoryLabel || "Residencial",
      year: req.body.year?.trim() || String(new Date().getFullYear()),
      summary: req.body.summary?.trim() || "Projeto selecionado do portfólio de arquitetura e urbanismo.",
      ...(req.body.coverIncludes?.trim() ? { coverIncludes: req.body.coverIncludes.trim() } : {}),
      ...(req.body.featured === "on" ? { featured: true } : {}),
    };

    if (req.body.featured === "on") {
      for (const [folder, meta] of Object.entries(config)) {
        if (folder !== safeName && meta.featured) {
          delete meta.featured;
        }
      }
    }

    writeConfig(config);
    rebuildData();

    res.json({ ok: true, project: listProjects().find((project) => project.folder === safeName) });
  } catch (error) {
    cleanUploaded(req.files);
    res.status(400).json({ ok: false, message: error.message });
  }
});

app.delete("/admin/api/images", requireAuth, (req, res) => {
  try {
    const relative = String(req.body.src || "");
    const target = path.resolve(root, relative);
    const base = path.resolve(portfolioDir);

    if (!target.startsWith(`${base}${path.sep}`) || !fs.existsSync(target)) {
      throw new Error("Imagem invalida.");
    }

    fs.unlinkSync(target);
    rebuildData();
    res.json({ ok: true });
  } catch (error) {
    res.status(400).json({ ok: false, message: error.message });
  }
});

app.use(express.static(root));

app.listen(port, () => {
  console.log(`Site: http://127.0.0.1:${port}`);
  console.log(`Admin: http://127.0.0.1:${port}/admin`);
  if (!process.env.ADMIN_PASSWORD) {
    console.log("Login local padrao: usuario eduarda / senha eduarda2026");
    console.log("Para publicar, configure ADMIN_USER, ADMIN_PASSWORD e SESSION_SECRET.");
  }
});
