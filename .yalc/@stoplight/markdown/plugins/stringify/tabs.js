"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tabHandler = exports.tabsHandler = void 0;
const tslib_1 = require("tslib");
const yaml_1 = require("@stoplight/yaml");
const container_flow_1 = tslib_1.__importDefault(require("mdast-util-to-markdown/lib/util/container-flow"));
const tabsHandler = (node, _, context) => {
    const exit = context.enter('tabs');
    const value = container_flow_1.default(node, context);
    exit();
    return `${value}

<!-- type: tab-end -->`;
};
exports.tabsHandler = tabsHandler;
const tabHandler = (node, _, context) => {
    var _a;
    const exit = context.enter('tab');
    const _b = (((_a = node.data) === null || _a === void 0 ? void 0 : _a.hProperties) || {}), { type } = _b, annotations = tslib_1.__rest(_b, ["type"]);
    const value = container_flow_1.default(node, context);
    exit();
    return `<!--
type: tab
${yaml_1.safeStringify(annotations).trim()}
-->

${value}`;
};
exports.tabHandler = tabHandler;
//# sourceMappingURL=tabs.js.map