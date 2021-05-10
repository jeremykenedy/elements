"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stringify = void 0;
const tslib_1 = require("tslib");
const remark_frontmatter_1 = tslib_1.__importDefault(require("remark-frontmatter"));
const remark_gfm_1 = tslib_1.__importDefault(require("remark-gfm"));
const remark_stringify_1 = tslib_1.__importDefault(require("remark-stringify"));
const unified_1 = tslib_1.__importDefault(require("unified"));
const stringify_1 = require("./plugins/stringify");
const remarkStringifyPreset = {
    plugins: [
        [remark_frontmatter_1.default, ['yaml']],
        remark_gfm_1.default,
    ],
    settings: {
        bullet: '-',
        emphasis: '_',
        fences: true,
        incrementListMarker: true,
        listItemIndent: 'one',
        rule: '-',
        handlers: {
            blockquote: stringify_1.blockquoteHandler,
            code: stringify_1.codeHandler,
            tabs: stringify_1.tabsHandler,
            tab: stringify_1.tabHandler,
        },
    },
};
const defaultProcessor = unified_1.default().use(remark_stringify_1.default).use(remarkStringifyPreset);
const stringify = (tree, opts = {}, processor = defaultProcessor) => {
    const processorInstance = processor()
        .data('settings', Object.assign({}, remarkStringifyPreset.settings, opts.settings))
        .use(opts.remarkPlugins || []);
    return processorInstance.stringify(processorInstance.runSync(tree));
};
exports.stringify = stringify;
//# sourceMappingURL=stringify.js.map