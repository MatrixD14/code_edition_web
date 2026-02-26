if (typeof GLOBAL === 'undefined' || !GLOBAL.xml_tags) {
    console.warn('Aguardando carregamento do dicionário XML...');
}

GLOBAL.xmlSchemas = {
    layout: {
        globalattrs: GLOBAL.xml_tags.layout.global,
        allowNamespaces: GLOBAL.xml_tags.layout.namespaces,
        tags: GLOBAL.xml_tags.layout.tags,
        baseAttrs: GLOBAL.xml_tags.layout.baseAttrs,
        tagAttrs: GLOBAL.xml_tags.layout.tagAttrs,
    },

    drawable: {
        allowNamespaces: GLOBAL.xml_tags.drawable.namespaces,
        tags: GLOBAL.xml_tags.drawable.tags,
        tagAttrs: GLOBAL.xml_tags.drawable.tagAttrs,
    },

    namespaces: {
        tools: {
            attrs: ['context', 'ignore', 'targetApi'],
        },
        xmlns: {
            values: ['http://schemas.android.com/apk/res/android', 'http://schemas.android.com/tools'],
            attrs: ['android', 'tools'],
        },
    },
    values: {
        strings: {
            allowNamespaces: [],
            tags: GLOBAL.xml_tags.values.strings.tags,
            tagAttrs: {
                string: GLOBAL.xml_tags.values.strings.attrs,
                plurals: GLOBAL.xml_tags.values.strings.attrs,
            },
        },
        colors: {
            allowNamespaces: [],
            tags: GLOBAL.xml_tags.values.colors.tags,
            tagAttrs: {
                color: GLOBAL.xml_tags.values.colors.attrs,
            },
        },
        styles: {
            allowNamespaces: [],
            tags: GLOBAL.xml_tags.values.styles.tags,
            tagAttrs: GLOBAL.xml_tags.values.styles.attrs,
        },
    },

    manifest: {
        globalattrs: GLOBAL.xml_tags.manifest.global,
        allowNamespaces: GLOBAL.xml_tags.manifest.namespaces,
        tags: GLOBAL.xml_tags.manifest.tags,
        tagAttrs: GLOBAL.xml_tags.manifest.attrs,
    },
};
