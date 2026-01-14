async function pickAndroidVersion() {
    const res = await fetch('../../../model/editor/list_android_version.php');
    const versions = await res.json();

    const options = {};
    versions.forEach((v) => (options[v] = v));

    const version = await quickPick(options);
    if (!version) return;
    localStorage.setItem('androidVersion', version);

    window.location.href = `../../../model/editor/lista_java.php?version=${version}`;
}
document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('btn-java-import');
    if (!btn) return;
    const version = typeof window.versionAndroid !== 'undefined' ? window.versionAndroid : localStorage.getItem('androidVersion');

    if (version) btn.title = 'Imports Java carregados: ' + version;

    btn.addEventListener('click', async () => {
        await pickAndroidVersion();
    });
});
