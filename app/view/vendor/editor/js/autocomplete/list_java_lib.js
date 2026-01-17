async function pickAndroidVersion() {
    const res = await fetch('../../../model/editor/list_android_version.php');
    const versions = await res.json();

    const options = {};
    versions.forEach((v) => (options[v] = v));

    const version = await quickPick(options);
    if (!version) return;

    const btn = document.getElementById('btn-java-import');
    const originalText = btn.innerText;
    btn.style.opacity = '0.5';

    try {
        const response = await fetch(`../../../model/editor/lista_java.php?version=${version}`);
        const text = await response.text();
        if (text.trim() === '') alert('O servidor não retornou nenhuma mensagem. Verifique os logs do PHP.');
        else alert(text);
        const oldScript = document.querySelector('script[src*="list_lib_java.js"]');
        if (oldScript) {
            const newScript = document.createElement('script');
            newScript.src = `./js/autocomplete/list_lib_java.js?v=${Date.now()}`;
            document.body.appendChild(newScript);
            oldScript.remove();
        }
        alert('Lista de imports atualizada com sucesso!');
    } catch (error) {
        alert('Erro ao processar lista: ' + error);
    } finally {
        btn.innerText = originalText;
        btn.style.opacity = '1';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('btn-java-import');
    if (!btn) return;
    const version =
        typeof window.versionAndroid !== 'undefined' ? window.versionAndroid : localStorage.getItem('androidVersion');

    if (version) btn.title = 'Imports Java carregados: ' + version;

    btn.addEventListener('click', async () => {
        await pickAndroidVersion();
    });
});
