const inputUpload = document.getElementById("upload_projeto");

inputUpload.addEventListener("change", async (e) => {
  const files = e.target.files;
  if (files.length === 0) return;

  const formData = new FormData();

  pathDisplay.innerHTML = "<li>Fazendo upload do projeto...</li>";

  for (let i = 0; i < files.length; i++) {
    formData.append("file[]", files[i]);
    formData.append("paths[]", files[i].webkitRelativePath);
  }

  try {
    const response = await fetch("../../../model/upload_project.php", {
      method: "POST",
      body: formData,
    });

    const result = await response.json();

    if (result.status === "success") {
      const rootFolderName = files[0].webkitRelativePath.split("/")[0];
      loadDir(rootFolderName);
    }
  } catch (error) {
    console.error("Erro no upload:", error);
    alert("Falha ao subir o projeto.");
  }
});
