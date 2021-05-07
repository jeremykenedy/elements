"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.smdCode = void 0;
const tslib_1 = require("tslib");
const unist_util_visit_1 = tslib_1.__importDefault(require("unist-util-visit"));
const metaKeyValPairMatcher = /(\S+)\s*=\s*(\"?)([^"]*)(\2|\s|$)/g;
function parseMeta(metastring) {
    const props = {};
    if (!metastring)
        return props;
    let metaWithoutKeyValPairs = metastring;
    let keyValPair;
    while ((keyValPair = metaKeyValPairMatcher.exec(metastring)) !== null) {
        props[keyValPair[1]] = keyValPair[3];
        metaWithoutKeyValPairs = metaWithoutKeyValPairs.replace(keyValPair[0], '');
    }
    const booleanProps = metaWithoutKeyValPairs.split(' ');
    for (const booleanProp of booleanProps) {
        if (booleanProp) {
            props[booleanProp] = 'true';
        }
    }
    return props;
}
function addCodeGrouping(groupings, parent, lastIndex, children) {
    if (children.length <= 1)
        return;
    const numCodeBlocks = children.length;
    const codeGroup = {
        type: 'codegroup',
        data: {
            hName: 'codegroup',
        },
        children,
    };
    groupings.push({
        codeGroup,
        parent,
        startIndex: lastIndex - (numCodeBlocks - 1),
        numCodeBlocks,
    });
}
function smdCode() {
    return function transform(root) {
        let sequentialCodeBlocks = [];
        let lastIndex = -1;
        let lastParent;
        let groupings = [];
        unist_util_visit_1.default(root, 'code', (node, index, parent) => {
            const _a = parseMeta(node.meta), { title: metaTitle } = _a, metaProps = tslib_1.__rest(_a, ["title"]);
            const annotations = Object.assign({}, node.annotations, metaProps);
            const title = annotations.title || metaTitle;
            if (title)
                annotations.title = title;
            node.annotations = annotations;
            if (node.meta) {
                delete node.meta;
            }
            const data = node.data || (node.data = {});
            data.hProperties = Object.assign(Object.assign({}, (data.hProperties || {})), node.annotations);
            const lastCodeBlock = sequentialCodeBlocks[sequentialCodeBlocks.length - 1];
            if (!lastCodeBlock || (lastIndex === index - 1 && lastParent === parent)) {
                lastIndex = index;
                lastParent = parent;
                sequentialCodeBlocks.push(node);
            }
            else {
                addCodeGrouping(groupings, lastParent, lastIndex, sequentialCodeBlocks);
                lastIndex = index;
                lastParent = parent;
                sequentialCodeBlocks = [node];
            }
        });
        addCodeGrouping(groupings, lastParent, lastIndex, sequentialCodeBlocks);
        let removed = new Map();
        for (const group of groupings) {
            if (!removed.get(group.parent)) {
                removed.set(group.parent, 0);
            }
            const removeCount = removed.get(group.parent);
            group.parent.children.splice(group.startIndex - removeCount, group.numCodeBlocks, group.codeGroup);
            removed.set(group.parent, removeCount + group.numCodeBlocks - 1);
        }
    };
}
exports.smdCode = smdCode;
//# sourceMappingURL=code.js.map