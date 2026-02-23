async function initProjectTree(path) {
    const r = await fetch(`${window.BASE_URL}model/editor/list_path.php?open_file=${encodeURIComponent(path)}`);
    const items = await r.json();

    ui.pathDisplay.innerHTML = '';
    items.forEach((item) => {
        ui.pathDisplay.appendChild(createListItem(item));
    });
}
function createListItem(item) {
    const li = document.createElement('li');
    li.innerHTML = `${item.type === 'dir' ? '📁' : '📄'} ${item.name}`;
    li.className = item.type;
    li.dataset.path = item.path;

    li.onclick = (e) => {
        e.stopPropagation();
        selecionarItem(li, item.path);
        if (item.type === 'dir') toggleDir(li);
        else openFile(item.path);
    };
    return li;
}
