const pathDisplay = document.querySelector(".path_display ul");
const btnOpenProject = document.getElementById("btn_open_project");
const projectSelector = document.getElementById("projects_selector");
const projectsList = document.getElementById("projects_list");

btnOpenProject.addEventListener("click", async (e) => {
  e.stopPropagation();
  projectSelector.classList.toggle("hidden");

  const r = await fetch("../../../model/list_path.php");
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

  document.querySelector(".nome_diretory").textContent = projectName;

  projectSelector.classList.add("hidden");
  pathDisplay.innerHTML = "<li>Carregando projeto...</li>";

  initProjectTree(projectPath);
});

async function initProjectTree(path) {
  const r = await fetch(
    `../../../model/list_path.php?open_file=${encodeURIComponent(path)}`
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
    `../../../model/list_path.php?open_file=${encodeURIComponent(dirPath)}`
  );
  const items = await r.json();
  const ul = document.createElement("ul");
  ul.style.paddingLeft = "15px";
  items.forEach((item) => ul.appendChild(createListItem(item)));
  container.appendChild(ul);
}

const textareaEditor = document.querySelector(".editor");
const nomeDiretorioDisplay = document.querySelector(".nome_diretory");

async function openFile(path) {
  try {
    const response = await fetch(
      `../../../model/read_file.php?file=${encodeURIComponent(path)}`
    );
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
const btnSalvar = document.getElementById("salvar");

btnSalvar.addEventListener("click", async () => {
  const input = document.getElementById("code-input");
  const filePath = input.dataset.currentFile;

  if (!filePath) {
    alert("Selecione um arquivo primeiro!");
    return;
  }

  try {
    const response = await fetch("../../../model/save_file.php", {
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
