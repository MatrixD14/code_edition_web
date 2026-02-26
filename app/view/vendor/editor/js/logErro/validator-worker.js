importScripts(
    '../variavelGlobal.js',
    '../autocomplete/list_@android.js',
    '../autocomplete/list_xml.js',
    '../autocomplete/list_tag_xml.js',
    './verifErroJava.js',
    './verifErroAtributo.js',
    './verifErroTag.js',
    './verifErroValueXml.js',
);
const cacheWorker = new Map();
self.onmessage = function (e) {
    try {
        const { texto, isJava, offset = 0 } = e.data;
        const erros = isJava ? validarJava(texto) : validarBlocoXML(texto);
        self.postMessage(
            erros.map((er) => ({
                ...er,
                linha: er.linha + offset,
            })),
        );
    } catch (err) {
        console.error('💥 Worker crash:', err);

        self.postMessage([
            {
                linha: 0,
                msg: err.message || 'Erro interno',
            },
        ]);
    }
};
