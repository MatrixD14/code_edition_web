const pathDisplay = document.querySelector(".path_display ul");
const btnOpenProject = document.getElementById("btn_open_project");
const projectSelector = document.getElementById("projects_selector");
const projectsList = document.getElementById("projects_list");
const btnSalvar = document.getElementById("salvar");
const textareaEditor = document.querySelector(".editor");
const nomeDiretorioDisplay = document.querySelector(".nome_diretory");
let currentSelectedFolder = "",
  currentProjectRoot = "",
  painel_path = document.querySelector(".painel_path"),
  file_push_open = document.querySelector(".file_push_open");

file_push_open.addEventListener("click", () => {
  painel_path.style.display =
    painel_path.style.display === "none" ? "block" : "none";
});
btnOpenProject.addEventListener("click", async (e) => {
  e.stopPropagation();
  projectSelector.classList.toggle("hidden");

  const r = await fetch("../../../model/editor/list_path.php");
  const items = await r.json();

  projectsList.innerHTML = items
    .filter((item) => item.type === "dir")
    .map((item) => `<li data-path="${item.path}">📂 ${item.name}</li>`)
    .join("");
});

projectsList.addEventListener("click", (e) => {
  const li = e.target.closest("li");
  if (!li) return;

  const projectPath = li.dataset.path;
  const projectName = li.textContent;

  currentProjectRoot = projectPath;
  currentSelectedFolder = projectPath;
  document.querySelector(".nome_diretory").textContent = projectName;

  projectSelector.classList.add("hidden");
  pathDisplay.innerHTML = "<li>Carregando projeto...</li>";

  initProjectTree(projectPath);
});

async function initProjectTree(path) {
  const r = await fetch(
    `../../../model/editor/list_path.php?open_file=${encodeURIComponent(path)}`
  );
  const items = await r.json();

  pathDisplay.innerHTML = "";
  items.forEach((item) => {
    pathDisplay.appendChild(createListItem(item));
  });
}

document.addEventListener("click", () =>
  projectSelector.classList.add("hidden")
);

function createListItem(item) {
  const li = document.createElement("li");
  li.innerHTML = `${item.type === "dir" ? "📁" : "📄"} ${item.name}`;
  li.className = item.type;
  li.dataset.path = item.path;

  li.onclick = (e) => {
    e.stopPropagation();
    selecionarItem(li, item.path);
    if (item.type === "dir") toggleDir(li);
    else openFile(item.path);
  };
  return li;
}

function toggleDir(li) {
  const isOpened = li.dataset.open === "1";
  if (isOpened) {
    li.querySelector("ul")?.remove();
    li.dataset.open = "0";
  } else {
    li.dataset.open = "1";
    const ulContainer = document.createElement("div");
    li.appendChild(ulContainer);
    loadSubDir(li.dataset.path, ulContainer);
  }
}

async function loadSubDir(dirPath, container) {
  const r = await fetch(
    `../../../model/editor/list_path.php?open_file=${encodeURIComponent(
      dirPath
    )}`
  );
  const items = await r.json();
  const ul = document.createElement("ul");
  ul.style.paddingLeft = "15px";
  items.forEach((item) => ul.appendChild(createListItem(item)));
  container.appendChild(ul);
}

async function openFile(path) {
  try {
    const response = await fetch(
      `../../../model/editor/read_file.php?file=${encodeURIComponent(path)}`
    );
    currentSelectedFolder = path.substring(0, path.lastIndexOf("/"));
    const text = await response.text();

    const input = document.getElementById("code-input");
    if (input) {
      input.value = text;

      input.dataset.currentFile = path;

      const displayNome = document.querySelector(".nome_diretory");
      if (displayNome) displayNome.textContent = path.split("/").pop();

      input.dispatchEvent(new Event("input"));
    }
  } catch (err) {
    console.error(err);
  }
}

