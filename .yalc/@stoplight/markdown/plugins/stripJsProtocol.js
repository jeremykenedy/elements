"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = exports.stripJsProtocol = exports.hasJavascriptProtocol = void 0;
const tslib_1 = require("tslib");
const unist_util_visit_1 = tslib_1.__importDefault(require("unist-util-visit"));
const isJavaScriptProtocol = /^[\u0000-\u001F ]*j[\r\n\t]*a[\r\n\t]*v[\r\n\t]*a[\r\n\t]*s[\r\n\t]*c[\r\n\t]*r[\r\n\t]*i[\r\n\t]*p[\r\n\t]*t[\r\n\t]*\:/i;
function hasJavascriptProtocol(url) {
    return isJavaScriptProtocol.test(url);
}
exports.hasJavascriptProtocol = hasJavascriptProtocol;
const stripJsProtocol = () => tree => {
    unist_util_visit_1.default(tree, 'link', onVisit);
};
exports.stripJsProtocol = stripJsProtocol;
exports.default = exports.stripJsProtocol;
const onVisit = node => {
    if (hasJavascriptProtocol(node.url)) {
        node.url = '';
    }
};
//# sourceMappingURL=stripJsProtocol.js.map