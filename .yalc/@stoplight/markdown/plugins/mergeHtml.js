"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = exports.mergeHtml = exports.SELF_CLOSING_HTML_TAGS = void 0;
const tslib_1 = require("tslib");
const unist_util_visit_1 = tslib_1.__importDefault(require("unist-util-visit"));
const Source = require('source-component');
exports.SELF_CLOSING_HTML_TAGS = Object.freeze([
    'area',
    'base',
    'br',
    'col',
    'embed',
    'hr',
    'img',
    'input',
    'link',
    'meta',
    'param',
    'source',
    'track',
    'wbr',
    'command',
    'keygen',
    'menuitem',
]);
const mergeHtml = () => tree => {
    unist_util_visit_1.default(tree, 'html', onVisit);
};
exports.mergeHtml = mergeHtml;
exports.default = exports.mergeHtml;
function isHtmlNode(node) {
    return node.type === 'html';
}
function isParentNode(node) {
    return !!(node && 'children' in node);
}
const HTML_TAG_REGEXP = /^<[^>]*>$/;
function isValueHtmlTag(value) {
    return HTML_TAG_REGEXP.test(value);
}
function locateNextHtmlNode(parent, index) {
    if (index > parent.children.length) {
        return -1;
    }
    index++;
    for (; index < parent.children.length; index++) {
        if (isHtmlNode(parent.children[index])) {
            return index;
        }
    }
    return -1;
}
function mergeSiblingsHtml(left, right) {
    if (typeof left.value !== 'string' || typeof right.value !== 'string')
        return;
    left.value += right.value;
    if (left.position !== void 0 && right.position !== void 0) {
        left.position.end = right.position.end;
    }
}
const onVisit = (node, index, parent) => {
    if (!isParentNode(parent))
        return;
    const nextHtmlNodeIndex = locateNextHtmlNode(parent, index);
    if (nextHtmlNodeIndex === -1 || typeof node.value !== 'string')
        return;
    if (!isValueHtmlTag(node.value) && nextHtmlNodeIndex !== index + 1)
        return;
    const nextHtmlNode = parent.children[nextHtmlNodeIndex];
    if (index + 1 === nextHtmlNodeIndex) {
        mergeSiblingsHtml(node, nextHtmlNode);
        parent.children.splice(nextHtmlNodeIndex, 1);
        return [unist_util_visit_1.default.SKIP, nextHtmlNodeIndex];
    }
    try {
        const { tagName, attributes, selfClosing } = parse(node.value);
        if (selfClosing) {
            return;
        }
        const newNode = Object.assign({ type: 'inlineHtml', children: parent.children.slice(index + 1, nextHtmlNodeIndex), attributes,
            tagName }, (node.position !== void 0 &&
            nextHtmlNode.position !== void 0 && {
            position: {
                end: nextHtmlNode.position.end,
                start: node.position.start,
                indent: node.position.indent,
            },
        }));
        parent.children[index] = newNode;
        parent.children.splice(index + 1, newNode.children.length + 1);
        return [unist_util_visit_1.default.SKIP, nextHtmlNodeIndex];
    }
    catch (ex) {
        return;
    }
};
function stringParser(source) {
    const stringSym = source.currentChar();
    let char = source.nextChar();
    let string = '';
    while (char) {
        if (char === stringSym && source.peek(-1) !== '\\') {
            source.nextChar();
            return string;
        }
        else {
            string += char;
        }
        char = source.nextChar();
    }
    return;
}
function isASCIIAlpha(charCode) {
    return ((charCode >= 65 && charCode <= 90) ||
        (charCode >= 97 && charCode <= 122));
}
function isASCIIDigit(charCode) {
    return (charCode >= 48 && charCode <= 57);
}
function isValidTagIdentifierCharCode(charCode) {
    return (isASCIIAlpha(charCode) ||
        isASCIIDigit(charCode) ||
        charCode === 45);
}
function parseName(source) {
    let char = source.nextChar();
    let name = char;
    if (!isASCIIAlpha(char.charCodeAt(0))) {
        throw new SyntaxError('tagName has to start with ascii alpha char');
    }
    while ((char = source.nextChar()) && isValidTagIdentifierCharCode(char.charCodeAt(0))) {
        name += char;
    }
    if (name === '') {
        throw new SyntaxError('No valid tagName found');
    }
    source.nextChar();
    return name.toLowerCase();
}
function parseAttributes(source) {
    let field = '';
    let char = source.currentChar();
    const attributes = {};
    while (char && char !== '>') {
        if (char === ' ') {
            if (!attributes[field]) {
                attributes[field] = true;
            }
            field = '';
        }
        else {
            if (char === '=') {
                source.nextChar();
                attributes[field] = stringParser(source);
                char = source.currentChar();
                continue;
            }
            else {
                field += char;
            }
        }
        char = source.nextChar();
    }
    return attributes;
}
function parse(text) {
    const source = new Source(text);
    const tagName = parseName(source);
    return {
        tagName,
        attributes: parseAttributes(source),
        selfClosing: exports.SELF_CLOSING_HTML_TAGS.includes(tagName),
    };
}
//# sourceMappingURL=mergeHtml.js.map