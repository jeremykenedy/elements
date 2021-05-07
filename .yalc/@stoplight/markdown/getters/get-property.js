"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProperty = void 0;
const unist_util_select_1 = require("unist-util-select");
const frontmatter_1 = require("../frontmatter");
const toString = require('mdast-util-to-string');
const getProperty = (propName, element, data) => {
    let target;
    if (data) {
        try {
            const frontmatter = new frontmatter_1.Frontmatter(data, true);
            target = frontmatter.get(propName);
            if (element && !target) {
                const elem = unist_util_select_1.select(element, data);
                if (elem) {
                    target = toString(elem);
                }
            }
        }
        catch (e) {
            console.warn(`Error getting ${propName} from markdown document`, e);
        }
    }
    return target;
};
exports.getProperty = getProperty;
//# sourceMappingURL=get-property.js.map