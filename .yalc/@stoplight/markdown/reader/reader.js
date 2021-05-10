"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Reader = void 0;
const parse_1 = require("../parse");
const stringify_1 = require("../stringify");
class Reader {
    fromLang(raw) {
        return parse_1.parse(raw);
    }
    toLang(data) {
        return stringify_1.stringify(data);
    }
}
exports.Reader = Reader;
//# sourceMappingURL=reader.js.map