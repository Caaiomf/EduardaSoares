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
const dialogMain = document.querySelector(".dialog-main");
const dialogCover = document.querySelector("[data-dialog-cover]");
const dialogCategory = document.querySelector("[data-dialog-category]");
const dialogTitle = document.querySelector("[data-dialog-title]");
const dialogSummary = document.querySelector("[data-dialog-summary]");
const dialogThumbs = document.querySelector("[data-dialog-thumbs]");
const form = document.querySelector("[data-contact-form]");
const formNote = document.querySelector("[data-form-note]");
const whatsappLinks = document.querySelectorAll("[data-whatsapp-link]");

const whatsappNumber = "5518991745227";
const whatsappDefaultMessage = "Olá, vi seu trabalho pelo seu site e gostaria de falar sobre um projeto.";

const categoryLabels = {
  all: "Todos",
  residencial: "Residencial",
  interiores: "Interiores",
  comercial: "Comercial",
  estudo: "Estudo",
};

const categoryIntro = {
  residencial: "{count} de casas, fachadas e implantações com leitura clara de acesso e cotidiano.",
  interiores: "{count} de ambientes internos, marcenaria, luz e composição para uso diário.",
  comercial: "{count} comercial com fachada, vitrine e presença urbana.",
  estudo: "{count} de conceito para testar linguagem, volume e implantação.",
};

let projectTypeIndex = 0;
let projectTypeTimer;

function absoluteUrl(value) {
  try {
    return new URL(value, window.location.href).href;
  } catch {
    return value;
  }
}

function cssImageUrl(src) {
  return `url('${src.replace(/'/g, "\\'")}')`;
}

function whatsappUrl(message) {
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
}

function syncWhatsappLinks() {
  whatsappLinks.forEach((link) => {
    link.href = whatsappUrl(whatsappDefaultMessage);
  });
}

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

function city(name) {
  return {
    "@type": "City",
    name,
    address: {
      "@type": "PostalAddress",
      addressLocality: name,
      addressRegion: "SP",
      addressCountry: "BR",
    },
  };
}

function renderStructuredData() {
  const graph = [
    {
      "@type": "WebSite",
      "@id": `${absoluteUrl("#site")}`,
      name: "Eduarda Soares Arquitetura e Urbanismo",
      inLanguage: "pt-BR",
    },
    {
      "@type": "WebPage",
      "@id": `${absoluteUrl("#pagina")}`,
      name: document.title,
      description: document.querySelector('meta[name="description"]')?.content,
      isPartOf: { "@id": `${absoluteUrl("#site")}` },
      about: { "@id": `${absoluteUrl("#negocio")}` },
      inLanguage: "pt-BR",
    },
    {
      "@type": "HomeAndConstructionBusiness",
      "@id": `${absoluteUrl("#negocio")}`,
      name: "Eduarda Soares Arquitetura e Urbanismo",
      description: "Projetos de arquitetura, interiores, reformas, fachadas e consultoria para Birigui, Araçatuba e região.",
      image: absoluteUrl(getHeroProject()?.cover || "assets/brand/logo-navbar-olive.svg"),
      logo: absoluteUrl("assets/brand/logo-navbar-olive.svg"),
      address: {
        "@type": "PostalAddress",
        addressLocality: "Birigui",
        addressRegion: "SP",
        addressCountry: "BR",
      },
      areaServed: [
        city("Birigui"),
        city("Araçatuba"),
        city("Penápolis"),
        city("Buritama"),
        city("Guararapes"),
        city("Bilac"),
        city("Coroados"),
      ],
      priceRange: "Sob consulta",
      knowsAbout: [
        "arquitetura em Birigui",
        "arquitetura em Araçatuba",
        "projeto arquitetônico residencial",
        "arquitetura de interiores",
        "fachadas residenciais",
        "reformas residenciais",
        "urbanismo",
      ],
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Serviços de arquitetura e urbanismo",
        itemListElement: [
          "Projeto arquitetônico",
          "Arquitetura de interiores",
          "Consultoria para reforma",
          "Estudos de fachada",
          "Urbanismo e implantação",
        ].map((name) => ({
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name,
            areaServed: ["Birigui", "Araçatuba", "Região noroeste paulista"],
          },
        })),
      },
    },
    {
      "@type": "ItemList",
      "@id": `${absoluteUrl("#lista-projetos")}`,
      name: "Portfólio de projetos de arquitetura",
      itemListElement: projects.map((project, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "CreativeWork",
          name: project.title,
          description: project.summary,
          image: absoluteUrl(project.cover),
          url: absoluteUrl(`#projeto-${project.id}`),
          genre: project.categoryLabel,
        },
      })),
    },
  ];

  let script = document.querySelector("#seo-structured-data");
  if (!script) {
    script = document.createElement("script");
    script.id = "seo-structured-data";
    script.type = "application/ld+json";
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify({ "@context": "https://schema.org", "@graph": graph });
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
    <article class="project-card${featured}" data-category="${project.category}" id="projeto-${project.id}">
      <button type="button" data-project-id="${project.id}" aria-label="Abrir ${project.title}">
        <img src="${project.cover}" alt="${project.coverAlt || project.title}" loading="${index < 3 ? "eager" : "lazy"}" decoding="async">
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

function setDialogImage(src, alt) {
  dialogCover.src = src;
  dialogCover.alt = alt;
  dialogMain?.style.setProperty("--dialog-image", cssImageUrl(src));
}

function openProject(projectId) {
  const project = projects.find((item) => item.id === projectId);
  if (!project) return;

  setDialogImage(project.cover, project.coverAlt || project.title);
  dialogCategory.textContent = `${project.categoryLabel} - ${project.year}`;
  dialogTitle.textContent = project.title;
  dialogSummary.textContent = project.summary;

  dialogThumbs.innerHTML = project.images
    .map((image, index) => `
      <button class="${image.src === project.cover ? "active" : ""}" type="button" data-image-src="${image.src}" data-image-alt="${image.alt}" style="--thumb-image: ${cssImageUrl(image.src)}">
        <img src="${image.src}" alt="${image.alt}" loading="${index < 6 ? "eager" : "lazy"}" decoding="async">
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
  setDialogImage(button.dataset.imageSrc, button.dataset.imageAlt);
  dialogThumbs.querySelectorAll("button").forEach((item) => item.classList.remove("active"));
  button.classList.add("active");
}

updateHeader();
renderHero();
renderFilters();
renderProjects();
startProjectTypeRotation();
renderStructuredData();
syncWhatsappLinks();

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

  const data = new FormData(form);
  const name = data.get("nome")?.toString().trim() || "seu contato";
  const email = data.get("email")?.toString().trim() || "Não informado";
  const type = data.get("tipo")?.toString().trim() || "Não informado";
  const message = data.get("mensagem")?.toString().trim() || "Não informado";
  const whatsappMessage = [
    whatsappDefaultMessage,
    "",
    `Nome: ${name}`,
    `Email: ${email}`,
    `Tipo de projeto: ${type}`,
    "",
    `Mensagem: ${message}`,
  ].join("\n");
  const opened = window.open(whatsappUrl(whatsappMessage), "_blank", "noopener");

  if (!opened) {
    window.location.href = whatsappUrl(whatsappMessage);
  }

  formNote.textContent = `Perfeito, ${name}. O WhatsApp foi aberto com sua mensagem.`;
  form.reset();
});
