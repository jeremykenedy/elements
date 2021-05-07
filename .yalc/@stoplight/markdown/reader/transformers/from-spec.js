"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fromSpec = void 0;
const yaml_1 = require("@stoplight/yaml");
function transformAnnotations(node) {
    if (!node.annotations)
        return null;
    const propCount = Object.keys(node.annotations).length;
    if (propCount === 0)
        return null;
    return {
        type: 'html',
        value: `<!--${propCount > 1 ? '\n' : ' '}${yaml_1.safeStringify(node.annotations).trim()}${propCount > 1 ? '\n' : ' '}-->`,
    };
}
function transformBlockquote(node) {
    return [
        {
            type: 'blockquote',
            children: node.children,
        },
    ];
}
function transformTabs(node) {
    const res = [];
    res.push(...transform(node.children));
    res.push({
        type: 'html',
        value: `<!-- ${yaml_1.safeStringify({ type: 'tab-end' }).trim()} -->`,
    });
    return res;
}
function transformTab(node) {
    return transform(node.children);
}
function transform(nodes) {
    const processed = [];
    for (const i in nodes) {
        if (!nodes[i])
            continue;
        const node = nodes[i];
        const anno = transformAnnotations(node);
        if (anno) {
            processed.push(anno);
        }
        const { type } = node;
        if (type === 'blockquote') {
            processed.push(...transformBlockquote(node));
        }
        else if (type === 'tabs') {
            processed.push(...transformTabs(node));
        }
        else if (type === 'tab') {
            processed.push(...transformTab(node));
        }
        else {
            processed.push(node);
        }
    }
    return processed;
}
const fromSpec = (root) => {
    const nodes = root.children;
    return {
        type: 'root',
        children: transform(nodes),
        position: root.position,
    };
};
exports.fromSpec = fromSpec;
//# sourceMappingURL=from-spec.js.map