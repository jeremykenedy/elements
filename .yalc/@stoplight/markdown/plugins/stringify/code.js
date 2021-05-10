"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.codeHandler = void 0;
const tslib_1 = require("tslib");
const code_1 = tslib_1.__importDefault(require("mdast-util-to-markdown/lib/handle/code"));
const codeHandler = (node, _, context) => {
    var _a;
    const _b = (((_a = node.data) === null || _a === void 0 ? void 0 : _a.hProperties) || {}), { lang, meta: _meta } = _b, annotations = tslib_1.__rest(_b, ["lang", "meta"]);
    const metaProps = [];
    if (Object.keys(annotations).length) {
        for (const key in annotations) {
            const annotationVal = annotations[key];
            if (typeof annotationVal === 'boolean' || annotationVal === 'true' || annotationVal === 'false') {
                if (annotationVal || annotationVal === 'true') {
                    metaProps.push(key);
                }
                continue;
            }
            else if (key === 'type') {
                if (annotationVal === 'json_schema') {
                    metaProps.push('jsonSchema');
                }
            }
            else if (key === 'highlightLines') {
                if (Array.isArray(annotationVal)) {
                    const rangeVals = [];
                    for (const val of annotationVal) {
                        if (Array.isArray(val)) {
                            rangeVals.push(`${val[0]}-${val[1]}`);
                        }
                        else {
                            rangeVals.push(val);
                        }
                    }
                    if (rangeVals.length) {
                        metaProps.push(`{${rangeVals.join(',')}}`);
                    }
                }
                else {
                    metaProps.push(`{${annotationVal}}`);
                }
            }
            else {
                metaProps.push(`${key}="${annotationVal}"`);
            }
        }
    }
    if (metaProps.length) {
        node.meta = metaProps.join(' ');
    }
    return code_1.default(node, _, context);
};
exports.codeHandler = codeHandler;
//# sourceMappingURL=code.js.map