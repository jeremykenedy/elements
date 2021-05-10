"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.blockquoteMdast2Hast = void 0;
const unist_util_visit_1 = require("unist-util-visit");
function blockquoteMdast2Hast() {
    return function transform(root) {
        unist_util_visit_1.visit(root, 'blockquote', node => {
            const data = node.data || (node.data = {});
            const annotations = node.annotations || {};
            data.hProperties = annotations;
        });
    };
}
exports.blockquoteMdast2Hast = blockquoteMdast2Hast;
//# sourceMappingURL=blockquote.js.map