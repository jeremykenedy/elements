"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getJsonPathForNode = void 0;
const getJsonPathForNode = (root, node) => {
    const path = [];
    findNode(root, node, path);
    return path;
};
exports.getJsonPathForNode = getJsonPathForNode;
function findNode(root, node, path) {
    if (node.position === undefined || root.position === undefined)
        return;
    if (node.position.start.line === root.position.start.line &&
        node.position.end.line === root.position.end.line &&
        node.position.start.column === root.position.start.column &&
        node.position.end.column === root.position.end.column) {
        return node;
    }
    if (node.position.start.line >= root.position.start.line && node.position.end.line <= root.position.end.line) {
        const { children } = root;
        if (Array.isArray(children)) {
            for (let i = 0; i < children.length; i++) {
                const item = findNode(children[i], node, path);
                if (item) {
                    path.unshift('children', i);
                    return findNode(item, node, path);
                }
            }
        }
    }
    return;
}
//# sourceMappingURL=getJsonPathForNode.js.map