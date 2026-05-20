const projects = window.PORTFOLIO_PROJECTS || [];
const heroProjectId = window.PORTFOLIO_HERO_PROJECT_ID;

const header = document.querySelector("[data-header]");
const menuToggle = document.querySelector(".menu-toggle");
const nav = document.querySelector("#site-nav");
const heroImage = document.querySelector("[data-hero-image]");
const filterBar = document.querySelector("[data-filter-bar]");
const projectGrid = document.querySelector("[data-project-grid]");
const projectTypeImage = document.querySelector("[data-project-type-image]");
const projectTypeName = document.querySelector("[data-project-type-name]");
const projectTypeCopy = document.querySelector("[data-project-type-copy]");
const dialog = document.querySelector("[data-project-dialog]");
const dialogClose = document.querySelector("[data-dialog-close]");
const dialogCover = document.querySelector("[data-dialog-cover]");
const dialogCategory = document.querySelector("[data-dialog-category]");
const dialogTitle = document.querySelector("[data-dialog-title]");
const dialogSummary = document.querySelector("[data-dialog-summary]");
const dialogThumbs = document.querySelector("[data-dialog-thumbs]");
const form = document.querySelector("[data-contact-form]");
const formNote = document.querySelector("[data-form-note]");

const categoryLabels = {
  all: "Todos",
  residencial: "Residencial",
  interiores: "Interiores",
  comercial: "Comercial",
  estudo: "Estudo",
};

const categoryIntro = {
  residencial: "{count} de casas, fachadas e implantacoes com leitura clara de acesso e cotidiano.",
  interiores: "{count} de ambientes internos, marcenaria, luz e composicao para uso diario.",
  comercial: "{count} comercial com fachada, vitrine e presenca urbana.",
  estudo: "{count} de conceito para testar linguagem, volume e implantacao.",
};

let projectTypeIndex = 0;
let projectTypeTimer;

function updateHeader() {
  header.classList.toggle("is-scrolled", window.scrollY > 24);
}

function getHeroProject() {
  return projects.find((project) => project.id === heroProjectId) || projects[0];
}

function renderHero() {
  const project = getHeroProject();
  if (!project || !heroImage) return;

  heroImage.src = project.cover;
  heroImage.alt = project.coverAlt || project.title;
}

function getCategories() {
  const unique = [...new Set(projects.map((project) => project.category))];
  const order = ["residencial", "interiores", "comercial", "estudo"];
  return ["all", ...order.filter((category) => unique.includes(category)), ...unique.filter((category) => !order.includes(category))];
}

function getProjectTypeCategories() {
  return getCategories().filter((category) => category !== "all");
}

function projectCountText(category) {
  const count = projects.filter((project) => project.category === category).length;
  return `${count} ${count === 1 ? "projeto" : "projetos"}`;
}

function getProjectForCategory(category) {
  return projects.find((project) => project.category === category) || projects[0];
}

function setProjectTypeIntro(category, animate = true) {
  if (!projectTypeName || !projectTypeCopy || !category) return;

  const project = getProjectForCategory(category);
  const label = categoryLabels[category] || category;
  const copy = (categoryIntro[category] || "{count} selecionados nesta categoria.").replace("{count}", projectCountText(category));
  const applyText = () => {
    if (projectTypeImage && project) {
      projectTypeImage.src = project.cover;
      projectTypeImage.alt = project.coverAlt || project.title;
    }
    projectTypeName.textContent = `${label}.`;
    projectTypeCopy.textContent = copy;
    projectTypeImage?.classList.remove("is-swapping");
    projectTypeName.classList.remove("is-swapping");
    projectTypeCopy.classList.remove("is-swapping");
  };

  if (!animate) {
    applyText();
    return;
  }

  projectTypeImage?.classList.add("is-swapping");
  projectTypeName.classList.add("is-swapping");
  projectTypeCopy.classList.add("is-swapping");
  window.setTimeout(applyText, 220);
}

function scheduleProjectTypeRotation() {
  window.clearInterval(projectTypeTimer);
  const categories = getProjectTypeCategories();
  if (categories.length < 2) return;

  projectTypeTimer = window.setInterval(() => {
    projectTypeIndex = (projectTypeIndex + 1) % categories.length;
    setProjectTypeIntro(categories[projectTypeIndex]);
  }, 4200);
}

function startProjectTypeRotation() {
  const categories = getProjectTypeCategories();
  if (categories.length === 0) return;

  projectTypeIndex = 0;
  setProjectTypeIntro(categories[projectTypeIndex], false);
  scheduleProjectTypeRotation();
}

