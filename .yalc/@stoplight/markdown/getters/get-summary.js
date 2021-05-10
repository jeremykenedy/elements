"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSummary = void 0;
const lodash_1 = require("lodash");
const get_property_1 = require("./get-property");
const getSummary = (data, opts = {}) => {
    let summary = get_property_1.getProperty('summary', 'paragraph', data);
    if (summary && opts.truncate) {
        summary = lodash_1.truncate(summary, { length: opts.truncate + 3 });
    }
    return summary;
};
exports.getSummary = getSummary;
//# sourceMappingURL=get-summary.js.map