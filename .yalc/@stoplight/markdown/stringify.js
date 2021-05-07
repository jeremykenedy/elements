"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stringify = void 0;
const tslib_1 = require("tslib");
const remark_stringify_1 = tslib_1.__importDefault(require("remark-stringify"));
const unified_1 = tslib_1.__importDefault(require("unified"));
const jiraBlocks_1 = tslib_1.__importDefault(require("./plugins/jiraBlocks"));
const resolver_1 = tslib_1.__importDefault(require("./plugins/resolver"));
const from_spec_1 = require("./reader/transformers/from-spec");
const frontmatter = require('remark-frontmatter');
const defaultOpts = {
    commonmark: true,
    gfm: true,
    listItemIndent: 'mixed',
};
const defaultProcessor = unified_1.default()
    .use(remark_stringify_1.default)
    .use(jiraBlocks_1.default)
    .use(frontmatter, ['yaml'])
    .use(() => from_spec_1.fromSpec)
    .use(resolver_1.default);
const stringify = (tree, opts = defaultOpts, processor = defaultProcessor) => {
    return processor().data('settings', opts).stringify(tree);
};
exports.stringify = stringify;
//# sourceMappingURL=stringify.js.map