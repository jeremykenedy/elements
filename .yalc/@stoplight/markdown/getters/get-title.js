"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTitle = void 0;
const get_property_1 = require("./get-property");
const getTitle = (data) => {
    return get_property_1.getProperty('title', 'heading', data);
};
exports.getTitle = getTitle;
//# sourceMappingURL=get-title.js.map