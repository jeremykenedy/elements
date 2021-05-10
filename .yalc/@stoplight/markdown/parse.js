"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parse = exports.remarkParsePreset = void 0;
const tslib_1 = require("tslib");
const remark_frontmatter_1 = tslib_1.__importDefault(require("remark-frontmatter"));
const remark_gfm_1 = tslib_1.__importDefault(require("remark-gfm"));
const remark_parse_1 = tslib_1.__importDefault(require("remark-parse"));
const remark_slug_1 = tslib_1.__importDefault(require("remark-slug"));
const unified_1 = tslib_1.__importDefault(require("unified"));
const run_1 = require("./plugins/run");
exports.remarkParsePreset = {
    plugins: [
        [remark_frontmatter_1.default, ['yaml']],
        remark_gfm_1.default,
        remark_slug_1.default,
        run_1.smdAnnotations,
        run_1.smdCode,
        run_1.inlineCodeMdast2Hast,
        run_1.blockquoteMdast2Hast,
        run_1.resolveCodeBlocks,
    ],
    settings: {},
};
const defaultProcessor = unified_1.default().use(remark_parse_1.default).use(exports.remarkParsePreset);
const parse = (markdown, opts = {}, processor = defaultProcessor) => {
    const processorInstance = processor()
        .data('settings', Object.assign({}, exports.remarkParsePreset.settings, opts.settings))
        .use(opts.remarkPlugins || []);
    return processorInstance.runSync(processorInstance.parse(markdown));
};
exports.parse = parse;
//# sourceMappingURL=parse.js.map