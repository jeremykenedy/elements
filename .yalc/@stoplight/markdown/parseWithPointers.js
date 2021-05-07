"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseWithPointers = void 0;
const parse_1 = require("./parse");
const parseWithPointers = (value, opts, processor) => {
    const tree = parse_1.parse(value, opts, processor);
    return {
        data: tree,
        diagnostics: [],
        ast: tree,
        lineMap: undefined,
    };
};
exports.parseWithPointers = parseWithPointers;
//# sourceMappingURL=parseWithPointers.js.map