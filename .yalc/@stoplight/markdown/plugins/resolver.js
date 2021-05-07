"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const yaml_1 = require("@stoplight/yaml");
const unist_util_visit_1 = tslib_1.__importDefault(require("unist-util-visit"));
function default_1(opts) {
    const { Compiler } = this;
    if (Compiler !== void 0) {
        Compiler.prototype.visitors.code = createCompiler(Compiler.prototype.visitors.code);
    }
    if (opts === null || opts === void 0 ? void 0 : opts.resolver) {
        return async (tree) => {
            const promises = [];
            unist_util_visit_1.default(tree, 'code', createVisitor(opts.resolver, promises));
            await Promise.all(promises);
        };
    }
}
exports.default = default_1;
const createVisitor = (resolver, promises) => node => {
    if (typeof node.value !== 'string')
        return;
    if (node.meta !== 'json_schema' && node.meta !== 'http')
        return;
    try {
        promises.push(resolver(node, yaml_1.parse(node.value))
            .then(resolved => {
            node.resolved = resolved;
        })
            .catch(() => {
            node.resolved = null;
        }));
    }
    catch (_a) {
        node.resolved = null;
    }
};
function createCompiler(fn) {
    return function (node, parent) {
        if (node.type === 'code' && 'resolved' in node && node.resolved !== null) {
            return fn.call(this, Object.assign(Object.assign({}, node), { value: node.lang === 'json' ? JSON.stringify(node.resolved, null, 2) : yaml_1.safeStringify(node.resolved, { indent: 2 }) }), parent);
        }
        return fn.call(this, node, parent);
    };
}
//# sourceMappingURL=resolver.js.map