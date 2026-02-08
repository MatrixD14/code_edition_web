function validarTagExiste(tag, schema) {
    if (!schema?.tags) return null;

    if (!schema.tags.includes(tag)) {
        return {
            msg: `Tag <${tag}> não reconhecida`,
        };
    }

    return null;
}
