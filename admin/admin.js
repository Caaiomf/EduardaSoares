const list = document.querySelector("[data-project-list]");
const form = document.querySelector("[data-project-form]");
const status = document.querySelector("[data-status]");
const imageGrid = document.querySelector("[data-image-grid]");
const formTitle = document.querySelector("[data-form-title]");
const newButton = document.querySelector("[data-new-project]");

let projects = [];
let selectedFolder = "";

function categoryLabel() {
  return form.category.selectedOptions[0]?.dataset.label || "Residencial";
}

function setStatus(message, error = false) {
  status.textContent = message;
  status.style.color = error ? "#9b3f36" : "#6e7164";
}

function clearForm() {
  selectedFolder = "";
  form.reset();
  form.year.value = new Date().getFullYear();
  form.categoryLabel.value = categoryLabel();
  formTitle.textContent = "Novo projeto";
  imageGrid.innerHTML = "";
  list.querySelectorAll("button").forEach((button) => button.classList.remove("active"));
  setStatus("");
}

function renderList() {
  list.innerHTML = projects
    .map((project) => `
      <button type="button" data-folder="${project.folder}">
        <strong>${project.meta.title || project.folder}</strong>
        <span>${project.meta.categoryLabel || "Sem categoria"} - ${project.images.length} imagem(ns)</span>
      </button>
    `)
    .join("");
}

function renderImages(project) {
  imageGrid.innerHTML = project.images
    .map((src) => `
      <div class="image-card">
        <img src="/${src}" alt="">
        <button type="button" data-delete-image="${src}">Remover</button>
      </div>
    `)
    .join("");
}

function fillForm(project) {
  selectedFolder = project.folder;
  formTitle.textContent = project.meta.title || project.folder;
  form.folder.value = project.folder;
  form.title.value = project.meta.title || project.folder;
  form.category.value = project.meta.category || "residencial";
  form.categoryLabel.value = project.meta.categoryLabel || categoryLabel();
  form.type.value = project.meta.type || "";
  form.year.value = project.meta.year || new Date().getFullYear();
  form.summary.value = project.meta.summary || "";
  form.coverIncludes.value = project.meta.coverIncludes || "";
  form.featured.checked = Boolean(project.meta.featured);
  form.images.value = "";
  renderImages(project);

  list.querySelectorAll("button").forEach((button) => {
    button.classList.toggle("active", button.dataset.folder === project.folder);
  });
}

async function loadProjects() {
  const response = await fetch("/admin/api/projects");
  const data = await response.json();
  projects = data.projects;
  renderList();
  if (selectedFolder) {
    const project = projects.find((item) => item.folder === selectedFolder);
    if (project) fillForm(project);
  }
}

list.addEventListener("click", (event) => {
  const button = event.target.closest("[data-folder]");
  if (!button) return;

  const project = projects.find((item) => item.folder === button.dataset.folder);
  if (project) fillForm(project);
});

form.category.addEventListener("change", () => {
  form.categoryLabel.value = categoryLabel();
  if (!form.type.value.trim()) {
    form.type.value = categoryLabel();
  }
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  form.categoryLabel.value = categoryLabel();
  setStatus("Salvando...");

  const response = await fetch("/admin/api/projects", {
    method: "POST",
    body: new FormData(form),
  });
  const data = await response.json();

  if (!response.ok) {
    setStatus(data.message || "Nao foi possivel salvar.", true);
    return;
  }

  selectedFolder = data.project.folder;
  setStatus("Projeto salvo e site atualizado.");
  await loadProjects();
});

imageGrid.addEventListener("click", async (event) => {
  const button = event.target.closest("[data-delete-image]");
  if (!button) return;
  if (!confirm("Remover esta imagem do projeto?")) return;

  const response = await fetch("/admin/api/images", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ src: button.dataset.deleteImage }),
  });
  const data = await response.json();

  if (!response.ok) {
    setStatus(data.message || "Nao foi possivel remover.", true);
    return;
  }

  setStatus("Imagem removida e site atualizado.");
  await loadProjects();
});

newButton.addEventListener("click", clearForm);

clearForm();
loadProjects().catch(() => setStatus("Nao foi possivel carregar os projetos.", true));