btnSalvar.addEventListener("click", async () => {
  const input = document.getElementById("code-input");
  const filePath = input.dataset.currentFile;

  if (!filePath) {
    alert("Selecione um arquivo primeiro!");
    return;
  }

  try {
    const response = await fetch("../../../model/editor/save_file.php", {
      method: "POST",
      body: JSON.stringify({ file: filePath, content: input.value }),
    });

    const rawText = await response.text();

    try {
      const result = JSON.parse(rawText);
      if (result.status === "success") {
        alert("💾 Salvo com sucesso!");
      } else {
        alert("❌ Erro: " + result.message);
      }
    } catch (e) {
      console.error("Resposta do servidor não é JSON:", rawText);
      alert("Erro crítico no servidor. Veja o console (F12).");
    }
  } catch (err) {
    alert("Erro na conexão.");
  }
});

async function createResource(type) {
  const targetDir = currentSelectedFolder || currentProjectRoot;

  if (!targetDir) {
    alert("Por favor, abra um projeto primeiro!");
    return;
  }
  const name = prompt(
    `Digite o nome do novo ${type === "file" ? "arquivo" : "pasta"}:`
  );
  if (!name) return;

  try {
    const response = await fetch("../../../model/editor/create_resource.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: type,
        name: name,
        parentDir: currentSelectedFolder,
      }),
    });

    const result = await response.json();
    if (result.status === "success") {
      alert("Criado com sucesso!");
      const liAtiva = document.querySelector(".item-selecionado");
      if (liAtiva && liAtiva.classList.contains("dir")) {
        liAtiva.dataset.open = "1";
        toggleDir(liAtiva);
        toggleDir(liAtiva);
      } else initProjectTree(currentProjectRoot);
    } else {
      alert("Erro: " + result.message);
    }
  } catch (err) {
    console.error(err);
  }
}
function selecionarItem(elemento, caminho) {
  document.querySelectorAll(".path_display li").forEach((el) => {
    el.classList.remove("item-selecionado");
  });

  elemento.classList.add("item-selecionado");
  currentSelectedPath = caminho;

  if (elemento.classList.contains("file")) {
    currentSelectedFolder = caminho.substring(0, caminho.lastIndexOf("/"));
  } else {
    currentSelectedFolder = caminho;
  }
}

document.getElementById("btn-delete").addEventListener("click", async () => {
  if (!currentSelectedPath) {
    alert("Selecione um arquivo ou pasta para deletar.");
    return;
  }

  if (!confirm(`Tem certeza que deseja deletar: ${currentSelectedPath}?`)) {
    return;
  }

  try {
    const response = await fetch("../../../model/editor/delete_resource.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: currentSelectedPath }),
    });

    const result = await response.json();

    if (result.status === "success") {
      alert("Deletado com sucesso!");
      currentSelectedPath = "";
      if (typeof listFiles === "function") listFiles();
    } else {
      alert("Erro: " + result.message);
    }
  } catch (err) {
    alert("Erro ao deletar.");
  }
});

async function renameResource() {
  if (!currentSelectedPath) {
    alert("Selecione um arquivo ou pasta para renomear.");
    return;
  }

  const oldName = currentSelectedPath.split("/").pop();
  const newName = prompt("Digite o novo nome:", oldName);

  if (!newName || newName === oldName) return;

  try {
    const response = await fetch("../../../model/editor/rename_resource.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        oldPath: currentSelectedPath,
        newName: newName,
      }),
    });

    const result = await response.json();

    if (result.status === "success") {
      alert("Renomeado com sucesso!");

      const liAtiva = document.querySelector(".item-selecionado");
      if (liAtiva) {
        const icon = liAtiva.classList.contains("dir") ? "📁" : "📄";
        liAtiva.innerHTML = `${icon} ${newName}`;

        const parentPath = currentSelectedPath.substring(
          0,
          currentSelectedPath.lastIndexOf("/")
        );
        const novoCaminhoCompleto = parentPath
          ? `${parentPath}/${newName}`
          : newName;
        liAtiva.dataset.path = novoCaminhoCompleto;
        currentSelectedPath = novoCaminhoCompleto;
      }
    } else {
      alert("Erro: " + result.message);
    }
  } catch (err) {
    console.error(err);
    alert("Erro na conexão ao renomear.");
  }
}

document.getElementById("btn_rename").addEventListener("click", renameResource);
document
  .getElementById("criar_file")
  .addEventListener("click", () => createResource("file"));
document
  .getElementById("criar_dir")
  .addEventListener("click", () => createResource("folder"));
