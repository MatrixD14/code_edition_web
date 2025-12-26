let state = {
  currentSelectedFolder: "",
  currentProjectRoot: "",
};

ui.file_push_open.addEventListener(
  "click",
  () =>
    (ui.painel_path.style.display =
      ui.painel_path.style.display === "none" ? "block" : "none")
);
ui.btnOpenProject.addEventListener("click", async (e) => {
  e.stopPropagation();
  ui.projectSelector.classList.toggle("hidden");
  config.painelConfig.classList.add("hidden");

  const r = await fetch("../../../model/editor/list_path.php");
  const items = await r.json();
  ui.projectsList.innerHTML = items
    .filter((item) => item.type === "dir")
    .map((item) => `<li data-path="${item.path}">📂 ${item.name}</li>`)
    .join("");
});

ui.projectsList.addEventListener("click", (e) => {
  const li = e.target.closest("li");
  if (!li) return;

  let projectPath = li.dataset.path,
    projectName = li.textContent;

  restEditor();

  if (typeof sincronizarTerminalComProjeto === "function")
    sincronizarTerminalComProjeto(projectPath);
  else {
    window.terminalCWD = projectPath;
    console.warn("Terminal ainda não carregado, salvando caminho...");
  }

  state.currentProjectRoot = projectPath;
  state.currentSelectedFolder = projectPath;
  $(".nome_diretory").textContent = projectName;
  ui.projectSelector.classList.add("hidden");
  ui.pathDisplay.innerHTML = "<li>Carregando projeto...</li>";

  initProjectTree(projectPath);
});

async function initProjectTree(path) {
  const r = await fetch(
    `../../../model/editor/list_path.php?open_file=${encodeURIComponent(path)}`
  );
  const items = await r.json();

  ui.pathDisplay.innerHTML = "";
  items.forEach((item) => {
    ui.pathDisplay.appendChild(createListItem(item));
  });
}

document.addEventListener("click", () =>
  ui.projectSelector.classList.add("hidden")
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
  const input = $("#code-input"),
    highlight = $("#highlight-content");

  if (highlight) highlight.textContent = "Carregando...";
  try {
    const response = await fetch(
      `../../../model/editor/read_file.php?file=${encodeURIComponent(path)}`
    );
    state.currentSelectedFolder = path.substring(0, path.lastIndexOf("/"));
    const text = await response.text();

    if (input) {
      input.value = text;
      input.dataset.currentFile = path;

      const displayNome = $(".nome_diretory");
      if (displayNome) displayNome.textContent = path.split("/").pop();

      input.dispatchEvent(new Event("input"));
    }
  } catch (err) {
    console.error(err);
  }
}

ui.btnSalvar.addEventListener("click", async () => {
  const input = $("#code-input");
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
      if (result.status === "success") alert("💾 Salvo com sucesso!");
      else alert("❌ Erro: " + result.message);
    } catch (e) {
      console.error("Resposta do servidor não é JSON:", rawText);
      alert("Erro crítico no servidor. Veja o console (F12).");
    }
  } catch (err) {
    alert("Erro na conexão.");
  }
});
async function refreshFolder(path) {
  const li = $(`li[data-path="${path}"]`);
  if (!li) return initProjectTree(state.currentProjectRoot);

  let containersAntigos = li.querySelectorAll("div, ul");
  containersAntigos.forEach((el) => el.remove());
  let novoContainer = document.createElement("div");
  li.appendChild(novoContainer);
  li.dataset.open = "1";
  await loadSubDir(path, novoContainer);
}
async function createResource(type) {
  let targetDir = state.currentSelectedFolder || state.currentProjectRoot;

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
        parentDir: targetDir,
      }),
    });

    const result = await response.json();
    if (result.status === "success") {
      alert("Criado com sucesso!");
      if (targetDir === state.currentProjectRoot) {
        await initProjectTree(state.currentProjectRoot);
      } else {
        await refreshFolder(targetDir);
      }
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
    state.currentSelectedFolder = caminho.substring(
      0,
      caminho.lastIndexOf("/")
    );
  } else state.currentSelectedFolder = caminho;
  window.terminalCWD = state.currentSelectedFolder;
}
function sincronizarTerminalComProjeto(path) {
  window.terminalCWD = path;

  const outputTerm = $("#terminal-output");
  if (outputTerm) {
    outputTerm.innerHTML += `<div style="color: #e2c08d; font-size: 0.8em;">-- Root alterado: ${path
      .split("/")
      .pop()} --</div>`;
    const container = $(".terminal");
    if (container) container.scrollTop = container.scrollHeight;
  }
}

$("#btn-delete").addEventListener("click", async () => {
  let input = $("#code-input");
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
      let parentPath = currentSelectedPath.substring(
        0,
        currentSelectedPath.lastIndexOf("/")
      );
      let pathLimpo = currentSelectedPath.replace(/^\/|\/$/g, ""),
        fileAbertoLimpo = (input.dataset.currentFile || "").replace(
          /^\/|\/$/g,
          ""
        );
      if (
        fileAbertoLimpo === pathLimpo ||
        fileAbertoLimpo.startsWith(pathLimpo + "/")
      )
        restEditor();

      currentSelectedPath = "";
      if (parentPath) refreshFolder(parentPath);
      else initProjectTree(state.currentProjectRoot);
      if (typeof listFiles === "function") listFiles();
    } else alert("Erro: " + result.message);
  } catch (err) {
    console.error("Erro ao deletar:", err);
    alert("Erro na conexão ao deletar.");
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

      const liAtiva = $(".item-selecionado");
      if (liAtiva) {
        const icon = liAtiva.classList.contains("dir") ? "📁" : "📄";
        liAtiva.textContent = `${icon} ${newName}`;

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

window.addEventListener("keydown", (e) => {
  if (e.ctrlKey && e.key === "s") {
    e.preventDefault();
    ui.btnSalvar.click();
  }

  if (
    e.ctrlKey &&
    e.key === "Delete" &&
    document.activeElement.id !== "code-input"
  ) {
    if (currentSelectedPath) $("#btn-delete").click();
  }

  if (e.ctrlKey && e.key === "b") {
    e.preventDefault();
    ui.file_push_open.click();
  }
  if (e.key === "F2") {
    e.preventDefault();
    renameResource();
  }
  if (e.ctrlKey && e.key === "D") {
    createResource("folder");
  }
  if (e.ctrlKey && e.key === "E") {
    createResource("file");
  }
});
$("#btn_rename").addEventListener("click", renameResource);
$("#criar_file").addEventListener("click", () => createResource("file"));
$("#criar_dir").addEventListener("click", () => createResource("folder"));
