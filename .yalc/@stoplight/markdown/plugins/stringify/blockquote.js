"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.blockquoteHandler = void 0;
const tslib_1 = require("tslib");
const yaml_1 = require("@stoplight/yaml");
const blockquote_1 = tslib_1.__importDefault(require("mdast-util-to-markdown/lib/handle/blockquote"));
const blockquoteHandler = (node, _, context) => {
    var _a;
    const annotations = (((_a = node.data) === null || _a === void 0 ? void 0 : _a.hProperties) || {});
    const value = blockquote_1.default(node, _, context);
    if (Object.keys(annotations).length) {
        return `<!-- ${yaml_1.safeStringify(annotations).trim()} -->

${value}`;
    }
    else {
        return value;
    }
};
exports.blockquoteHandler = blockquoteHandler;
//# sourceMappingURL=blockquote.js.map