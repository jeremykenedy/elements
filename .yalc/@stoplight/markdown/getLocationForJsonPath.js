"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLocationForJsonPath = void 0;
const lodash_1 = require("lodash");
const getLocationForJsonPath = ({ ast }, path) => {
    const data = path.length === 0 ? ast : lodash_1.get(ast, path);
    if (data === void 0)
        return;
    return {
        range: {
            start: {
                character: data.position.start.column - 1,
                line: data.position.start.line - 1,
            },
            end: {
                character: data.position.end.column - 1,
                line: data.position.end.line - 1,
            },
        },
    };
};
exports.getLocationForJsonPath = getLocationForJsonPath;
//# sourceMappingURL=getLocationForJsonPath.js.map