"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveCodeBlocks = void 0;
const yaml_1 = require("@stoplight/yaml");
const unist_util_visit_1 = require("unist-util-visit");
function resolveCodeBlocks(opts) {
    if (opts === null || opts === void 0 ? void 0 : opts.resolver) {
        return async (tree) => {
            const promises = [];
            unist_util_visit_1.visit(tree, 'code', createVisitor(opts.resolver, promises));
            await Promise.all(promises);
        };
    }
}
exports.resolveCodeBlocks = resolveCodeBlocks;
const createVisitor = (resolver, promises) => node => {
    var _a, _b;
    if (typeof node.value !== 'string')
        return;
    if (!((_a = node.annotations) === null || _a === void 0 ? void 0 : _a.jsonSchema) && !((_b = node.annotations) === null || _b === void 0 ? void 0 : _b.http))
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
    catch (_c) {
        node.resolved = null;
    }
};
//# sourceMappingURL=resolver.js.map