"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.run = exports.parse = exports.remarkPreset = void 0;
const tslib_1 = require("tslib");
const remark_frontmatter_1 = tslib_1.__importDefault(require("remark-frontmatter"));
const remark_inline_links_1 = tslib_1.__importDefault(require("remark-inline-links"));
const remark_parse_1 = tslib_1.__importDefault(require("remark-parse"));
const remark_slug_1 = tslib_1.__importDefault(require("remark-slug"));
const unified_1 = tslib_1.__importDefault(require("unified"));
const plugins_1 = require("./plugins");
const code_1 = require("./plugins/code");
const jiraBlocks_1 = tslib_1.__importDefault(require("./plugins/jiraBlocks"));
const stripJsProtocol_1 = tslib_1.__importDefault(require("./plugins/stripJsProtocol"));
const to_spec_1 = require("./reader/transformers/to-spec");
const defaultOpts = {
    commonmark: true,
    gfm: true,
};
exports.remarkPreset = [
    remark_parse_1.default,
    jiraBlocks_1.default,
    [remark_frontmatter_1.default, ['yaml']],
    () => to_spec_1.toSpec,
    code_1.smdCode,
    remark_slug_1.default,
    [remark_inline_links_1.default, { commonmark: true }],
    plugins_1.mergeHtml,
    stripJsProtocol_1.default,
];
const defaultProcessor = unified_1.default().use(exports.remarkPreset);
const parse = (input, opts = defaultOpts, processor = defaultProcessor) => {
    return processor().data('settings', opts).parse(input);
};
exports.parse = parse;
const run = (input, opts = defaultOpts, processor = defaultProcessor) => {
    return processor().runSync(exports.parse(input, opts, processor));
};
exports.run = run;
//# sourceMappingURL=parse.js.map