function syncProjectTypeWithFilter(filter) {
  if (filter === "all") {
    scheduleProjectTypeRotation();
    return;
  }

  const categories = getProjectTypeCategories();
  const nextIndex = categories.indexOf(filter);
  if (nextIndex === -1) return;

  projectTypeIndex = nextIndex;
  setProjectTypeIntro(filter);
  scheduleProjectTypeRotation();
}

function renderFilters() {
  filterBar.innerHTML = getCategories()
    .map((category, index) => {
      const active = index === 0 ? " active" : "";
      return `<button class="filter-button${active}" type="button" data-filter="${category}">${categoryLabels[category] || category}</button>`;
    })
    .join("");
}

function projectCard(project, index) {
  const featured = project.featured || index === 0 ? " featured" : "";
  return `
    <article class="project-card${featured}" data-category="${project.category}">
      <button type="button" data-project-id="${project.id}" aria-label="Abrir ${project.title}">
        <img src="${project.cover}" alt="${project.coverAlt || project.title}" loading="${index < 3 ? "eager" : "lazy"}">
        <div class="project-meta">
          <p>${project.categoryLabel} - ${project.year}</p>
          <h3>${project.title}</h3>
          <span>${project.summary}</span>
        </div>
      </button>
    </article>
  `;
}

function renderProjects(filter = "all") {
  const visibleProjects = filter === "all" ? projects : projects.filter((project) => project.category === filter);
  projectGrid.innerHTML = visibleProjects.map(projectCard).join("");
}

function setActiveFilter(filter) {
  document.querySelectorAll("[data-filter]").forEach((button) => {
    button.classList.toggle("active", button.dataset.filter === filter);
  });
}

function openProject(projectId) {
  const project = projects.find((item) => item.id === projectId);
  if (!project) return;

  dialogCover.src = project.cover;
  dialogCover.alt = project.coverAlt || project.title;
  dialogCategory.textContent = `${project.categoryLabel} - ${project.year}`;
  dialogTitle.textContent = project.title;
  dialogSummary.textContent = project.summary;

  dialogThumbs.innerHTML = project.images
    .map((image, index) => `
      <button class="${image.src === project.cover ? "active" : ""}" type="button" data-image-src="${image.src}" data-image-alt="${image.alt}">
        <img src="${image.src}" alt="${image.alt}" loading="${index < 6 ? "eager" : "lazy"}">
      </button>
    `)
    .join("");

  if (typeof dialog.showModal === "function") {
    dialog.showModal();
  } else {
    dialog.setAttribute("open", "");
  }
}

function selectDialogImage(button) {
  dialogCover.src = button.dataset.imageSrc;
  dialogCover.alt = button.dataset.imageAlt;
  dialogThumbs.querySelectorAll("button").forEach((item) => item.classList.remove("active"));
  button.classList.add("active");
}

updateHeader();
renderHero();
renderFilters();
renderProjects();
startProjectTypeRotation();

window.addEventListener("scroll", updateHeader, { passive: true });

menuToggle.addEventListener("click", () => {
  const isOpen = header.classList.toggle("menu-open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
});

nav.addEventListener("click", (event) => {
  if (event.target.matches("a")) {
    header.classList.remove("menu-open");
    menuToggle.setAttribute("aria-expanded", "false");
  }
});

filterBar.addEventListener("click", (event) => {
  const button = event.target.closest("[data-filter]");
  if (!button) return;

  const filter = button.dataset.filter;
  setActiveFilter(filter);
  syncProjectTypeWithFilter(filter);
  renderProjects(filter);
});

projectGrid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-project-id]");
  if (!button) return;
  openProject(button.dataset.projectId);
});

dialogThumbs.addEventListener("click", (event) => {
  const button = event.target.closest("[data-image-src]");
  if (button) selectDialogImage(button);
});

dialogClose.addEventListener("click", () => dialog.close());

dialog.addEventListener("click", (event) => {
  if (event.target === dialog) {
    dialog.close();
  }
});

form.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!form.checkValidity()) {
    formNote.textContent = "Preencha os campos obrigatorios para enviar.";
    form.reportValidity();
    return;
  }

  const name = new FormData(form).get("nome")?.toString().trim() || "seu contato";
  formNote.textContent = `Obrigada, ${name}. Sua mensagem ficou pronta para envio.`;
  form.reset();
});
