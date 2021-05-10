"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.smdAnnotations = void 0;
const yaml_1 = require("@stoplight/yaml");
function smdAnnotations() {
    return function transform(root) {
        const nodes = root.children;
        const processed = [];
        let inTab = false;
        let skipNext = false;
        let tabPlaceholder = {
            type: 'tabs',
            data: {
                hName: 'tabs',
            },
            children: [
                {
                    type: 'tab',
                    data: {
                        hName: 'tab',
                    },
                    children: [],
                },
            ],
        };
        for (const i in nodes) {
            if (!nodes[i])
                continue;
            if (skipNext) {
                skipNext = false;
                continue;
            }
            const node = nodes[i];
            const next = nodes[+i + 1] ? nodes[+i + 1] : null;
            const anno = captureAnnotations(node);
            if ('type' in anno) {
                const { type } = anno;
                if (type === 'tab') {
                    const { children } = tabPlaceholder;
                    if (inTab && tabPlaceholder) {
                        children.push({
                            type: 'tab',
                            data: {
                                hName: 'tab',
                            },
                            children: [],
                        });
                    }
                    else {
                        inTab = true;
                    }
                    if (Object.keys(anno).length > 0) {
                        Object.assign(children[children.length - 1].data, {
                            hProperties: anno,
                        });
                    }
                    tabPlaceholder.children = children;
                    continue;
                }
                else if (type === 'tab-end') {
                    processed.push(tabPlaceholder);
                    inTab = false;
                    tabPlaceholder = {
                        type: 'tabs',
                        data: {
                            hName: 'tabs',
                        },
                        children: [
                            {
                                type: 'tab',
                                data: {
                                    hName: 'tab',
                                },
                                children: [],
                            },
                        ],
                    };
                    continue;
                }
            }
            if (inTab) {
                const size = tabPlaceholder.children.length;
                if (tabPlaceholder.children[size - 1]) {
                    tabPlaceholder.children[size - 1].children.push(processNode(node, anno));
                }
            }
            else if (Object.keys(anno).length > 0 && next) {
                processed.push(processNode(next, anno));
                skipNext = true;
            }
            else {
                processed.push(processNode(node));
            }
        }
        return Object.assign(Object.assign({}, root), { children: processed });
    };
}
exports.smdAnnotations = smdAnnotations;
function captureAnnotations(node) {
    if (!node || !node.value) {
        return {};
    }
    if (node.type === 'mdxFlowExpression' &&
        node.value.startsWith('/*') &&
        node.value.endsWith('*/')) {
        const raw = node.value
            .substr('/*'.length, node.value.length - '*/'.length - '/*'.length)
            .trim();
        try {
            const contents = yaml_1.parse(raw);
            if (typeof contents === 'object') {
                for (const key in contents) {
                    if (typeof contents[key] === 'string') {
                        const escapedContent = contents[key].replace('"', '%22');
                        contents[key] = escapedContent;
                    }
                }
                return contents;
            }
        }
        catch (error) {
        }
    }
    else if (node.type === 'html' &&
        node.value.startsWith('<!--') &&
        node.value.endsWith('-->')) {
        const raw = node.value
            .substr('<!--'.length, node.value.length - '-->'.length - '<!--'.length)
            .trim();
        try {
            const contents = yaml_1.parse(raw);
            if (typeof contents === 'object') {
                return contents;
            }
        }
        catch (error) {
        }
    }
    return {};
}
function processNode(node, annotations) {
    if (annotations) {
        return Object.assign(Object.assign({}, node), { annotations });
    }
    return node;
}
//# sourceMappingURL=annotations.js.map