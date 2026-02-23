inputUpload.addEventListener('change', async (e) => {
    const files = e.target.files;
    if (files.length === 0) return;

    ui.pathDisplay.innerHTML = '<li>Subindo projeto em partes...</li>';

    for (let i = 0; i < files.length; i++) {
        const formData = new FormData();
        formData.append('file', files[i]);
        formData.append('path', files[i].webkitRelativePath);

        try {
            await fetch(`${window.BASE_URL}model/editor/upload_project.php`, {
                method: 'POST',
                body: formData,
            });
            ui.pathDisplay.innerHTML = `<li>Enviando: ${i + 1} de ${files.length}</li>`;
        } catch (error) {
            console.error('Erro no arquivo:', files[i].name);
        }
    }

    alert('Upload concluído!');
    const rootFolderName = files[0].webkitRelativePath.split('/')[0];
    initProjectTree(rootFolderName);
});
